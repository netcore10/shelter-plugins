// ---------------------------------------------------------------------------
// The LISTEN.moe gateway
//
// Protocol, read off the live socket rather than the docs (which render
// client-side and gave nothing useful):
//
//   → connect wss://listen.moe/gateway_v2
//   → send    {"op":0,"d":{"auth":""}}          empty auth = anonymous
//   ← recv    {"op":0,"d":{"heartbeat":35000}}  welcome, carrying the interval
//   → send    {"op":9}                          every `heartbeat` ms, forever
//   ← recv    {"op":1,"t":"TRACK_UPDATE","d":{song, startTime, listeners, …}}
//
// Miss the heartbeats and the server hangs up, so the interval comes from the
// welcome frame rather than being assumed.
// ---------------------------------------------------------------------------

const OP_HELLO = 0;
const OP_EVENT = 1;
const OP_HEARTBEAT = 9;

const CDN = "https://cdn.listen.moe";

// Image filenames arrive unencoded and are often non-ASCII ("怪物_cover_jpop.png").
const asset = (kind, file) => `${CDN}/${kind}/${encodeURIComponent(file)}`;

function artworkFor(song) {
  const album = song?.albums?.find((a) => a.image)?.image;
  if (album) return asset("covers", album);

  const artist = song?.artists?.find((a) => a.image)?.image;
  if (artist) return asset("artists", artist);

  return null;
}

const join = (list, pick) => list?.map(pick).filter(Boolean).join(", ") || null;

/**
 * Both scripts are kept — which one is shown is a display preference that can
 * change without a new track arriving, so the UI picks rather than us.
 */
function normalise(d) {
  const song = d?.song ?? {};
  const source = song.sources?.[0];
  const duration = song.duration || null;

  // `startTime` is the track's END, despite the name. Measured across a track
  // change: at the exact moment a song begins, the field reads `duration`
  // seconds in the future.
  //
  //   [+  0s] TRACK_UPDATE  elapsed=-186s  dur=326s
  //   [+186s] TRACK_UPDATE  elapsed=-294s  dur=294s   ← boundary, = -duration
  //
  // Taken literally it puts every track permanently 0:00, which is what it did.
  const ends = d?.startTime ? Date.parse(d.startTime) || null : null;

  return {
    title: song.title || "Unknown track",
    titleAlt: song.titleRomaji || null,
    artist: join(song.artists, (a) => a.name),
    artistAlt: join(song.artists, (a) => a.nameRomaji || a.name),
    album: song.albums?.[0]?.name || null,
    source: source?.nameRomaji || source?.name || null,
    art: artworkFor(song),
    startedAt: ends && duration ? ends - duration * 1000 : null,
    duration,
    listeners: d?.listeners ?? null,
    requester: d?.requester?.displayName || d?.requester?.username || null,
    event: d?.event?.name || null,
  };
}

export function connect(station, sink) {
  let socket = null;
  let heartbeat = null;
  let retryTimer = null;
  let attempt = 0;
  let stopped = false;

  const open = () => {
    if (stopped) return;

    sink.status("connecting");

    const sock = new WebSocket(station.provider.gateway);
    socket = sock;

    sock.onopen = () => sock.send(JSON.stringify({ op: OP_HELLO, d: { auth: "" } }));

    sock.onmessage = (e) => {
      let msg;
      try {
        msg = JSON.parse(e.data);
      } catch {
        return;
      }

      if (msg.op === OP_HELLO) {
        attempt = 0;
        sink.status("live");

        clearInterval(heartbeat);
        heartbeat = setInterval(() => {
          if (sock.readyState === WebSocket.OPEN) sock.send(JSON.stringify({ op: OP_HEARTBEAT }));
        }, msg.d?.heartbeat ?? 35_000);

        return;
      }

      // TRACK_UPDATE_REQUEST is the same payload for a user-requested song.
      // QUEUE_UPDATE and NOTIFICATION carry nothing this player shows.
      if (msg.op !== OP_EVENT) return;
      if (msg.t !== "TRACK_UPDATE" && msg.t !== "TRACK_UPDATE_REQUEST") return;

      sink.track(normalise(msg.d));
    };

    sock.onerror = () => {
      try {
        sock.close();
      } catch {
        // Only closing to trigger onclose; failing here is harmless.
      }
    };

    sock.onclose = () => {
      if (socket !== sock) return; // superseded by a newer socket

      socket = null;
      clearInterval(heartbeat);
      heartbeat = null;

      if (stopped) return;
      sink.status(attempt > 2 ? "error" : "connecting");

      // Backoff with jitter. The station runs 24/7, so an outage is worth
      // waiting out quietly rather than hammering the endpoint.
      const base = Math.min(30_000, 1000 * 2 ** attempt++);
      retryTimer = setTimeout(open, base * (0.7 + Math.random() * 0.6));
    };
  };

  open();

  return () => {
    stopped = true;
    clearInterval(heartbeat);
    clearTimeout(retryTimer);

    if (!socket) return;

    // Detach before closing: onclose is what schedules reconnects, and this
    // close is deliberate.
    const dying = socket;
    socket = null;
    dying.onopen = dying.onmessage = dying.onerror = dying.onclose = null;
    try {
      dying.close();
    } catch {
      // Already closing, or never opened.
    }
  };
}
