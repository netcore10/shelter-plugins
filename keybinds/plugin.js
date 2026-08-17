(function(exports) {

//#region rolldown:runtime
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function() {
	return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));

//#endregion

//#region plugins/keybinds/actions.js
const { flux: { dispatcher: dispatcher$1, storesFlat } } = shelter;
const currentUserId = () => storesFlat.UserStore?.getCurrentUser?.()?.id;
/**
* Push to talk is the awkward one: as well as the two dispatches, the media
* engine has to be told directly to open the input, or the state changes
* without any audio actually being transmitted.
*/
function pushToTalk(active) {
	const userId = currentUserId();
	if (userId) dispatcher$1.dispatch({
		type: "SPEAKING",
		context: "default",
		speakingFlags: active ? 1 : 0,
		userId
	});
	dispatcher$1.dispatch({
		type: "PUSH_TO_TALK_STATE_CHANGE",
		isActive: active,
		isPriority: false,
		isLatched: active
	});
	try {
		storesFlat.MediaEngineStore?.getMediaEngine?.()?.eachConnection?.((connection) => connection.setForceAudioInput(active, false, false));
	} catch {}
}
const toggle = (type) => () => dispatcher$1.dispatch({
	type,
	context: "default",
	syncRemote: true,
	playSoundEffect: true
});
const ACTIONS$1 = {
	NONE: { label: "None" },
	TOGGLE_MUTE: {
		label: "Mute",
		press: toggle("AUDIO_TOGGLE_SELF_MUTE")
	},
	TOGGLE_DEAFEN: {
		label: "Deafen",
		press: toggle("AUDIO_TOGGLE_SELF_DEAF")
	},
	PUSH_TO_TALK: {
		label: "Push to talk",
		press: () => pushToTalk(true),
		release: () => pushToTalk(false)
	}
};
const ACTION_KEYS = Object.keys(ACTIONS$1);

//#endregion
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
//#region plugins/keybinds/styles.js
var styles_default = `
.mkb-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 14px 0;
}

.mkb-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-default, var(--text-normal, #f2f3f5));
}

.mkb-seg {
  display: flex;
  gap: 4px;
  padding: 3px;
  border-radius: 7px;
  background: var(--background-modifier-hover, rgba(255, 255, 255, .06));
}

.mkb-seg button {
  padding: 5px 10px;
  border: 0;
  border-radius: 5px;
  background: none;
  color: var(--text-secondary, var(--interactive-normal, #b5bac1));
  font: inherit;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}

.mkb-seg button:hover { color: var(--text-default, var(--text-normal, #f2f3f5)); }

.mkb-seg button[aria-pressed="true"] {
  background: var(--background-modifier-selected, rgba(255, 255, 255, .1));
  color: var(--text-default, var(--text-normal, #f2f3f5));
}

.mkb-note {
  margin: 8px 0 4px;
  font-size: 12px;
  line-height: 1.4;
  color: var(--text-muted, #949ba4);
}
`;

//#endregion
//#region solid-js/web
var require_web = __commonJS({ "solid-js/web"(exports, module) {
	module.exports = shelter.solidWeb;
} });

//#endregion
//#region plugins/keybinds/settings.jsx
var import_web = __toESM(require_web(), 1);
var import_web$1 = __toESM(require_web(), 1);
var import_web$2 = __toESM(require_web(), 1);
var import_web$3 = __toESM(require_web(), 1);
var import_web$4 = __toESM(require_web(), 1);
var import_web$5 = __toESM(require_web(), 1);
var import_web$6 = __toESM(require_web(), 1);
var import_web$7 = __toESM(require_web(), 1);
var import_web$8 = __toESM(require_web(), 1);
const _tmpl$ = /*#__PURE__*/ (0, import_web.template)(`<div class="mkb-row"><!#><!/><div class="mkb-seg" role="group"></div></div>`, 6), _tmpl$2 = /*#__PURE__*/ (0, import_web.template)(`<button type="button"></button>`, 2), _tmpl$3 = /*#__PURE__*/ (0, import_web.template)(`<div class="mkb-note">These fire while Discord has focus. A truly global binding has to be registered with the OS, which a plugin can't do from inside the page.<br>Binding a button also stops it navigating back or forward — though some clients handle the side buttons at a level the page can't override, in which case it will do both.</div>`, 3);
const { plugin: { store: store$1 }, solid: { For }, ui: { Header, HeaderTags, Text } } = shelter;
function Row(props) {
	return (() => {
		const _el$ = (0, import_web$5.getNextElement)(_tmpl$), _el$3 = _el$.firstChild, [_el$4, _co$] = (0, import_web$6.getNextMarker)(_el$3.nextSibling), _el$2 = _el$4.nextSibling;
		(0, import_web$7.insert)(_el$, (0, import_web$8.createComponent)(Text, {
			"class": "mkb-label",
			get children() {
				return props.label;
			}
		}), _el$4, _co$);
		(0, import_web$7.insert)(_el$2, (0, import_web$8.createComponent)(For, {
			each: ACTION_KEYS,
			children: (key) => (() => {
				const _el$5 = (0, import_web$5.getNextElement)(_tmpl$2);
				_el$5.$$click = () => store$1[props.setting] = key;
				(0, import_web$7.insert)(_el$5, () => ACTIONS$1[key].label);
				(0, import_web$3.effect)(() => (0, import_web$2.setAttribute)(_el$5, "aria-pressed", store$1[props.setting] === key));
				(0, import_web$4.runHydrationEvents)();
				return _el$5;
			})()
		}));
		return _el$;
	})();
}
function Settings() {
	return [
		(0, import_web$8.createComponent)(Header, {
			get tag() {
				return HeaderTags.H3;
			},
			children: "Mouse side buttons"
		}),
		(0, import_web$8.createComponent)(Row, {
			label: "Mouse 4 (back)",
			setting: "mouse4"
		}),
		(0, import_web$8.createComponent)(Row, {
			label: "Mouse 5 (forward)",
			setting: "mouse5"
		}),
		(0, import_web$5.getNextElement)(_tmpl$3)
	];
}
(0, import_web$1.delegateEvents)(["click"]);

//#endregion
//#region plugins/keybinds/index.jsx
const { plugin: { store, scoped } } = shelter;
const BUTTONS = {
	3: "mouse4",
	4: "mouse5"
};
store.mouse4 ??= "NONE";
store.mouse5 ??= "NONE";
const held = new Set();
const actionFor = (button) => ACTIONS$1[store[BUTTONS[button]]] ?? ACTIONS$1.NONE;
function onDown(e) {
	if (!BUTTONS[e.button]) return;
	const action = actionFor(e.button);
	if (action === ACTIONS$1.NONE) return;
	e.preventDefault();
	held.add(e.button);
	action.press?.();
}
function onUp(e) {
	if (!held.has(e.button)) return;
	held.delete(e.button);
	e.preventDefault();
	actionFor(e.button).release?.();
}
function onAux(e) {
	if (BUTTONS[e.button] && actionFor(e.button) !== ACTIONS$1.NONE) e.preventDefault();
}
/**
* Release everything still held.
*
* Losing focus mid-hold means the mouseup never arrives, which would leave push
* to talk transmitting indefinitely.
*/
function releaseAll() {
	for (const button of held) actionFor(button).release?.();
	held.clear();
}
function onLoad() {
	scoped.ui.injectCss(styles_default);
	window.keybinds = {
		get: () => ({
			mouse4: store.mouse4,
			mouse5: store.mouse5
		}),
		actions: () => Object.keys(ACTIONS$1),
		set(button, action) {
			const key = String(button).replace(/^mouse/i, "mouse");
			if (!["mouse4", "mouse5"].includes(key)) return "button must be mouse4 or mouse5";
			if (!ACTIONS$1[action]) return `action must be one of: ${Object.keys(ACTIONS$1).join(", ")}`;
			store[key] = action;
			return `${key} → ${action}`;
		}
	};
	addEventListener("mousedown", onDown, true);
	addEventListener("mouseup", onUp, true);
	addEventListener("auxclick", onAux, true);
	addEventListener("blur", releaseAll);
	start();
}
function onUnload() {
	releaseAll();
	stop();
	delete window.keybinds;
	removeEventListener("mousedown", onDown, true);
	removeEventListener("mouseup", onUp, true);
	removeEventListener("auxclick", onAux, true);
	removeEventListener("blur", releaseAll);
}

//#endregion
exports.onLoad = onLoad
exports.onUnload = onUnload
Object.defineProperty(exports, 'settings', {
  enumerable: true,
  get: function () {
    return Settings;
  }
});
return exports;
})({});