import * as listenmoe from "./listenmoe";
import * as radio from "./radio";
import * as plaza from "./plaza";
import * as somafm from "./somafm";
import * as nightride from "./nightride";

const PROVIDERS = { listenmoe, radio, plaza, somafm, nightride };

/**
 * Start following what's playing on `station`.
 *
 * `sink.track(t)` is called with a normalised track, `sink.status(s)` with one
 * of "connecting" | "live" | "error". Returns a function that stops everything.
 *
 * Stations with no metadata source (a bare stream URL the user pasted) get a
 * no-op: the panel falls back to showing the station itself.
 */
export function connect(station, sink) {
  const provider = PROVIDERS[station?.provider?.type];

  if (!provider) {
    sink.status("live");
    sink.track(null);
    return () => {};
  }

  return provider.connect(station, sink);
}
