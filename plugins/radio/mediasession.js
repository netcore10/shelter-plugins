import { store } from "./data";
import * as player from "./player";
import * as session from "./session";
import { track } from "./nowplaying";
import { currentStation } from "./stations";

// Publishes what's playing to the OS media controls — the Windows volume
// overlay, the macOS now-playing widget, and the media keys on a keyboard.
//
// This module imports session, so session must not import it back: the hook it
// registers in attach() is what carries the traffic the other way.

/** Push current state to the OS. Safe to call whenever anything changes. */
export function sync() {
  const ms = navigator.mediaSession;
  if (!ms) return;

  if (!store.mediaSession || !player.active()) return clear();

  const now = track();
  const station = currentStation();
  const romaji = store.romaji;

  ms.metadata = new MediaMetadata({
    title: (romaji && now?.titleAlt) || now?.title || station.name,
    artist: (romaji && now?.artistAlt) || now?.artist || station.name,
    album: now?.album || station.name,
    // The OS picks a size from this list; stations publish one image and no
    // dimensions, so it's offered without a size hint rather than a made-up one.
    artwork: now?.art || station.logo ? [{ src: now?.art || station.logo }] : [],
  });

  ms.playbackState = "playing";
}

export function clear() {
  const ms = navigator.mediaSession;
  if (!ms) return;

  ms.metadata = null;
  ms.playbackState = "none";
}

const ACTIONS = {
  play: () => session.start(),
  pause: () => session.stop(),
  stop: () => session.stop(),
};

export function attach() {
  const ms = navigator.mediaSession;
  if (!ms) return;

  for (const [action, handler] of Object.entries(ACTIONS)) {
    try {
      ms.setActionHandler(action, handler);
    } catch {
      // Not every action exists everywhere, and an unsupported one throws.
    }
  }
}

export function detach() {
  const ms = navigator.mediaSession;
  if (!ms) return;

  for (const action of Object.keys(ACTIONS)) {
    try {
      ms.setActionHandler(action, null);
    } catch {
      // As above.
    }
  }

  clear();
}
