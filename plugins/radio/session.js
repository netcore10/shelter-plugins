import { store } from "./data";
import * as player from "./player";
import * as nowplaying from "./nowplaying";
import { currentStation, stationById, streamUrl } from "./stations";

const {
  solid: { createSignal },
} = shelter;

// Orchestration. player.js knows about audio and nothing else; nowplaying.js
// knows about metadata and nothing else. Everything that has to coordinate the
// two — and the panel — lives here, driven imperatively from event handlers
// rather than from a reactive graph, so nothing survives to go stale after
// onUnload disposes the roots.

const [panelOpen, setPanelOpen] = createSignal(false);
const [view, setView] = createSignal("player"); // "player" | "stations"

// The toolbar button the panel hangs off. Not reactive: it's read when the
// panel positions itself.
let anchor = null;

export { panelOpen, view };

export const anchorEl = () => anchor;

// Notified whenever playback starts, stops or changes station. index.jsx wires
// this to the OS media controls — a callback rather than an import, because
// mediasession.js imports this module and a cycle would be worse than a hook.
let playbackHook = () => {};

export function onPlaybackChange(fn) {
  playbackHook = fn;
}

/**
 * Hold a metadata connection only while something is actually listening to it
 * or looking at it. Everything that can change either condition calls this.
 */
function syncMetadata() {
  nowplaying.want(player.active() || panelOpen() ? currentStation() : null);
}

// --- panel ----------------------------------------------------------------

export function openPanel(el) {
  anchor = el ?? anchor;
  setPanelOpen(true);
  syncMetadata();
}

export function closePanel() {
  setPanelOpen(false);
  setView("player");
  syncMetadata();
}

export function togglePanel(el) {
  if (panelOpen()) closePanel();
  else openPanel(el);
}

export function showStations() {
  setView("stations");
}

export function showPlayer() {
  setView("player");
}

// --- playback -------------------------------------------------------------

export function start() {
  player.play(streamUrl(currentStation()));
  syncMetadata();
  playbackHook();
}

/**
 * The everyday "off". Keeps the audio element loaded so the OS media session
 * survives and its play key can start us again — see player.pause().
 */
export function pause() {
  player.pause();
  syncMetadata();
  playbackHook();
}

/** A full teardown. For shutdown and switching stations, not for the play button. */
export function stop() {
  player.stop();
  syncMetadata();
  playbackHook();
}

export function toggle() {
  // isLive() as well, since our own signals can drift from the element.
  if (player.active() || player.isLive()) pause();
  else start();
}

export function selectStation(id) {
  const station = stationById(id);
  if (!station || id === store.station) return;

  const wasPlaying = player.active();
  store.station = id;

  // Audio first. It's the change the user actually hears, so it must not sit
  // behind anything the metadata side does.
  if (wasPlaying) player.play(streamUrl(station));

  // Then drop the old station's connection before opening the new one, so a
  // stale track can't linger under the new station's name.
  nowplaying.want(null);
  syncMetadata();
  playbackHook();
  showPlayer();
}

export function selectQuality(quality) {
  if (quality === store.quality) return;

  store.quality = quality;
  if (player.active()) player.play(streamUrl(currentStation()));
}

export function shutdown() {
  player.destroy();
  nowplaying.want(null);
  setPanelOpen(false);
  anchor = null;
}
