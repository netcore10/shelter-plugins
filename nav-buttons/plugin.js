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

//#region solid-js/web
var require_web = __commonJS({ "solid-js/web"(exports, module) {
	module.exports = shelter.solidWeb;
} });

//#endregion
//#region plugins/nav-buttons/styles.js
var styles_default = `
.nav-btns {
  display: flex;
  align-items: center;
  gap: 2px;
  /* The top bar is a window drag region in desktop clients. Without this a
     click reads as the start of a window drag and never reaches the button. */
  -webkit-app-region: no-drag;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  color: var(--interactive-normal, var(--text-secondary, #b5bac1));
  cursor: pointer;
  -webkit-app-region: no-drag;
}

.nav-btn:hover {
  color: var(--interactive-hover, var(--text-default, #f2f3f5));
  background: var(--background-modifier-hover, rgba(255, 255, 255, .06));
}

/* Matches how Discord dims its own pair at the ends of the history stack. */
.nav-btn[aria-disabled="true"] {
  opacity: .35;
  cursor: default;
}

.nav-btn[aria-disabled="true"]:hover {
  background: none;
  color: var(--interactive-normal, var(--text-secondary, #b5bac1));
}
`;

//#endregion
//#region plugins/nav-buttons/index.jsx
var import_web = __toESM(require_web(), 1);
var import_web$1 = __toESM(require_web(), 1);
var import_web$2 = __toESM(require_web(), 1);
const _tmpl$ = /*#__PURE__*/ (0, import_web.template)(`<div class="nav-btn" role="button" tabindex="0" data-jump-section="global"><svg aria-hidden="true" role="img" width="18" height="18" fill="none" viewBox="0 0 24 24"><path fill="currentColor"></path></svg></div>`, 6);
const { plugin: { scoped } } = shelter;
const GROUP = "[class*=\"leading_\"]:not([data-navbtns])";
const BACK = "M3.3 11.3a1 1 0 0 0 0 1.4l5 5a1 1 0 0 0 1.4-1.4L6.42 13H20a1 1 0 1 0 0-2H6.41l3.3-3.3a1 1 0 0 0-1.42-1.4l-5 5Z";
const FORWARD = "M20.7 12.7a1 1 0 0 0 0-1.4l-5-5a1 1 0 1 0-1.4 1.4l3.29 3.3H4a1 1 0 1 0 0 2h13.59l-3.3 3.3a1 1 0 0 0 1.42 1.4l5-5Z";
const mounts = new Set();
let originalPush = null;
let maxIndex = 0;
function index() {
	const idx = history.state?.idx;
	return typeof idx === "number" ? idx : null;
}
function setDisabled(button$1, disabled) {
	button$1.setAttribute("aria-disabled", String(disabled));
	button$1.setAttribute("tabindex", disabled ? "-1" : "0");
}
function refresh() {
	const idx = index();
	for (const { back, forward } of mounts) {
		setDisabled(back, idx !== null && idx <= 0);
		setDisabled(forward, idx !== null && idx >= maxIndex);
	}
}
function onPop() {
	const idx = index();
	if (idx !== null && idx > maxIndex) maxIndex = idx;
	refresh();
}
function patchHistory() {
	originalPush = history.pushState;
	history.pushState = function(...args) {
		const result = originalPush.apply(this, args);
		maxIndex = index() ?? maxIndex;
		refresh();
		return result;
	};
	addEventListener("popstate", onPop);
}
function go(delta, button$1) {
	if (button$1.getAttribute("aria-disabled") === "true") return;
	if (delta < 0) history.back();
else history.forward();
}
function button(label, path, delta) {
	const el = (() => {
		const _el$ = (0, import_web$1.getNextElement)(_tmpl$), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild;
		(0, import_web$2.setAttribute)(_el$, "aria-label", label);
		(0, import_web$2.setAttribute)(_el$3, "d", path);
		return _el$;
	})();
	el.addEventListener("click", () => go(delta, el));
	el.addEventListener("keydown", (e) => {
		if (e.key !== "Enter" && e.key !== " ") return;
		e.preventDefault();
		go(delta, el);
	});
	return el;
}
/** Drop anything whose top bar React has since thrown away. */
function sweep() {
	for (const entry of mounts) {
		if (entry.root.isConnected) continue;
		entry.guard.disconnect();
		mounts.delete(entry);
	}
}
/**
* The two ends of the top bar. Rather than assume they're direct siblings —
* which would silently inject nothing the day Discord adds a wrapper — look for
* the trailing group from a shared ancestor a few levels up.
*/
function inTopBar(group) {
	let node = group.parentElement;
	for (let depth = 0; node && depth < 3; depth++, node = node.parentElement) if (node.querySelector("[class*=\"trailing_\"]")) return true;
	return false;
}
function inject(group) {
	sweep();
	if (group.dataset.navbtns || !inTopBar(group)) return;
	if (group.querySelector("[class*=\"backForwardButtons\"]")) return;
	group.dataset.navbtns = "1";
	const back = button("Go back", BACK, -1);
	const forward = button("Go forward", FORWARD, 1);
	const root = document.createElement("div");
	root.className = "nav-btns";
	root.append(back, forward);
	group.prepend(root);
	const guard = new MutationObserver(() => {
		if (group.isConnected && !root.isConnected) group.prepend(root);
	});
	guard.observe(group, { childList: true });
	mounts.add({
		root,
		back,
		forward,
		guard
	});
	refresh();
}
function onLoad() {
	scoped.ui.injectCss(styles_default);
	maxIndex = index() ?? 0;
	patchHistory();
	scoped.observeDom(GROUP, inject);
}
function onUnload() {
	if (originalPush) history.pushState = originalPush;
	originalPush = null;
	removeEventListener("popstate", onPop);
	for (const entry of mounts) entry.guard.disconnect();
	mounts.clear();
	document.querySelectorAll(".nav-btns").forEach((el) => el.remove());
	document.querySelectorAll("[data-navbtns]").forEach((el) => delete el.dataset.navbtns);
}

//#endregion
exports.onLoad = onLoad
exports.onUnload = onUnload
return exports;
})({});