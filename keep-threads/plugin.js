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
//#region plugins/keep-threads/index.jsx
var import_web = __toESM(require_web(), 1);
var import_web$1 = __toESM(require_web(), 1);
var import_web$2 = __toESM(require_web(), 1);
var import_web$3 = __toESM(require_web(), 1);
var import_web$4 = __toESM(require_web(), 1);
var import_web$5 = __toESM(require_web(), 1);
const _tmpl$ = /*#__PURE__*/ (0, import_web.template)(`<h3>Kept threads</h3>`, 2), _tmpl$2 = /*#__PURE__*/ (0, import_web.template)(`<p>Right-click a thread and pick Keep thread, or open one and come back here.</p>`, 2), _tmpl$3 = /*#__PURE__*/ (0, import_web.template)(`<p>#<!#><!/> is already kept.</p>`, 4), _tmpl$4 = /*#__PURE__*/ (0, import_web.template)(`<p>None yet.</p>`, 2), _tmpl$5 = /*#__PURE__*/ (0, import_web.template)(`<div><span>#<!#><!/></span><!#><!/></div>`, 8);
const { plugin: { store, scoped }, flux: { storesFlat: { ChannelStore, SelectedChannelStore, FavoriteStore } }, http, ui: { Button, showToast }, solid: { For, Show } } = shelter;
const log = (...a) => console.log("%c[keep-threads]", "color:#5865f2;font-weight:bold", ...a);
const guard = (name, fn) => (...args) => {
	try {
		return fn(...args);
	} catch (e) {
		console.error("[keep-threads] " + name + " threw:", e, "args:", args);
	}
};
store.threads ??= {};
async function revive(id) {
	try {
		log("revive: checking", id);
		await http.ready;
		const { body } = await http.get(`/channels/${id}`);
		const meta = body?.thread_metadata;
		log("revive:", id, body?.name, "thread_metadata:", meta);
		if (!meta?.archived || meta.locked) return log("revive:", id, meta?.locked ? "locked, skipping" : "not archived, nothing to do");
		await http.patch({
			url: `/channels/${id}`,
			body: { archived: false }
		});
		log("revive:", id, "unarchived");
	} catch (e) {
		console.warn("[keep-threads] could not unarchive", id, e);
	}
}
function keep(c) {
	log("keep:", c?.id, c?.name);
	store.threads = {
		...store.threads,
		[c.id]: c.name
	};
	refreshPins();
	revive(c.id);
	showToast({ title: `Keeping #${c.name}` });
}
function drop(id) {
	log("drop:", id);
	const { [id]: _,...rest } = store.threads;
	store.threads = rest;
	refreshPins();
}
const ROW = "[data-list-item-id^=\"channels___\"]";
const markRow = (row) => {
	const kept = !!store.threads[row.dataset.listItemId.split("___")[1]];
	if (kept !== row.hasAttribute("data-kt-kept")) row.toggleAttribute("data-kt-kept", kept);
};
const refreshPins = () => {
	const rows = [...document.querySelectorAll(ROW)];
	rows.forEach(markRow);
	const kept = document.querySelectorAll("[data-kt-kept]");
	log("pins: rows found", rows.length, "marked kept", kept.length, [...kept]);
	kept.forEach((k) => log("pins: kept row", k, "name el", k.querySelector("[class*=\"overflow_\"]")));
};
let lastTarget = null;
function channelIdFrom(el) {
	const row = el.closest?.(ROW);
	log("contextmenu: row via data-list-item-id", row);
	if (row) return row.dataset.listItemId.split("___")[1];
	const a = el.closest?.("a[href*=\"/channels/\"]");
	log("contextmenu: fell back to link", a, "ancestors:", (() => {
		const out = [];
		for (let n = el; n && out.length < 8; n = n.parentElement) out.push(n.tagName + "." + n.className + (n.dataset?.listItemId ? " [" + n.dataset.listItemId + "]" : ""));
		return out;
	})());
	return a?.getAttribute("href").split("/").pop();
}
function onContextMenu(e) {
	const id = channelIdFrom(e.target);
	const c = ChannelStore.getChannel(id);
	lastTarget = c?.isThread?.() ? c : null;
	log("contextmenu: channel id", id, "is thread", !!lastTarget);
}
function addMenuItem(menu) {
	menu.dataset.kt = "1";
	if (menu.matches("[class*=\"submenu_\"]")) return;
	const c = lastTarget;
	lastTarget = null;
	log("menu appeared:", menu.id, "for thread", c?.name);
	if (!c) return;
	const sample = menu.querySelector("[role=\"menuitem\"]:not([aria-disabled=\"true\"])") ?? menu.querySelector("[role=\"menuitem\"]");
	const label = sample?.querySelector("[class*=\"label_\"]");
	if (!sample) return log("menu: no menuitem to clone, giving up");
	const item = document.createElement("div");
	item.setAttribute("role", "menuitem");
	item.tabIndex = -1;
	item.dataset.ktItem = "1";
	item.className = [...sample.classList].filter((k) => !/focused|disabled/.test(k)).join(" ");
	const text = document.createElement("div");
	text.className = label?.className ?? "";
	text.textContent = store.threads[c.id] ? "Stop keeping thread" : "Keep thread";
	item.append(text);
	item.addEventListener("click", guard("menu click", () => {
		store.threads[c.id] ? drop(c.id) : keep(c);
		document.dispatchEvent(new KeyboardEvent("keydown", {
			key: "Escape",
			code: "Escape",
			keyCode: 27,
			bubbles: true
		}));
	}));
	const group = sample.closest("[role=\"group\"]") ?? sample.parentElement;
	group.append(item);
	log("menu: item added");
}
function favouriteIds() {
	const favs = FavoriteStore?.getFavoriteChannels?.() ?? {};
	return Object.keys(favs).filter((id) => {
		const c = ChannelStore.getChannel(id);
		return !c || c.isThread?.();
	});
}
const isKept = (id) => !!store.threads[id] || favouriteIds().includes(id);
let timer;
const reviveAll = () => new Set([...Object.keys(store.threads), ...favouriteIds()]).forEach(revive);
const onContextMenuSafe = guard("contextmenu", onContextMenu);
function onLoad() {
	log("onLoad: kept threads", { ...store.threads });
	log("onLoad: FavoriteStore", FavoriteStore, "methods", FavoriteStore && Object.getOwnPropertyNames(Object.getPrototypeOf(FavoriteStore)), "favourites", FavoriteStore?.getFavoriteChannels?.(), "favourite threads", favouriteIds());
	document.addEventListener("contextmenu", onContextMenuSafe, true);
	scoped.observeDom("[role=\"menu\"]:not([data-kt])", guard("menu", addMenuItem));
	scoped.observeDom(ROW, guard("pin", markRow));
	refreshPins();
	scoped.ui.injectCss(`
    [data-kt-kept] [class*="overflow_"]::before { content: "\\1F4CC  "; }
    [data-kt-item]:hover { background: var(--menu-item-default-hover-bg, var(--brand-500)); color: #fff; }
    [data-kt-item]:hover * { color: #fff; }
  `);
	scoped.flux.subscribe("THREAD_UPDATE", guard("THREAD_UPDATE", ({ channel }) => {
		const meta = channel?.threadMetadata ?? channel?.thread_metadata;
		if (!isKept(channel?.id)) return;
		log("THREAD_UPDATE for kept thread", channel.id, "meta", meta);
		if (meta?.archived) revive(channel.id);
	}));
	reviveAll();
	timer = setInterval(reviveAll, 9e5);
}
function onUnload() {
	clearInterval(timer);
	document.removeEventListener("contextmenu", onContextMenuSafe, true);
	document.querySelectorAll("[data-kt-item]").forEach((n) => n.remove());
	document.querySelectorAll("[data-kt-kept]").forEach((n) => n.removeAttribute("data-kt-kept"));
	log("onUnload");
}
function settings() {
	const c0 = ChannelStore.getChannel(SelectedChannelStore.getChannelId());
	const current = () => c0;
	const isThread = () => current()?.isThread?.();
	return [
		(0, import_web$4.createComponent)(Show, {
			get when() {
				return isThread();
			},
			get fallback() {
				return (0, import_web$3.getNextElement)(_tmpl$2);
			},
			get children() {
				return (0, import_web$4.createComponent)(Show, {
					get when() {
						return !store.threads[current().id];
					},
					get fallback() {
						return (() => {
							const _el$3 = (0, import_web$3.getNextElement)(_tmpl$3), _el$4 = _el$3.firstChild, _el$6 = _el$4.nextSibling, [_el$7, _co$] = (0, import_web$1.getNextMarker)(_el$6.nextSibling), _el$5 = _el$7.nextSibling;
							(0, import_web$2.insert)(_el$3, () => current().name, _el$7, _co$);
							return _el$3;
						})();
					},
					get children() {
						return (0, import_web$4.createComponent)(Button, {
							onClick: () => keep(current()),
							get children() {
								return ["Keep #", (0, import_web$5.memo)(() => current().name)];
							}
						});
					}
				});
			}
		}),
		(() => {
			const _el$ = (0, import_web$3.getNextElement)(_tmpl$);
			_el$.style.setProperty("margin-top", "16px");
			return _el$;
		})(),
		(0, import_web$4.createComponent)(For, {
			get each() {
				return Object.entries(store.threads);
			},
			get fallback() {
				return (0, import_web$3.getNextElement)(_tmpl$4);
			},
			children: ([id, name]) => (() => {
				const _el$9 = (0, import_web$3.getNextElement)(_tmpl$5), _el$0 = _el$9.firstChild, _el$1 = _el$0.firstChild, _el$10 = _el$1.nextSibling, [_el$11, _co$2] = (0, import_web$1.getNextMarker)(_el$10.nextSibling), _el$12 = _el$0.nextSibling, [_el$13, _co$3] = (0, import_web$1.getNextMarker)(_el$12.nextSibling);
				_el$9.style.setProperty("display", "flex");
				_el$9.style.setProperty("align-items", "center");
				_el$9.style.setProperty("gap", "8px");
				_el$9.style.setProperty("margin", "6px 0");
				_el$0.style.setProperty("flex", "1");
				(0, import_web$2.insert)(_el$0, name, _el$11, _co$2);
				(0, import_web$2.insert)(_el$9, (0, import_web$4.createComponent)(Button, {
					size: "small",
					onClick: () => drop(id),
					children: "Remove"
				}), _el$13, _co$3);
				return _el$9;
			})()
		})
	];
}

//#endregion
exports.onLoad = onLoad
exports.onUnload = onUnload
exports.settings = settings
return exports;
})({});