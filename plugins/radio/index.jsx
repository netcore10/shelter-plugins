// Imported first and for its side effects: evaluating ./data fills in the store
// defaults that everything else reads.
import "./data";
import css from "./styles";
import { removeInjections, startInjection, stats } from "./inject";
import * as mediasession from "./mediasession";
import * as player from "./player";
import { onTrack } from "./nowplaying";
import { onPlaybackChange, shutdown } from "./session";

const {
  plugin: { scoped },
} = shelter;

export function onLoad() {
  // Note: injectCss lives under scoped.ui, not on scoped directly.
  scoped.ui.injectCss(css);

  mediasession.attach();
  // Both the OS controls' triggers: a new song on the same station, and the
  // station or playback state changing under the same song.
  onTrack(() => mediasession.sync());
  onPlaybackChange(() => mediasession.sync());

  startInjection();

  // Diagnostic surface. A slow client after hours is impossible to attribute
  // without a number, and `mounts` is the one that would climb if this plugin
  // were leaking toolbar buttons. It should sit at 1 no matter how long Discord
  // has been open or how much you've navigated around.
  window.__radio = { stats, media: mediasession.debug, player: player.state };
}

export function onUnload() {
  // scoped tears down the observer and the CSS; the audio element, the metadata
  // connection and the nodes we placed by hand are ours to clean up.
  shutdown();
  mediasession.detach();
  removeInjections();
  delete window.__radio;
}

export { default as settings } from "./settings";
