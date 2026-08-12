import { startPolling } from "./poll";

// SomaFM exposes a recent-songs playlist per channel; the first entry is what's
// on air. There are no timestamps we can build a progress bar from, so the
// panel simply doesn't draw one for these stations.

export function connect(station, sink) {
  return startPolling({
    url: `https://somafm.com/songs/${station.provider.channel}.json`,
    interval: 20_000,
    sink,
    parse: (body) => {
      const song = body?.songs?.[0] ?? {};

      return {
        title: song.title || "Unknown track",
        artist: song.artist || null,
        album: song.album || null,
        // Usually an empty string rather than absent, hence the truthy check —
        // the station logo stands in when there's nothing here.
        art: song.albumArt || null,
      };
    },
  });
}
