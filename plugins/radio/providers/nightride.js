// Nightride FM pushes metadata for every channel down one server-sent-events
// stream, so all its stations share a single connection. On connect the server
// replays the current track for each channel, which is what saves us from
// showing nothing until the next song change.

const META_URL = "https://nightride.fm/meta";

const sinks = new Map(); // channel -> sink
let source = null;

function open() {
  if (source) return;

  source = new EventSource(META_URL);

  source.onopen = () => sinks.forEach((sink) => sink.status("live"));

  source.onmessage = (e) => {
    let rows;
    try {
      rows = JSON.parse(e.data);
    } catch {
      return;
    }

    for (const row of rows ?? []) {
      // Every channel's updates come down the same pipe; ignore the ones no
      // open station is listening for.
      const sink = sinks.get(row?.station);
      if (!sink) continue;

      sink.status("live");
      sink.track({ title: row.title || "Unknown track", artist: row.artist || null });
    }
  };

  // EventSource reconnects on its own, so this is only about telling the UI.
  source.onerror = () => sinks.forEach((sink) => sink.status("connecting"));
}

function close() {
  source?.close();
  source = null;
}

export function connect(station, sink) {
  const { channel } = station.provider;

  sinks.set(channel, sink);
  sink.status("connecting");
  open();

  return () => {
    sinks.delete(channel);
    if (sinks.size === 0) close();
  };
}
