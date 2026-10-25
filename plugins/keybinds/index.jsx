import * as panel from "./panel";

// Dorion's bundled Custom Keybinds panel throws on current Discord builds:
// Add Keybind reads a list off a React fiber owner that Discord no longer
// passes, so the dialog never opens (SpikeHD/Dorion#492). This supplies it.
//
// Everything else about that panel — recording, saving, registering the
// keybind with Dorion — stays theirs. This only unblocks it.

export function onLoad() {
  panel.start();
}

export function onUnload() {
  panel.stop();
}
