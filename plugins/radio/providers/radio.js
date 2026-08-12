import { startPolling } from "./poll";

// r/a/dio publishes everything in one document at https://r-a-d.io/api.

/** Now-playing arrives as one "artist - title" string, sometimes without the dash. */
function split(np = "") {
  const at = np.indexOf(" - ");
  if (at < 0) return { artist: null, title: np.trim() || "Unknown track" };

  return { artist: np.slice(0, at).trim(), title: np.slice(at + 3).trim() };
}

export function connect(station, sink) {
  return startPolling({
    url: "https://r-a-d.io/api",
    interval: 15_000,
    sink,
    parse: (body) => {
      const main = body?.main ?? {};
      const { artist, title } = split(main.np);

      return {
        title,
        artist,
        // Epoch seconds, and the pair gives us a real progress bar.
        startedAt: main.start_time ? main.start_time * 1000 : null,
        duration: main.start_time && main.end_time ? main.end_time - main.start_time : null,
        listeners: main.listeners ?? null,
        // isafkstream means the automated rotation is on air, so there's no
        // human DJ to credit even though `dj` is still populated.
        dj: !main.isafkstream ? main.dj?.djname || null : null,
      };
    },
  });
}
