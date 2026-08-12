import { startPolling } from "./poll";

// Nightwave Plaza. https://api.plaza.one/status carries the song, its artwork
// and how far into it the stream currently is.

export function connect(station, sink) {
  return startPolling({
    url: "https://api.plaza.one/status",
    interval: 10_000,
    sink,
    parse: (body) => {
      const song = body?.song ?? {};

      return {
        title: song.title || "Unknown track",
        artist: song.artist || null,
        album: song.album || null,
        art: song.artwork_src || null,
        duration: song.length || null,
        // There's no start timestamp, only `position` — how many seconds in we
        // are right now. Working backwards from it gives the panel something it
        // can tick forward between polls.
        startedAt: song.position != null ? Date.now() - song.position * 1000 : null,
        listeners: body?.listeners ?? null,
      };
    },
  });
}
