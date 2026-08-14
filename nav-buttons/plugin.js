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
  /* Never grow or shrink the bar. As a foreign child in a flex row written for
     a fixed set of children, anything else lets us push Discord's own layout
     around — which is what collapsed the window. */
  flex: 0 0 auto;
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
function button(label, path, delta) {
	const el = (() => {
		const _el$ = (0, import_web$1.getNextElement)(_tmpl$), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild;
		(0, import_web$2.setAttribute)(_el$, "aria-label", label);
		(0, import_web$2.setAttribute)(_el$3, "d", path);
		return _el$;
	})();
	const go = () => delta < 0 ? history.back() : history.forward();
	el.addEventListener("click", go);
	el.addEventListener("keydown", (e) => {
		if (e.key !== "Enter" && e.key !== " ") return;
		e.preventDefault();
		go();
	});
	return el;
}
/**
* Is this the window's top bar, and not one of the other places Discord reuses
* these class stems? Checks the bar's own shape: `bar_` (not `toolbar_`, hence
* the word boundary) with a title and a trailing group as direct children.
*/
function isTopBar(leading) {
	const bar = leading.parentElement;
	if (!bar || !/(^|\s)bar_/.test(bar.className)) return false;
	return !!bar.querySelector(":scope > [class*=\"title_\"]") && !!bar.querySelector(":scope > [class*=\"trailing_\"]");
}
/** Drop anything whose top bar React has since thrown away. */
function sweep() {
	for (const entry of mounts) {
		if (entry.root.isConnected) continue;
		entry.guard.disconnect();
		mounts.delete(entry);
	}
}
function inject(leading) {
	sweep();
	if (leading.dataset.navbtns || !isTopBar(leading)) return;
	const bar = leading.parentElement;
	if (bar.querySelector("[class*=\"backForwardButtons\"]")) return;
	leading.dataset.navbtns = "1";
	const root = document.createElement("div");
	root.className = "nav-btns";
	root.append(button("Go back", BACK, -1), button("Go forward", FORWARD, 1));
	let host = leading;
	host.prepend(root);
	const guard = new MutationObserver(() => {
		if (host.isConnected && !root.isConnected) host.prepend(root);
	});
	guard.observe(host, { childList: true });
	requestAnimationFrame(() => {
		if (!root.isConnected || root.getBoundingClientRect().width > 0) return;
		host = bar;
		bar.insertBefore(root, bar.firstChild);
		guard.disconnect();
		guard.observe(host, { childList: true });
	});
	mounts.add({
		root,
		guard
	});
}
function onLoad() {
	scoped.ui.injectCss(styles_default);
	scoped.observeDom(GROUP, inject);
}
function onUnload() {
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