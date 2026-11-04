(function(exports) {

"use strict";

//#region plugins/keybinds/panel.jsx
const { flux: { dispatcher }, util: { getFiberOwner, log } } = shelter;
const ACTIONS = [
	"UNASSIGNED",
	"TOGGLE_MUTE",
	"TOGGLE_DEAFEN",
	"TOGGLE_STREAMER_MODE",
	"TOGGLE_VOICE_MODE",
	"PUSH_TO_TALK",
	"PUSH_TO_TALK_PRIORITY",
	"PUSH_TO_MUTE"
];
const title = (value) => value.split("_").map((word) => word[0] + word.slice(1).toLowerCase()).join(" ");
const ACTION_TYPES = ACTIONS.map((value) => ({
	value,
	label: title(value)
}));
const NOTICE = "[data-nav-anchor-key=\"custom_keybinds_setting\"]";
const PANE = "system_panel";
let replaying = false;
let unsubscribe = null;
const patched = new Set();
/** Add our lists to a props object, leaving a good one alone. */
function fill(props) {
	if (!props || Array.isArray(props.keybindActionTypes)) return props;
	try {
		props.keybindActionTypes = ACTION_TYPES;
		props.keybindDescriptions ??= {};
	} catch (err) {
		log(`keybinds: couldn't supply props: ${err}`, "warn");
	}
	return props;
}
/**
* Keep the lists present across re-renders.
*
* Filling once isn't enough: the plugin passes these through JSX, which Solid
* compiles into getters that re-read owner.props on every access. Clicking Add
* Keybind reads it again, long after React has swapped in a fresh props object
* and dropped what we put there — which is why it worked once and then threw.
*/
function supplyProps() {
	const notice = document.querySelector(NOTICE);
	if (!notice) return false;
	const owner = getFiberOwner(notice);
	if (!owner?.props) return false;
	fill(owner.props);
	if (!patched.has(owner)) {
		let current = owner.props;
		try {
			Object.defineProperty(owner, "props", {
				configurable: true,
				enumerable: true,
				get: () => current,
				set: (next) => current = fill(next)
			});
			patched.add(owner);
		} catch (err) {
			log(`keybinds: couldn't hold props across renders: ${err}`, "warn");
		}
	}
	return true;
}
/** Give the owners back a plain `props`, exactly as they were. */
function unpatch() {
	for (const owner of patched) try {
		const value = owner.props;
		delete owner.props;
		owner.props = value;
	} catch {}
	patched.clear();
}
function onTrack(payload) {
	if (replaying) return;
	if (payload?.event !== "settings_pane_viewed") return;
	if (payload?.properties?.destination_pane !== PANE) return;
	setTimeout(() => {
		if (!supplyProps()) return;
		replaying = true;
		try {
			dispatcher.dispatch({
				type: "TRACK",
				event: "settings_pane_viewed",
				properties: { destination_pane: PANE }
			});
		} finally {
			replaying = false;
		}
	}, 0);
}
function start() {
	if (unsubscribe) return;
	unsubscribe = dispatcher.subscribe("TRACK", onTrack);
	supplyProps();
}
function stop() {
	if (unsubscribe) if (typeof unsubscribe === "function") unsubscribe();
else dispatcher.unsubscribe?.("TRACK", onTrack);
	unsubscribe = null;
	unpatch();
}

//#endregion
//#region plugins/keybinds/index.jsx
function onLoad() {
	start();
}
function onUnload() {
	stop();
}

//#endregion
exports.onLoad = onLoad
exports.onUnload = onUnload
return exports;
})({});