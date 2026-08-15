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

  if (!store.mediaSession) return clear();

  // Paused rather than cleared: keeping the metadata leaves the OS control on
  // screen, which is what lets the play key start us again. Clearing it removes
  // the control entirely and the key goes back to whatever played last.
  if (!player.active()) {
    attach();
    ms.playbackState = "paused";
    return;
  }

  // Re-assert on every state change. The handlers are a single page-wide slot,
  // so Discord or any other plugin that touches them replaces ours outright —
  // and the failure is silent, showing up only as a dead media key.
  attach();

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

// Last action the OS sent us, for diagnosing which half of the chain is broken:
// whether a key press reaches this plugin at all, or reaches it and then fails.
let lastAction = null;

export function debug() {
  const ms = navigator.mediaSession;

  return {
    lastAction,
    state: ms?.playbackState ?? "(no mediaSession)",
    title: ms?.metadata?.title ?? null,
    enabled: !!store.mediaSession,
    playing: player.active(),
  };
}

function handle(name, run) {
  lastAction = { name, at: new Date().toLocaleTimeString() };
  console.log("[radio] media key:", name);
  run();
}

// pause() rather than stop(): a full teardown ends the media session, and the
// play key would then have nothing to resume — with no window to click, that
// leaves no way back at all.
const ACTIONS = {
  play: () => handle("play", () => session.start()),
  pause: () => handle("pause", () => session.pause()),
  stop: () => handle("stop", () => session.stop()),
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
