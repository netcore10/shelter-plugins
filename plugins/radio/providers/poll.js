/**
 * A polling metadata provider.
 *
 * Most stations publish now-playing as a small JSON document. Each caller
 * supplies the URL, how often to ask, and how to turn the response into our
 * normalised track shape.
 */
export function startPolling({ url, interval, parse, sink }) {
  let timer = null;
  let stopped = false;
  let failures = 0;

  const tick = async () => {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const body = await res.json();
      if (stopped) return;

      failures = 0;
      sink.status("live");
      sink.track(parse(body));
    } catch {
      if (stopped) return;

      failures++;
      // One blip shouldn't blank the panel; a sustained outage should say so.
      sink.status(failures > 2 ? "error" : "connecting");
    } finally {
      if (!stopped) {
        // Back off while the endpoint is unhappy, so a dead API doesn't mean a
        // request every few seconds for as long as the panel stays open.
        const wait = failures ? Math.min(60_000, interval * 2 ** failures) : interval;
        timer = setTimeout(tick, wait);
      }
    }
  };

  sink.status("connecting");
  tick();

  return () => {
    stopped = true;
    clearTimeout(timer);
  };
}
