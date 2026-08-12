import * as providers from "./providers";

const {
  solid: { createSignal },
} = shelter;

// The single source of truth for "what is on air", whichever station that is.
// Providers hand us their own shapes; everything downstream sees this one.

const [track, setTrack] = createSignal(null);
const [status, setStatus] = createSignal("off"); // "off" | "connecting" | "live" | "error"

export { track, status };

const EMPTY = {
  title: null,
  titleAlt: null,
  artist: null,
  artistAlt: null,
  album: null,
  source: null,
  art: null,
  startedAt: null,
  duration: null,
  listeners: null,
  requester: null,
  dj: null,
  event: null,
};

let disconnect = null;
let currentId = null;
let onTrackCb = null;

/** Notified whenever a new track lands. Used to drive the OS media controls. */
export function onTrack(fn) {
  onTrackCb = fn;
}

/**
 * Declare which station we should be following, or null for none. Idempotent,
 * so callers can just describe the state they want as often as they like.
 */
export function want(station) {
  const id = station?.id ?? null;
  if (id === currentId) return;

  currentId = id;
  disconnect?.();
  disconnect = null;
  setTrack(null);

  if (!station) {
    setStatus("off");
    return;
  }

  setStatus("connecting");

  disconnect = providers.connect(station, {
    // A provider being torn down mid-flight (an in-flight fetch, a socket
    // closing) must not write over whatever replaced it.
    track: (t) => {
      if (currentId !== id) return;

      const normalised = t ? { ...EMPTY, ...t } : null;
      setTrack(normalised);
      onTrackCb?.(normalised);
    },
    status: (s) => {
      if (currentId === id) setStatus(s);
    },
  });
}
