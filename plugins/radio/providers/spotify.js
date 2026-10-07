import * as spotify from "../spotify";

// Unlike the other providers there's no public endpoint to poll: every request
// carries the user's token, and "nothing playing" is a 204 rather than a JSON
// document, so this doesn't go through poll.js.

const PLAYING_EVERY = 4_000;
const IDLE_EVERY = 8_000;

export function connect(station, sink) {
  if (!spotify.connected()) {
    // Not an error — the panel tells the user to connect in settings.
    sink.status("live");
    sink.track(null);
    return () => {};
  }

  let timer = null;
  let stopped = false;
  let failures = 0;

  const tick = async () => {
    clearTimeout(timer);

    try {
      const track = await spotify.fetchState();
      if (stopped) return;

      failures = 0;
      sink.status("live");
      sink.track(track);
    } catch {
      if (stopped) return;

      failures++;
      sink.status(failures > 2 ? "error" : "connecting");
    } finally {
      if (!stopped) {
        const wait = failures
          ? Math.min(60_000, IDLE_EVERY * 2 ** failures)
          : spotify.playing()
            ? PLAYING_EVERY
            : IDLE_EVERY;
        timer = setTimeout(tick, wait);
      }
    }
  };

  spotify.onNudge(tick);
  sink.status("connecting");
  tick();

  return () => {
    stopped = true;
    clearTimeout(timer);
    spotify.onNudge(null);
  };
}
