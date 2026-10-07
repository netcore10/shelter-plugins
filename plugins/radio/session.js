import { store } from "./data";
import * as player from "./player";
import * as nowplaying from "./nowplaying";
import * as spotify from "./spotify";
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
  nowplaying.want(listening() || panelOpen() ? currentStation() : null);
}

// Spotify plays on some other device, so "is it on" comes from asking Spotify
// rather than from our audio element. Everything below that cares about
// playback goes through these instead of reading player directly.
const remote = () => !!currentStation().remote;
const listening = () => (remote() ? spotify.playing() : player.active());

export const isPlaying = () => (remote() ? spotify.playing() : player.playing());
export const isLoading = () => (remote() ? false : player.loading());

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
  if (remote()) {
    spotify.play();
    syncMetadata();
    playbackHook();
    return;
  }

  // Resume in place when the element is only paused. Reloading the source
  // destroys the OS media session, and that session is what the play key is
  // driving — so a play handler that reloads tears down its own caller.
  if (!player.resume()) player.play(streamUrl(currentStation()));

  syncMetadata();
  playbackHook();
}

/**
 * The everyday "off". Keeps the audio element loaded so the OS media session
 * survives and its play key can start us again — see player.pause().
 */
export function pause() {
  if (remote()) spotify.pause();
  else player.pause();

  syncMetadata();
  playbackHook();
}

/** A full teardown. For shutdown and switching stations, not for the play button. */
export function stop() {
  player.stop();
  if (remote()) spotify.pause();
  syncMetadata();
  playbackHook();
}

export function toggle() {
  // isLive() as well, since our own signals can drift from the element.
  if (remote() ? spotify.playing() : player.active() || player.isLive()) pause();
  else start();
}

export function selectStation(id) {
  const station = stationById(id);
  if (!station || id === store.station) return;

  const wasPlaying = listening();
  const wasRemote = remote();
  store.station = id;

  // Only one thing should be making sound. Moving between Spotify and a
  // stream hands over: the side we're leaving goes quiet.
  if (wasRemote && wasPlaying) spotify.pause();
  if (station.remote) player.stop();

  // Audio first. It's the change the user actually hears, so it must not sit
  // behind anything the metadata side does.
  if (wasPlaying) {
    if (station.remote) spotify.play();
    else player.play(streamUrl(station));
  }

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
  spotify.destroy();
  nowplaying.want(null);
  setPanelOpen(false);
  anchor = null;
}
