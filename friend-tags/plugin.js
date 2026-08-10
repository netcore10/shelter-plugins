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

//#region plugins/friend-tags/backup.js
const DB_NAME = "friend-tags";
const STORE = "data";
const KEY = "snapshot";
function open() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, 1);
		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}
async function withStore(mode, run) {
	const db = await open();
	try {
		return await new Promise((resolve, reject) => {
			const tx = db.transaction(STORE, mode);
			const request = run(tx.objectStore(STORE));
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
	} finally {
		db.close();
	}
}
async function saveSnapshot(snapshot) {
	try {
		await withStore("readwrite", (store$3) => store$3.put({
			...snapshot,
			savedAt: Date.now()
		}, KEY));
		return true;
	} catch {
		return false;
	}
}
async function loadSnapshot() {
	try {
		return await withStore("readonly", (store$3) => store$3.get(KEY));
	} catch {
		return undefined;
	}
}

//#endregion
//#region plugins/friend-tags/presets.js
const MOTIONS = [
	{
		id: "none",
		label: "None"
	},
	{
		id: "breathe",
		label: "Breathe",
		note: "Gentle scale in and out"
	},
	{
		id: "wiggle",
		label: "Wiggle",
		note: "Rocks side to side"
	},
	{
		id: "float",
		label: "Float",
		note: "Bobs up and down"
	},
	{
		id: "shake",
		label: "Shake",
		note: "Fast nervous jitter"
	},
	{
		id: "pulse",
		label: "Pulse",
		note: "Fades in and out"
	}
];
const COLOR_ANIMS = [
	{
		id: "none",
		label: "None"
	},
	{
		id: "rainbow",
		label: "Rainbow",
		note: "Cycles the hue"
	},
	{
		id: "glow",
		label: "Glow",
		note: "Soft halo that swells"
	},
	{
		id: "shimmer",
		label: "Shimmer",
		note: "Sweeps a highlight across"
	},
	{
		id: "flow",
		label: "Flow",
		note: "Slides the gradient along — needs a gradient fill"
	}
];
const DURATIONS = {
	breathe: 3,
	wiggle: 1.2,
	float: 2.6,
	shake: .5,
	pulse: 2.4,
	rainbow: 6,
	glow: 2.6,
	shimmer: 2.8,
	flow: 4
};
const LEGACY_ANIMATION_TRACK = {
	breathe: "motion",
	wiggle: "motion",
	float: "motion",
	shake: "motion",
	pulse: "motion",
	rainbow: "color",
	glow: "color",
	shimmer: "color"
};
const FONTS = [
	{
		id: "",
		label: "Discord default"
	},
	{
		id: "var(--font-display)",
		label: "Discord display"
	},
	{
		id: "var(--font-code)",
		label: "Monospace"
	},
	{
		id: "Georgia, 'Times New Roman', serif",
		label: "Serif"
	},
	{
		id: "'Comic Sans MS', 'Chalkboard SE', cursive",
		label: "Comic"
	},
	{
		id: "'Brush Script MT', cursive",
		label: "Handwriting"
	},
	{
		id: "Impact, Haettenschweiler, sans-serif",
		label: "Impact"
	},
	{
		id: "'Courier New', monospace",
		label: "Typewriter"
	},
	{
		id: "system-ui, sans-serif",
		label: "System"
	}
];
const GRADIENT_PRESETS = [
	{
		label: "Sunset",
		colors: [
			"#FF6B6B",
			"#FFA36B",
			"#FFD86B"
		],
		angle: 90
	},
	{
		label: "Vaporwave",
		colors: [
			"#FF71CE",
			"#B967FF",
			"#01CDFE"
		],
		angle: 90
	},
	{
		label: "Goth",
		colors: [
			"#2B1331",
			"#7A1FA2",
			"#E040FB"
		],
		angle: 90
	},
	{
		label: "Toxic",
		colors: ["#00F260", "#0575E6"],
		angle: 90
	},
	{
		label: "Blood",
		colors: ["#8E0E00", "#FF4B2B"],
		angle: 90
	},
	{
		label: "Ocean",
		colors: ["#2E3192", "#1BFFFF"],
		angle: 90
	},
	{
		label: "Gold",
		colors: [
			"#B78628",
			"#FCC201",
			"#B78628"
		],
		angle: 90
	},
	{
		label: "Mono",
		colors: ["#434343", "#000000"],
		angle: 90
	}
];
const DEFAULT_STYLE = {
	fill: "solid",
	color: undefined,
	colors: ["#FF71CE", "#01CDFE"],
	angle: 90,
	text: "auto",
	font: "",
	weight: 700,
	italic: false,
	motion: "none",
	motionSpeed: 1,
	colorAnim: "none",
	colorSpeed: 1
};

//#endregion
//#region plugins/friend-tags/data.js
const { plugin: { store: store$2 }, flux: { storesFlat: storesFlat$3 } } = shelter;
store$2.tags ??= {};
store$2.colors ??= {};
store$2.styles ??= {};
store$2.notes ??= {};
store$2.accounts ??= {};
store$2.inFriends ??= true;
store$2.inMessages ??= true;
store$2.inMembers ??= true;
store$2.inDms ??= true;
store$2.inProfiles ??= true;
store$2.inVoice ??= true;
store$2.uppercase ??= true;
store$2.maxShown ??= 3;
store$2.animate ??= true;
store$2.multiAccount ??= false;
store$2.debug ??= false;
function currentAccountId() {
	try {
		return storesFlat$3.UserStore?.getCurrentUser?.()?.id;
	} catch {
		return undefined;
	}
}
/**
* Which account bucket to use, or undefined for the shared top-level maps.
*
* Deliberately falls back to shared whenever the account ID isn't available:
* returning an empty bucket instead would make every tag look like it had been
* wiped, which is far worse than briefly showing the shared set.
*/
const scopedId = () => store$2.multiAccount ? currentAccountId() : undefined;
const rawMap = (name) => {
	const id = scopedId();
	return (id ? store$2.accounts[id]?.[name] : store$2[name]) ?? {};
};
/**
* Deep-copy a store value into plain JS.
*
* Everything read off shelter's store comes back as a proxy whose get trap
* creates a Solid signal AND a valtio subscription *per property read*. Handing
* those proxies to components means every chip builds its own subscriptions,
* and every write then notifies all of them. Detaching once, inside a memo,
* means consumers touch ordinary objects.
*/
function detach(value, depth = 4) {
	if (depth <= 0) return value;
	if (Array.isArray(value)) return value.map((item) => detach(item, depth - 1));
	if (value && typeof value === "object") {
		const out = {};
		for (const key in value) out[key] = detach(value[key], depth - 1);
		return out;
	}
	return value;
}
const readMap = (name) => detach(rawMap(name));
/** Detach a single entry rather than the whole map. */
const readEntry = (name, key) => detach(rawMap(name)[key]);
const display = {
	uppercase: () => store$2.uppercase,
	maxShown: () => store$2.maxShown,
	animate: () => store$2.animate
};
const disposeStoreMemos = () => {};
function writeMap(name, value) {
	const id = scopedId();
	if (!id) store$2[name] = value;
else store$2.accounts = {
		...store$2.accounts,
		[id]: {
			...store$2.accounts[id] ?? {},
			[name]: value
		}
	};
	scheduleBackup();
}
let backupTimer;
/**
* Mirror everything to our own IndexedDB shortly after any change.
*
* Debounced because a rename touches three maps in a row and there's no point
* writing three times.
*/
function scheduleBackup() {
	clearTimeout(backupTimer);
	backupTimer = setTimeout(() => {
		try {
			saveSnapshot(JSON.parse(JSON.stringify({
				tags: store$2.tags,
				colors: store$2.colors,
				styles: store$2.styles,
				notes: store$2.notes,
				accounts: store$2.accounts
			})));
		} catch (err) {
			if (store$2.debug) console.error("[ftags] backup failed", err);
		}
	}, 400);
}
async function restoreFromBackup() {
	const snapshot = await loadSnapshot();
	if (!snapshot) return 0;
	let recovered = 0;
	const isEmpty = (value) => !value || Object.keys(value).length === 0;
	if (isEmpty(store$2.tags) && !isEmpty(snapshot.tags)) {
		store$2.tags = snapshot.tags;
		recovered = Object.keys(snapshot.tags).length;
	}
	if (isEmpty(store$2.colors) && !isEmpty(snapshot.colors)) store$2.colors = snapshot.colors;
	if (isEmpty(store$2.styles) && !isEmpty(snapshot.styles)) store$2.styles = snapshot.styles;
	if (isEmpty(store$2.notes) && !isEmpty(snapshot.notes)) store$2.notes = snapshot.notes;
	if (isEmpty(store$2.accounts) && !isEmpty(snapshot.accounts)) store$2.accounts = snapshot.accounts;
	return recovered;
}
function seedCurrentAccount() {
	const id = currentAccountId();
	if (!id || store$2.accounts[id]) return false;
	store$2.accounts = {
		...store$2.accounts,
		[id]: {
			tags: { ...store$2.tags },
			colors: { ...store$2.colors },
			styles: { ...store$2.styles }
		}
	};
	return true;
}
const normalise = (tag) => String(tag ?? "").replace(/\s+/g, " ").trim();
const tagKey = (tag) => normalise(tag).toLowerCase();
const allUserTags = () => readMap("tags");
const getNote = (userId) => readEntry("notes", userId) ?? "";
function setNote(userId, note) {
	const text = String(note ?? "").trim();
	const next = { ...readMap("notes") };
	if (text) next[userId] = text;
else delete next[userId];
	writeMap("notes", next);
}
const getTags = (userId) => readEntry("tags", userId) ?? [];
function setTags(userId, tags) {
	const seen = new Set();
	const clean = [];
	for (const raw of tags) {
		const tag = normalise(raw);
		if (!tag || seen.has(tagKey(tag))) continue;
		seen.add(tagKey(tag));
		clean.push(tag);
	}
	const next = { ...readMap("tags") };
	if (clean.length) next[userId] = clean;
else delete next[userId];
	writeMap("tags", next);
}
const addTag = (userId, tag) => setTags(userId, [...getTags(userId), tag]);
const removeTag = (userId, tag) => setTags(userId, getTags(userId).filter((t) => tagKey(t) !== tagKey(tag)));
const clearUser = (userId) => setTags(userId, []);
function allTags() {
	const counts = new Map();
	for (const tags of Object.values(readMap("tags"))) for (const tag of tags) {
		const key = tagKey(tag);
		const entry = counts.get(key);
		if (entry) entry.count++;
else counts.set(key, {
			key,
			label: tag,
			count: 1
		});
	}
	return [...counts.values()].sort((a, b) => a.label.localeCompare(b.label));
}
function renameTag(from, to) {
	const target = normalise(to);
	if (!target || normalise(from) === target) return;
	const nextTags = {};
	for (const [userId, tags] of Object.entries(readMap("tags"))) {
		const seen = new Set();
		const mapped = [];
		for (const tag of tags) {
			const next = tagKey(tag) === tagKey(from) ? target : tag;
			if (seen.has(tagKey(next))) continue;
			seen.add(tagKey(next));
			mapped.push(next);
		}
		if (mapped.length) nextTags[userId] = mapped;
	}
	writeMap("tags", nextTags);
	const nextColors = { ...readMap("colors") };
	const colour = nextColors[tagKey(from)];
	delete nextColors[tagKey(from)];
	if (colour) nextColors[tagKey(target)] = colour;
	writeMap("colors", nextColors);
	const nextStyles = { ...readMap("styles") };
	const style = nextStyles[tagKey(from)];
	delete nextStyles[tagKey(from)];
	if (style) nextStyles[tagKey(target)] = style;
	writeMap("styles", nextStyles);
}
function deleteTag(tag) {
	const nextTags = {};
	for (const [userId, tags] of Object.entries(readMap("tags"))) {
		const kept = tags.filter((t) => tagKey(t) !== tagKey(tag));
		if (kept.length) nextTags[userId] = kept;
	}
	writeMap("tags", nextTags);
	const nextColors = { ...readMap("colors") };
	delete nextColors[tagKey(tag)];
	writeMap("colors", nextColors);
	const nextStyles = { ...readMap("styles") };
	delete nextStyles[tagKey(tag)];
	writeMap("styles", nextStyles);
}
const PALETTE = [
	"#5865F2",
	"#3BA55D",
	"#FAA81A",
	"#ED4245",
	"#EB459E",
	"#00A8FC",
	"#F47B67",
	"#9B59B6",
	"#1ABC9C",
	"#E67E22",
	"#7289DA",
	"#43B581",
	"#C77DFF",
	"#F0B232"
];
function hashString(str) {
	let hash = 0;
	for (let i = 0; i < str.length; i++) hash = Math.imul(hash, 31) + str.charCodeAt(i) | 0;
	return Math.abs(hash);
}
const colorOf = (tag) => readEntry("colors", tagKey(tag)) ?? PALETTE[hashString(tagKey(tag)) % PALETTE.length];
function setColor(tag, color) {
	writeMap("colors", {
		...readMap("colors"),
		[tagKey(tag)]: color
	});
}
function resetColor(tag) {
	const next = { ...readMap("colors") };
	delete next[tagKey(tag)];
	writeMap("colors", next);
}
function textOn(hex) {
	const value = parseInt(String(hex).slice(1), 16);
	if (!Number.isFinite(value)) return "#fff";
	const r = value >> 16 & 255;
	const g = value >> 8 & 255;
	const b = value & 255;
	return (r * 299 + g * 587 + b * 114) / 1e3 > 150 ? "#000" : "#fff";
}
function styleOf(tag) {
	const saved = readEntry("styles", tagKey(tag)) ?? {};
	const style = {
		...DEFAULT_STYLE,
		...saved,
		color: saved.color ?? colorOf(tag)
	};
	if (saved.animation && !saved.motion && !saved.colorAnim) {
		const track = LEGACY_ANIMATION_TRACK[saved.animation];
		if (track === "motion") {
			style.motion = saved.animation;
			style.motionSpeed = saved.speed ?? 1;
		} else if (track === "color") {
			style.colorAnim = saved.animation;
			style.colorSpeed = saved.speed ?? 1;
		}
	}
	return style;
}
function setStyle(tag, patch) {
	const key = tagKey(tag);
	writeMap("styles", {
		...readMap("styles"),
		[key]: {
			...readMap("styles")[key],
			...patch
		}
	});
	if (patch.color) setColor(tag, patch.color);
}
function resetStyle(tag) {
	const next = { ...readMap("styles") };
	delete next[tagKey(tag)];
	writeMap("styles", next);
	resetColor(tag);
}
function styleToCss(style, { animate = true } = {}) {
	const gradient = style.fill === "gradient" && style.colors?.length > 1;
	const background = gradient ? `linear-gradient(${style.angle ?? 90}deg, ${style.colors.join(", ")})` : style.color;
	const backdrop = gradient ? averageColor(style.colors) : style.color;
	const css = {
		background,
		color: style.text && style.text !== "auto" ? style.text : textOn(backdrop),
		"font-weight": String(style.weight ?? 700)
	};
	if (style.font) css["font-family"] = style.font;
	if (style.italic) css["font-style"] = "italic";
	if (!animate) return css;
	const tracks = [];
	const add = (name, speed) => {
		const duration = DURATIONS[name];
		if (!duration) return;
		tracks.push(`ftags-${name} ${(duration / (speed > 0 ? speed : 1)).toFixed(2)}s ease-in-out infinite`);
	};
	add(style.motion, style.motionSpeed);
	if (style.colorAnim === "rainbow" || style.colorAnim === "flow") {
		const duration = DURATIONS[style.colorAnim];
		const speed = style.colorSpeed > 0 ? style.colorSpeed : 1;
		tracks.push(`ftags-${style.colorAnim} ${(duration / speed).toFixed(2)}s linear infinite`);
	} else add(style.colorAnim, style.colorSpeed);
	if (tracks.length) css.animation = tracks.join(", ");
	if (style.colorAnim === "shimmer") {
		const base = gradient ? background : `linear-gradient(90deg, ${style.color}, ${style.color})`;
		css["background-image"] = `${base}, linear-gradient(100deg, transparent 20%, rgba(255,255,255,.55) 50%, transparent 80%)`;
		css["background-size"] = "100% 100%, 220% 100%";
		css["background-repeat"] = "no-repeat";
	}
	if (style.colorAnim === "flow" && gradient) css["background-size"] = "200% 100%";
	return css;
}
function averageColor(hexes) {
	let r = 0;
	let g = 0;
	let b = 0;
	for (const hex of hexes) {
		const value = parseInt(String(hex).slice(1), 16);
		if (!Number.isFinite(value)) continue;
		r += value >> 16 & 255;
		g += value >> 8 & 255;
		b += value & 255;
	}
	const n = hexes.length || 1;
	const toHex = (c) => Math.round(c / n).toString(16).padStart(2, "0");
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
const exportData = () => JSON.stringify({
	tags: readMap("tags"),
	colors: readMap("colors"),
	styles: readMap("styles"),
	notes: readMap("notes")
}, null, 2);
function importData(json, { merge = false } = {}) {
	const parsed = JSON.parse(json);
	if (!parsed || typeof parsed !== "object" || typeof parsed.tags !== "object" || parsed.tags === null) throw new Error("Expected an object with a `tags` property.");
	const incoming = {};
	let tagCount = 0;
	for (const [userId, tags] of Object.entries(parsed.tags)) {
		if (!Array.isArray(tags)) continue;
		const clean = tags.map(normalise).filter(Boolean);
		if (clean.length) {
			incoming[userId] = clean;
			tagCount += clean.length;
		}
	}
	const counts = {
		users: Object.keys(incoming).length,
		tags: tagCount
	};
	if (!merge) {
		writeMap("tags", incoming);
		writeMap("colors", parsed.colors && typeof parsed.colors === "object" ? { ...parsed.colors } : {});
		writeMap("styles", parsed.styles && typeof parsed.styles === "object" ? { ...parsed.styles } : {});
		writeMap("notes", parsed.notes && typeof parsed.notes === "object" ? { ...parsed.notes } : {});
		return counts;
	}
	const merged = { ...readMap("tags") };
	for (const [userId, tags] of Object.entries(incoming)) {
		const seen = new Set();
		merged[userId] = [...merged[userId] ?? [], ...tags].filter((tag) => {
			if (seen.has(tagKey(tag))) return false;
			seen.add(tagKey(tag));
			return true;
		});
	}
	writeMap("tags", merged);
	if (parsed.colors && typeof parsed.colors === "object") writeMap("colors", {
		...readMap("colors"),
		...parsed.colors
	});
	if (parsed.styles && typeof parsed.styles === "object") writeMap("styles", {
		...readMap("styles"),
		...parsed.styles
	});
	if (parsed.notes && typeof parsed.notes === "object") writeMap("notes", {
		...readMap("notes"),
		...parsed.notes
	});
	return counts;
}

//#endregion
//#region plugins/friend-tags/styles.js
var styles_default = `
/* Wrapper we can remove wholesale on unload; lays out as if it weren't there. */
.ftags-mount { display: contents; }

/* --- tag animations ---
   Names must stay in sync with ANIMATION_DURATIONS in presets.js. Transforms
   need a transform-friendly display, which .ftags-chip already has. */

@keyframes ftags-breathe {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.09); }
}

@keyframes ftags-wiggle {
  0%, 100% { transform: rotate(-3.5deg); }
  50%      { transform: rotate(3.5deg); }
}

@keyframes ftags-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: .5; }
}

/* box-shadow only, deliberately: glow shares the colour track with rainbow, and
   animating filter here would fight rainbow's hue-rotate if both ever ran. */
@keyframes ftags-glow {
  0%, 100% { box-shadow: 0 0 0 0 currentColor; }
  50%      { box-shadow: 0 0 9px 1px currentColor; }
}

@keyframes ftags-float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-3px); }
}

@keyframes ftags-shake {
  0%, 100%      { transform: translateX(0); }
  20%, 60%      { transform: translateX(-1.5px); }
  40%, 80%      { transform: translateX(1.5px); }
}

/* hue-rotate works on any base colour, solid or gradient */
@keyframes ftags-rainbow {
  from { filter: hue-rotate(0deg); }
  to   { filter: hue-rotate(360deg); }
}

@keyframes ftags-shimmer {
  from { background-position: 0 0, -120% 0; }
  to   { background-position: 0 0, 220% 0; }
}

/* slides the gradient itself along the chip */
@keyframes ftags-flow {
  from { background-position: 0% 50%; }
  to   { background-position: 200% 50%; }
}

/* Respect the OS setting — animated chips sit in peripheral vision all day. */
@media (prefers-reduced-motion: reduce) {
  .ftags-chip { animation: none !important; }
}

.ftags-row {
  display: inline-flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 4px;
  margin-left: 6px;
  vertical-align: middle;
  position: relative;
  top: -1px;
}

.ftags-chip {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 7px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  line-height: 20px;
  letter-spacing: .02em;
  white-space: nowrap;
  flex: 0 0 auto;
  font-family: var(--font-display);
}

.ftags-chip--upper { text-transform: uppercase; }

/* Lays the label out as a flex line so the emoji is CENTRED against the text
   rather than hung off its baseline. Baseline alignment depends on the font's
   ascent/descent, which is why nudging vertical-align kept missing.

   white-space: pre is what makes this safe: a flex container normally drops the
   leading/trailing whitespace of each text run, which would turn "~a~ b" into
   "ab". pre preserves those spaces and prevents wrapping at the same time. */
.ftags-chip-text {
  display: inline-flex;
  align-items: center;
  white-space: pre;
  min-width: 0;
  overflow: hidden;
}

/* Emoji inside a tag. Sized in em so it tracks the chip's font-size, and set
   generously since seeing the emoji is half the point of allowing them.
   object-fit guards against non-square custom emoji.

   No vertical-align at all: the parent is a flex line with align-items: center,
   so the emoji is centred geometrically. Baseline offsets were the problem —
   they position relative to font metrics, so every value was either too low or
   too high depending on the face in use. */
.ftags-emoji {
  height: 1.45em;
  width: 1.45em;
  object-fit: contain;
  margin: 0 .06em;
  flex: 0 0 auto;
  display: block;
  cursor: pointer;
}

/* Unicode emoji get a wrapper purely so they're clickable like image ones. */
.ftags-emoji-char {
  flex: 0 0 auto;
  cursor: pointer;
  font-size: 1.25em;
  line-height: 1;
}

/* --- click-to-preview popout --- */

.ftags-preview-host { position: static; }

.ftags-preview-pop {
  position: fixed;
  z-index: 10001;
  padding: 14px 12px 12px;
  text-align: center;
  background-color: #111214;
  color: #dbdee1;
  border: 1px solid rgba(0, 0, 0, .4);
  border-radius: 8px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, .45);
}

.theme-light .ftags-preview-pop,
html.theme-light .ftags-preview-pop {
  background-color: #ffffff;
  color: #313338;
  border-color: rgba(0, 0, 0, .12);
  box-shadow: 0 8px 20px rgba(0, 0, 0, .16);
}

.ftags-preview-art {
  display: grid;
  place-items: center;
  height: 76px;
  margin-bottom: 10px;
}
.ftags-preview-art img { width: 72px; height: 72px; object-fit: contain; }
.ftags-preview-char { font-size: 62px; line-height: 1; }

.ftags-preview-name {
  font-size: 14px;
  font-weight: 700;
  word-break: break-all;
}

.ftags-preview-source {
  margin-top: 3px;
  font-size: 12px;
  color: #949ba4;
}

/* Inline code in a tag: the chip already has a background, so just nudge it. */
.ftags-code {
  font-family: var(--font-code), monospace;
  font-size: .9em;
  padding: 0 .25em;
  border-radius: 3px;
  background: rgba(0, 0, 0, .22);
  text-transform: none;
}

.ftags-chip--more {
  background: var(--background-modifier-accent) !important;
  color: var(--text-muted) !important;
}

/* Compact surfaces (member list, DM list) are width constrained. The chip must
   be allowed to SHRINK (flex: 0 1 auto) for text-overflow to kick in — with the
   base "flex: 0 0 auto" it just overflows and gets cut off mid-word. */
/* Shrink to the chip's own width instead of reserving a share of the row.
   max-width: 50% held that space open whether or not the tag needed it, which
   left a gap between the tag and whatever follows it in the DM list. */
/* Cap it: uncapped, a long tag takes the whole row and truncates the name it
   belongs to. The name comes first — the tag clips instead. */
.ftags-row--compact {
  min-width: 0;
  max-width: 40%;
  flex: 0 1 auto;
}
.ftags-row--compact .ftags-chip {
  flex: 0 1 auto;
  min-width: 1.5em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  max-width: 100%;
}

.ftags-add {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  background: var(--background-modifier-accent);
  color: var(--interactive-normal);
  font-size: 11px;
  line-height: 1;
  flex: 0 0 auto;
  opacity: 0;
  transition: opacity .1s ease, background-color .1s ease;
}
.ftags-add:hover { background: var(--background-modifier-selected); color: var(--interactive-active); }

/* Keep the friends list clean: the add button only appears on hover. */
.ftags-row--editable:hover .ftags-add,
.ftags-add:focus-visible { opacity: 1; }
[class*="peopleListItem"]:hover .ftags-add { opacity: 1; }

/* An untagged row is nothing but the add button, so there'd be no hover target
   at all. Leave it faintly visible so the feature is discoverable. */
.ftags-row--empty .ftags-add { opacity: .4; }
.ftags-row--empty:hover .ftags-add { opacity: 1; }

.ftags-row--editable .ftags-chip { cursor: pointer; }

/* --- editor / manager modals --- */

/* Belt and braces: even a static chip's box-shadow shouldn't be able to grow
   these lists enough to toggle the modal's scrollbar. */
.ftags-editor-list,
.ftags-suggestions {
  overflow: hidden;
}

.ftags-editor-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
  min-height: 24px;
}

.ftags-editor-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 4px 0 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.ftags-editor-chip button {
  all: unset;
  cursor: pointer;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 13px;
  line-height: 1;
  opacity: .65;
}
.ftags-editor-chip button:hover { opacity: 1; background: rgba(0, 0, 0, .2); }

.ftags-empty {
  color: var(--text-muted);
  font-size: 13px;
  font-style: italic;
}

.ftags-add-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.ftags-add-row > :first-child { flex: 1; }

.ftags-live-preview {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}
.ftags-live-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--header-secondary);
}

.ftags-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.ftags-suggestion {
  cursor: pointer;
  opacity: .55;
  transition: opacity .1s ease;
}
.ftags-suggestion:hover { opacity: 1; }

.ftags-manager-grid {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: 8px 10px;
}

/* --- colour picker: saturation/brightness square + hue bar --- */

/* Reserves the picker's height while it waits for the modal animation, so
   nothing jumps when it appears. */
.ftags-picker-slot { min-height: 232px; }

.ftags-picker { display: flex; flex-direction: column; gap: 10px; width: 100%; }

/* Saturation left-to-right, brightness top-to-bottom, over the current hue.
   Layer order matters: the black overlay sits on top of the white one. */
.ftags-picker-sv {
  position: relative;
  height: 150px;
  border-radius: 6px;
  cursor: crosshair;
  touch-action: none;
  background-image:
    linear-gradient(to top, #000, rgba(0, 0, 0, 0)),
    linear-gradient(to right, #fff, rgba(255, 255, 255, 0));
}

.ftags-picker-hue {
  position: relative;
  height: 16px;
  border-radius: 8px;
  cursor: ew-resize;
  touch-action: none;
  background: linear-gradient(to right,
    #f00 0%, #ff0 16.66%, #0f0 33.33%, #0ff 50%, #00f 66.66%, #f0f 83.33%, #f00 100%);
}

.ftags-picker-thumb {
  position: absolute;
  width: 14px;
  height: 14px;
  margin: -7px 0 0 -7px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, .55), inset 0 0 0 1px rgba(0, 0, 0, .35);
  pointer-events: none;
}

.ftags-picker-row { display: flex; align-items: center; gap: 8px; }
.ftags-picker-row > :last-child { flex: 1; }

.ftags-picker-preview {
  width: 34px;
  height: 30px;
  flex: 0 0 auto;
  border-radius: 6px;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .35);
}

/* The colour pip: a shelter Button painted with the colour, so clicking the
   colour itself opens the picker window. */
.ftags-swatch-trigger {
  width: 100%;
  height: 34px;
  min-width: 0;
  padding: 0;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .4);
  transition: filter .1s ease;
}
.ftags-swatch-trigger:hover { filter: brightness(1.12); }

.ftags-swatch-trigger--stop { width: 46px; }
.ftags-swatch-trigger--on {
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .4), 0 0 0 2px var(--brand-experiment, #5865F2);
}

.ftags-stops {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.ftags-stops .ftags-picker-dot { margin-right: 6px; }

.ftags-count {
  color: var(--text-muted);
  font-size: 12px;
  white-space: nowrap;
}

.ftags-user-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid var(--background-modifier-accent);
}
.ftags-user-row:last-child { border-bottom: none; }

.ftags-user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--header-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 0 0 auto;
  max-width: 40%;
}

.ftags-user-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

/* --- emoji autocomplete ---
   Modelled on Discord's own autocomplete popout: floating panel above the
   input, muted uppercase header, highlighted row follows keyboard and mouse. */

/* Portalled into the modal's <dialog> and positioned with fixed coords, so the
   modal body's scrolling can't clip it and the top layer can't hide it.

   Colours here are literal on purpose. A var() fallback only applies when the
   variable is UNDEFINED — if Discord defines it but it resolves to
   something invalid, the property becomes "initial", i.e. a transparent
   background, which is exactly what happened. A floating panel must never be
   see-through, so the base colours are hard-coded and the light theme is
   handled explicitly below. */
.ftags-ac {
  z-index: 10000;
  min-width: 240px;
  background-color: #111214;
  color: #dbdee1;
  border: 1px solid rgba(0, 0, 0, .4);
  border-radius: 6px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, .45);
  overflow: hidden;
}

.theme-light .ftags-ac,
html.theme-light .ftags-ac {
  background-color: #ffffff;
  color: #313338;
  border-color: rgba(0, 0, 0, .12);
  box-shadow: 0 8px 20px rgba(0, 0, 0, .16);
}

.ftags-ac-header {
  padding: 8px 10px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: #949ba4;
  border-bottom: 1px solid rgba(255, 255, 255, .06);
  background-color: inherit;
}
.ftags-ac-header strong { color: #f2f3f5; }

.theme-light .ftags-ac-header strong,
html.theme-light .ftags-ac-header strong { color: #060607; }
.theme-light .ftags-ac-header,
html.theme-light .ftags-ac-header { border-bottom-color: rgba(0, 0, 0, .08); }

.ftags-ac-list {
  max-height: 240px;
  overflow-y: auto;
  padding: 4px 0;
  background-color: inherit;
}

.ftags-ac-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  cursor: pointer;
  color: inherit;
}
.ftags-ac-row--on { background-color: rgba(255, 255, 255, .07); }

.theme-light .ftags-ac-row--on,
html.theme-light .ftags-ac-row--on { background-color: rgba(0, 0, 0, .06); }

.ftags-ac-emoji {
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
}
.ftags-ac-emoji img { width: 22px; height: 22px; object-fit: contain; }
.ftags-ac-char { font-size: 19px; line-height: 1; }

.ftags-ac-name {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

/* Marks entries that come from your servers rather than the unicode set. */
.ftags-ac-badge {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .02em;
  padding: 2px 5px;
  border-radius: 3px;
  color: #b5bac1;
  background-color: rgba(255, 255, 255, .08);
  flex: 0 0 auto;
}

.theme-light .ftags-ac-badge,
html.theme-light .ftags-ac-badge {
  color: #5c5e66;
  background-color: rgba(0, 0, 0, .06);
}

/* --- styler --- */

.ftags-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  /* Generous padding so a rotating (wiggle) or scaling (breathe) chip has room
     to move inside the box. overflow stays hidden — letting it spill instead
     makes the modal body scrollbar flicker in time with the animation. */
  padding: 30px 34px;
  margin-bottom: 14px;
  border-radius: 8px;
  background: var(--background-secondary);
  border: 1px solid var(--background-modifier-accent);
  /* Padding gives breathe/float room to move. overflow must NOT be visible:
     an animated chip that spills outside the box intermittently overflows the
     modal body, which makes its scrollbar flicker on and off as the animation
     loops. */
  overflow: hidden;
}
.ftags-preview .ftags-chip { height: 26px; line-height: 26px; font-size: 13px; padding: 0 10px; border-radius: 13px; }

.ftags-field { margin-bottom: 12px; display: flex; flex-direction: column; gap: 6px; }

.ftags-stop-remove {
  all: unset;
  cursor: pointer;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1;
  padding: 2px;
}
.ftags-stop-remove:hover { color: var(--text-danger); }

.ftags-font-grid,
.ftags-anim-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 6px;
  margin-bottom: 8px;
}

.ftags-font-option,
.ftags-anim-option {
  all: unset;
  cursor: pointer;
  text-align: center;
  padding: 7px 6px;
  border-radius: 6px;
  font-size: 13px;
  color: var(--interactive-normal);
  background: var(--background-secondary);
  border: 1px solid transparent;
  transition: background-color .1s ease, border-color .1s ease;
}
.ftags-font-option:hover,
.ftags-anim-option:hover { background: var(--background-modifier-hover); color: var(--interactive-hover); }

.ftags-font-option--on,
.ftags-anim-option--on {
  background: var(--background-modifier-selected);
  border-color: var(--brand-experiment, #5865F2);
  color: var(--interactive-active);
}
`;

//#endregion
//#region solid-js/web
var require_web = __commonJS({ "solid-js/web"(exports, module) {
	module.exports = shelter.solidWeb;
} });

//#endregion
//#region plugins/friend-tags/ui/EmojiPreview.jsx
var import_web$102 = __toESM(require_web(), 1);
var import_web$103 = __toESM(require_web(), 1);
var import_web$104 = __toESM(require_web(), 1);
var import_web$105 = __toESM(require_web(), 1);
var import_web$106 = __toESM(require_web(), 1);
var import_web$107 = __toESM(require_web(), 1);
var import_web$108 = __toESM(require_web(), 1);
var import_web$109 = __toESM(require_web(), 1);
var import_web$110 = __toESM(require_web(), 1);
var import_web$111 = __toESM(require_web(), 1);
var import_web$112 = __toESM(require_web(), 1);
const _tmpl$$11 = /*#__PURE__*/ (0, import_web$102.template)(`<div class="ftags-preview-pop"><div class="ftags-preview-art"></div><div class="ftags-preview-name">:<!#><!/>:</div><div class="ftags-preview-source"></div></div>`, 10), _tmpl$2$9 = /*#__PURE__*/ (0, import_web$102.template)(`<img>`, 1), _tmpl$3$7 = /*#__PURE__*/ (0, import_web$102.template)(`<span class="ftags-preview-char"></span>`, 2);
const { flux: { storesFlat: storesFlat$2 }, solidWeb: { render }, ui: { getRoot: getRoot$1 } } = shelter;
let dispose;
function closeEmojiPreview() {
	dispose?.();
	dispose = undefined;
}
/** Where a custom emoji comes from, if Discord will tell us. */
function sourceOf(emoji) {
	if (!emoji.id) return "Standard emoji";
	try {
		const custom = storesFlat$2.EmojiStore?.getCustomEmojiById?.(emoji.id);
		const guild = custom?.guildId && storesFlat$2.GuildStore?.getGuild?.(custom.guildId);
		if (guild?.name) return `Server emoji — ${guild.name}`;
	} catch {}
	return "Server emoji";
}
function Preview(props) {
	const rect = props.rect;
	const width = 190;
	const height = 150;
	const above = rect.top > height + 12;
	const left = Math.min(Math.max(8, rect.left + rect.width / 2 - width / 2), window.innerWidth - width - 8);
	return (() => {
		const _el$ = (0, import_web$108.getNextElement)(_tmpl$$11), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling, _el$4 = _el$3.firstChild, _el$6 = _el$4.nextSibling, [_el$7, _co$] = (0, import_web$110.getNextMarker)(_el$6.nextSibling), _el$5 = _el$7.nextSibling, _el$8 = _el$3.nextSibling;
		_el$.$$click = (e) => e.stopPropagation();
		(0, import_web$111.insert)(_el$2, (() => {
			const _c$ = (0, import_web$112.memo)(() => !!props.emoji.id);
			return () => _c$() ? (() => {
				const _el$9 = (0, import_web$108.getNextElement)(_tmpl$2$9);
				(0, import_web$105.setAttribute)(_el$9, "draggable", false);
				(0, import_web$107.effect)((_p$) => {
					const _v$ = `https://cdn.discordapp.com/emojis/${props.emoji.id}.${props.emoji.animated ? "gif" : "webp"}?size=128`, _v$2 = props.emoji.name ?? "";
					_v$ !== _p$._v$ && (0, import_web$105.setAttribute)(_el$9, "src", _p$._v$ = _v$);
					_v$2 !== _p$._v$2 && (0, import_web$105.setAttribute)(_el$9, "alt", _p$._v$2 = _v$2);
					return _p$;
				}, {
					_v$: undefined,
					_v$2: undefined
				});
				return _el$9;
			})() : (() => {
				const _el$0 = (0, import_web$108.getNextElement)(_tmpl$3$7);
				(0, import_web$111.insert)(_el$0, () => props.emoji.char);
				return _el$0;
			})();
		})());
		(0, import_web$111.insert)(_el$3, () => props.emoji.name ?? "emoji", _el$7, _co$);
		(0, import_web$111.insert)(_el$8, () => sourceOf(props.emoji));
		(0, import_web$107.effect)((_$p) => (0, import_web$106.style)(_el$, {
			left: `${left}px`,
			width: `${width}px`,
			...above ? { bottom: `${window.innerHeight - rect.top + 10}px` } : { top: `${rect.bottom + 10}px` }
		}, _$p));
		(0, import_web$109.runHydrationEvents)();
		return _el$;
	})();
}
function showEmojiPreview(emoji, anchor) {
	closeEmojiPreview();
	const root = (() => {
		try {
			return getRoot$1?.(anchor) || document.body;
		} catch {
			return document.body;
		}
	})();
	const container = document.createElement("div");
	container.className = "ftags-preview-host";
	root.appendChild(container);
	const rect = anchor.getBoundingClientRect();
	const unrender = render(() => (0, import_web$104.createComponent)(Preview, {
		emoji,
		rect
	}), container);
	const onKey = (e) => {
		if (e.key === "Escape") closeEmojiPreview();
	};
	const listen = () => {
		document.addEventListener("click", closeEmojiPreview);
		document.addEventListener("keydown", onKey, true);
		window.addEventListener("scroll", closeEmojiPreview, true);
	};
	const timer = setTimeout(listen);
	dispose = () => {
		clearTimeout(timer);
		document.removeEventListener("click", closeEmojiPreview);
		document.removeEventListener("keydown", onKey, true);
		window.removeEventListener("scroll", closeEmojiPreview, true);
		unrender();
		container.remove();
	};
}
(0, import_web$103.delegateEvents)(["click"]);

//#endregion
//#region plugins/friend-tags/emoji.js
const { flux: { storesFlat: storesFlat$1 } } = shelter;
const UNICODE = {
	grinning: "😀",
	smile: "😄",
	joy: "😂",
	rofl: "🤣",
	sweat_smile: "😅",
	wink: "😉",
	blush: "😊",
	yum: "😋",
	sunglasses: "😎",
	heart_eyes: "😍",
	kissing_heart: "😘",
	thinking: "🤔",
	neutral_face: "😐",
	expressionless: "😑",
	smirk: "😏",
	unamused: "😒",
	pensive: "😔",
	confused: "😕",
	worried: "😟",
	cry: "😢",
	sob: "😭",
	angry: "😠",
	rage: "😡",
	triumph: "😤",
	sleepy: "😪",
	sleeping: "😴",
	mask: "😷",
	nauseated: "🤢",
	dizzy_face: "😵",
	cowboy: "🤠",
	clown: "🤡",
	skull: "💀",
	ghost: "👻",
	alien: "👽",
	robot: "🤖",
	smiling_imp: "😈",
	imp: "👿",
	japanese_ogre: "👹",
	poop: "💩",
	upside_down: "🙃",
	money_mouth: "🤑",
	nerd: "🤓",
	star_struck: "🤩",
	partying: "🥳",
	melting: "🫠",
	pleading: "🥺",
	yawning: "🥱",
	woozy: "🥴",
	hot: "🥵",
	cold: "🥶",
	heart: "❤️",
	orange_heart: "🧡",
	yellow_heart: "💛",
	green_heart: "💚",
	blue_heart: "💙",
	purple_heart: "💜",
	black_heart: "🖤",
	white_heart: "🤍",
	brown_heart: "🤎",
	broken_heart: "💔",
	two_hearts: "💕",
	sparkling_heart: "💖",
	heartpulse: "💗",
	cupid: "💘",
	gift_heart: "💝",
	thumbsup: "👍",
	thumbsdown: "👎",
	ok_hand: "👌",
	punch: "👊",
	fist: "✊",
	wave: "👋",
	raised_hands: "🙌",
	pray: "🙏",
	clap: "👏",
	muscle: "💪",
	point_up: "☝️",
	point_down: "👇",
	point_left: "👈",
	point_right: "👉",
	v: "✌️",
	crossed_fingers: "🤞",
	metal: "🤘",
	call_me: "🤙",
	eyes: "👀",
	brain: "🧠",
	tongue: "👅",
	lips: "👄",
	ear: "👂",
	nose: "👃",
	fire: "🔥",
	sparkles: "✨",
	star: "⭐",
	star2: "🌟",
	zap: "⚡",
	boom: "💥",
	collision: "💢",
	dizzy: "💫",
	sweat_drops: "💦",
	dash: "💨",
	tornado: "🌪️",
	rainbow: "🌈",
	sunny: "☀️",
	cloud: "☁️",
	snowflake: "❄️",
	crescent_moon: "🌙",
	full_moon: "🌕",
	earth: "🌍",
	comet: "☄️",
	crown: "👑",
	gem: "💎",
	ring: "💍",
	lipstick: "💄",
	high_heel: "👠",
	dress: "👗",
	tada: "🎉",
	confetti_ball: "🎊",
	balloon: "🎈",
	gift: "🎁",
	birthday: "🎂",
	cake: "🍰",
	pizza: "🍕",
	hamburger: "🍔",
	fries: "🍟",
	hotdog: "🌭",
	taco: "🌮",
	burrito: "🌯",
	popcorn: "🍿",
	doughnut: "🍩",
	cookie: "🍪",
	chocolate: "🍫",
	candy: "🍬",
	lollipop: "🍭",
	coffee: "☕",
	tea: "🍵",
	beer: "🍺",
	beers: "🍻",
	wine_glass: "🍷",
	cocktail: "🍸",
	tropical_drink: "🍹",
	champagne: "🍾",
	milk: "🥛",
	apple: "🍎",
	banana: "🍌",
	cherries: "🍒",
	grapes: "🍇",
	strawberry: "🍓",
	peach: "🍑",
	watermelon: "🍉",
	avocado: "🥑",
	eggplant: "🍆",
	dog: "🐶",
	cat: "🐱",
	mouse: "🐭",
	fox: "🦊",
	bear: "🐻",
	panda: "🐼",
	koala: "🐨",
	tiger: "🐯",
	lion: "🦁",
	cow: "🐮",
	pig: "🐷",
	frog: "🐸",
	monkey: "🐵",
	chicken: "🐔",
	penguin: "🐧",
	bird: "🐦",
	duck: "🦆",
	eagle: "🦅",
	owl: "🦉",
	bat: "🦇",
	wolf: "🐺",
	unicorn: "🦄",
	horse: "🐴",
	bee: "🐝",
	bug: "🐛",
	butterfly: "🦋",
	snail: "🐌",
	spider: "🕷️",
	snake: "🐍",
	turtle: "🐢",
	dragon: "🐉",
	whale: "🐳",
	dolphin: "🐬",
	fish: "🐟",
	octopus: "🐙",
	crab: "🦀",
	shark: "🦈",
	rose: "🌹",
	tulip: "🌷",
	sunflower: "🌻",
	cherry_blossom: "🌸",
	hibiscus: "🌺",
	bouquet: "💐",
	herb: "🌿",
	four_leaf_clover: "🍀",
	maple_leaf: "🍁",
	cactus: "🌵",
	palm_tree: "🌴",
	christmas_tree: "🎄",
	mushroom: "🍄",
	music: "🎵",
	notes: "🎶",
	headphones: "🎧",
	guitar: "🎸",
	microphone: "🎤",
	drum: "🥁",
	video_game: "🎮",
	dart: "🎯",
	game_die: "🎲",
	trophy: "🏆",
	medal: "🏅",
	soccer: "⚽",
	basketball: "🏀",
	football: "🏈",
	tennis: "🎾",
	skull_crossbones: "☠️",
	knife: "🔪",
	gun: "🔫",
	bomb: "💣",
	syringe: "💉",
	pill: "💊",
	key: "🔑",
	lock: "🔒",
	unlock: "🔓",
	hourglass: "⌛",
	alarm_clock: "⏰",
	watch: "⌚",
	bell: "🔔",
	loudspeaker: "📢",
	mega: "📣",
	book: "📖",
	books: "📚",
	pencil: "✏️",
	pen: "🖊️",
	scissors: "✂️",
	paperclip: "📎",
	computer: "💻",
	keyboard: "⌨️",
	phone: "📱",
	camera: "📷",
	tv: "📺",
	radio: "📻",
	bulb: "💡",
	flashlight: "🔦",
	battery: "🔋",
	plug: "🔌",
	magnet: "🧲",
	wrench: "🔧",
	hammer: "🔨",
	gear: "⚙️",
	link: "🔗",
	moneybag: "💰",
	dollar: "💵",
	credit_card: "💳",
	check: "✅",
	x: "❌",
	warning: "⚠️",
	question: "❓",
	exclamation: "❗",
	heavy_plus_sign: "➕",
	recycle: "♻️",
	infinity: "♾️",
	peace: "☮️",
	yin_yang: "☯️",
	biohazard: "☣️",
	radioactive: "☢️",
	no_entry: "⛔",
	"100": "💯",
	ok: "🆗",
	new: "🆕",
	cool: "🆒",
	free: "🆓",
	sos: "🆘"
};
/**
* Custom emoji visible to the user.
*
* These are the real EmojiStore methods, per Discord's own typings:
*   EmojiStore.getGuilds()                     -> { [guildId]: { emojis: [] } }
*   EmojiStore.getGuildEmoji(guildId)          -> CustomEmoji[]
*   ctx.getDisambiguatedEmoji()                -> Emoji[]  (custom have an id)
*   ctx.getCustomEmoji()                       -> { [name]: CustomEmoji }
*   ctx.getGroupedCustomEmoji()                -> { [guildId]: CustomEmoji[] }
*
* Several are tried because which ones are populated depends on Nitro state and
* on the guild argument. Each is wrapped: this is internal API, and the picker
* should degrade to unicode-only rather than throw.
*/
const CACHE_MS = 3e4;
let cache;
let cacheIndex;
let cachedAt = 0;
let generation = 0;
const emojiGeneration = () => generation;
function customEmoji() {
	if (cache && Date.now() - cachedAt < CACHE_MS) return cache;
	cache = buildCustomEmoji();
	cacheIndex = new Map(cache.map((emoji) => [emoji.key.toLowerCase(), emoji]));
	cachedAt = Date.now();
	generation++;
	return cache;
}
function buildCustomEmoji() {
	const out = [];
	const seen = new Set();
	const push = (emoji) => {
		if (!emoji?.id || !emoji?.name || seen.has(emoji.id)) return;
		seen.add(emoji.id);
		out.push({
			key: emoji.name,
			id: emoji.id,
			animated: !!emoji.animated,
			insert: `<${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}>`
		});
	};
	const harvest = (value) => {
		if (Array.isArray(value)) value.forEach(push);
else if (value && typeof value === "object") for (const entry of Object.values(value)) if (Array.isArray(entry)) entry.forEach(push);
else if (Array.isArray(entry?.emojis)) entry.emojis.forEach(push);
else push(entry);
	};
	const store$3 = storesFlat$1.EmojiStore;
	const attempt = (fn) => {
		try {
			harvest(fn());
		} catch {}
	};
	attempt(() => store$3?.getGuilds?.());
	attempt(() => {
		const context = store$3?.getDisambiguatedEmojiContext?.();
		return context?.getCustomEmoji?.();
	});
	attempt(() => {
		const context = store$3?.getDisambiguatedEmojiContext?.();
		return context?.getGroupedCustomEmoji?.();
	});
	attempt(() => {
		const context = store$3?.getDisambiguatedEmojiContext?.();
		return context?.getDisambiguatedEmoji?.();
	});
	return out;
}
function customEmojiByName(name) {
	customEmoji();
	return cacheIndex?.get(String(name ?? "").toLowerCase());
}
const customEmojiCount = () => customEmoji().length;
const UNICODE_LIST = Object.entries(UNICODE).map(([key, char]) => ({
	key,
	char,
	insert: char
}));
const unicodeFor = (name) => UNICODE[String(name ?? "").toLowerCase()];
/** Prefix matches rank above substring ones, so ":fi" offers fire before high_five. */
function rank(pool, q) {
	const prefix = [];
	const contains = [];
	for (const emoji of pool) {
		const key = emoji.key.toLowerCase();
		if (key.startsWith(q)) prefix.push(emoji);
else if (key.includes(q)) contains.push(emoji);
	}
	return [...prefix, ...contains];
}
function searchEmoji(query, limit = 10) {
	const q = String(query ?? "").toLowerCase();
	const custom = rank(customEmoji(), q);
	const unicode = rank(UNICODE_LIST, q);
	const out = [];
	let i = 0;
	let j = 0;
	while (out.length < limit && (i < custom.length || j < unicode.length)) {
		if (i < custom.length) out.push(custom[i++]);
		if (out.length < limit && j < unicode.length) out.push(unicode[j++]);
	}
	return out;
}
const emojiQuery = (text) => /:([a-zA-Z0-9_+-]*)$/.exec(String(text ?? ""))?.[1];
const applyEmoji = (text, emoji) => String(text ?? "").replace(/:([a-zA-Z0-9_+-]*)$/, emoji.insert);

//#endregion
//#region plugins/friend-tags/ui/RichText.jsx
var import_web$92 = __toESM(require_web(), 1);
var import_web$93 = __toESM(require_web(), 1);
var import_web$94 = __toESM(require_web(), 1);
var import_web$95 = __toESM(require_web(), 1);
var import_web$96 = __toESM(require_web(), 1);
var import_web$97 = __toESM(require_web(), 1);
var import_web$98 = __toESM(require_web(), 1);
var import_web$99 = __toESM(require_web(), 1);
var import_web$100 = __toESM(require_web(), 1);
var import_web$101 = __toESM(require_web(), 1);
const _tmpl$$10 = /*#__PURE__*/ (0, import_web$92.template)(`<span class="ftags-emoji-char"></span>`, 2), _tmpl$2$8 = /*#__PURE__*/ (0, import_web$92.template)(`<img class="ftags-emoji">`, 1), _tmpl$3$6 = /*#__PURE__*/ (0, import_web$92.template)(`<b></b>`, 2), _tmpl$4$5 = /*#__PURE__*/ (0, import_web$92.template)(`<i></i>`, 2), _tmpl$5$4 = /*#__PURE__*/ (0, import_web$92.template)(`<u></u>`, 2), _tmpl$6$3 = /*#__PURE__*/ (0, import_web$92.template)(`<s></s>`, 2), _tmpl$7$3 = /*#__PURE__*/ (0, import_web$92.template)(`<b><i></i></b>`, 4), _tmpl$8$3 = /*#__PURE__*/ (0, import_web$92.template)(`<code class="ftags-code"></code>`, 2);
const { flux: { storesFlat }, solid: { For: For$5, createMemo: createMemo$6 } } = shelter;
const EMOJI_CDN = "https://cdn.discordapp.com/emojis";
/**
* Resolve a `:shortcode:` against Discord's emoji data.
*
* Every lookup is optional-chained and wrapped: these are internal Discord
* APIs, and a rename upstream should degrade to showing the literal `:name:`
* rather than throwing inside a chip that's rendered hundreds of times.
*/
/**
* Both kinds of emoji are supported, and `:name:` means the unicode one.
*
* This mirrors Discord: a bare shortcode is the standard emoji, and a server
* emoji is written `<:name:id>` — which is unambiguous and exactly what the
* picker inserts. So `:wave:` stays 👋 even if you also have a "Wave" emoji,
* and both remain reachable. A server emoji whose name ISN'T a standard
* shortcode still resolves from a bare `:name:`, as a convenience.
*/
function lookupShortcode(name) {
	const char = unicodeFor(name);
	if (char) return { text: char };
	try {
		const context = storesFlat.EmojiStore?.getDisambiguatedEmojiContext?.();
		const found = context?.getByName?.(String(name).toLowerCase()) ?? context?.getByName?.(name);
		if (found?.surrogates) return { text: found.surrogates };
		if (found?.id) return {
			id: found.id,
			name: found.name,
			animated: !!found.animated
		};
	} catch {}
	try {
		const custom = customEmojiByName(name);
		if (custom) return {
			id: custom.id,
			name: custom.key,
			animated: custom.animated
		};
	} catch {}
}
const CUSTOM_EMOJI = /<(a?):(\w+):(\d+)>/;
const SHORTCODE = /:([a-zA-Z0-9_+-]+):/;
/** Split text into plain strings and emoji descriptors. */
function tokeniseEmoji(text) {
	const out = [];
	let rest = text;
	while (rest) {
		const custom = CUSTOM_EMOJI.exec(rest);
		const short = SHORTCODE.exec(rest);
		const match = custom && short ? custom.index <= short.index ? custom : short : custom ?? short;
		if (!match) {
			out.push(rest);
			break;
		}
		if (match.index > 0) out.push(rest.slice(0, match.index));
		if (match === custom) out.push({
			id: match[3],
			name: match[2],
			animated: match[1] === "a"
		});
else {
			const found = lookupShortcode(match[1]);
			out.push(found ? {
				...found,
				name: found.name ?? match[1]
			} : match[0]);
		}
		rest = rest.slice(match.index + match[0].length);
	}
	return out;
}
const MARKS = [
	{
		open: "***",
		tag: "bi"
	},
	{
		open: "**",
		tag: "b"
	},
	{
		open: "__",
		tag: "u"
	},
	{
		open: "~~",
		tag: "s"
	},
	{
		open: "`",
		tag: "code"
	},
	{
		open: "*",
		tag: "i"
	},
	{
		open: "_",
		tag: "i"
	},
	{
		open: "~",
		tag: "s"
	}
];
/**
* Parse inline markdown into a tree of { tag, children } nodes.
* Unmatched markers stay literal, so a tag named "C++ ~ Rust" survives intact.
*/
function parseMarkdown(text) {
	const nodes = [];
	let buffer = "";
	const flush = () => {
		if (buffer) {
			nodes.push(...tokeniseEmoji(buffer));
			buffer = "";
		}
	};
	const isWord = (char) => !!char && /\w/.test(char);
	let i = 0;
	while (i < text.length) {
		const mark = MARKS.find((m) => text.startsWith(m.open, i));
		if (mark) {
			const close = text.indexOf(mark.open, i + mark.open.length);
			const underscore = mark.open === "_" || mark.open === "__";
			const bounded = !underscore || !isWord(text[i - 1]) && !isWord(text[close + mark.open.length]);
			if (close !== -1 && bounded) {
				flush();
				nodes.push({
					tag: mark.tag,
					children: parseMarkdown(text.slice(i + mark.open.length, close))
				});
				i = close + mark.open.length;
				continue;
			}
		}
		buffer += text[i];
		i++;
	}
	flush();
	return nodes;
}
/**
* Open the preview, and stop the click there.
*
* Without stopping it, the same click also hits whatever the chip sits on — the
* tag editor on an editable chip, or Discord's own handler for a username in
* chat, which would open a profile behind the preview.
*/
const previewOnClick = (emoji) => (e) => {
	e.preventDefault();
	e.stopPropagation();
	showEmojiPreview(emoji, e.currentTarget);
};
function Node(props) {
	const node = () => props.node;
	return (0, import_web$101.memo)((() => {
		const _c$ = (0, import_web$101.memo)(() => typeof node() === "string");
		return () => _c$() ? node() : (() => {
			const _c$2 = (0, import_web$101.memo)(() => !!node().text);
			return () => _c$2() ? (() => {
				const _el$ = (0, import_web$97.getNextElement)(_tmpl$$10);
				(0, import_web$100.addEventListener)(_el$, "click", previewOnClick({
					char: node().text,
					name: node().name
				}), true);
				(0, import_web$99.insert)(_el$, () => node().text);
				(0, import_web$98.runHydrationEvents)();
				return _el$;
			})() : (() => {
				const _c$3 = (0, import_web$101.memo)(() => !!node().id);
				return () => _c$3() ? (() => {
					const _el$2 = (0, import_web$97.getNextElement)(_tmpl$2$8);
					(0, import_web$100.addEventListener)(_el$2, "click", previewOnClick(node()), true);
					(0, import_web$96.setAttribute)(_el$2, "draggable", false);
					(0, import_web$95.effect)((_p$) => {
						const _v$ = `${EMOJI_CDN}/${node().id}.${node().animated ? "gif" : "webp"}?size=44`, _v$2 = `:${node().name}:`;
						_v$ !== _p$._v$ && (0, import_web$96.setAttribute)(_el$2, "src", _p$._v$ = _v$);
						_v$2 !== _p$._v$2 && (0, import_web$96.setAttribute)(_el$2, "alt", _p$._v$2 = _v$2);
						return _p$;
					}, {
						_v$: undefined,
						_v$2: undefined
					});
					(0, import_web$98.runHydrationEvents)();
					return _el$2;
				})() : (0, import_web$94.createComponent)(Marked, { get node() {
					return node();
				} });
			})();
		})();
	})());
}
function Marked(props) {
	const children = () => (0, import_web$94.createComponent)(For$5, {
		get each() {
			return props.node.children;
		},
		children: (child) => (0, import_web$94.createComponent)(Node, { node: child })
	});
	switch (props.node.tag) {
		case "b": return (() => {
			const _el$3 = (0, import_web$97.getNextElement)(_tmpl$3$6);
			(0, import_web$99.insert)(_el$3, children);
			return _el$3;
		})();
		case "i": return (() => {
			const _el$4 = (0, import_web$97.getNextElement)(_tmpl$4$5);
			(0, import_web$99.insert)(_el$4, children);
			return _el$4;
		})();
		case "u": return (() => {
			const _el$5 = (0, import_web$97.getNextElement)(_tmpl$5$4);
			(0, import_web$99.insert)(_el$5, children);
			return _el$5;
		})();
		case "s": return (() => {
			const _el$6 = (0, import_web$97.getNextElement)(_tmpl$6$3);
			(0, import_web$99.insert)(_el$6, children);
			return _el$6;
		})();
		case "bi": return (() => {
			const _el$7 = (0, import_web$97.getNextElement)(_tmpl$7$3), _el$8 = _el$7.firstChild;
			(0, import_web$99.insert)(_el$8, children);
			return _el$7;
		})();
		case "code": return (() => {
			const _el$9 = (0, import_web$97.getNextElement)(_tmpl$8$3);
			(0, import_web$99.insert)(_el$9, children);
			return _el$9;
		})();
		default: return (0, import_web$101.memo)(children);
	}
}
const CUSTOM_EMOJI_ALL = /<(a?):(\w+):(\d+)>/g;
const plainText = (text) => String(text ?? "").replace(CUSTOM_EMOJI_ALL, (_, __, name) => `:${name}:`).replace(/\*\*\*|\*\*|__|~~|`|\*|_|~/g, "");
const parseCache = new Map();
const PARSE_CACHE_LIMIT = 400;
function parseCached(text) {
	const hit = parseCache.get(text);
	const gen = emojiGeneration();
	if (hit && hit.gen === gen) return hit.nodes;
	if (parseCache.size >= PARSE_CACHE_LIMIT) parseCache.clear();
	const nodes = parseMarkdown(text);
	parseCache.set(text, {
		gen,
		nodes
	});
	return nodes;
}
function RichText(props) {
	const nodes = createMemo$6(() => parseCached(String(props.text ?? "")));
	return (0, import_web$94.createComponent)(For$5, {
		get each() {
			return nodes();
		},
		children: (node) => (0, import_web$94.createComponent)(Node, { node })
	});
}
(0, import_web$93.delegateEvents)(["click"]);

//#endregion
//#region plugins/friend-tags/ui/Chip.jsx
var import_web$81 = __toESM(require_web(), 1);
var import_web$82 = __toESM(require_web(), 1);
var import_web$83 = __toESM(require_web(), 1);
var import_web$84 = __toESM(require_web(), 1);
var import_web$85 = __toESM(require_web(), 1);
var import_web$86 = __toESM(require_web(), 1);
var import_web$87 = __toESM(require_web(), 1);
var import_web$88 = __toESM(require_web(), 1);
var import_web$89 = __toESM(require_web(), 1);
var import_web$90 = __toESM(require_web(), 1);
var import_web$91 = __toESM(require_web(), 1);
const _tmpl$$9 = /*#__PURE__*/ (0, import_web$81.template)(`<span><span class="ftags-chip-text"></span></span>`, 4);
const { solid: { createMemo: createMemo$5 } } = shelter;
function Chip(props) {
	const config = createMemo$5(() => props.style ?? styleOf(props.tag));
	const css = createMemo$5(() => styleToCss(config(), { animate: props.animate ?? display.animate() }));
	return (() => {
		const _el$ = (0, import_web$87.getNextElement)(_tmpl$$9), _el$2 = _el$.firstChild;
		(0, import_web$91.addEventListener)(_el$, "click", props.onClick, true);
		(0, import_web$89.insert)(_el$2, (0, import_web$90.createComponent)(RichText, { get text() {
			return props.tag;
		} }));
		(0, import_web$86.effect)((_p$) => {
			const _v$ = `ftags-chip${display.uppercase() && !props.plain ? " ftags-chip--upper" : ""}${props.class ? ` ${props.class}` : ""}`, _v$2 = css(), _v$3 = props.title ?? plainText(props.tag);
			_v$ !== _p$._v$ && (0, import_web$85.className)(_el$, _p$._v$ = _v$);
			_p$._v$2 = (0, import_web$84.style)(_el$, _v$2, _p$._v$2);
			_v$3 !== _p$._v$3 && (0, import_web$83.setAttribute)(_el$, "title", _p$._v$3 = _v$3);
			return _p$;
		}, {
			_v$: undefined,
			_v$2: undefined,
			_v$3: undefined
		});
		(0, import_web$88.runHydrationEvents)();
		return _el$;
	})();
}
(0, import_web$82.delegateEvents)(["click"]);

//#endregion
//#region plugins/friend-tags/ui/EmojiAutocomplete.jsx
var import_web$70 = __toESM(require_web(), 1);
var import_web$71 = __toESM(require_web(), 1);
var import_web$72 = __toESM(require_web(), 1);
var import_web$73 = __toESM(require_web(), 1);
var import_web$74 = __toESM(require_web(), 1);
var import_web$75 = __toESM(require_web(), 1);
var import_web$76 = __toESM(require_web(), 1);
var import_web$77 = __toESM(require_web(), 1);
var import_web$78 = __toESM(require_web(), 1);
var import_web$79 = __toESM(require_web(), 1);
var import_web$80 = __toESM(require_web(), 1);
const _tmpl$$8 = /*#__PURE__*/ (0, import_web$70.template)(`<div class="ftags-ac"><div class="ftags-ac-header">Emoji matching <strong>:<!#><!/></strong></div><div class="ftags-ac-list"></div></div>`, 10), _tmpl$2$7 = /*#__PURE__*/ (0, import_web$70.template)(`<img>`, 1), _tmpl$3$5 = /*#__PURE__*/ (0, import_web$70.template)(`<span class="ftags-ac-badge">server</span>`, 2), _tmpl$4$4 = /*#__PURE__*/ (0, import_web$70.template)(`<div><span class="ftags-ac-emoji"></span><span class="ftags-ac-name">:<!#><!/>:</span><!#><!/></div>`, 10), _tmpl$5$3 = /*#__PURE__*/ (0, import_web$70.template)(`<span class="ftags-ac-char"></span>`, 2);
const { solid: { For: For$4, Show: Show$5, createEffect: createEffect$1, createMemo: createMemo$4, createSignal: createSignal$6, onCleanup: onCleanup$1 }, solidWeb: { Portal }, ui: { getRoot } } = shelter;
function createEmojiAutocomplete(value, setValue) {
	const [selected, setSelected] = createSignal$6(0);
	const [dismissed, setDismissed] = createSignal$6(false);
	const [anchor, setAnchor] = createSignal$6();
	const [rect, setRect] = createSignal$6();
	const [caret, setCaret] = createSignal$6(null);
	const input = () => anchor()?.querySelector("input, textarea");
	createEffect$1(() => {
		const element = input();
		if (!element) return;
		const sync = () => setCaret(element.selectionStart);
		const events = [
			"input",
			"keyup",
			"click",
			"select",
			"focus"
		];
		for (const event of events) element.addEventListener(event, sync);
		sync();
		onCleanup$1(() => {
			for (const event of events) element.removeEventListener(event, sync);
		});
	});
	/** The text up to the caret — what a shortcode is matched against. */
	const head = () => {
		const position = caret();
		const text = value();
		return position == null || position > text.length ? text : text.slice(0, position);
	};
	const query = createMemo$4(() => emojiQuery(head()));
	const results = createMemo$4(() => query() === undefined ? [] : searchEmoji(query(), 10));
	const open$1 = () => !dismissed() && results().length > 0;
	createEffect$1(() => {
		query();
		setSelected(0);
	});
	createEffect$1(() => {
		if (query() === undefined) setDismissed(false);
	});
	createEffect$1(() => {
		const element = anchor();
		if (!element) return;
		const measure = () => setRect(element.getBoundingClientRect());
		measure();
		if (!open$1()) return;
		window.addEventListener("scroll", measure, true);
		window.addEventListener("resize", measure);
		onCleanup$1(() => {
			window.removeEventListener("scroll", measure, true);
			window.removeEventListener("resize", measure);
		});
	});
	const pick = (emoji) => {
		const text = value();
		const position = caret() ?? text.length;
		const replaced = applyEmoji(text.slice(0, position), emoji);
		setValue(replaced + text.slice(position));
		setDismissed(true);
		queueMicrotask(() => {
			const element = input();
			if (!element) return;
			element.focus();
			element.selectionStart = element.selectionEnd = replaced.length;
			setCaret(replaced.length);
		});
	};
	const keydown = (e) => {
		if (!open$1()) return;
		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				setSelected((i) => (i + 1) % results().length);
				break;
			case "ArrowUp":
				e.preventDefault();
				setSelected((i) => (i - 1 + results().length) % results().length);
				break;
			case "Enter":
			case "Tab":
				e.preventDefault();
				e.stopPropagation();
				pick(results()[selected()]);
				break;
			case "Escape":
				e.preventDefault();
				e.stopPropagation();
				setDismissed(true);
				break;
		}
	};
	/**
	* Where the popup gets portalled. getRoot walks up to the nearest <dialog>,
	* shadow root, or body — so inside a modal this lands in the top-layer
	* dialog, and outside one it falls back to the body.
	*/
	const mount = () => {
		const element = anchor();
		try {
			return element && getRoot?.(element) || document.body;
		} catch {
			return document.body;
		}
	};
	return {
		query,
		results,
		open: open$1,
		selected,
		setSelected,
		pick,
		keydown,
		setAnchor,
		rect,
		mount
	};
}
const POPUP_MAX_HEIGHT = 290;
function EmojiAutocomplete(props) {
	const c = () => props.controller;
	const position = createMemo$4(() => {
		const r = c().rect();
		if (!r) return { display: "none" };
		const above = r.top >= POPUP_MAX_HEIGHT + 12;
		return {
			position: "fixed",
			left: `${r.left}px`,
			width: `${r.width}px`,
			...above ? { bottom: `${window.innerHeight - r.top + 8}px` } : { top: `${r.bottom + 8}px` }
		};
	});
	return (0, import_web$78.createComponent)(Show$5, {
		get when() {
			return c().open();
		},
		get children() {
			return (0, import_web$78.createComponent)(Portal, {
				get mount() {
					return c().mount();
				},
				get children() {
					const _el$ = (0, import_web$77.getNextElement)(_tmpl$$8), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild, _el$4 = _el$3.nextSibling, _el$5 = _el$4.firstChild, _el$6 = _el$5.nextSibling, [_el$7, _co$] = (0, import_web$79.getNextMarker)(_el$6.nextSibling), _el$8 = _el$2.nextSibling;
					(0, import_web$80.insert)(_el$4, () => c().query(), _el$7, _co$);
					(0, import_web$80.insert)(_el$8, (0, import_web$78.createComponent)(For$4, {
						get each() {
							return c().results();
						},
						children: (emoji, i) => (() => {
							const _el$9 = (0, import_web$77.getNextElement)(_tmpl$4$4), _el$0 = _el$9.firstChild, _el$10 = _el$0.nextSibling, _el$11 = _el$10.firstChild, _el$13 = _el$11.nextSibling, [_el$14, _co$2] = (0, import_web$79.getNextMarker)(_el$13.nextSibling), _el$12 = _el$14.nextSibling, _el$16 = _el$10.nextSibling, [_el$17, _co$3] = (0, import_web$79.getNextMarker)(_el$16.nextSibling);
							_el$9.$$mousedown = (e) => {
								e.preventDefault();
								c().pick(emoji);
							};
							_el$9.addEventListener("mouseenter", () => c().setSelected(i()));
							(0, import_web$80.insert)(_el$0, (0, import_web$78.createComponent)(Show$5, {
								get when() {
									return emoji.id;
								},
								get fallback() {
									return (() => {
										const _el$18 = (0, import_web$77.getNextElement)(_tmpl$5$3);
										(0, import_web$80.insert)(_el$18, () => emoji.char);
										return _el$18;
									})();
								},
								get children() {
									const _el$1 = (0, import_web$77.getNextElement)(_tmpl$2$7);
									(0, import_web$74.setAttribute)(_el$1, "draggable", false);
									(0, import_web$76.effect)((_p$) => {
										const _v$ = `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? "gif" : "webp"}?size=44`, _v$2 = emoji.key;
										_v$ !== _p$._v$ && (0, import_web$74.setAttribute)(_el$1, "src", _p$._v$ = _v$);
										_v$2 !== _p$._v$2 && (0, import_web$74.setAttribute)(_el$1, "alt", _p$._v$2 = _v$2);
										return _p$;
									}, {
										_v$: undefined,
										_v$2: undefined
									});
									return _el$1;
								}
							}));
							(0, import_web$80.insert)(_el$10, () => emoji.key, _el$14, _co$2);
							(0, import_web$80.insert)(_el$9, (0, import_web$78.createComponent)(Show$5, {
								get when() {
									return emoji.id;
								},
								get children() {
									return (0, import_web$77.getNextElement)(_tmpl$3$5);
								}
							}), _el$17, _co$3);
							(0, import_web$76.effect)(() => (0, import_web$72.className)(_el$9, `ftags-ac-row${i() === c().selected() ? " ftags-ac-row--on" : ""}`));
							(0, import_web$73.runHydrationEvents)();
							return _el$9;
						})()
					}));
					(0, import_web$76.effect)((_$p) => (0, import_web$75.style)(_el$, position(), _$p));
					return _el$;
				}
			});
		}
	});
}
(0, import_web$71.delegateEvents)(["mousedown"]);

//#endregion
//#region plugins/friend-tags/ui/ColorPicker.jsx
var import_web$60 = __toESM(require_web(), 1);
var import_web$61 = __toESM(require_web(), 1);
var import_web$62 = __toESM(require_web(), 1);
var import_web$63 = __toESM(require_web(), 1);
var import_web$64 = __toESM(require_web(), 1);
var import_web$65 = __toESM(require_web(), 1);
var import_web$66 = __toESM(require_web(), 1);
var import_web$67 = __toESM(require_web(), 1);
var import_web$68 = __toESM(require_web(), 1);
var import_web$69 = __toESM(require_web(), 1);
const _tmpl$$7 = /*#__PURE__*/ (0, import_web$60.template)(`<div class="ftags-picker"><div class="ftags-picker-sv"><div class="ftags-picker-thumb"></div></div><div class="ftags-picker-hue"><div class="ftags-picker-thumb"></div></div><div class="ftags-picker-row"><span class="ftags-picker-preview"></span><!#><!/></div></div>`, 16);
const { ui: { TextBox: TextBox$3 }, solid: { createEffect, createSignal: createSignal$5, onCleanup } } = shelter;
function normaliseHex(input) {
	const raw = String(input ?? "").trim().replace(/^#/, "");
	const full = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;
	return /^[0-9a-f]{6}$/i.test(full) ? `#${full.toLowerCase()}` : undefined;
}
const hexToRgb = (hex) => {
	const value = parseInt(String(hex ?? "").replace("#", ""), 16) || 0;
	return {
		r: value >> 16 & 255,
		g: value >> 8 & 255,
		b: value & 255
	};
};
const rgbToHex = ({ r, g, b }) => `#${[
	r,
	g,
	b
].map((n) => Math.round(n).toString(16).padStart(2, "0")).join("")}`;
function rgbToHsv({ r, g, b }) {
	r /= 255;
	g /= 255;
	b /= 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const d = max - min;
	let h = 0;
	if (d) {
		if (max === r) h = (g - b) / d % 6;
else if (max === g) h = (b - r) / d + 2;
else h = (r - g) / d + 4;
		h *= 60;
		if (h < 0) h += 360;
	}
	return {
		h,
		s: max ? d / max : 0,
		v: max
	};
}
function hsvToRgb({ h, s, v }) {
	const c = v * s;
	const x = c * (1 - Math.abs(h / 60 % 2 - 1));
	const m = v - c;
	const [r, g, b] = h < 60 ? [
		c,
		x,
		0
	] : h < 120 ? [
		x,
		c,
		0
	] : h < 180 ? [
		0,
		c,
		x
	] : h < 240 ? [
		0,
		x,
		c
	] : h < 300 ? [
		x,
		0,
		c
	] : [
		c,
		0,
		x
	];
	return {
		r: (r + m) * 255,
		g: (g + m) * 255,
		b: (b + m) * 255
	};
}
const hsvToHex = (hsv) => rgbToHex(hsvToRgb(hsv));
const hexToHsv = (hex) => rgbToHsv(hexToRgb(hex));
const clamp01 = (n) => Math.min(1, Math.max(0, n));
function ColorPicker(props) {
	const [hsv, setHsv] = createSignal$5(hexToHsv(props.value ?? "#5865f2"));
	const [text, setText] = createSignal$5(props.value ?? "");
	let userDriven = false;
	createEffect(() => {
		const value = props.value;
		if (userDriven || !value) return;
		setHsv(hexToHsv(value));
		setText(value);
	});
	const commit = (next) => {
		userDriven = true;
		setHsv(next);
		const hex = hsvToHex(next);
		setText(hex);
		props.onChange(hex);
	};
	/**
	* Drag handling. The box is measured ONCE, when the drag starts.
	*
	* Re-measuring per move, or switching between offsetX and bounding-rect
	* depending on what the pointer happened to be over, gives two subtly
	* different answers and the thumb jitters between them. One measurement for
	* the whole gesture is stable — and safe now that the picker only mounts
	* after the modal has finished animating, so the box isn't mid-transform.
	*/
	const dragging = (compute) => (e) => {
		e.preventDefault();
		e.stopPropagation();
		const rect = e.currentTarget.getBoundingClientRect();
		if (!rect.width || !rect.height) return;
		const apply = (event) => compute((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
		apply(e);
		const stop = () => {
			window.removeEventListener("pointermove", apply);
			window.removeEventListener("pointerup", stop);
		};
		window.addEventListener("pointermove", apply);
		window.addEventListener("pointerup", stop);
		onCleanup(stop);
	};
	const onSquare = dragging((fx, fy) => commit({
		...hsv(),
		s: clamp01(fx),
		v: 1 - clamp01(fy)
	}));
	const onHue = dragging((fx) => commit({
		...hsv(),
		h: clamp01(fx) * 360
	}));
	const onHexInput = (value) => {
		userDriven = true;
		setText(value);
		if (/^#?[0-9a-f]{6}$/i.test(value.trim())) {
			const hex = normaliseHex(value);
			setHsv(hexToHsv(hex));
			props.onChange(hex);
		}
	};
	const onHexBlur = () => {
		const hex = normaliseHex(text());
		if (hex) {
			setHsv(hexToHsv(hex));
			props.onChange(hex);
		} else setText(props.value ?? "");
	};
	return (() => {
		const _el$ = (0, import_web$63.getNextElement)(_tmpl$$7), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild, _el$4 = _el$2.nextSibling, _el$5 = _el$4.firstChild, _el$6 = _el$4.nextSibling, _el$7 = _el$6.firstChild, _el$8 = _el$7.nextSibling, [_el$9, _co$] = (0, import_web$65.getNextMarker)(_el$8.nextSibling);
		(0, import_web$69.addEventListener)(_el$2, "pointerdown", onSquare, true);
		(0, import_web$69.addEventListener)(_el$4, "pointerdown", onHue, true);
		_el$5.style.setProperty("top", "50%");
		(0, import_web$66.insert)(_el$6, (0, import_web$67.createComponent)(TextBox$3, {
			get value() {
				return text();
			},
			onInput: onHexInput,
			onBlur: onHexBlur,
			placeholder: "#rrggbb",
			maxlength: 7,
			get ["aria-label"]() {
				return props.label ?? "Hex colour";
			}
		}), _el$9, _co$);
		(0, import_web$62.effect)((_p$) => {
			const _v$ = hsvToHex({
				h: hsv().h,
				s: 1,
				v: 1
			}), _v$2 = `${hsv().s * 100}%`, _v$3 = `${(1 - hsv().v) * 100}%`, _v$4 = `${hsv().h / 360 * 100}%`, _v$5 = props.value;
			_v$ !== _p$._v$ && _el$2.style.setProperty("background-color", _p$._v$ = _v$);
			_v$2 !== _p$._v$2 && _el$3.style.setProperty("left", _p$._v$2 = _v$2);
			_v$3 !== _p$._v$3 && _el$3.style.setProperty("top", _p$._v$3 = _v$3);
			_v$4 !== _p$._v$4 && _el$5.style.setProperty("left", _p$._v$4 = _v$4);
			_v$5 !== _p$._v$5 && _el$7.style.setProperty("background", _p$._v$5 = _v$5);
			return _p$;
		}, {
			_v$: undefined,
			_v$2: undefined,
			_v$3: undefined,
			_v$4: undefined,
			_v$5: undefined
		});
		(0, import_web$64.runHydrationEvents)();
		return _el$;
	})();
}
(0, import_web$61.delegateEvents)(["pointerdown"]);

//#endregion
//#region plugins/friend-tags/ui/openColorPicker.jsx
var import_web$56 = __toESM(require_web(), 1);
var import_web$57 = __toESM(require_web(), 1);
var import_web$58 = __toESM(require_web(), 1);
var import_web$59 = __toESM(require_web(), 1);
const _tmpl$$6 = /*#__PURE__*/ (0, import_web$56.template)(`<div class="ftags-picker-slot"></div>`, 2), _tmpl$2$6 = /*#__PURE__*/ (0, import_web$56.template)(`<div style="display: flex; justify-content: flex-end; width: 100%"></div>`, 2);
const { ui: { Button: Button$4, ModalBody: ModalBody$4, ModalFooter: ModalFooter$4, ModalHeader: ModalHeader$4, ModalRoot: ModalRoot$4, ModalSizes: ModalSizes$4, openModal: openModal$3 }, solid: { Show: Show$4, createSignal: createSignal$4, onMount } } = shelter;
function openColorPicker({ label: label$1, value, onChange }) {
	return openModal$3((props) => {
		const [ready, setReady] = createSignal$4(false);
		onMount(() => setTimeout(() => setReady(true), 300));
		return (0, import_web$59.createComponent)(ModalRoot$4, {
			get size() {
				return ModalSizes$4.SMALL;
			},
			get children() {
				return [
					(0, import_web$59.createComponent)(ModalHeader$4, {
						get close() {
							return props.close;
						},
						children: label$1
					}),
					(0, import_web$59.createComponent)(ModalBody$4, { get children() {
						const _el$ = (0, import_web$57.getNextElement)(_tmpl$$6);
						(0, import_web$58.insert)(_el$, (0, import_web$59.createComponent)(Show$4, {
							get when() {
								return ready();
							},
							get children() {
								return (0, import_web$59.createComponent)(ColorPicker, {
									label: label$1,
									get value() {
										return value();
									},
									onChange
								});
							}
						}));
						return _el$;
					} }),
					(0, import_web$59.createComponent)(ModalFooter$4, { get children() {
						const _el$2 = (0, import_web$57.getNextElement)(_tmpl$2$6);
						(0, import_web$58.insert)(_el$2, (0, import_web$59.createComponent)(Button$4, {
							get onClick() {
								return props.close;
							},
							children: "Done"
						}));
						return _el$2;
					} })
				];
			}
		});
	});
}

//#endregion
//#region plugins/friend-tags/ui/TagStyler.jsx
var import_web$43 = __toESM(require_web(), 1);
var import_web$44 = __toESM(require_web(), 1);
var import_web$45 = __toESM(require_web(), 1);
var import_web$46 = __toESM(require_web(), 1);
var import_web$47 = __toESM(require_web(), 1);
var import_web$48 = __toESM(require_web(), 1);
var import_web$49 = __toESM(require_web(), 1);
var import_web$50 = __toESM(require_web(), 1);
var import_web$51 = __toESM(require_web(), 1);
var import_web$52 = __toESM(require_web(), 1);
var import_web$53 = __toESM(require_web(), 1);
var import_web$54 = __toESM(require_web(), 1);
var import_web$55 = __toESM(require_web(), 1);
const _tmpl$$5 = /*#__PURE__*/ (0, import_web$43.template)(`<div class="ftags-preview"><!#><!/><!#><!/></div>`, 6), _tmpl$2$5 = /*#__PURE__*/ (0, import_web$43.template)(`<div class="ftags-field"><!#><!/><!#><!/><!#><!/></div>`, 8), _tmpl$3$4 = /*#__PURE__*/ (0, import_web$43.template)(`<div style="display: flex; gap: 8px; margin-bottom: 10px"><!#><!/><!#><!/></div>`, 6), _tmpl$4$3 = /*#__PURE__*/ (0, import_web$43.template)(`<div class="ftags-field"><span></span><!#><!/></div>`, 6), _tmpl$5$2 = /*#__PURE__*/ (0, import_web$43.template)(`<div class="ftags-field"><span>Stops</span><div class="ftags-stops"><!#><!/><!#><!/><!#><!/></div></div>`, 12), _tmpl$6$2 = /*#__PURE__*/ (0, import_web$43.template)(`<div class="ftags-field"><span>Angle — <!#><!/>°</span><!#><!/></div>`, 8), _tmpl$7$2 = /*#__PURE__*/ (0, import_web$43.template)(`<div class="ftags-field"><span>Presets</span><div class="ftags-suggestions"></div></div>`, 6), _tmpl$8$2 = /*#__PURE__*/ (0, import_web$43.template)(`<div class="ftags-field"><span>Colour</span><div style="display: flex; gap: 8px; margin-bottom: 8px"><!#><!/><!#><!/></div><!#><!/></div>`, 12), _tmpl$9$1 = /*#__PURE__*/ (0, import_web$43.template)(`<div class="ftags-field"><span>Font</span><div class="ftags-font-grid"></div><!#><!/></div>`, 8), _tmpl$0$1 = /*#__PURE__*/ (0, import_web$43.template)(`<div class="ftags-field"><span>Weight — <!#><!/></span><!#><!/></div>`, 8), _tmpl$1 = /*#__PURE__*/ (0, import_web$43.template)(`<span>Colour speed — <!#><!/>×</span>`, 4), _tmpl$10 = /*#__PURE__*/ (0, import_web$43.template)(`<div class="ftags-field"><span>Colour</span><div class="ftags-anim-grid"></div><!#><!/><!#><!/></div>`, 10), _tmpl$11 = /*#__PURE__*/ (0, import_web$43.template)(`<span>Movement speed — <!#><!/>×</span>`, 4), _tmpl$12 = /*#__PURE__*/ (0, import_web$43.template)(`<div class="ftags-field"><span>Movement</span><div class="ftags-anim-grid"></div><!#><!/></div>`, 8), _tmpl$13 = /*#__PURE__*/ (0, import_web$43.template)(`<div style="display: flex; gap: 8px; justify-content: flex-end; width: 100%"><!#><!/><!#><!/><!#><!/></div>`, 8), _tmpl$14 = /*#__PURE__*/ (0, import_web$43.template)(`<button></button>`, 2);
const { ui: { Button: Button$3, ButtonColors: ButtonColors$3, ButtonLooks: ButtonLooks$3, ButtonSizes: ButtonSizes$2, Divider: Divider$2, Header: Header$3, HeaderTags: HeaderTags$3, ModalBody: ModalBody$3, ModalFooter: ModalFooter$3, ModalHeader: ModalHeader$3, ModalRoot: ModalRoot$3, ModalSizes: ModalSizes$3, Slider: Slider$1, SwitchItem: SwitchItem$1, Text: Text$3, TextBox: TextBox$2 }, solid: { For: For$3, Show: Show$3, createSignal: createSignal$3 } } = shelter;
const label = {
	color: "var(--header-secondary)",
	"font-size": "12px",
	"text-transform": "uppercase",
	"font-weight": 700
};
function TagStyler(props) {
	const [draft, setDraft] = createSignal$3(styleOf(props.tag));
	const [name, setName] = createSignal$3(props.tag);
	const [activeStop, setActiveStop] = createSignal$3(0);
	const autocomplete = createEmojiAutocomplete(name, setName);
	const patch = (changes) => setDraft({
		...draft(),
		...changes
	});
	const renamed = () => normalise(name()) && normalise(name()) !== props.tag;
	const setStop = (index, value) => {
		const colors = [...draft().colors];
		colors[index] = value;
		patch({ colors });
	};
	const addStop = () => patch({ colors: [...draft().colors, "#ffffff"] });
	const removeStop = (index) => patch({ colors: draft().colors.filter((_, i) => i !== index) });
	const save = () => {
		const target = renamed() ? normalise(name()) : props.tag;
		if (renamed()) renameTag(props.tag, target);
		setStyle(target, draft());
		props.close();
	};
	return (0, import_web$54.createComponent)(ModalRoot$3, {
		get size() {
			return ModalSizes$3.MEDIUM;
		},
		get children() {
			return [
				(0, import_web$54.createComponent)(ModalHeader$3, {
					get close() {
						return props.close;
					},
					get children() {
						return [
							"Style “",
							(0, import_web$55.memo)(() => props.tag),
							"”"
						];
					}
				}),
				(0, import_web$54.createComponent)(ModalBody$3, { get children() {
					return [
						(() => {
							const _el$ = (0, import_web$51.getNextElement)(_tmpl$$5), _el$2 = _el$.firstChild, [_el$3, _co$] = (0, import_web$52.getNextMarker)(_el$2.nextSibling), _el$4 = _el$3.nextSibling, [_el$5, _co$2] = (0, import_web$52.getNextMarker)(_el$4.nextSibling);
							(0, import_web$53.insert)(_el$, (0, import_web$54.createComponent)(Chip, {
								get tag() {
									return normalise(name()) || props.tag;
								},
								get style() {
									return draft();
								},
								animate: true
							}), _el$3, _co$);
							(0, import_web$53.insert)(_el$, (0, import_web$54.createComponent)(Chip, {
								get tag() {
									return normalise(name()) || props.tag;
								},
								get style() {
									return draft();
								},
								animate: true,
								plain: true
							}), _el$5, _co$2);
							return _el$;
						})(),
						(0, import_web$54.createComponent)(Header$3, {
							get tag() {
								return HeaderTags$3.H5;
							},
							children: "Name"
						}),
						(() => {
							const _el$6 = (0, import_web$51.getNextElement)(_tmpl$2$5), _el$7 = _el$6.firstChild, [_el$8, _co$3] = (0, import_web$52.getNextMarker)(_el$7.nextSibling), _el$9 = _el$8.nextSibling, [_el$0, _co$4] = (0, import_web$52.getNextMarker)(_el$9.nextSibling), _el$1 = _el$0.nextSibling, [_el$10, _co$5] = (0, import_web$52.getNextMarker)(_el$1.nextSibling);
							const _ref$ = autocomplete.setAnchor;
							typeof _ref$ === "function" ? (0, import_web$50.use)(_ref$, _el$6) : autocomplete.setAnchor = _el$6;
							(0, import_web$53.insert)(_el$6, (0, import_web$54.createComponent)(TextBox$2, {
								get value() {
									return name();
								},
								onInput: setName,
								maxlength: 80,
								placeholder: "Tag name",
								"aria-label": "Tag name",
								get onKeyDown() {
									return autocomplete.keydown;
								}
							}), _el$8, _co$3);
							(0, import_web$53.insert)(_el$6, (0, import_web$54.createComponent)(EmojiAutocomplete, { controller: autocomplete }), _el$0, _co$4);
							(0, import_web$53.insert)(_el$6, (0, import_web$54.createComponent)(Show$3, {
								get when() {
									return renamed();
								},
								get children() {
									return (0, import_web$54.createComponent)(Text$3, {
										style: {
											color: "var(--text-muted)",
											"font-size": "12px"
										},
										children: "Renaming on save — this updates the tag on everyone who has it."
									});
								}
							}), _el$10, _co$5);
							return _el$6;
						})(),
						(0, import_web$54.createComponent)(Divider$2, {
							mt: true,
							mb: true
						}),
						(0, import_web$54.createComponent)(Header$3, {
							get tag() {
								return HeaderTags$3.H5;
							},
							children: "Fill"
						}),
						(() => {
							const _el$11 = (0, import_web$51.getNextElement)(_tmpl$3$4), _el$12 = _el$11.firstChild, [_el$13, _co$6] = (0, import_web$52.getNextMarker)(_el$12.nextSibling), _el$14 = _el$13.nextSibling, [_el$15, _co$7] = (0, import_web$52.getNextMarker)(_el$14.nextSibling);
							(0, import_web$53.insert)(_el$11, (0, import_web$54.createComponent)(Button$3, {
								grow: true,
								get look() {
									return draft().fill === "solid" ? ButtonLooks$3.FILLED : ButtonLooks$3.OUTLINED;
								},
								onClick: () => patch({ fill: "solid" }),
								children: "Solid"
							}), _el$13, _co$6);
							(0, import_web$53.insert)(_el$11, (0, import_web$54.createComponent)(Button$3, {
								grow: true,
								get look() {
									return draft().fill === "gradient" ? ButtonLooks$3.FILLED : ButtonLooks$3.OUTLINED;
								},
								onClick: () => patch({ fill: "gradient" }),
								children: "Gradient"
							}), _el$15, _co$7);
							return _el$11;
						})(),
						(() => {
							const _el$16 = (0, import_web$51.getNextElement)(_tmpl$4$3), _el$17 = _el$16.firstChild, _el$18 = _el$17.nextSibling, [_el$19, _co$8] = (0, import_web$52.getNextMarker)(_el$18.nextSibling);
							(0, import_web$53.insert)(_el$17, (() => {
								const _c$ = (0, import_web$55.memo)(() => draft().fill === "gradient");
								return () => _c$() ? `Colour — stop ${activeStop() + 1}` : "Colour";
							})());
							(0, import_web$53.insert)(_el$16, (0, import_web$54.createComponent)(Button$3, {
								get size() {
									return ButtonSizes$2.NONE;
								},
								"class": "ftags-swatch-trigger",
								"aria-label": "Choose colour",
								get style() {
									return { background: draft().fill === "gradient" ? draft().colors[activeStop()] ?? draft().colors[0] : draft().color };
								},
								onClick: () => openColorPicker({
									label: draft().fill === "gradient" ? `Gradient stop ${activeStop() + 1}` : "Tag colour",
									value: () => draft().fill === "gradient" ? draft().colors[activeStop()] ?? draft().colors[0] : draft().color,
									onChange: (colour) => draft().fill === "gradient" ? setStop(activeStop(), colour) : patch({ color: colour })
								})
							}), _el$19, _co$8);
							(0, import_web$49.effect)((_$p) => (0, import_web$48.style)(_el$17, label, _$p));
							return _el$16;
						})(),
						(0, import_web$54.createComponent)(Show$3, {
							get when() {
								return draft().fill === "gradient";
							},
							get children() {
								return [
									(() => {
										const _el$20 = (0, import_web$51.getNextElement)(_tmpl$5$2), _el$21 = _el$20.firstChild, _el$22 = _el$21.nextSibling, _el$23 = _el$22.firstChild, [_el$24, _co$9] = (0, import_web$52.getNextMarker)(_el$23.nextSibling), _el$25 = _el$24.nextSibling, [_el$26, _co$0] = (0, import_web$52.getNextMarker)(_el$25.nextSibling), _el$27 = _el$26.nextSibling, [_el$28, _co$1] = (0, import_web$52.getNextMarker)(_el$27.nextSibling);
										(0, import_web$53.insert)(_el$22, (0, import_web$54.createComponent)(For$3, {
											get each() {
												return draft().colors;
											},
											children: (stop, i) => (0, import_web$54.createComponent)(Button$3, {
												get size() {
													return ButtonSizes$2.NONE;
												},
												get ["class"]() {
													return `ftags-swatch-trigger ftags-swatch-trigger--stop${i() === activeStop() ? " ftags-swatch-trigger--on" : ""}`;
												},
												style: { background: stop },
												get ["aria-label"]() {
													return `Edit gradient stop ${i() + 1}`;
												},
												onClick: () => {
													setActiveStop(i());
													openColorPicker({
														label: `Gradient stop ${i() + 1}`,
														value: () => draft().colors[i()],
														onChange: (colour) => setStop(i(), colour)
													});
												}
											})
										}), _el$24, _co$9);
										(0, import_web$53.insert)(_el$22, (0, import_web$54.createComponent)(Show$3, {
											get when() {
												return draft().colors.length > 2;
											},
											get children() {
												return (0, import_web$54.createComponent)(Button$3, {
													get size() {
														return ButtonSizes$2.TINY;
													},
													get look() {
														return ButtonLooks$3.OUTLINED;
													},
													get color() {
														return ButtonColors$3.RED;
													},
													onClick: () => {
														removeStop(activeStop());
														setActiveStop((a) => Math.max(0, a - 1));
													},
													children: "Remove"
												});
											}
										}), _el$26, _co$0);
										(0, import_web$53.insert)(_el$22, (0, import_web$54.createComponent)(Show$3, {
											get when() {
												return draft().colors.length < 5;
											},
											get children() {
												return (0, import_web$54.createComponent)(Button$3, {
													get size() {
														return ButtonSizes$2.TINY;
													},
													get look() {
														return ButtonLooks$3.OUTLINED;
													},
													onClick: () => {
														addStop();
														setActiveStop(draft().colors.length - 1);
													},
													children: "+ Add"
												});
											}
										}), _el$28, _co$1);
										(0, import_web$49.effect)((_$p) => (0, import_web$48.style)(_el$21, label, _$p));
										return _el$20;
									})(),
									(() => {
										const _el$29 = (0, import_web$51.getNextElement)(_tmpl$6$2), _el$30 = _el$29.firstChild, _el$31 = _el$30.firstChild, _el$33 = _el$31.nextSibling, [_el$34, _co$10] = (0, import_web$52.getNextMarker)(_el$33.nextSibling), _el$32 = _el$34.nextSibling, _el$35 = _el$30.nextSibling, [_el$36, _co$11] = (0, import_web$52.getNextMarker)(_el$35.nextSibling);
										(0, import_web$53.insert)(_el$30, () => draft().angle, _el$34, _co$10);
										(0, import_web$53.insert)(_el$29, (0, import_web$54.createComponent)(Slider$1, {
											get value() {
												return draft().angle;
											},
											onInput: (v) => patch({ angle: Math.round(v) }),
											min: 0,
											max: 360,
											step: 15
										}), _el$36, _co$11);
										(0, import_web$49.effect)((_$p) => (0, import_web$48.style)(_el$30, label, _$p));
										return _el$29;
									})(),
									(() => {
										const _el$37 = (0, import_web$51.getNextElement)(_tmpl$7$2), _el$38 = _el$37.firstChild, _el$39 = _el$38.nextSibling;
										(0, import_web$53.insert)(_el$39, (0, import_web$54.createComponent)(For$3, {
											each: GRADIENT_PRESETS,
											children: (preset) => (0, import_web$54.createComponent)(Chip, {
												"class": "ftags-suggestion",
												get tag() {
													return preset.label;
												},
												get style() {
													return {
														...draft(),
														fill: "gradient",
														colors: preset.colors,
														angle: preset.angle
													};
												},
												animate: false,
												onClick: () => patch({
													fill: "gradient",
													colors: [...preset.colors],
													angle: preset.angle
												})
											})
										}));
										(0, import_web$49.effect)((_$p) => (0, import_web$48.style)(_el$38, label, _$p));
										return _el$37;
									})()
								];
							}
						}),
						(0, import_web$54.createComponent)(Divider$2, {
							mt: true,
							mb: true
						}),
						(0, import_web$54.createComponent)(Header$3, {
							get tag() {
								return HeaderTags$3.H5;
							},
							children: "Text"
						}),
						(() => {
							const _el$40 = (0, import_web$51.getNextElement)(_tmpl$8$2), _el$41 = _el$40.firstChild, _el$42 = _el$41.nextSibling, _el$43 = _el$42.firstChild, [_el$44, _co$12] = (0, import_web$52.getNextMarker)(_el$43.nextSibling), _el$45 = _el$44.nextSibling, [_el$46, _co$13] = (0, import_web$52.getNextMarker)(_el$45.nextSibling), _el$47 = _el$42.nextSibling, [_el$48, _co$14] = (0, import_web$52.getNextMarker)(_el$47.nextSibling);
							(0, import_web$53.insert)(_el$42, (0, import_web$54.createComponent)(Button$3, {
								get size() {
									return ButtonSizes$2.SMALL;
								},
								get look() {
									return draft().text === "auto" ? ButtonLooks$3.FILLED : ButtonLooks$3.OUTLINED;
								},
								onClick: () => patch({ text: "auto" }),
								children: "Auto"
							}), _el$44, _co$12);
							(0, import_web$53.insert)(_el$42, (0, import_web$54.createComponent)(Button$3, {
								get size() {
									return ButtonSizes$2.SMALL;
								},
								get look() {
									return draft().text === "auto" ? ButtonLooks$3.OUTLINED : ButtonLooks$3.FILLED;
								},
								onClick: () => patch({ text: draft().text === "auto" ? "#ffffff" : draft().text }),
								children: "Custom"
							}), _el$46, _co$13);
							(0, import_web$53.insert)(_el$40, (0, import_web$54.createComponent)(Show$3, {
								get when() {
									return draft().text !== "auto";
								},
								get fallback() {
									return (0, import_web$54.createComponent)(Text$3, {
										style: {
											color: "var(--text-muted)",
											"font-size": "12px"
										},
										children: "Black or white is chosen automatically for contrast."
									});
								},
								get children() {
									return (0, import_web$54.createComponent)(Button$3, {
										get size() {
											return ButtonSizes$2.NONE;
										},
										"class": "ftags-swatch-trigger",
										"aria-label": "Choose text colour",
										get style() {
											return { background: draft().text };
										},
										onClick: () => openColorPicker({
											label: "Text colour",
											value: () => draft().text,
											onChange: (text) => patch({ text })
										})
									});
								}
							}), _el$48, _co$14);
							(0, import_web$49.effect)((_$p) => (0, import_web$48.style)(_el$41, label, _$p));
							return _el$40;
						})(),
						(() => {
							const _el$49 = (0, import_web$51.getNextElement)(_tmpl$9$1), _el$50 = _el$49.firstChild, _el$51 = _el$50.nextSibling, _el$52 = _el$51.nextSibling, [_el$53, _co$15] = (0, import_web$52.getNextMarker)(_el$52.nextSibling);
							(0, import_web$53.insert)(_el$51, (0, import_web$54.createComponent)(For$3, {
								each: FONTS,
								children: (font) => (() => {
									const _el$90 = (0, import_web$51.getNextElement)(_tmpl$14);
									_el$90.$$click = () => patch({ font: font.id });
									(0, import_web$53.insert)(_el$90, () => font.label);
									(0, import_web$49.effect)((_p$) => {
										const _v$ = `ftags-font-option${draft().font === font.id ? " ftags-font-option--on" : ""}`, _v$2 = font.id || "inherit";
										_v$ !== _p$._v$ && (0, import_web$46.className)(_el$90, _p$._v$ = _v$);
										_v$2 !== _p$._v$2 && _el$90.style.setProperty("font-family", _p$._v$2 = _v$2);
										return _p$;
									}, {
										_v$: undefined,
										_v$2: undefined
									});
									(0, import_web$47.runHydrationEvents)();
									return _el$90;
								})()
							}));
							(0, import_web$53.insert)(_el$49, (0, import_web$54.createComponent)(TextBox$2, {
								get value() {
									return draft().font;
								},
								onInput: (v) => patch({ font: v }),
								placeholder: "…or a custom font-family",
								"aria-label": "Custom font family"
							}), _el$53, _co$15);
							(0, import_web$49.effect)((_$p) => (0, import_web$48.style)(_el$50, label, _$p));
							return _el$49;
						})(),
						(() => {
							const _el$54 = (0, import_web$51.getNextElement)(_tmpl$0$1), _el$55 = _el$54.firstChild, _el$56 = _el$55.firstChild, _el$57 = _el$56.nextSibling, [_el$58, _co$16] = (0, import_web$52.getNextMarker)(_el$57.nextSibling), _el$59 = _el$55.nextSibling, [_el$60, _co$17] = (0, import_web$52.getNextMarker)(_el$59.nextSibling);
							(0, import_web$53.insert)(_el$55, () => draft().weight, _el$58, _co$16);
							(0, import_web$53.insert)(_el$54, (0, import_web$54.createComponent)(Slider$1, {
								get value() {
									return draft().weight;
								},
								onInput: (v) => patch({ weight: Math.round(v) }),
								min: 400,
								max: 900,
								step: 100,
								tick: 100
							}), _el$60, _co$17);
							(0, import_web$49.effect)((_$p) => (0, import_web$48.style)(_el$55, label, _$p));
							return _el$54;
						})(),
						(0, import_web$54.createComponent)(SwitchItem$1, {
							get checked() {
								return draft().italic;
							},
							get value() {
								return draft().italic;
							},
							onChange: (v) => patch({ italic: v }),
							hideBorder: true,
							children: "Italic"
						}),
						(0, import_web$54.createComponent)(Divider$2, {
							mt: true,
							mb: true
						}),
						(0, import_web$54.createComponent)(Header$3, {
							get tag() {
								return HeaderTags$3.H5;
							},
							children: "Animation"
						}),
						(0, import_web$54.createComponent)(Text$3, {
							style: {
								color: "var(--text-muted)",
								"font-size": "12px"
							},
							children: "Colour and movement are separate — pick one of each, or just one."
						}),
						(() => {
							const _el$61 = (0, import_web$51.getNextElement)(_tmpl$10), _el$62 = _el$61.firstChild, _el$63 = _el$62.nextSibling, _el$69 = _el$63.nextSibling, [_el$70, _co$19] = (0, import_web$52.getNextMarker)(_el$69.nextSibling), _el$71 = _el$70.nextSibling, [_el$72, _co$20] = (0, import_web$52.getNextMarker)(_el$71.nextSibling);
							_el$61.style.setProperty("margin-top", "10px");
							(0, import_web$53.insert)(_el$63, (0, import_web$54.createComponent)(For$3, {
								each: COLOR_ANIMS,
								children: (anim) => (() => {
									const _el$91 = (0, import_web$51.getNextElement)(_tmpl$14);
									_el$91.$$click = () => patch({ colorAnim: anim.id });
									(0, import_web$53.insert)(_el$91, () => anim.label);
									(0, import_web$49.effect)((_p$) => {
										const _v$3 = `ftags-anim-option${draft().colorAnim === anim.id ? " ftags-anim-option--on" : ""}`, _v$4 = anim.note;
										_v$3 !== _p$._v$3 && (0, import_web$46.className)(_el$91, _p$._v$3 = _v$3);
										_v$4 !== _p$._v$4 && (0, import_web$45.setAttribute)(_el$91, "title", _p$._v$4 = _v$4);
										return _p$;
									}, {
										_v$3: undefined,
										_v$4: undefined
									});
									(0, import_web$47.runHydrationEvents)();
									return _el$91;
								})()
							}));
							(0, import_web$53.insert)(_el$61, (0, import_web$54.createComponent)(Show$3, {
								get when() {
									return (0, import_web$55.memo)(() => draft().colorAnim === "flow")() && draft().fill !== "gradient";
								},
								get children() {
									return (0, import_web$54.createComponent)(Text$3, {
										style: {
											color: "var(--text-warning, var(--text-muted))",
											"font-size": "12px"
										},
										children: "Flow needs a gradient fill to have anything to slide."
									});
								}
							}), _el$70, _co$19);
							(0, import_web$53.insert)(_el$61, (0, import_web$54.createComponent)(Show$3, {
								get when() {
									return draft().colorAnim !== "none";
								},
								get children() {
									return [(() => {
										const _el$64 = (0, import_web$51.getNextElement)(_tmpl$1), _el$65 = _el$64.firstChild, _el$67 = _el$65.nextSibling, [_el$68, _co$18] = (0, import_web$52.getNextMarker)(_el$67.nextSibling), _el$66 = _el$68.nextSibling;
										(0, import_web$53.insert)(_el$64, () => draft().colorSpeed, _el$68, _co$18);
										(0, import_web$49.effect)((_$p) => (0, import_web$48.style)(_el$64, label, _$p));
										return _el$64;
									})(), (0, import_web$54.createComponent)(Slider$1, {
										get value() {
											return draft().colorSpeed;
										},
										onInput: (v) => patch({ colorSpeed: Math.round(v * 4) / 4 }),
										min: .25,
										max: 3,
										step: .25
									})];
								}
							}), _el$72, _co$20);
							(0, import_web$49.effect)((_$p) => (0, import_web$48.style)(_el$62, label, _$p));
							return _el$61;
						})(),
						(() => {
							const _el$73 = (0, import_web$51.getNextElement)(_tmpl$12), _el$74 = _el$73.firstChild, _el$75 = _el$74.nextSibling, _el$81 = _el$75.nextSibling, [_el$82, _co$22] = (0, import_web$52.getNextMarker)(_el$81.nextSibling);
							(0, import_web$53.insert)(_el$75, (0, import_web$54.createComponent)(For$3, {
								each: MOTIONS,
								children: (anim) => (() => {
									const _el$92 = (0, import_web$51.getNextElement)(_tmpl$14);
									_el$92.$$click = () => patch({ motion: anim.id });
									(0, import_web$53.insert)(_el$92, () => anim.label);
									(0, import_web$49.effect)((_p$) => {
										const _v$5 = `ftags-anim-option${draft().motion === anim.id ? " ftags-anim-option--on" : ""}`, _v$6 = anim.note;
										_v$5 !== _p$._v$5 && (0, import_web$46.className)(_el$92, _p$._v$5 = _v$5);
										_v$6 !== _p$._v$6 && (0, import_web$45.setAttribute)(_el$92, "title", _p$._v$6 = _v$6);
										return _p$;
									}, {
										_v$5: undefined,
										_v$6: undefined
									});
									(0, import_web$47.runHydrationEvents)();
									return _el$92;
								})()
							}));
							(0, import_web$53.insert)(_el$73, (0, import_web$54.createComponent)(Show$3, {
								get when() {
									return draft().motion !== "none";
								},
								get children() {
									return [(() => {
										const _el$76 = (0, import_web$51.getNextElement)(_tmpl$11), _el$77 = _el$76.firstChild, _el$79 = _el$77.nextSibling, [_el$80, _co$21] = (0, import_web$52.getNextMarker)(_el$79.nextSibling), _el$78 = _el$80.nextSibling;
										(0, import_web$53.insert)(_el$76, () => draft().motionSpeed, _el$80, _co$21);
										(0, import_web$49.effect)((_$p) => (0, import_web$48.style)(_el$76, label, _$p));
										return _el$76;
									})(), (0, import_web$54.createComponent)(Slider$1, {
										get value() {
											return draft().motionSpeed;
										},
										onInput: (v) => patch({ motionSpeed: Math.round(v * 4) / 4 }),
										min: .25,
										max: 3,
										step: .25
									})];
								}
							}), _el$82, _co$22);
							(0, import_web$49.effect)((_$p) => (0, import_web$48.style)(_el$74, label, _$p));
							return _el$73;
						})()
					];
				} }),
				(0, import_web$54.createComponent)(ModalFooter$3, { get children() {
					const _el$83 = (0, import_web$51.getNextElement)(_tmpl$13), _el$84 = _el$83.firstChild, [_el$85, _co$23] = (0, import_web$52.getNextMarker)(_el$84.nextSibling), _el$86 = _el$85.nextSibling, [_el$87, _co$24] = (0, import_web$52.getNextMarker)(_el$86.nextSibling), _el$88 = _el$87.nextSibling, [_el$89, _co$25] = (0, import_web$52.getNextMarker)(_el$88.nextSibling);
					(0, import_web$53.insert)(_el$83, (0, import_web$54.createComponent)(Button$3, {
						get look() {
							return ButtonLooks$3.OUTLINED;
						},
						get color() {
							return ButtonColors$3.RED;
						},
						onClick: () => {
							resetStyle(props.tag);
							props.close();
						},
						children: "Reset"
					}), _el$85, _co$23);
					(0, import_web$53.insert)(_el$83, (0, import_web$54.createComponent)(Button$3, {
						get look() {
							return ButtonLooks$3.OUTLINED;
						},
						get onClick() {
							return props.close;
						},
						children: "Cancel"
					}), _el$87, _co$24);
					(0, import_web$53.insert)(_el$83, (0, import_web$54.createComponent)(Button$3, {
						onClick: save,
						children: "Save"
					}), _el$89, _co$25);
					return _el$83;
				} })
			];
		}
	});
}
(0, import_web$44.delegateEvents)(["click"]);

//#endregion
//#region plugins/friend-tags/ui/openStyler.jsx
var import_web$42 = __toESM(require_web(), 1);
const { ui: { openModal: openModal$2 } } = shelter;
const openStyler = (tag) => openModal$2((props) => (0, import_web$42.createComponent)(TagStyler, {
	tag,
	get close() {
		return props.close;
	}
}));

//#endregion
//#region plugins/friend-tags/ui/TagEditor.jsx
var import_web$31 = __toESM(require_web(), 1);
var import_web$32 = __toESM(require_web(), 1);
var import_web$33 = __toESM(require_web(), 1);
var import_web$34 = __toESM(require_web(), 1);
var import_web$35 = __toESM(require_web(), 1);
var import_web$36 = __toESM(require_web(), 1);
var import_web$37 = __toESM(require_web(), 1);
var import_web$38 = __toESM(require_web(), 1);
var import_web$39 = __toESM(require_web(), 1);
var import_web$40 = __toESM(require_web(), 1);
var import_web$41 = __toESM(require_web(), 1);
const _tmpl$$4 = /*#__PURE__*/ (0, import_web$31.template)(`<div class="ftags-editor-list"></div>`, 2), _tmpl$2$4 = /*#__PURE__*/ (0, import_web$31.template)(`<div class="ftags-add-row"><!#><!/><!#><!/><!#><!/></div>`, 8), _tmpl$3$3 = /*#__PURE__*/ (0, import_web$31.template)(`<div class="ftags-live-preview"><span class="ftags-live-label">Preview</span><!#><!/></div>`, 6), _tmpl$4$2 = /*#__PURE__*/ (0, import_web$31.template)(`<div style="display: flex; flex-direction: column; gap: 6px"></div>`, 2), _tmpl$5$1 = /*#__PURE__*/ (0, import_web$31.template)(`<div style="margin-top: 6px"></div>`, 2), _tmpl$6$1 = /*#__PURE__*/ (0, import_web$31.template)(`<div class="ftags-suggestions"></div>`, 2), _tmpl$7$1 = /*#__PURE__*/ (0, import_web$31.template)(`<div style="display: flex; gap: 8px; justify-content: flex-end; width: 100%"><!#><!/><!#><!/></div>`, 6), _tmpl$8$1 = /*#__PURE__*/ (0, import_web$31.template)(`<span class="ftags-empty">No tags yet — add one below.</span>`, 2), _tmpl$9 = /*#__PURE__*/ (0, import_web$31.template)(`<span class="ftags-editor-chip"><!#><!/><button>×</button></span>`, 6), _tmpl$0 = /*#__PURE__*/ (0, import_web$31.template)(`<div style="display: flex; align-items: center; gap: 8px"><!#><!/><div style="flex: 1"></div><!#><!/></div>`, 8);
const { flux: { storesFlat: { UserStore: UserStore$2 } }, ui: { Button: Button$2, ButtonColors: ButtonColors$2, ButtonLooks: ButtonLooks$2, ButtonSizes: ButtonSizes$1, Header: Header$2, HeaderTags: HeaderTags$2, ModalBody: ModalBody$2, ModalFooter: ModalFooter$2, ModalHeader: ModalHeader$2, ModalRoot: ModalRoot$2, ModalSizes: ModalSizes$2, Text: Text$2, TextArea: TextArea$1, TextBox: TextBox$1 }, solid: { For: For$2, Show: Show$2, createMemo: createMemo$3, createSignal: createSignal$2 } } = shelter;
function TagEditor(props) {
	const [draft, setDraft] = createSignal$2("");
	const [note, setNoteDraft] = createSignal$2(getNote(props.userId));
	const autocomplete = createEmojiAutocomplete(draft, setDraft);
	const user = createMemo$3(() => UserStore$2.getUser(props.userId));
	const name = () => user()?.globalName ?? user()?.username ?? props.userId;
	const tags = createMemo$3(() => getTags(props.userId));
	const suggestions = createMemo$3(() => {
		const mine = new Set(tags().map(tagKey));
		return allTags().filter((t) => !mine.has(t.key)).slice(0, 12);
	});
	const duplicate = () => tags().some((t) => tagKey(t) === tagKey(draft()));
	const canAdd = () => !!normalise(draft()) && !duplicate();
	const commit = () => {
		if (!canAdd()) return;
		addTag(props.userId, draft());
		setDraft("");
	};
	return (0, import_web$40.createComponent)(ModalRoot$2, {
		get size() {
			return ModalSizes$2.SMALL;
		},
		get children() {
			return [
				(0, import_web$40.createComponent)(ModalHeader$2, {
					get close() {
						return props.close;
					},
					get children() {
						return ["Tags for ", (0, import_web$41.memo)(() => name())];
					}
				}),
				(0, import_web$40.createComponent)(ModalBody$2, { get children() {
					return [
						(() => {
							const _el$ = (0, import_web$38.getNextElement)(_tmpl$$4);
							(0, import_web$39.insert)(_el$, (0, import_web$40.createComponent)(Show$2, {
								get when() {
									return tags().length;
								},
								get fallback() {
									return (0, import_web$38.getNextElement)(_tmpl$8$1);
								},
								get children() {
									return (0, import_web$40.createComponent)(For$2, {
										get each() {
											return tags();
										},
										children: (tag) => (() => {
											const _el$20 = (0, import_web$38.getNextElement)(_tmpl$9), _el$22 = _el$20.firstChild, [_el$23, _co$7] = (0, import_web$36.getNextMarker)(_el$22.nextSibling), _el$21 = _el$23.nextSibling;
											(0, import_web$39.insert)(_el$20, tag, _el$23, _co$7);
											_el$21.$$click = () => removeTag(props.userId, tag);
											(0, import_web$35.setAttribute)(_el$21, "aria-label", `Remove tag ${tag}`);
											(0, import_web$33.effect)((_p$) => {
												const _v$ = colorOf(tag), _v$2 = textOn(colorOf(tag));
												_v$ !== _p$._v$ && _el$20.style.setProperty("background", _p$._v$ = _v$);
												_v$2 !== _p$._v$2 && _el$20.style.setProperty("color", _p$._v$2 = _v$2);
												return _p$;
											}, {
												_v$: undefined,
												_v$2: undefined
											});
											(0, import_web$34.runHydrationEvents)();
											return _el$20;
										})()
									});
								}
							}));
							return _el$;
						})(),
						(() => {
							const _el$2 = (0, import_web$38.getNextElement)(_tmpl$2$4), _el$3 = _el$2.firstChild, [_el$4, _co$] = (0, import_web$36.getNextMarker)(_el$3.nextSibling), _el$5 = _el$4.nextSibling, [_el$6, _co$2] = (0, import_web$36.getNextMarker)(_el$5.nextSibling), _el$7 = _el$6.nextSibling, [_el$8, _co$3] = (0, import_web$36.getNextMarker)(_el$7.nextSibling);
							const _ref$ = autocomplete.setAnchor;
							typeof _ref$ === "function" ? (0, import_web$37.use)(_ref$, _el$2) : autocomplete.setAnchor = _el$2;
							(0, import_web$39.insert)(_el$2, (0, import_web$40.createComponent)(TextBox$1, {
								get value() {
									return draft();
								},
								placeholder: "New tag… try :fire: or ~strike~",
								maxlength: 80,
								"aria-label": "New tag",
								onInput: setDraft,
								onKeyDown: (e) => {
									autocomplete.keydown(e);
									if (e.key === "Enter" && !e.defaultPrevented) commit();
								}
							}), _el$4, _co$);
							(0, import_web$39.insert)(_el$2, (0, import_web$40.createComponent)(Button$2, {
								onClick: commit,
								get disabled() {
									return !canAdd();
								},
								get size() {
									return ButtonSizes$1.SMALL;
								},
								children: "Add"
							}), _el$6, _co$2);
							(0, import_web$39.insert)(_el$2, (0, import_web$40.createComponent)(EmojiAutocomplete, { controller: autocomplete }), _el$8, _co$3);
							return _el$2;
						})(),
						(0, import_web$40.createComponent)(Show$2, {
							get when() {
								return draft();
							},
							get children() {
								const _el$9 = (0, import_web$38.getNextElement)(_tmpl$3$3), _el$0 = _el$9.firstChild, _el$1 = _el$0.nextSibling, [_el$10, _co$4] = (0, import_web$36.getNextMarker)(_el$1.nextSibling);
								(0, import_web$39.insert)(_el$9, (0, import_web$40.createComponent)(Chip, {
									get tag() {
										return draft();
									},
									animate: false
								}), _el$10, _co$4);
								return _el$9;
							}
						}),
						(0, import_web$40.createComponent)(Show$2, {
							get when() {
								return duplicate();
							},
							get children() {
								return (0, import_web$40.createComponent)(Text$2, {
									style: {
										color: "var(--text-danger)",
										"font-size": "13px"
									},
									get children() {
										return [(0, import_web$41.memo)(() => name()), " already has that tag."];
									}
								});
							}
						}),
						(0, import_web$40.createComponent)(Show$2, {
							get when() {
								return tags().length;
							},
							get children() {
								return [(0, import_web$40.createComponent)(Header$2, {
									get tag() {
										return HeaderTags$2.H5;
									},
									margin: true,
									children: "Appearance"
								}), (() => {
									const _el$11 = (0, import_web$38.getNextElement)(_tmpl$4$2);
									(0, import_web$39.insert)(_el$11, (0, import_web$40.createComponent)(For$2, {
										get each() {
											return tags();
										},
										children: (tag) => (() => {
											const _el$24 = (0, import_web$38.getNextElement)(_tmpl$0), _el$26 = _el$24.firstChild, [_el$27, _co$8] = (0, import_web$36.getNextMarker)(_el$26.nextSibling), _el$25 = _el$27.nextSibling, _el$28 = _el$25.nextSibling, [_el$29, _co$9] = (0, import_web$36.getNextMarker)(_el$28.nextSibling);
											(0, import_web$39.insert)(_el$24, (0, import_web$40.createComponent)(Chip, {
												tag,
												animate: false
											}), _el$27, _co$8);
											(0, import_web$39.insert)(_el$24, (0, import_web$40.createComponent)(Button$2, {
												get size() {
													return ButtonSizes$1.TINY;
												},
												get look() {
													return ButtonLooks$2.OUTLINED;
												},
												onClick: () => openStyler(tag),
												children: "Style"
											}), _el$29, _co$9);
											return _el$24;
										})()
									}));
									return _el$11;
								})()];
							}
						}),
						(0, import_web$40.createComponent)(Header$2, {
							get tag() {
								return HeaderTags$2.H5;
							},
							margin: true,
							children: "Note"
						}),
						(0, import_web$40.createComponent)(Text$2, {
							style: {
								color: "var(--text-muted)",
								"font-size": "12px"
							},
							children: "Private to you, and never shown next to their name."
						}),
						(() => {
							const _el$12 = (0, import_web$38.getNextElement)(_tmpl$5$1);
							(0, import_web$39.insert)(_el$12, (0, import_web$40.createComponent)(TextArea$1, {
								get value() {
									return note();
								},
								onInput: (value) => {
									setNoteDraft(value);
									setNote(props.userId, value);
								},
								placeholder: "How you know them, what they like…",
								maxlength: 500,
								"resize-y": true,
								"aria-label": "Private note"
							}));
							return _el$12;
						})(),
						(0, import_web$40.createComponent)(Show$2, {
							get when() {
								return suggestions().length;
							},
							get children() {
								return [(0, import_web$40.createComponent)(Header$2, {
									get tag() {
										return HeaderTags$2.H5;
									},
									margin: true,
									children: "Existing tags"
								}), (() => {
									const _el$13 = (0, import_web$38.getNextElement)(_tmpl$6$1);
									(0, import_web$39.insert)(_el$13, (0, import_web$40.createComponent)(For$2, {
										get each() {
											return suggestions();
										},
										children: (t) => (0, import_web$40.createComponent)(Chip, {
											"class": "ftags-suggestion",
											animate: false,
											get tag() {
												return t.label;
											},
											get title() {
												return `Used by ${t.count} ${t.count === 1 ? "person" : "people"}`;
											},
											onClick: () => addTag(props.userId, t.label)
										})
									}));
									return _el$13;
								})()];
							}
						})
					];
				} }),
				(0, import_web$40.createComponent)(ModalFooter$2, { get children() {
					const _el$14 = (0, import_web$38.getNextElement)(_tmpl$7$1), _el$15 = _el$14.firstChild, [_el$16, _co$5] = (0, import_web$36.getNextMarker)(_el$15.nextSibling), _el$17 = _el$16.nextSibling, [_el$18, _co$6] = (0, import_web$36.getNextMarker)(_el$17.nextSibling);
					(0, import_web$39.insert)(_el$14, (0, import_web$40.createComponent)(Show$2, {
						get when() {
							return tags().length;
						},
						get children() {
							return (0, import_web$40.createComponent)(Button$2, {
								get look() {
									return ButtonLooks$2.OUTLINED;
								},
								get color() {
									return ButtonColors$2.RED;
								},
								onClick: () => clearUser(props.userId),
								children: "Remove all"
							});
						}
					}), _el$16, _co$5);
					(0, import_web$39.insert)(_el$14, (0, import_web$40.createComponent)(Button$2, {
						get onClick() {
							return props.close;
						},
						children: "Done"
					}), _el$18, _co$6);
					return _el$14;
				} })
			];
		}
	});
}
(0, import_web$32.delegateEvents)(["click"]);

//#endregion
//#region plugins/friend-tags/ui/TagRow.jsx
var import_web$19 = __toESM(require_web(), 1);
var import_web$20 = __toESM(require_web(), 1);
var import_web$21 = __toESM(require_web(), 1);
var import_web$22 = __toESM(require_web(), 1);
var import_web$23 = __toESM(require_web(), 1);
var import_web$24 = __toESM(require_web(), 1);
var import_web$25 = __toESM(require_web(), 1);
var import_web$26 = __toESM(require_web(), 1);
var import_web$27 = __toESM(require_web(), 1);
var import_web$28 = __toESM(require_web(), 1);
var import_web$29 = __toESM(require_web(), 1);
var import_web$30 = __toESM(require_web(), 1);
const _tmpl$$3 = /*#__PURE__*/ (0, import_web$19.template)(`<span class="ftags-chip ftags-chip--more">+<!#><!/></span>`, 4), _tmpl$2$3 = /*#__PURE__*/ (0, import_web$19.template)(`<button class="ftags-add" aria-label="Edit tags for this user">+</button>`, 2), _tmpl$3$2 = /*#__PURE__*/ (0, import_web$19.template)(`<span><!#><!/><!#><!/><!#><!/></span>`, 8);
const { ui: { openModal: openModal$1 }, solid: { For: For$1, Show: Show$1, createMemo: createMemo$2 } } = shelter;
const openTagEditor = (userId) => openModal$1((props) => (0, import_web$30.createComponent)(TagEditor, {
	userId,
	get close() {
		return props.close;
	}
}));
function TagRow(props) {
	const tags = createMemo$2(() => getTags(props.userId));
	const shown = createMemo$2(() => {
		const limit = display.maxShown();
		return limit > 0 ? tags().slice(0, limit) : tags();
	});
	const overflow = createMemo$2(() => tags().length - shown().length);
	const edit = (e) => {
		e.stopPropagation();
		e.preventDefault();
		openTagEditor(props.userId);
	};
	return (0, import_web$30.createComponent)(Show$1, {
		get when() {
			return props.show?.() ?? true;
		},
		get children() {
			return (0, import_web$30.createComponent)(Show$1, {
				get when() {
					return props.editable || tags().length;
				},
				get children() {
					const _el$ = (0, import_web$24.getNextElement)(_tmpl$3$2), _el$7 = _el$.firstChild, [_el$8, _co$2] = (0, import_web$26.getNextMarker)(_el$7.nextSibling), _el$9 = _el$8.nextSibling, [_el$0, _co$3] = (0, import_web$26.getNextMarker)(_el$9.nextSibling), _el$1 = _el$0.nextSibling, [_el$10, _co$4] = (0, import_web$26.getNextMarker)(_el$1.nextSibling);
					(0, import_web$27.insert)(_el$, (0, import_web$30.createComponent)(For$1, {
						get each() {
							return shown();
						},
						children: (tag) => (0, import_web$30.createComponent)(Chip, {
							tag,
							get onClick() {
								return props.editable ? edit : undefined;
							}
						})
					}), _el$8, _co$2);
					(0, import_web$27.insert)(_el$, (0, import_web$30.createComponent)(Show$1, {
						get when() {
							return overflow() > 0;
						},
						get children() {
							const _el$2 = (0, import_web$24.getNextElement)(_tmpl$$3), _el$3 = _el$2.firstChild, _el$4 = _el$3.nextSibling, [_el$5, _co$] = (0, import_web$26.getNextMarker)(_el$4.nextSibling);
							(0, import_web$28.addEventListener)(_el$2, "click", props.editable ? edit : undefined, true);
							(0, import_web$27.insert)(_el$2, overflow, _el$5, _co$);
							(0, import_web$23.effect)(() => (0, import_web$22.setAttribute)(_el$2, "title", tags().join(", ")));
							(0, import_web$25.runHydrationEvents)();
							return _el$2;
						}
					}), _el$0, _co$3);
					(0, import_web$27.insert)(_el$, (0, import_web$30.createComponent)(Show$1, {
						get when() {
							return props.editable;
						},
						get children() {
							const _el$6 = (0, import_web$24.getNextElement)(_tmpl$2$3);
							_el$6.$$click = edit;
							(0, import_web$25.runHydrationEvents)();
							return _el$6;
						}
					}), _el$10, _co$4);
					(0, import_web$23.effect)(() => (0, import_web$21.className)(_el$, `ftags-row${props.compact ? " ftags-row--compact" : ""}${props.editable ? " ftags-row--editable" : ""}${!tags().length ? " ftags-row--empty" : ""}`));
					return _el$;
				}
			});
		}
	});
}
(0, import_web$20.delegateEvents)(["click"]);

//#endregion
//#region plugins/friend-tags/inject.jsx
var import_web$14 = __toESM(require_web(), 1);
var import_web$15 = __toESM(require_web(), 1);
var import_web$16 = __toESM(require_web(), 1);
var import_web$17 = __toESM(require_web(), 1);
var import_web$18 = __toESM(require_web(), 1);
const _tmpl$$2 = /*#__PURE__*/ (0, import_web$14.template)(`<span class="ftags-mount"></span>`, 2), _tmpl$2$2 = /*#__PURE__*/ (0, import_web$14.template)(`<div role="menuitem" tabindex="-1">Edit tags</div>`, 2);
const { flux: { storesFlat: { UserStore: UserStore$1, ChannelStore, SelectedChannelStore } }, plugin: { store: store$1, scoped: scoped$1 }, ui: { ReactiveRoot }, util: { getFiber, reactFiberWalker, log }, observeDom } = shelter;
const MARK = "ftags";
const unhandled = (selector) => selector.split(",").map((part) => `${part.trim()}:not([data-${MARK}])`).join(", ");
const DEFAULT_DEPTH = 12;
const SURFACES = [
	{
		id: "friends",
		selector: "[class*=\"peopleListItem\"]",
		anchors: [
			"[class*=\"nameAndDecorators\"]",
			"[class*=\"discordTag\"]",
			"[class*=\"userInfo\"]"
		],
		props: ["user"],
		editable: true,
		enabled: () => store$1.inFriends
	},
	{
		id: "messages",
		selector: "[id^=\"message-username-\"]",
		anchors: [],
		props: ["message", "user"],
		enabled: () => store$1.inMessages,
		onDispatch: true
	},
	{
		id: "members",
		selector: "[class*=\"memberInner\"]",
		anchors: ["[class*=\"nameAndDecorators\"]", "[class*=\"name_\"]"],
		props: ["user"],
		compact: true,
		enabled: () => store$1.inMembers
	},
	{
		id: "dms",
		selector: "[data-list-item-id^=\"private-channels-uid_\"]",
		anchors: ["[class*=\"nameAndDecorators\"]", "[class*=\"name_\"]"],
		resolve: resolveDmUser,
		compact: true,
		enabled: () => store$1.inDms
	},
	{
		id: "profiles",
		selector: "[class*=\"userPopoutOuter\"] [class*=\"usernameRow\"], [class*=\"userProfileModalInner\"] [class*=\"usernameRow\"]",
		anchors: [],
		props: [
			"user",
			"userId",
			"displayProfile"
		],
		depth: 20,
		editable: true,
		enabled: () => store$1.inProfiles
	}
];
/**
* Read a DM row's user straight from its link target, e.g.
* `/channels/@me/1234` -> that channel -> its single recipient.
*
* The sidebar's nav entries (Friends, Message Requests, Nitro, Shop, Quests)
* sit in the same list as real DMs, and none of them carry a user of their own,
* so a fiber walk climbs past them and finds whichever DM is currently open —
* which is how one friend's tags ended up on every nav item. Matching a numeric
* channel ID rules all of those out with no walking at all.
*/
function resolveDmUser(element) {
	const href = element.getAttribute?.("href") ?? element.querySelector("a[href]")?.getAttribute("href") ?? "";
	const channelId = /\/channels\/@me\/(\d+)\b/.exec(href)?.[1];
	if (!channelId) return;
	const channel = ChannelStore.getChannel(channelId);
	if (channel?.recipients?.length !== 1) return;
	return UserStore$1.getUser(channel.recipients[0]);
}
/**
* Walk up the fiber tree looking for a prop, checking both prop bags.
*
* `depth` matters more than it looks: reactFiberWalker also recurses through
* siblings, so the default limit of 100 will happily wander out of the row and
* into unrelated parts of the page. Keep it tight.
*/
function walkProp(element, name, depth) {
	const fiber = reactFiberWalker(getFiber(element), name, true, false, depth);
	return fiber?.memoizedProps?.[name] ?? fiber?.pendingProps?.[name];
}
/**
* Turn a DOM element into the user it represents, trying each prop in order.
* Order matters: on a message the `message` prop is authoritative, while a
* stray `user` prop further up the tree could belong to someone else entirely.
*/
function resolveUser(element, props, depth) {
	for (const prop of props) {
		const value = walkProp(element, prop, depth);
		if (!value) continue;
		switch (prop) {
			case "user":
				if (value.id) return value;
				break;
			case "message":
				if (value.author?.id) return value.author;
				break;
			case "userId":
				if (typeof value === "string") return UserStore$1.getUser(value);
				break;
			case "displayProfile":
				if (value.userId) return UserStore$1.getUser(value.userId);
				break;
			case "channel":
				if (value.recipients?.length === 1) return UserStore$1.getUser(value.recipients[0]);
				break;
		}
	}
}
const firstMatch = (root, selectors) => {
	for (const selector of selectors) {
		const found = root.querySelector(selector);
		if (found) return found;
	}
};
function attach(element, surface) {
	if (element.dataset[MARK]) return;
	element.dataset[MARK] = "1";
	try {
		inject(element, surface);
	} catch (err) {
		if (store$1.debug) log([`[friend-tags] ${surface.id}: injection failed`, err], "error");
	}
}
function inject(element, surface) {
	const user = surface.resolve ? surface.resolve(element) : resolveUser(element, surface.props, surface.depth ?? DEFAULT_DEPTH);
	if (!user?.id) {
		if (store$1.debug && surface.id !== "dms") log(`[friend-tags] ${surface.id}: could not resolve a user`, "warn");
		return;
	}
	const anchor = firstMatch(element, surface.anchors) ?? (surface.requireAnchor ? undefined : element);
	if (!anchor) {
		if (store$1.debug) log(`[friend-tags] ${surface.id}: no anchor matched, skipping`, "warn");
		return;
	}
	const mount = (0, import_web$18.getNextElement)(_tmpl$$2);
	mount.append((0, import_web$17.createComponent)(ReactiveRoot, { get children() {
		return (0, import_web$17.createComponent)(TagRow, {
			get userId() {
				return user.id;
			},
			get compact() {
				return surface.compact;
			},
			get editable() {
				return surface.editable;
			},
			get show() {
				return surface.enabled;
			}
		});
	} }));
	anchor.append(mount);
	element.addEventListener("contextmenu", () => {
		lastContextUser = {
			id: user.id,
			at: Date.now()
		};
	});
}
let lastContextUser;
function addContextMenuItem(menu) {
	const recent = lastContextUser && Date.now() - lastContextUser.at < 1e3;
	const userId = recent && lastContextUser.id || resolveUser(menu, [
		"user",
		"message",
		"userId",
		"channel"
	], 25)?.id;
	if (!userId) return;
	const items = menu.querySelectorAll("[role=\"menuitem\"]");
	if (!items.length) return;
	const template = items[items.length - 1];
	const item = (() => {
		const _el$2 = (0, import_web$18.getNextElement)(_tmpl$2$2);
		(0, import_web$16.effect)(() => (0, import_web$15.className)(_el$2, template.className));
		return _el$2;
	})();
	item.addEventListener("click", () => {
		document.dispatchEvent(new KeyboardEvent("keydown", {
			key: "Escape",
			bubbles: true
		}));
		setTimeout(() => openTagEditor(userId), 0);
	});
	template.parentElement?.append(item);
}
const MESSAGE_TRIGGERS = [
	"MESSAGE_CREATE",
	"MESSAGE_UPDATE",
	"CHANNEL_SELECT",
	"LOAD_MESSAGES_SUCCESS",
	"UPDATE_CHANNEL_DIMENSIONS"
];
function startInjection() {
	for (const surface of SURFACES) {
		if (surface.onDispatch) continue;
		scoped$1.observeDom(unhandled(surface.selector), (element) => attach(element, surface));
	}
	scoped$1.observeDom(`[role="menu"]:not([data-${MARK}-menu])`, (menu) => {
		menu.dataset[`${MARK}Menu`] = "1";
		try {
			addContextMenuItem(menu);
		} catch (err) {
			if (store$1.debug) log(["[friend-tags] context menu injection failed", err], "error");
		}
	});
	const messages = SURFACES.find((s) => s.id === "messages");
	const onDispatch = (payload) => {
		if (payload.type === "MESSAGE_CREATE" && payload.channelId !== SelectedChannelStore.getChannelId()) return;
		const unobserve = observeDom(unhandled(messages.selector), (element) => {
			unobserve();
			attach(element, messages);
		});
		setTimeout(unobserve, 500);
	};
	for (const trigger of MESSAGE_TRIGGERS) scoped$1.flux.subscribe(trigger, onDispatch);
	for (const surface of SURFACES) for (const element of document.querySelectorAll(unhandled(surface.selector))) attach(element, surface);
}
function removeInjections() {
	for (const mount of document.querySelectorAll(".ftags-mount")) mount.remove();
	for (const element of document.querySelectorAll(`[data-${MARK}]`)) delete element.dataset[MARK];
}
function refreshInjections() {
	removeInjections();
	for (const surface of SURFACES) for (const element of document.querySelectorAll(unhandled(surface.selector))) attach(element, surface);
}

//#endregion
//#region plugins/friend-tags/ui/TagManager.jsx
var import_web$6 = __toESM(require_web(), 1);
var import_web$7 = __toESM(require_web(), 1);
var import_web$8 = __toESM(require_web(), 1);
var import_web$9 = __toESM(require_web(), 1);
var import_web$10 = __toESM(require_web(), 1);
var import_web$11 = __toESM(require_web(), 1);
var import_web$12 = __toESM(require_web(), 1);
var import_web$13 = __toESM(require_web(), 1);
const _tmpl$$1 = /*#__PURE__*/ (0, import_web$6.template)(`<div style="display: flex; gap: 6px; align-items: center"><!#><!/><!#><!/></div>`, 6), _tmpl$2$1 = /*#__PURE__*/ (0, import_web$6.template)(`<span class="ftags-count"><!#><!/> <!#><!/></span>`, 6), _tmpl$3$1 = /*#__PURE__*/ (0, import_web$6.template)(`<div style="display: flex; gap: 6px"><!#><!/><!#><!/></div>`, 6), _tmpl$4$1 = /*#__PURE__*/ (0, import_web$6.template)(`<div class="ftags-manager-grid"></div>`, 2), _tmpl$5 = /*#__PURE__*/ (0, import_web$6.template)(`<span class="ftags-empty">No tags yet.</span>`, 2), _tmpl$6 = /*#__PURE__*/ (0, import_web$6.template)(`<span class="ftags-empty">Nobody is tagged yet.</span>`, 2), _tmpl$7 = /*#__PURE__*/ (0, import_web$6.template)(`<div class="ftags-user-row"><span class="ftags-user-name"></span><span class="ftags-user-tags"></span><!#><!/><!#><!/></div>`, 10), _tmpl$8 = /*#__PURE__*/ (0, import_web$6.template)(`<div style="width: 100%"><div style="display: flex; gap: 8px; align-items: center"><!#><!/><!#><!/></div><!#><!/></div>`, 10);
const { flux: { storesFlat: { UserStore } }, ui: { Button: Button$1, ButtonColors: ButtonColors$1, ButtonLooks: ButtonLooks$1, ButtonSizes, Divider: Divider$1, Header: Header$1, HeaderTags: HeaderTags$1, ModalBody: ModalBody$1, ModalFooter: ModalFooter$1, ModalHeader: ModalHeader$1, ModalRoot: ModalRoot$1, ModalSizes: ModalSizes$1, Text: Text$1, TextBox, openConfirmationModal }, solid: { For, Show, createMemo: createMemo$1, createSignal: createSignal$1 } } = shelter;
function TagRowEntry(props) {
	const [renaming, setRenaming] = createSignal$1(false);
	const [draft, setDraft] = createSignal$1(props.tag.label);
	const commit = () => {
		renameTag(props.tag.label, draft());
		setRenaming(false);
	};
	return [
		(0, import_web$13.createComponent)(Button$1, {
			get size() {
				return ButtonSizes.TINY;
			},
			get look() {
				return ButtonLooks$1.OUTLINED;
			},
			onClick: () => openStyler(props.tag.label),
			children: "Style"
		}),
		(0, import_web$13.createComponent)(Show, {
			get when() {
				return renaming();
			},
			get fallback() {
				return (0, import_web$13.createComponent)(Chip, {
					get tag() {
						return props.tag.label;
					},
					animate: false
				});
			},
			get children() {
				const _el$ = (0, import_web$10.getNextElement)(_tmpl$$1), _el$2 = _el$.firstChild, [_el$3, _co$] = (0, import_web$11.getNextMarker)(_el$2.nextSibling), _el$4 = _el$3.nextSibling, [_el$5, _co$2] = (0, import_web$11.getNextMarker)(_el$4.nextSibling);
				(0, import_web$12.insert)(_el$, (0, import_web$13.createComponent)(TextBox, {
					get value() {
						return draft();
					},
					onInput: setDraft,
					"aria-label": "Rename tag",
					maxlength: 40
				}), _el$3, _co$);
				(0, import_web$12.insert)(_el$, (0, import_web$13.createComponent)(Button$1, {
					get size() {
						return ButtonSizes.TINY;
					},
					onClick: commit,
					children: "Save"
				}), _el$5, _co$2);
				return _el$;
			}
		}),
		(() => {
			const _el$6 = (0, import_web$10.getNextElement)(_tmpl$2$1), _el$8 = _el$6.firstChild, [_el$9, _co$3] = (0, import_web$11.getNextMarker)(_el$8.nextSibling), _el$7 = _el$9.nextSibling, _el$0 = _el$7.nextSibling, [_el$1, _co$4] = (0, import_web$11.getNextMarker)(_el$0.nextSibling);
			(0, import_web$12.insert)(_el$6, () => props.tag.count, _el$9, _co$3);
			(0, import_web$12.insert)(_el$6, () => props.tag.count === 1 ? "person" : "people", _el$1, _co$4);
			return _el$6;
		})(),
		(() => {
			const _el$10 = (0, import_web$10.getNextElement)(_tmpl$3$1), _el$11 = _el$10.firstChild, [_el$12, _co$5] = (0, import_web$11.getNextMarker)(_el$11.nextSibling), _el$13 = _el$12.nextSibling, [_el$14, _co$6] = (0, import_web$11.getNextMarker)(_el$13.nextSibling);
			(0, import_web$12.insert)(_el$10, (0, import_web$13.createComponent)(Button$1, {
				get size() {
					return ButtonSizes.TINY;
				},
				get look() {
					return ButtonLooks$1.OUTLINED;
				},
				onClick: () => {
					setDraft(props.tag.label);
					setRenaming(!renaming());
				},
				get children() {
					return renaming() ? "Cancel" : "Rename";
				}
			}), _el$12, _co$5);
			(0, import_web$12.insert)(_el$10, (0, import_web$13.createComponent)(Button$1, {
				get size() {
					return ButtonSizes.TINY;
				},
				get look() {
					return ButtonLooks$1.OUTLINED;
				},
				get color() {
					return ButtonColors$1.RED;
				},
				onClick: () => openConfirmationModal({
					header: () => `Delete "${props.tag.label}"?`,
					body: () => `This removes the tag from all ${props.tag.count} ${props.tag.count === 1 ? "person" : "people"} who have it.`,
					confirmText: "Delete",
					type: "danger"
				}).then(() => deleteTag(props.tag.label), () => {}),
				children: "Delete"
			}), _el$14, _co$6);
			return _el$10;
		})()
	];
}
function TagManager(props) {
	const [filter, setFilter] = createSignal$1("");
	const tags = createMemo$1(() => {
		const query = filter().toLowerCase();
		return allTags().filter((t) => !query || t.key.includes(query));
	});
	const users = createMemo$1(() => {
		const query = filter().toLowerCase();
		return Object.entries(allUserTags()).map(([userId, userTags]) => {
			const user = UserStore.getUser(userId);
			return {
				userId,
				tags: userTags,
				name: user?.globalName ?? user?.username ?? userId
			};
		}).filter((entry) => !query || entry.name.toLowerCase().includes(query) || entry.tags.some((t) => t.toLowerCase().includes(query))).sort((a, b) => a.name.localeCompare(b.name));
	});
	return (0, import_web$13.createComponent)(ModalRoot$1, {
		get size() {
			return ModalSizes$1.MEDIUM;
		},
		get children() {
			return [
				(0, import_web$13.createComponent)(ModalHeader$1, {
					get close() {
						return props.close;
					},
					children: "Manage tags"
				}),
				(0, import_web$13.createComponent)(ModalBody$1, { get children() {
					return [
						(0, import_web$13.createComponent)(TextBox, {
							get value() {
								return filter();
							},
							onInput: setFilter,
							placeholder: "Filter by tag or person…",
							"aria-label": "Filter"
						}),
						(0, import_web$13.createComponent)(Header$1, {
							get tag() {
								return HeaderTags$1.H5;
							},
							margin: true,
							children: "Tags"
						}),
						(0, import_web$13.createComponent)(Show, {
							get when() {
								return tags().length;
							},
							get fallback() {
								return (0, import_web$10.getNextElement)(_tmpl$5);
							},
							get children() {
								const _el$15 = (0, import_web$10.getNextElement)(_tmpl$4$1);
								(0, import_web$12.insert)(_el$15, (0, import_web$13.createComponent)(For, {
									get each() {
										return tags();
									},
									children: (tag) => (0, import_web$13.createComponent)(TagRowEntry, { tag })
								}));
								return _el$15;
							}
						}),
						(0, import_web$13.createComponent)(Divider$1, {
							mt: true,
							mb: true
						}),
						(0, import_web$13.createComponent)(Header$1, {
							get tag() {
								return HeaderTags$1.H5;
							},
							children: "Tagged people"
						}),
						(0, import_web$13.createComponent)(Show, {
							get when() {
								return users().length;
							},
							get fallback() {
								return (0, import_web$10.getNextElement)(_tmpl$6);
							},
							get children() {
								return (0, import_web$13.createComponent)(For, {
									get each() {
										return users();
									},
									children: (entry) => (() => {
										const _el$18 = (0, import_web$10.getNextElement)(_tmpl$7), _el$19 = _el$18.firstChild, _el$20 = _el$19.nextSibling, _el$21 = _el$20.nextSibling, [_el$22, _co$7] = (0, import_web$11.getNextMarker)(_el$21.nextSibling), _el$23 = _el$22.nextSibling, [_el$24, _co$8] = (0, import_web$11.getNextMarker)(_el$23.nextSibling);
										(0, import_web$12.insert)(_el$19, () => entry.name);
										(0, import_web$12.insert)(_el$20, (0, import_web$13.createComponent)(For, {
											get each() {
												return entry.tags;
											},
											children: (tag) => (0, import_web$13.createComponent)(Chip, {
												tag,
												animate: false
											})
										}));
										(0, import_web$12.insert)(_el$18, (0, import_web$13.createComponent)(Button$1, {
											get size() {
												return ButtonSizes.TINY;
											},
											get look() {
												return ButtonLooks$1.OUTLINED;
											},
											onClick: () => openTagEditor(entry.userId),
											children: "Edit"
										}), _el$22, _co$7);
										(0, import_web$12.insert)(_el$18, (0, import_web$13.createComponent)(Button$1, {
											get size() {
												return ButtonSizes.TINY;
											},
											get look() {
												return ButtonLooks$1.OUTLINED;
											},
											get color() {
												return ButtonColors$1.RED;
											},
											onClick: () => clearUser(entry.userId),
											children: "Clear"
										}), _el$24, _co$8);
										(0, import_web$8.effect)(() => (0, import_web$7.setAttribute)(_el$19, "title", entry.userId));
										return _el$18;
									})()
								});
							}
						}),
						(0, import_web$13.createComponent)(Show, {
							get when() {
								return (0, import_web$9.memo)(() => !!!users().length)() && !tags().length;
							},
							get children() {
								return (0, import_web$13.createComponent)(Text$1, {
									style: {
										color: "var(--text-muted)",
										"font-size": "13px"
									},
									children: "Open your friends list and hover someone to add your first tag."
								});
							}
						})
					];
				} }),
				(0, import_web$13.createComponent)(ModalFooter$1, { get children() {
					return (0, import_web$13.createComponent)(ByIdAdder, {});
				} })
			];
		}
	});
}
/**
* Escape hatch: tag someone by raw ID. Discord reshuffles its class names from
* time to time, and if that ever breaks the friends list injection this stays
* working regardless.
*/
function ByIdAdder() {
	const [id, setId] = createSignal$1("");
	const valid = () => /^\d{17,20}$/.test(id().trim());
	return (() => {
		const _el$25 = (0, import_web$10.getNextElement)(_tmpl$8), _el$26 = _el$25.firstChild, _el$27 = _el$26.firstChild, [_el$28, _co$9] = (0, import_web$11.getNextMarker)(_el$27.nextSibling), _el$29 = _el$28.nextSibling, [_el$30, _co$0] = (0, import_web$11.getNextMarker)(_el$29.nextSibling), _el$31 = _el$26.nextSibling, [_el$32, _co$1] = (0, import_web$11.getNextMarker)(_el$31.nextSibling);
		(0, import_web$12.insert)(_el$26, (0, import_web$13.createComponent)(TextBox, {
			get value() {
				return id();
			},
			onInput: setId,
			placeholder: "User ID",
			"aria-label": "User ID"
		}), _el$28, _co$9);
		(0, import_web$12.insert)(_el$26, (0, import_web$13.createComponent)(Button$1, {
			get disabled() {
				return !valid();
			},
			onClick: () => {
				openTagEditor(id().trim());
				setId("");
			},
			children: "Tag by ID"
		}), _el$30, _co$0);
		(0, import_web$12.insert)(_el$25, (0, import_web$13.createComponent)(Show, {
			get when() {
				return (0, import_web$9.memo)(() => !!id())() && !valid();
			},
			get children() {
				return (0, import_web$13.createComponent)(Text$1, {
					style: {
						color: "var(--text-danger)",
						"font-size": "13px"
					},
					children: "That doesn't look like a user ID."
				});
			}
		}), _el$32, _co$1);
		return _el$25;
	})();
}

//#endregion
//#region plugins/friend-tags/ui/index.jsx
var import_web = __toESM(require_web(), 1);
var import_web$1 = __toESM(require_web(), 1);
var import_web$2 = __toESM(require_web(), 1);
var import_web$3 = __toESM(require_web(), 1);
var import_web$4 = __toESM(require_web(), 1);
var import_web$5 = __toESM(require_web(), 1);
const _tmpl$ = /*#__PURE__*/ (0, import_web.template)(`<div style="margin-top: 8px"></div>`, 2), _tmpl$2 = /*#__PURE__*/ (0, import_web.template)(`<div style="display: flex; gap: 8px; justify-content: flex-end; width: 100%"><!#><!/><!#><!/><!#><!/></div>`, 8), _tmpl$3 = /*#__PURE__*/ (0, import_web.template)(`<div style="margin: 8px 0 4px"></div>`, 2), _tmpl$4 = /*#__PURE__*/ (0, import_web.template)(`<div style="display: flex; gap: 8px; margin-top: 10px"><!#><!/><!#><!/></div>`, 6);
const { plugin: { store }, ui: { Button, ButtonColors, ButtonLooks, Divider, Header, HeaderTags, ModalBody, ModalFooter, ModalHeader, ModalRoot, ModalSizes, Slider, SwitchItem, Text, TextArea, ToastColors: ToastColors$1, openModal, showToast: showToast$1 }, solid: { createMemo, createSignal } } = shelter;
const Toggle = (props) => (0, import_web$5.createComponent)(SwitchItem, {
	get checked() {
		return props.checked;
	},
	get value() {
		return props.checked;
	},
	get onChange() {
		return props.onChange;
	},
	get note() {
		return props.note;
	},
	hideBorder: true,
	get children() {
		return props.children;
	}
});
function Backup(props) {
	const [text, setText] = createSignal(exportData());
	const doImport = (merge) => {
		let counts;
		try {
			counts = importData(text(), { merge });
		} catch (err) {
			showToast$1({
				title: "Import failed",
				content: String(err.message ?? err),
				color: ToastColors$1.CRITICAL
			});
			return;
		}
		if (!counts.users) {
			showToast$1({
				title: "Nothing to import",
				content: "That backup parsed fine but contains no tags.",
				color: ToastColors$1.WARNING,
				duration: 6e3
			});
			return;
		}
		refreshInjections();
		showToast$1({
			title: "Friend Tags",
			content: `Imported ${counts.tags} ${counts.tags === 1 ? "tag" : "tags"} across ${counts.users} ${counts.users === 1 ? "person" : "people"}.`,
			color: ToastColors$1.SUCCESS
		});
		props.close();
	};
	return (0, import_web$5.createComponent)(ModalRoot, {
		get size() {
			return ModalSizes.MEDIUM;
		},
		get children() {
			return [
				(0, import_web$5.createComponent)(ModalHeader, {
					get close() {
						return props.close;
					},
					children: "Backup & restore"
				}),
				(0, import_web$5.createComponent)(ModalBody, { get children() {
					return [(0, import_web$5.createComponent)(Text, {
						style: {
							color: "var(--header-secondary)",
							"font-size": "14px"
						},
						children: "Copy this somewhere safe, or paste a previous backup in and import it."
					}), (() => {
						const _el$ = (0, import_web$3.getNextElement)(_tmpl$);
						(0, import_web$4.insert)(_el$, (0, import_web$5.createComponent)(TextArea, {
							get value() {
								return text();
							},
							onInput: setText,
							mono: true,
							"resize-y": true,
							"aria-label": "Tag data"
						}));
						return _el$;
					})()];
				} }),
				(0, import_web$5.createComponent)(ModalFooter, { get children() {
					const _el$2 = (0, import_web$3.getNextElement)(_tmpl$2), _el$3 = _el$2.firstChild, [_el$4, _co$] = (0, import_web$2.getNextMarker)(_el$3.nextSibling), _el$5 = _el$4.nextSibling, [_el$6, _co$2] = (0, import_web$2.getNextMarker)(_el$5.nextSibling), _el$7 = _el$6.nextSibling, [_el$8, _co$3] = (0, import_web$2.getNextMarker)(_el$7.nextSibling);
					(0, import_web$4.insert)(_el$2, (0, import_web$5.createComponent)(Button, {
						get look() {
							return ButtonLooks.OUTLINED;
						},
						onClick: () => {
							navigator.clipboard.writeText(exportData());
							showToast$1({
								title: "Friend Tags",
								content: "Copied to clipboard."
							});
						},
						children: "Copy"
					}), _el$4, _co$);
					(0, import_web$4.insert)(_el$2, (0, import_web$5.createComponent)(Button, {
						get look() {
							return ButtonLooks.OUTLINED;
						},
						onClick: () => doImport(true),
						children: "Merge"
					}), _el$6, _co$2);
					(0, import_web$4.insert)(_el$2, (0, import_web$5.createComponent)(Button, {
						get color() {
							return ButtonColors.RED;
						},
						onClick: () => doImport(false),
						children: "Replace all"
					}), _el$8, _co$3);
					return _el$2;
				} })
			];
		}
	});
}
function Settings() {
	const summary = createMemo(() => {
		const tagCount = allTags().length;
		const userCount = Object.keys(allUserTags()).length;
		return `${tagCount} ${tagCount === 1 ? "tag" : "tags"} across ${userCount} ${userCount === 1 ? "person" : "people"}`;
	});
	return [
		(0, import_web$5.createComponent)(Header, {
			get tag() {
				return HeaderTags.H5;
			},
			children: "Where to show tags"
		}),
		(0, import_web$5.createComponent)(Toggle, {
			get checked() {
				return store.inFriends;
			},
			onChange: (v) => store.inFriends = v,
			note: "Hover someone in the friends list to add or edit their tags.",
			children: "Friends list"
		}),
		(0, import_web$5.createComponent)(Toggle, {
			get checked() {
				return store.inMessages;
			},
			onChange: (v) => store.inMessages = v,
			note: "Next to the username on every message, in servers and DMs.",
			children: "Chat messages"
		}),
		(0, import_web$5.createComponent)(Toggle, {
			get checked() {
				return store.inMembers;
			},
			onChange: (v) => store.inMembers = v,
			children: "Server member list"
		}),
		(0, import_web$5.createComponent)(Toggle, {
			get checked() {
				return store.inDms;
			},
			onChange: (v) => store.inDms = v,
			children: "DM list"
		}),
		(0, import_web$5.createComponent)(Toggle, {
			get checked() {
				return store.inProfiles;
			},
			onChange: (v) => store.inProfiles = v,
			note: "Profile popouts and the full profile modal — also editable here.",
			children: "Profiles"
		}),
		(0, import_web$5.createComponent)(Divider, {
			mt: true,
			mb: true
		}),
		(0, import_web$5.createComponent)(Header, {
			get tag() {
				return HeaderTags.H5;
			},
			children: "Appearance"
		}),
		(0, import_web$5.createComponent)(Toggle, {
			get checked() {
				return store.uppercase;
			},
			onChange: (v) => store.uppercase = v,
			children: "Display tags in uppercase"
		}),
		(0, import_web$5.createComponent)(Toggle, {
			get checked() {
				return store.animate;
			},
			onChange: (v) => store.animate = v,
			note: "Master switch for per-tag animations. Your OS “reduce motion” setting is always respected regardless.",
			children: "Play tag animations"
		}),
		(0, import_web$5.createComponent)(Header, {
			get tag() {
				return HeaderTags.H5;
			},
			margin: true,
			children: "Maximum tags shown per person"
		}),
		(0, import_web$5.createComponent)(Text, {
			style: {
				color: "var(--header-secondary)",
				"font-size": "14px"
			},
			children: "Any extras collapse into a “+n” pill you can hover. Set to 0 for no limit."
		}),
		(() => {
			const _el$9 = (0, import_web$3.getNextElement)(_tmpl$3);
			(0, import_web$4.insert)(_el$9, (0, import_web$5.createComponent)(Slider, {
				get value() {
					return store.maxShown;
				},
				onInput: (v) => store.maxShown = Math.round(v),
				min: 0,
				max: 8,
				step: 1,
				tick: 1
			}));
			return _el$9;
		})(),
		(0, import_web$5.createComponent)(Divider, {
			mt: true,
			mb: true
		}),
		(0, import_web$5.createComponent)(Header, {
			get tag() {
				return HeaderTags.H5;
			},
			children: "Your tags"
		}),
		(0, import_web$5.createComponent)(Text, {
			style: {
				color: "var(--header-secondary)",
				"font-size": "14px"
			},
			get children() {
				return summary();
			}
		}),
		(() => {
			const _el$0 = (0, import_web$3.getNextElement)(_tmpl$4), _el$1 = _el$0.firstChild, [_el$10, _co$4] = (0, import_web$2.getNextMarker)(_el$1.nextSibling), _el$11 = _el$10.nextSibling, [_el$12, _co$5] = (0, import_web$2.getNextMarker)(_el$11.nextSibling);
			(0, import_web$4.insert)(_el$0, (0, import_web$5.createComponent)(Button, {
				grow: true,
				onClick: () => openModal(TagManager),
				children: "Manage tags"
			}), _el$10, _co$4);
			(0, import_web$4.insert)(_el$0, (0, import_web$5.createComponent)(Button, {
				grow: true,
				get look() {
					return ButtonLooks.OUTLINED;
				},
				onClick: () => openModal(Backup),
				children: "Backup & restore"
			}), _el$12, _co$5);
			return _el$0;
		})(),
		(0, import_web$5.createComponent)(Divider, {
			mt: true,
			mb: true
		}),
		(0, import_web$5.createComponent)(Header, {
			get tag() {
				return HeaderTags.H5;
			},
			children: "Accounts"
		}),
		(0, import_web$5.createComponent)(Toggle, {
			get checked() {
				return store.multiAccount;
			},
			onChange: (v) => {
				if (v) seedCurrentAccount();
				store.multiAccount = v;
				refreshInjections();
			},
			get note() {
				return currentAccountId() ? "Give each Discord account its own tags. Turning this on copies your current tags to this account, and never deletes the shared set — switch it back off to get them again." : "Give each Discord account its own tags. (Your account ID isn't readable right now, so the shared set is still in use.)";
			},
			children: "Separate tags per account"
		}),
		(0, import_web$5.createComponent)(Divider, {
			mt: true,
			mb: true
		}),
		(0, import_web$5.createComponent)(Text, {
			style: {
				color: "var(--text-muted)",
				"font-size": "13px"
			},
			get children() {
				return (0, import_web$1.memo)(() => !!customEmojiCount())() ? `${customEmojiCount()} custom emoji available to the picker.` : "No custom emoji found — the picker will only offer unicode ones. Discord may have moved its emoji API; turn on debug logging and let me know.";
			}
		}),
		(0, import_web$5.createComponent)(Toggle, {
			get checked() {
				return store.debug;
			},
			onChange: (v) => store.debug = v,
			note: "Logs to the console when a tag can't be attached. Useful if Discord changes its layout and a surface stops working.",
			children: "Debug logging"
		})
	];
}

//#endregion
//#region plugins/friend-tags/index.jsx
const { plugin: { scoped }, ui: { ToastColors, showToast } } = shelter;
function onLoad() {
	scoped.ui.injectCss(styles_default);
	startInjection();
	restoreFromBackup().then((recovered) => {
		if (!recovered) return;
		refreshInjections();
		showToast({
			title: "Friend Tags",
			content: `Restored tags for ${recovered} ${recovered === 1 ? "person" : "people"} after the update.`,
			color: ToastColors.SUCCESS
		});
	});
}
function onUnload() {
	removeInjections();
	disposeStoreMemos();
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