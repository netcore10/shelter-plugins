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
const { plugin: { store: store$5 } } = shelter;
store$5.tags ??= {};
store$5.colors ??= {};
store$5.styles ??= {};
store$5.inFriends ??= true;
store$5.inMessages ??= true;
store$5.inMembers ??= true;
store$5.inDms ??= true;
store$5.inProfiles ??= true;
store$5.uppercase ??= true;
store$5.maxShown ??= 3;
store$5.animate ??= true;
store$5.debug ??= false;
const normalise = (tag) => String(tag ?? "").replace(/\s+/g, " ").trim();
const tagKey = (tag) => normalise(tag).toLowerCase();
const getTags = (userId) => store$5.tags[userId] ?? [];
function setTags(userId, tags) {
	const seen = new Set();
	const clean = [];
	for (const raw of tags) {
		const tag = normalise(raw);
		if (!tag || seen.has(tagKey(tag))) continue;
		seen.add(tagKey(tag));
		clean.push(tag);
	}
	const next = { ...store$5.tags };
	if (clean.length) next[userId] = clean;
else delete next[userId];
	store$5.tags = next;
}
const addTag = (userId, tag) => setTags(userId, [...getTags(userId), tag]);
const removeTag = (userId, tag) => setTags(userId, getTags(userId).filter((t) => tagKey(t) !== tagKey(tag)));
const clearUser = (userId) => setTags(userId, []);
function allTags() {
	const counts = new Map();
	for (const tags of Object.values(store$5.tags)) for (const tag of tags) {
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
	for (const [userId, tags] of Object.entries(store$5.tags)) {
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
	store$5.tags = nextTags;
	const nextColors = { ...store$5.colors };
	const colour = nextColors[tagKey(from)];
	delete nextColors[tagKey(from)];
	if (colour) nextColors[tagKey(target)] = colour;
	store$5.colors = nextColors;
	const nextStyles = { ...store$5.styles };
	const style = nextStyles[tagKey(from)];
	delete nextStyles[tagKey(from)];
	if (style) nextStyles[tagKey(target)] = style;
	store$5.styles = nextStyles;
}
function deleteTag(tag) {
	const nextTags = {};
	for (const [userId, tags] of Object.entries(store$5.tags)) {
		const kept = tags.filter((t) => tagKey(t) !== tagKey(tag));
		if (kept.length) nextTags[userId] = kept;
	}
	store$5.tags = nextTags;
	const nextColors = { ...store$5.colors };
	delete nextColors[tagKey(tag)];
	store$5.colors = nextColors;
	const nextStyles = { ...store$5.styles };
	delete nextStyles[tagKey(tag)];
	store$5.styles = nextStyles;
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
const colorOf = (tag) => store$5.colors[tagKey(tag)] ?? PALETTE[hashString(tagKey(tag)) % PALETTE.length];
function setColor(tag, color) {
	store$5.colors = {
		...store$5.colors,
		[tagKey(tag)]: color
	};
}
function resetColor(tag) {
	const next = { ...store$5.colors };
	delete next[tagKey(tag)];
	store$5.colors = next;
}
function styleOf(tag) {
	const saved = store$5.styles[tagKey(tag)] ?? {};
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
	const next = {
		...store$5.styles,
		[key]: {
			...store$5.styles[key],
			...patch
		}
	};
	store$5.styles = next;
	if (patch.color) setColor(tag, patch.color);
}
function resetStyle(tag) {
	const next = { ...store$5.styles };
	delete next[tagKey(tag)];
	store$5.styles = next;
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
function textOn(hex) {
	const value = parseInt(hex.slice(1), 16);
	if (!Number.isFinite(value)) return "#fff";
	const r = value >> 16 & 255;
	const g = value >> 8 & 255;
	const b = value & 255;
	return (r * 299 + g * 587 + b * 114) / 1e3 > 150 ? "#000" : "#fff";
}
const exportData = () => JSON.stringify({
	tags: store$5.tags,
	colors: store$5.colors,
	styles: store$5.styles
}, null, 2);
function importData(json, { merge = false } = {}) {
	const parsed = JSON.parse(json);
	if (!parsed || typeof parsed !== "object" || typeof parsed.tags !== "object") throw new Error("Expected an object with a `tags` property.");
	const incoming = {};
	for (const [userId, tags] of Object.entries(parsed.tags)) {
		if (!Array.isArray(tags)) continue;
		const clean = tags.map(normalise).filter(Boolean);
		if (clean.length) incoming[userId] = clean;
	}
	if (!merge) {
		store$5.tags = incoming;
		store$5.colors = parsed.colors && typeof parsed.colors === "object" ? { ...parsed.colors } : {};
		store$5.styles = parsed.styles && typeof parsed.styles === "object" ? { ...parsed.styles } : {};
		return Object.keys(incoming).length;
	}
	const merged = { ...store$5.tags };
	for (const [userId, tags] of Object.entries(incoming)) {
		const seen = new Set();
		merged[userId] = [...merged[userId] ?? [], ...tags].filter((tag) => {
			if (seen.has(tagKey(tag))) return false;
			seen.add(tagKey(tag));
			return true;
		});
	}
	store$5.tags = merged;
	if (parsed.colors && typeof parsed.colors === "object") store$5.colors = {
		...store$5.colors,
		...parsed.colors
	};
	if (parsed.styles && typeof parsed.styles === "object") store$5.styles = {
		...store$5.styles,
		...parsed.styles
	};
	return Object.keys(incoming).length;
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
  height: 15px;
  padding: 0 5px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
  line-height: 15px;
  letter-spacing: .02em;
  white-space: nowrap;
  flex: 0 0 auto;
  font-family: var(--font-display);
}

.ftags-chip--upper { text-transform: uppercase; }

.ftags-chip--more {
  background: var(--background-modifier-accent) !important;
  color: var(--text-muted) !important;
}

/* Compact surfaces (member list, DM list) are width constrained. The chip must
   be allowed to SHRINK (flex: 0 1 auto) for text-overflow to kick in — with the
   base "flex: 0 0 auto" it just overflows and gets cut off mid-word. */
.ftags-row--compact {
  min-width: 0;
  max-width: 50%;
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
  width: 15px;
  height: 15px;
  padding: 0;
  border: none;
  border-radius: 8px;
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

.ftags-swatch {
  width: 24px;
  height: 24px;
  padding: 0;
  border: 1px solid var(--background-modifier-accent);
  border-radius: 6px;
  background: none;
  cursor: pointer;
}
.ftags-swatch::-webkit-color-swatch-wrapper { padding: 2px; }
.ftags-swatch::-webkit-color-swatch { border: none; border-radius: 4px; }

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

/* --- styler --- */

.ftags-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 18px;
  margin-bottom: 14px;
  border-radius: 8px;
  background: var(--background-secondary);
  border: 1px solid var(--background-modifier-accent);
  /* room for float/breathe to move without being clipped */
  overflow: visible;
}
.ftags-preview .ftags-chip { height: 22px; line-height: 22px; font-size: 13px; padding: 0 9px; border-radius: 11px; }

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
//#region plugins/friend-tags/ui/Chip.jsx
var import_web$53 = __toESM(require_web(), 1);
var import_web$54 = __toESM(require_web(), 1);
var import_web$55 = __toESM(require_web(), 1);
var import_web$56 = __toESM(require_web(), 1);
var import_web$57 = __toESM(require_web(), 1);
var import_web$58 = __toESM(require_web(), 1);
var import_web$59 = __toESM(require_web(), 1);
var import_web$60 = __toESM(require_web(), 1);
var import_web$61 = __toESM(require_web(), 1);
var import_web$62 = __toESM(require_web(), 1);
const _tmpl$$6 = /*#__PURE__*/ (0, import_web$53.template)(`<span></span>`, 2);
const { plugin: { store: store$4 } } = shelter;
function Chip(props) {
	const config = () => props.style ?? styleOf(props.tag);
	const css = () => styleToCss(config(), { animate: props.animate ?? store$4.animate });
	return (() => {
		const _el$ = (0, import_web$59.getNextElement)(_tmpl$$6);
		(0, import_web$62.addEventListener)(_el$, "click", props.onClick, true);
		(0, import_web$61.insert)(_el$, () => props.tag);
		(0, import_web$58.effect)((_p$) => {
			const _v$ = `ftags-chip${store$4.uppercase && !props.plain ? " ftags-chip--upper" : ""}${props.class ? ` ${props.class}` : ""}`, _v$2 = css(), _v$3 = props.title ?? props.tag;
			_v$ !== _p$._v$ && (0, import_web$57.className)(_el$, _p$._v$ = _v$);
			_p$._v$2 = (0, import_web$56.style)(_el$, _v$2, _p$._v$2);
			_v$3 !== _p$._v$3 && (0, import_web$55.setAttribute)(_el$, "title", _p$._v$3 = _v$3);
			return _p$;
		}, {
			_v$: undefined,
			_v$2: undefined,
			_v$3: undefined
		});
		(0, import_web$60.runHydrationEvents)();
		return _el$;
	})();
}
(0, import_web$54.delegateEvents)(["click"]);

//#endregion
//#region plugins/friend-tags/ui/TagStyler.jsx
var import_web$41 = __toESM(require_web(), 1);
var import_web$42 = __toESM(require_web(), 1);
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
const _tmpl$$5 = /*#__PURE__*/ (0, import_web$41.template)(`<div class="ftags-preview"><!#><!/><!#><!/></div>`, 6), _tmpl$2$5 = /*#__PURE__*/ (0, import_web$41.template)(`<div class="ftags-field"><!#><!/><!#><!/></div>`, 6), _tmpl$3$4 = /*#__PURE__*/ (0, import_web$41.template)(`<div style="display: flex; gap: 8px; margin-bottom: 10px"><!#><!/><!#><!/></div>`, 6), _tmpl$4$3 = /*#__PURE__*/ (0, import_web$41.template)(`<div class="ftags-field"><span>Colour</span><input type="color" class="ftags-swatch" aria-label="Tag colour"></div>`, 5), _tmpl$5$2 = /*#__PURE__*/ (0, import_web$41.template)(`<div class="ftags-field"><span>Stops</span><div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap"><!#><!/><!#><!/></div></div>`, 10), _tmpl$6$2 = /*#__PURE__*/ (0, import_web$41.template)(`<div class="ftags-field"><span>Angle — <!#><!/>°</span><!#><!/></div>`, 8), _tmpl$7$2 = /*#__PURE__*/ (0, import_web$41.template)(`<div class="ftags-field"><span>Presets</span><div class="ftags-suggestions"></div></div>`, 6), _tmpl$8$2 = /*#__PURE__*/ (0, import_web$41.template)(`<div class="ftags-field"><span>Colour</span><div style="display: flex; gap: 8px; align-items: center"><!#><!/><input type="color" class="ftags-swatch" aria-label="Text colour"><!#><!/></div></div>`, 11), _tmpl$9 = /*#__PURE__*/ (0, import_web$41.template)(`<div class="ftags-field"><span>Font</span><div class="ftags-font-grid"></div><!#><!/></div>`, 8), _tmpl$0 = /*#__PURE__*/ (0, import_web$41.template)(`<div class="ftags-field"><span>Weight — <!#><!/></span><!#><!/></div>`, 8), _tmpl$1 = /*#__PURE__*/ (0, import_web$41.template)(`<span>Colour speed — <!#><!/>×</span>`, 4), _tmpl$10 = /*#__PURE__*/ (0, import_web$41.template)(`<div class="ftags-field"><span>Colour</span><div class="ftags-anim-grid"></div><!#><!/><!#><!/></div>`, 10), _tmpl$11 = /*#__PURE__*/ (0, import_web$41.template)(`<span>Movement speed — <!#><!/>×</span>`, 4), _tmpl$12 = /*#__PURE__*/ (0, import_web$41.template)(`<div class="ftags-field"><span>Movement</span><div class="ftags-anim-grid"></div><!#><!/></div>`, 8), _tmpl$13 = /*#__PURE__*/ (0, import_web$41.template)(`<div style="display: flex; gap: 8px; justify-content: flex-end; width: 100%"><!#><!/><!#><!/><!#><!/></div>`, 8), _tmpl$14 = /*#__PURE__*/ (0, import_web$41.template)(`<button class="ftags-stop-remove">×</button>`, 2), _tmpl$15 = /*#__PURE__*/ (0, import_web$41.template)(`<span style="display: inline-flex; gap: 2px; align-items: center"><input type="color" class="ftags-swatch"><!#><!/></span>`, 5), _tmpl$16 = /*#__PURE__*/ (0, import_web$41.template)(`<button></button>`, 2);
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
	return (0, import_web$51.createComponent)(ModalRoot$3, {
		get size() {
			return ModalSizes$3.MEDIUM;
		},
		get children() {
			return [
				(0, import_web$51.createComponent)(ModalHeader$3, {
					get close() {
						return props.close;
					},
					get children() {
						return [
							"Style “",
							(0, import_web$52.memo)(() => props.tag),
							"”"
						];
					}
				}),
				(0, import_web$51.createComponent)(ModalBody$3, { get children() {
					return [
						(() => {
							const _el$ = (0, import_web$48.getNextElement)(_tmpl$$5), _el$2 = _el$.firstChild, [_el$3, _co$] = (0, import_web$49.getNextMarker)(_el$2.nextSibling), _el$4 = _el$3.nextSibling, [_el$5, _co$2] = (0, import_web$49.getNextMarker)(_el$4.nextSibling);
							(0, import_web$50.insert)(_el$, (0, import_web$51.createComponent)(Chip, {
								get tag() {
									return normalise(name()) || props.tag;
								},
								get style() {
									return draft();
								},
								animate: true
							}), _el$3, _co$);
							(0, import_web$50.insert)(_el$, (0, import_web$51.createComponent)(Chip, {
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
						(0, import_web$51.createComponent)(Header$3, {
							get tag() {
								return HeaderTags$3.H5;
							},
							children: "Name"
						}),
						(() => {
							const _el$6 = (0, import_web$48.getNextElement)(_tmpl$2$5), _el$7 = _el$6.firstChild, [_el$8, _co$3] = (0, import_web$49.getNextMarker)(_el$7.nextSibling), _el$9 = _el$8.nextSibling, [_el$0, _co$4] = (0, import_web$49.getNextMarker)(_el$9.nextSibling);
							(0, import_web$50.insert)(_el$6, (0, import_web$51.createComponent)(TextBox$2, {
								get value() {
									return name();
								},
								onInput: setName,
								maxlength: 40,
								placeholder: "Tag name",
								"aria-label": "Tag name"
							}), _el$8, _co$3);
							(0, import_web$50.insert)(_el$6, (0, import_web$51.createComponent)(Show$3, {
								get when() {
									return renamed();
								},
								get children() {
									return (0, import_web$51.createComponent)(Text$3, {
										style: {
											color: "var(--text-muted)",
											"font-size": "12px"
										},
										children: "Renaming on save — this updates the tag on everyone who has it."
									});
								}
							}), _el$0, _co$4);
							return _el$6;
						})(),
						(0, import_web$51.createComponent)(Divider$2, {
							mt: true,
							mb: true
						}),
						(0, import_web$51.createComponent)(Header$3, {
							get tag() {
								return HeaderTags$3.H5;
							},
							children: "Fill"
						}),
						(() => {
							const _el$1 = (0, import_web$48.getNextElement)(_tmpl$3$4), _el$10 = _el$1.firstChild, [_el$11, _co$5] = (0, import_web$49.getNextMarker)(_el$10.nextSibling), _el$12 = _el$11.nextSibling, [_el$13, _co$6] = (0, import_web$49.getNextMarker)(_el$12.nextSibling);
							(0, import_web$50.insert)(_el$1, (0, import_web$51.createComponent)(Button$3, {
								grow: true,
								get look() {
									return draft().fill === "solid" ? ButtonLooks$3.FILLED : ButtonLooks$3.OUTLINED;
								},
								onClick: () => patch({ fill: "solid" }),
								children: "Solid"
							}), _el$11, _co$5);
							(0, import_web$50.insert)(_el$1, (0, import_web$51.createComponent)(Button$3, {
								grow: true,
								get look() {
									return draft().fill === "gradient" ? ButtonLooks$3.FILLED : ButtonLooks$3.OUTLINED;
								},
								onClick: () => patch({ fill: "gradient" }),
								children: "Gradient"
							}), _el$13, _co$6);
							return _el$1;
						})(),
						(0, import_web$51.createComponent)(Show$3, {
							get when() {
								return draft().fill === "solid";
							},
							get children() {
								const _el$14 = (0, import_web$48.getNextElement)(_tmpl$4$3), _el$15 = _el$14.firstChild, _el$16 = _el$15.nextSibling;
								_el$16.$$input = (e) => patch({ color: e.currentTarget.value });
								(0, import_web$47.effect)((_$p) => (0, import_web$45.style)(_el$15, label, _$p));
								(0, import_web$47.effect)(() => _el$16.value = draft().color);
								(0, import_web$46.runHydrationEvents)();
								return _el$14;
							}
						}),
						(0, import_web$51.createComponent)(Show$3, {
							get when() {
								return draft().fill === "gradient";
							},
							get children() {
								return [
									(() => {
										const _el$17 = (0, import_web$48.getNextElement)(_tmpl$5$2), _el$18 = _el$17.firstChild, _el$19 = _el$18.nextSibling, _el$20 = _el$19.firstChild, [_el$21, _co$7] = (0, import_web$49.getNextMarker)(_el$20.nextSibling), _el$22 = _el$21.nextSibling, [_el$23, _co$8] = (0, import_web$49.getNextMarker)(_el$22.nextSibling);
										(0, import_web$50.insert)(_el$19, (0, import_web$51.createComponent)(For$3, {
											get each() {
												return draft().colors;
											},
											children: (stop, i) => (() => {
												const _el$84 = (0, import_web$48.getNextElement)(_tmpl$15), _el$85 = _el$84.firstChild, _el$87 = _el$85.nextSibling, [_el$88, _co$22] = (0, import_web$49.getNextMarker)(_el$87.nextSibling);
												_el$85.$$input = (e) => setStop(i(), e.currentTarget.value);
												_el$85.value = stop;
												(0, import_web$50.insert)(_el$84, (0, import_web$51.createComponent)(Show$3, {
													get when() {
														return draft().colors.length > 2;
													},
													get children() {
														const _el$86 = (0, import_web$48.getNextElement)(_tmpl$14);
														_el$86.$$click = () => removeStop(i());
														(0, import_web$47.effect)(() => (0, import_web$44.setAttribute)(_el$86, "aria-label", `Remove stop ${i() + 1}`));
														(0, import_web$46.runHydrationEvents)();
														return _el$86;
													}
												}), _el$88, _co$22);
												(0, import_web$47.effect)(() => (0, import_web$44.setAttribute)(_el$85, "aria-label", `Gradient stop ${i() + 1}`));
												(0, import_web$46.runHydrationEvents)();
												return _el$84;
											})()
										}), _el$21, _co$7);
										(0, import_web$50.insert)(_el$19, (0, import_web$51.createComponent)(Show$3, {
											get when() {
												return draft().colors.length < 5;
											},
											get children() {
												return (0, import_web$51.createComponent)(Button$3, {
													get size() {
														return ButtonSizes$2.TINY;
													},
													get look() {
														return ButtonLooks$3.OUTLINED;
													},
													onClick: addStop,
													children: "+ Stop"
												});
											}
										}), _el$23, _co$8);
										(0, import_web$47.effect)((_$p) => (0, import_web$45.style)(_el$18, label, _$p));
										return _el$17;
									})(),
									(() => {
										const _el$24 = (0, import_web$48.getNextElement)(_tmpl$6$2), _el$25 = _el$24.firstChild, _el$26 = _el$25.firstChild, _el$28 = _el$26.nextSibling, [_el$29, _co$9] = (0, import_web$49.getNextMarker)(_el$28.nextSibling), _el$27 = _el$29.nextSibling, _el$30 = _el$25.nextSibling, [_el$31, _co$0] = (0, import_web$49.getNextMarker)(_el$30.nextSibling);
										(0, import_web$50.insert)(_el$25, () => draft().angle, _el$29, _co$9);
										(0, import_web$50.insert)(_el$24, (0, import_web$51.createComponent)(Slider$1, {
											get value() {
												return draft().angle;
											},
											onInput: (v) => patch({ angle: Math.round(v) }),
											min: 0,
											max: 360,
											step: 15
										}), _el$31, _co$0);
										(0, import_web$47.effect)((_$p) => (0, import_web$45.style)(_el$25, label, _$p));
										return _el$24;
									})(),
									(() => {
										const _el$32 = (0, import_web$48.getNextElement)(_tmpl$7$2), _el$33 = _el$32.firstChild, _el$34 = _el$33.nextSibling;
										(0, import_web$50.insert)(_el$34, (0, import_web$51.createComponent)(For$3, {
											each: GRADIENT_PRESETS,
											children: (preset) => (0, import_web$51.createComponent)(Chip, {
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
										(0, import_web$47.effect)((_$p) => (0, import_web$45.style)(_el$33, label, _$p));
										return _el$32;
									})()
								];
							}
						}),
						(0, import_web$51.createComponent)(Divider$2, {
							mt: true,
							mb: true
						}),
						(0, import_web$51.createComponent)(Header$3, {
							get tag() {
								return HeaderTags$3.H5;
							},
							children: "Text"
						}),
						(() => {
							const _el$35 = (0, import_web$48.getNextElement)(_tmpl$8$2), _el$36 = _el$35.firstChild, _el$37 = _el$36.nextSibling, _el$39 = _el$37.firstChild, [_el$40, _co$1] = (0, import_web$49.getNextMarker)(_el$39.nextSibling), _el$38 = _el$40.nextSibling, _el$41 = _el$38.nextSibling, [_el$42, _co$10] = (0, import_web$49.getNextMarker)(_el$41.nextSibling);
							(0, import_web$50.insert)(_el$37, (0, import_web$51.createComponent)(Button$3, {
								get size() {
									return ButtonSizes$2.TINY;
								},
								get look() {
									return draft().text === "auto" ? ButtonLooks$3.FILLED : ButtonLooks$3.OUTLINED;
								},
								onClick: () => patch({ text: "auto" }),
								children: "Auto"
							}), _el$40, _co$1);
							_el$38.$$input = (e) => patch({ text: e.currentTarget.value });
							(0, import_web$50.insert)(_el$37, (0, import_web$51.createComponent)(Text$3, {
								style: {
									color: "var(--text-muted)",
									"font-size": "12px"
								},
								children: "Auto picks black or white for contrast."
							}), _el$42, _co$10);
							(0, import_web$47.effect)((_$p) => (0, import_web$45.style)(_el$36, label, _$p));
							(0, import_web$47.effect)(() => _el$38.value = draft().text === "auto" ? "#ffffff" : draft().text);
							(0, import_web$46.runHydrationEvents)();
							return _el$35;
						})(),
						(() => {
							const _el$43 = (0, import_web$48.getNextElement)(_tmpl$9), _el$44 = _el$43.firstChild, _el$45 = _el$44.nextSibling, _el$46 = _el$45.nextSibling, [_el$47, _co$11] = (0, import_web$49.getNextMarker)(_el$46.nextSibling);
							(0, import_web$50.insert)(_el$45, (0, import_web$51.createComponent)(For$3, {
								each: FONTS,
								children: (font) => (() => {
									const _el$89 = (0, import_web$48.getNextElement)(_tmpl$16);
									_el$89.$$click = () => patch({ font: font.id });
									(0, import_web$50.insert)(_el$89, () => font.label);
									(0, import_web$47.effect)((_p$) => {
										const _v$ = `ftags-font-option${draft().font === font.id ? " ftags-font-option--on" : ""}`, _v$2 = font.id || "inherit";
										_v$ !== _p$._v$ && (0, import_web$43.className)(_el$89, _p$._v$ = _v$);
										_v$2 !== _p$._v$2 && _el$89.style.setProperty("font-family", _p$._v$2 = _v$2);
										return _p$;
									}, {
										_v$: undefined,
										_v$2: undefined
									});
									(0, import_web$46.runHydrationEvents)();
									return _el$89;
								})()
							}));
							(0, import_web$50.insert)(_el$43, (0, import_web$51.createComponent)(TextBox$2, {
								get value() {
									return draft().font;
								},
								onInput: (v) => patch({ font: v }),
								placeholder: "…or a custom font-family",
								"aria-label": "Custom font family"
							}), _el$47, _co$11);
							(0, import_web$47.effect)((_$p) => (0, import_web$45.style)(_el$44, label, _$p));
							return _el$43;
						})(),
						(() => {
							const _el$48 = (0, import_web$48.getNextElement)(_tmpl$0), _el$49 = _el$48.firstChild, _el$50 = _el$49.firstChild, _el$51 = _el$50.nextSibling, [_el$52, _co$12] = (0, import_web$49.getNextMarker)(_el$51.nextSibling), _el$53 = _el$49.nextSibling, [_el$54, _co$13] = (0, import_web$49.getNextMarker)(_el$53.nextSibling);
							(0, import_web$50.insert)(_el$49, () => draft().weight, _el$52, _co$12);
							(0, import_web$50.insert)(_el$48, (0, import_web$51.createComponent)(Slider$1, {
								get value() {
									return draft().weight;
								},
								onInput: (v) => patch({ weight: Math.round(v) }),
								min: 400,
								max: 900,
								step: 100,
								tick: 100
							}), _el$54, _co$13);
							(0, import_web$47.effect)((_$p) => (0, import_web$45.style)(_el$49, label, _$p));
							return _el$48;
						})(),
						(0, import_web$51.createComponent)(SwitchItem$1, {
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
						(0, import_web$51.createComponent)(Divider$2, {
							mt: true,
							mb: true
						}),
						(0, import_web$51.createComponent)(Header$3, {
							get tag() {
								return HeaderTags$3.H5;
							},
							children: "Animation"
						}),
						(0, import_web$51.createComponent)(Text$3, {
							style: {
								color: "var(--text-muted)",
								"font-size": "12px"
							},
							children: "Colour and movement are separate — pick one of each, or just one."
						}),
						(() => {
							const _el$55 = (0, import_web$48.getNextElement)(_tmpl$10), _el$56 = _el$55.firstChild, _el$57 = _el$56.nextSibling, _el$63 = _el$57.nextSibling, [_el$64, _co$15] = (0, import_web$49.getNextMarker)(_el$63.nextSibling), _el$65 = _el$64.nextSibling, [_el$66, _co$16] = (0, import_web$49.getNextMarker)(_el$65.nextSibling);
							_el$55.style.setProperty("margin-top", "10px");
							(0, import_web$50.insert)(_el$57, (0, import_web$51.createComponent)(For$3, {
								each: COLOR_ANIMS,
								children: (anim) => (() => {
									const _el$90 = (0, import_web$48.getNextElement)(_tmpl$16);
									_el$90.$$click = () => patch({ colorAnim: anim.id });
									(0, import_web$50.insert)(_el$90, () => anim.label);
									(0, import_web$47.effect)((_p$) => {
										const _v$3 = `ftags-anim-option${draft().colorAnim === anim.id ? " ftags-anim-option--on" : ""}`, _v$4 = anim.note;
										_v$3 !== _p$._v$3 && (0, import_web$43.className)(_el$90, _p$._v$3 = _v$3);
										_v$4 !== _p$._v$4 && (0, import_web$44.setAttribute)(_el$90, "title", _p$._v$4 = _v$4);
										return _p$;
									}, {
										_v$3: undefined,
										_v$4: undefined
									});
									(0, import_web$46.runHydrationEvents)();
									return _el$90;
								})()
							}));
							(0, import_web$50.insert)(_el$55, (0, import_web$51.createComponent)(Show$3, {
								get when() {
									return (0, import_web$52.memo)(() => draft().colorAnim === "flow")() && draft().fill !== "gradient";
								},
								get children() {
									return (0, import_web$51.createComponent)(Text$3, {
										style: {
											color: "var(--text-warning, var(--text-muted))",
											"font-size": "12px"
										},
										children: "Flow needs a gradient fill to have anything to slide."
									});
								}
							}), _el$64, _co$15);
							(0, import_web$50.insert)(_el$55, (0, import_web$51.createComponent)(Show$3, {
								get when() {
									return draft().colorAnim !== "none";
								},
								get children() {
									return [(() => {
										const _el$58 = (0, import_web$48.getNextElement)(_tmpl$1), _el$59 = _el$58.firstChild, _el$61 = _el$59.nextSibling, [_el$62, _co$14] = (0, import_web$49.getNextMarker)(_el$61.nextSibling), _el$60 = _el$62.nextSibling;
										(0, import_web$50.insert)(_el$58, () => draft().colorSpeed, _el$62, _co$14);
										(0, import_web$47.effect)((_$p) => (0, import_web$45.style)(_el$58, label, _$p));
										return _el$58;
									})(), (0, import_web$51.createComponent)(Slider$1, {
										get value() {
											return draft().colorSpeed;
										},
										onInput: (v) => patch({ colorSpeed: Math.round(v * 4) / 4 }),
										min: .25,
										max: 3,
										step: .25
									})];
								}
							}), _el$66, _co$16);
							(0, import_web$47.effect)((_$p) => (0, import_web$45.style)(_el$56, label, _$p));
							return _el$55;
						})(),
						(() => {
							const _el$67 = (0, import_web$48.getNextElement)(_tmpl$12), _el$68 = _el$67.firstChild, _el$69 = _el$68.nextSibling, _el$75 = _el$69.nextSibling, [_el$76, _co$18] = (0, import_web$49.getNextMarker)(_el$75.nextSibling);
							(0, import_web$50.insert)(_el$69, (0, import_web$51.createComponent)(For$3, {
								each: MOTIONS,
								children: (anim) => (() => {
									const _el$91 = (0, import_web$48.getNextElement)(_tmpl$16);
									_el$91.$$click = () => patch({ motion: anim.id });
									(0, import_web$50.insert)(_el$91, () => anim.label);
									(0, import_web$47.effect)((_p$) => {
										const _v$5 = `ftags-anim-option${draft().motion === anim.id ? " ftags-anim-option--on" : ""}`, _v$6 = anim.note;
										_v$5 !== _p$._v$5 && (0, import_web$43.className)(_el$91, _p$._v$5 = _v$5);
										_v$6 !== _p$._v$6 && (0, import_web$44.setAttribute)(_el$91, "title", _p$._v$6 = _v$6);
										return _p$;
									}, {
										_v$5: undefined,
										_v$6: undefined
									});
									(0, import_web$46.runHydrationEvents)();
									return _el$91;
								})()
							}));
							(0, import_web$50.insert)(_el$67, (0, import_web$51.createComponent)(Show$3, {
								get when() {
									return draft().motion !== "none";
								},
								get children() {
									return [(() => {
										const _el$70 = (0, import_web$48.getNextElement)(_tmpl$11), _el$71 = _el$70.firstChild, _el$73 = _el$71.nextSibling, [_el$74, _co$17] = (0, import_web$49.getNextMarker)(_el$73.nextSibling), _el$72 = _el$74.nextSibling;
										(0, import_web$50.insert)(_el$70, () => draft().motionSpeed, _el$74, _co$17);
										(0, import_web$47.effect)((_$p) => (0, import_web$45.style)(_el$70, label, _$p));
										return _el$70;
									})(), (0, import_web$51.createComponent)(Slider$1, {
										get value() {
											return draft().motionSpeed;
										},
										onInput: (v) => patch({ motionSpeed: Math.round(v * 4) / 4 }),
										min: .25,
										max: 3,
										step: .25
									})];
								}
							}), _el$76, _co$18);
							(0, import_web$47.effect)((_$p) => (0, import_web$45.style)(_el$68, label, _$p));
							return _el$67;
						})()
					];
				} }),
				(0, import_web$51.createComponent)(ModalFooter$3, { get children() {
					const _el$77 = (0, import_web$48.getNextElement)(_tmpl$13), _el$78 = _el$77.firstChild, [_el$79, _co$19] = (0, import_web$49.getNextMarker)(_el$78.nextSibling), _el$80 = _el$79.nextSibling, [_el$81, _co$20] = (0, import_web$49.getNextMarker)(_el$80.nextSibling), _el$82 = _el$81.nextSibling, [_el$83, _co$21] = (0, import_web$49.getNextMarker)(_el$82.nextSibling);
					(0, import_web$50.insert)(_el$77, (0, import_web$51.createComponent)(Button$3, {
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
					}), _el$79, _co$19);
					(0, import_web$50.insert)(_el$77, (0, import_web$51.createComponent)(Button$3, {
						get look() {
							return ButtonLooks$3.OUTLINED;
						},
						get onClick() {
							return props.close;
						},
						children: "Cancel"
					}), _el$81, _co$20);
					(0, import_web$50.insert)(_el$77, (0, import_web$51.createComponent)(Button$3, {
						onClick: save,
						children: "Save"
					}), _el$83, _co$21);
					return _el$77;
				} })
			];
		}
	});
}
(0, import_web$42.delegateEvents)(["input", "click"]);

//#endregion
//#region plugins/friend-tags/ui/openStyler.jsx
var import_web$40 = __toESM(require_web(), 1);
const { ui: { openModal: openModal$2 } } = shelter;
const openStyler = (tag) => openModal$2((props) => (0, import_web$40.createComponent)(TagStyler, {
	tag,
	get close() {
		return props.close;
	}
}));

//#endregion
//#region plugins/friend-tags/ui/TagEditor.jsx
var import_web$30 = __toESM(require_web(), 1);
var import_web$31 = __toESM(require_web(), 1);
var import_web$32 = __toESM(require_web(), 1);
var import_web$33 = __toESM(require_web(), 1);
var import_web$34 = __toESM(require_web(), 1);
var import_web$35 = __toESM(require_web(), 1);
var import_web$36 = __toESM(require_web(), 1);
var import_web$37 = __toESM(require_web(), 1);
var import_web$38 = __toESM(require_web(), 1);
var import_web$39 = __toESM(require_web(), 1);
const _tmpl$$4 = /*#__PURE__*/ (0, import_web$30.template)(`<div class="ftags-editor-list"></div>`, 2), _tmpl$2$4 = /*#__PURE__*/ (0, import_web$30.template)(`<div class="ftags-add-row"><!#><!/><!#><!/></div>`, 6), _tmpl$3$3 = /*#__PURE__*/ (0, import_web$30.template)(`<div style="display: flex; flex-direction: column; gap: 6px"></div>`, 2), _tmpl$4$2 = /*#__PURE__*/ (0, import_web$30.template)(`<div class="ftags-suggestions"></div>`, 2), _tmpl$5$1 = /*#__PURE__*/ (0, import_web$30.template)(`<div style="display: flex; gap: 8px; justify-content: flex-end; width: 100%"><!#><!/><!#><!/></div>`, 6), _tmpl$6$1 = /*#__PURE__*/ (0, import_web$30.template)(`<span class="ftags-empty">No tags yet — add one below.</span>`, 2), _tmpl$7$1 = /*#__PURE__*/ (0, import_web$30.template)(`<span class="ftags-editor-chip"><!#><!/><button>×</button></span>`, 6), _tmpl$8$1 = /*#__PURE__*/ (0, import_web$30.template)(`<div style="display: flex; align-items: center; gap: 8px"><!#><!/><div style="flex: 1"></div><!#><!/></div>`, 8);
const { flux: { storesFlat: { UserStore: UserStore$2 } }, ui: { Button: Button$2, ButtonColors: ButtonColors$2, ButtonLooks: ButtonLooks$2, ButtonSizes: ButtonSizes$1, Header: Header$2, HeaderTags: HeaderTags$2, ModalBody: ModalBody$2, ModalFooter: ModalFooter$2, ModalHeader: ModalHeader$2, ModalRoot: ModalRoot$2, ModalSizes: ModalSizes$2, Text: Text$2, TextBox: TextBox$1 }, solid: { For: For$2, Show: Show$2, createMemo: createMemo$3, createSignal: createSignal$2 } } = shelter;
function TagEditor(props) {
	const [draft, setDraft] = createSignal$2("");
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
	return (0, import_web$38.createComponent)(ModalRoot$2, {
		get size() {
			return ModalSizes$2.SMALL;
		},
		get children() {
			return [
				(0, import_web$38.createComponent)(ModalHeader$2, {
					get close() {
						return props.close;
					},
					get children() {
						return ["Tags for ", (0, import_web$39.memo)(() => name())];
					}
				}),
				(0, import_web$38.createComponent)(ModalBody$2, { get children() {
					return [
						(() => {
							const _el$ = (0, import_web$36.getNextElement)(_tmpl$$4);
							(0, import_web$37.insert)(_el$, (0, import_web$38.createComponent)(Show$2, {
								get when() {
									return tags().length;
								},
								get fallback() {
									return (0, import_web$36.getNextElement)(_tmpl$6$1);
								},
								get children() {
									return (0, import_web$38.createComponent)(For$2, {
										get each() {
											return tags();
										},
										children: (tag) => (() => {
											const _el$13 = (0, import_web$36.getNextElement)(_tmpl$7$1), _el$15 = _el$13.firstChild, [_el$16, _co$5] = (0, import_web$35.getNextMarker)(_el$15.nextSibling), _el$14 = _el$16.nextSibling;
											(0, import_web$37.insert)(_el$13, tag, _el$16, _co$5);
											_el$14.$$click = () => removeTag(props.userId, tag);
											(0, import_web$34.setAttribute)(_el$14, "aria-label", `Remove tag ${tag}`);
											(0, import_web$32.effect)((_p$) => {
												const _v$ = colorOf(tag), _v$2 = textOn(colorOf(tag));
												_v$ !== _p$._v$ && _el$13.style.setProperty("background", _p$._v$ = _v$);
												_v$2 !== _p$._v$2 && _el$13.style.setProperty("color", _p$._v$2 = _v$2);
												return _p$;
											}, {
												_v$: undefined,
												_v$2: undefined
											});
											(0, import_web$33.runHydrationEvents)();
											return _el$13;
										})()
									});
								}
							}));
							return _el$;
						})(),
						(() => {
							const _el$2 = (0, import_web$36.getNextElement)(_tmpl$2$4), _el$3 = _el$2.firstChild, [_el$4, _co$] = (0, import_web$35.getNextMarker)(_el$3.nextSibling), _el$5 = _el$4.nextSibling, [_el$6, _co$2] = (0, import_web$35.getNextMarker)(_el$5.nextSibling);
							(0, import_web$37.insert)(_el$2, (0, import_web$38.createComponent)(TextBox$1, {
								get value() {
									return draft();
								},
								placeholder: "New tag…",
								maxlength: 40,
								"aria-label": "New tag",
								onInput: setDraft
							}), _el$4, _co$);
							(0, import_web$37.insert)(_el$2, (0, import_web$38.createComponent)(Button$2, {
								onClick: commit,
								get disabled() {
									return !canAdd();
								},
								get size() {
									return ButtonSizes$1.SMALL;
								},
								children: "Add"
							}), _el$6, _co$2);
							return _el$2;
						})(),
						(0, import_web$38.createComponent)(Show$2, {
							get when() {
								return duplicate();
							},
							get children() {
								return (0, import_web$38.createComponent)(Text$2, {
									style: {
										color: "var(--text-danger)",
										"font-size": "13px"
									},
									get children() {
										return [(0, import_web$39.memo)(() => name()), " already has that tag."];
									}
								});
							}
						}),
						(0, import_web$38.createComponent)(Show$2, {
							get when() {
								return tags().length;
							},
							get children() {
								return [(0, import_web$38.createComponent)(Header$2, {
									get tag() {
										return HeaderTags$2.H5;
									},
									margin: true,
									children: "Appearance"
								}), (() => {
									const _el$7 = (0, import_web$36.getNextElement)(_tmpl$3$3);
									(0, import_web$37.insert)(_el$7, (0, import_web$38.createComponent)(For$2, {
										get each() {
											return tags();
										},
										children: (tag) => (() => {
											const _el$17 = (0, import_web$36.getNextElement)(_tmpl$8$1), _el$19 = _el$17.firstChild, [_el$20, _co$6] = (0, import_web$35.getNextMarker)(_el$19.nextSibling), _el$18 = _el$20.nextSibling, _el$21 = _el$18.nextSibling, [_el$22, _co$7] = (0, import_web$35.getNextMarker)(_el$21.nextSibling);
											(0, import_web$37.insert)(_el$17, (0, import_web$38.createComponent)(Chip, { tag }), _el$20, _co$6);
											(0, import_web$37.insert)(_el$17, (0, import_web$38.createComponent)(Button$2, {
												get size() {
													return ButtonSizes$1.TINY;
												},
												get look() {
													return ButtonLooks$2.OUTLINED;
												},
												onClick: () => openStyler(tag),
												children: "Style"
											}), _el$22, _co$7);
											return _el$17;
										})()
									}));
									return _el$7;
								})()];
							}
						}),
						(0, import_web$38.createComponent)(Show$2, {
							get when() {
								return suggestions().length;
							},
							get children() {
								return [(0, import_web$38.createComponent)(Header$2, {
									get tag() {
										return HeaderTags$2.H5;
									},
									margin: true,
									children: "Existing tags"
								}), (() => {
									const _el$8 = (0, import_web$36.getNextElement)(_tmpl$4$2);
									(0, import_web$37.insert)(_el$8, (0, import_web$38.createComponent)(For$2, {
										get each() {
											return suggestions();
										},
										children: (t) => (0, import_web$38.createComponent)(Chip, {
											"class": "ftags-suggestion",
											get tag() {
												return t.label;
											},
											get title() {
												return `Used by ${t.count} ${t.count === 1 ? "person" : "people"}`;
											},
											onClick: () => addTag(props.userId, t.label)
										})
									}));
									return _el$8;
								})()];
							}
						})
					];
				} }),
				(0, import_web$38.createComponent)(ModalFooter$2, { get children() {
					const _el$9 = (0, import_web$36.getNextElement)(_tmpl$5$1), _el$0 = _el$9.firstChild, [_el$1, _co$3] = (0, import_web$35.getNextMarker)(_el$0.nextSibling), _el$10 = _el$1.nextSibling, [_el$11, _co$4] = (0, import_web$35.getNextMarker)(_el$10.nextSibling);
					(0, import_web$37.insert)(_el$9, (0, import_web$38.createComponent)(Show$2, {
						get when() {
							return tags().length;
						},
						get children() {
							return (0, import_web$38.createComponent)(Button$2, {
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
					}), _el$1, _co$3);
					(0, import_web$37.insert)(_el$9, (0, import_web$38.createComponent)(Button$2, {
						get onClick() {
							return props.close;
						},
						children: "Done"
					}), _el$11, _co$4);
					return _el$9;
				} })
			];
		}
	});
}
(0, import_web$31.delegateEvents)(["click"]);

//#endregion
//#region plugins/friend-tags/ui/TagRow.jsx
var import_web$18 = __toESM(require_web(), 1);
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
const _tmpl$$3 = /*#__PURE__*/ (0, import_web$18.template)(`<span class="ftags-chip ftags-chip--more">+<!#><!/></span>`, 4), _tmpl$2$3 = /*#__PURE__*/ (0, import_web$18.template)(`<button class="ftags-add" aria-label="Edit tags for this user">+</button>`, 2), _tmpl$3$2 = /*#__PURE__*/ (0, import_web$18.template)(`<span><!#><!/><!#><!/><!#><!/></span>`, 8);
const { plugin: { store: store$3 }, ui: { openModal: openModal$1 }, solid: { For: For$1, Show: Show$1, createMemo: createMemo$2 } } = shelter;
const openTagEditor = (userId) => openModal$1((props) => (0, import_web$29.createComponent)(TagEditor, {
	userId,
	get close() {
		return props.close;
	}
}));
function TagRow(props) {
	const tags = createMemo$2(() => getTags(props.userId));
	const shown = createMemo$2(() => {
		const limit = store$3.maxShown;
		return limit > 0 ? tags().slice(0, limit) : tags();
	});
	const overflow = createMemo$2(() => tags().length - shown().length);
	const edit = (e) => {
		e.stopPropagation();
		e.preventDefault();
		openTagEditor(props.userId);
	};
	return (0, import_web$29.createComponent)(Show$1, {
		get when() {
			return props.show?.() ?? true;
		},
		get children() {
			return (0, import_web$29.createComponent)(Show$1, {
				get when() {
					return props.editable || tags().length;
				},
				get children() {
					const _el$ = (0, import_web$23.getNextElement)(_tmpl$3$2), _el$7 = _el$.firstChild, [_el$8, _co$2] = (0, import_web$25.getNextMarker)(_el$7.nextSibling), _el$9 = _el$8.nextSibling, [_el$0, _co$3] = (0, import_web$25.getNextMarker)(_el$9.nextSibling), _el$1 = _el$0.nextSibling, [_el$10, _co$4] = (0, import_web$25.getNextMarker)(_el$1.nextSibling);
					(0, import_web$26.insert)(_el$, (0, import_web$29.createComponent)(For$1, {
						get each() {
							return shown();
						},
						children: (tag) => (0, import_web$29.createComponent)(Chip, {
							tag,
							get onClick() {
								return props.editable ? edit : undefined;
							}
						})
					}), _el$8, _co$2);
					(0, import_web$26.insert)(_el$, (0, import_web$29.createComponent)(Show$1, {
						get when() {
							return overflow() > 0;
						},
						get children() {
							const _el$2 = (0, import_web$23.getNextElement)(_tmpl$$3), _el$3 = _el$2.firstChild, _el$4 = _el$3.nextSibling, [_el$5, _co$] = (0, import_web$25.getNextMarker)(_el$4.nextSibling);
							(0, import_web$27.addEventListener)(_el$2, "click", props.editable ? edit : undefined, true);
							(0, import_web$26.insert)(_el$2, overflow, _el$5, _co$);
							(0, import_web$22.effect)(() => (0, import_web$21.setAttribute)(_el$2, "title", tags().join(", ")));
							(0, import_web$24.runHydrationEvents)();
							return _el$2;
						}
					}), _el$0, _co$3);
					(0, import_web$26.insert)(_el$, (0, import_web$29.createComponent)(Show$1, {
						get when() {
							return props.editable;
						},
						get children() {
							const _el$6 = (0, import_web$23.getNextElement)(_tmpl$2$3);
							_el$6.$$click = edit;
							(0, import_web$24.runHydrationEvents)();
							return _el$6;
						}
					}), _el$10, _co$4);
					(0, import_web$22.effect)(() => (0, import_web$20.className)(_el$, `ftags-row${props.compact ? " ftags-row--compact" : ""}${props.editable ? " ftags-row--editable" : ""}${!tags().length ? " ftags-row--empty" : ""}`));
					return _el$;
				}
			});
		}
	});
}
(0, import_web$19.delegateEvents)(["click"]);

//#endregion
//#region plugins/friend-tags/inject.jsx
var import_web$13 = __toESM(require_web(), 1);
var import_web$14 = __toESM(require_web(), 1);
var import_web$15 = __toESM(require_web(), 1);
var import_web$16 = __toESM(require_web(), 1);
var import_web$17 = __toESM(require_web(), 1);
const _tmpl$$2 = /*#__PURE__*/ (0, import_web$13.template)(`<span class="ftags-mount"></span>`, 2), _tmpl$2$2 = /*#__PURE__*/ (0, import_web$13.template)(`<div role="menuitem" tabindex="-1">Edit tags</div>`, 2);
const { flux: { storesFlat: { UserStore: UserStore$1, ChannelStore, SelectedChannelStore } }, plugin: { store: store$2, scoped: scoped$1 }, ui: { ReactiveRoot }, util: { getFiber, reactFiberWalker, log }, observeDom } = shelter;
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
		enabled: () => store$2.inFriends
	},
	{
		id: "messages",
		selector: "[id^=\"message-username-\"]",
		anchors: [],
		props: ["message", "user"],
		enabled: () => store$2.inMessages,
		onDispatch: true
	},
	{
		id: "members",
		selector: "[class*=\"memberInner\"]",
		anchors: ["[class*=\"nameAndDecorators\"]", "[class*=\"name_\"]"],
		props: ["user"],
		compact: true,
		enabled: () => store$2.inMembers
	},
	{
		id: "dms",
		selector: "[data-list-item-id^=\"private-channels-uid_\"]",
		anchors: ["[class*=\"nameAndDecorators\"]", "[class*=\"name_\"]"],
		resolve: resolveDmUser,
		compact: true,
		enabled: () => store$2.inDms
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
		enabled: () => store$2.inProfiles
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
		if (store$2.debug) log([`[friend-tags] ${surface.id}: injection failed`, err], "error");
	}
}
function inject(element, surface) {
	const user = surface.resolve ? surface.resolve(element) : resolveUser(element, surface.props, surface.depth ?? DEFAULT_DEPTH);
	if (!user?.id) {
		if (store$2.debug) log(`[friend-tags] ${surface.id}: could not resolve a user`, "warn");
		return;
	}
	const anchor = firstMatch(element, surface.anchors) ?? element;
	const mount = (0, import_web$17.getNextElement)(_tmpl$$2);
	mount.append((0, import_web$16.createComponent)(ReactiveRoot, { get children() {
		return (0, import_web$16.createComponent)(TagRow, {
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
	if (!lastContextUser || Date.now() - lastContextUser.at > 1e3) return;
	const userId = lastContextUser.id;
	const items = menu.querySelectorAll("[role=\"menuitem\"]");
	if (!items.length) return;
	const template = items[items.length - 1];
	const item = (() => {
		const _el$2 = (0, import_web$17.getNextElement)(_tmpl$2$2);
		(0, import_web$15.effect)(() => (0, import_web$14.className)(_el$2, template.className));
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
			if (store$2.debug) log(["[friend-tags] context menu injection failed", err], "error");
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

//#endregion
//#region plugins/friend-tags/ui/TagManager.jsx
var import_web$5 = __toESM(require_web(), 1);
var import_web$6 = __toESM(require_web(), 1);
var import_web$7 = __toESM(require_web(), 1);
var import_web$8 = __toESM(require_web(), 1);
var import_web$9 = __toESM(require_web(), 1);
var import_web$10 = __toESM(require_web(), 1);
var import_web$11 = __toESM(require_web(), 1);
var import_web$12 = __toESM(require_web(), 1);
const _tmpl$$1 = /*#__PURE__*/ (0, import_web$5.template)(`<div style="display: flex; gap: 6px; align-items: center"><!#><!/><!#><!/></div>`, 6), _tmpl$2$1 = /*#__PURE__*/ (0, import_web$5.template)(`<span class="ftags-count"><!#><!/> <!#><!/></span>`, 6), _tmpl$3$1 = /*#__PURE__*/ (0, import_web$5.template)(`<div style="display: flex; gap: 6px"><!#><!/><!#><!/></div>`, 6), _tmpl$4$1 = /*#__PURE__*/ (0, import_web$5.template)(`<div class="ftags-manager-grid"></div>`, 2), _tmpl$5 = /*#__PURE__*/ (0, import_web$5.template)(`<span class="ftags-empty">No tags yet.</span>`, 2), _tmpl$6 = /*#__PURE__*/ (0, import_web$5.template)(`<span class="ftags-empty">Nobody is tagged yet.</span>`, 2), _tmpl$7 = /*#__PURE__*/ (0, import_web$5.template)(`<div class="ftags-user-row"><span class="ftags-user-name"></span><span class="ftags-user-tags"></span><!#><!/><!#><!/></div>`, 10), _tmpl$8 = /*#__PURE__*/ (0, import_web$5.template)(`<div style="width: 100%"><div style="display: flex; gap: 8px; align-items: center"><!#><!/><!#><!/></div><!#><!/></div>`, 10);
const { flux: { storesFlat: { UserStore } }, plugin: { store: store$1 }, ui: { Button: Button$1, ButtonColors: ButtonColors$1, ButtonLooks: ButtonLooks$1, ButtonSizes, Divider: Divider$1, Header: Header$1, HeaderTags: HeaderTags$1, ModalBody: ModalBody$1, ModalFooter: ModalFooter$1, ModalHeader: ModalHeader$1, ModalRoot: ModalRoot$1, ModalSizes: ModalSizes$1, Text: Text$1, TextBox, openConfirmationModal }, solid: { For, Show, createMemo: createMemo$1, createSignal: createSignal$1 } } = shelter;
function TagRowEntry(props) {
	const [renaming, setRenaming] = createSignal$1(false);
	const [draft, setDraft] = createSignal$1(props.tag.label);
	const commit = () => {
		renameTag(props.tag.label, draft());
		setRenaming(false);
	};
	return [
		(0, import_web$12.createComponent)(Button$1, {
			get size() {
				return ButtonSizes.TINY;
			},
			get look() {
				return ButtonLooks$1.OUTLINED;
			},
			onClick: () => openStyler(props.tag.label),
			children: "Style"
		}),
		(0, import_web$12.createComponent)(Show, {
			get when() {
				return renaming();
			},
			get fallback() {
				return (0, import_web$12.createComponent)(Chip, { get tag() {
					return props.tag.label;
				} });
			},
			get children() {
				const _el$ = (0, import_web$9.getNextElement)(_tmpl$$1), _el$2 = _el$.firstChild, [_el$3, _co$] = (0, import_web$10.getNextMarker)(_el$2.nextSibling), _el$4 = _el$3.nextSibling, [_el$5, _co$2] = (0, import_web$10.getNextMarker)(_el$4.nextSibling);
				(0, import_web$11.insert)(_el$, (0, import_web$12.createComponent)(TextBox, {
					get value() {
						return draft();
					},
					onInput: setDraft,
					"aria-label": "Rename tag",
					maxlength: 40
				}), _el$3, _co$);
				(0, import_web$11.insert)(_el$, (0, import_web$12.createComponent)(Button$1, {
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
			const _el$6 = (0, import_web$9.getNextElement)(_tmpl$2$1), _el$8 = _el$6.firstChild, [_el$9, _co$3] = (0, import_web$10.getNextMarker)(_el$8.nextSibling), _el$7 = _el$9.nextSibling, _el$0 = _el$7.nextSibling, [_el$1, _co$4] = (0, import_web$10.getNextMarker)(_el$0.nextSibling);
			(0, import_web$11.insert)(_el$6, () => props.tag.count, _el$9, _co$3);
			(0, import_web$11.insert)(_el$6, () => props.tag.count === 1 ? "person" : "people", _el$1, _co$4);
			return _el$6;
		})(),
		(() => {
			const _el$10 = (0, import_web$9.getNextElement)(_tmpl$3$1), _el$11 = _el$10.firstChild, [_el$12, _co$5] = (0, import_web$10.getNextMarker)(_el$11.nextSibling), _el$13 = _el$12.nextSibling, [_el$14, _co$6] = (0, import_web$10.getNextMarker)(_el$13.nextSibling);
			(0, import_web$11.insert)(_el$10, (0, import_web$12.createComponent)(Button$1, {
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
			(0, import_web$11.insert)(_el$10, (0, import_web$12.createComponent)(Button$1, {
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
		return Object.entries(store$1.tags).map(([userId, userTags]) => {
			const user = UserStore.getUser(userId);
			return {
				userId,
				tags: userTags,
				name: user?.globalName ?? user?.username ?? userId
			};
		}).filter((entry) => !query || entry.name.toLowerCase().includes(query) || entry.tags.some((t) => t.toLowerCase().includes(query))).sort((a, b) => a.name.localeCompare(b.name));
	});
	return (0, import_web$12.createComponent)(ModalRoot$1, {
		get size() {
			return ModalSizes$1.MEDIUM;
		},
		get children() {
			return [
				(0, import_web$12.createComponent)(ModalHeader$1, {
					get close() {
						return props.close;
					},
					children: "Manage tags"
				}),
				(0, import_web$12.createComponent)(ModalBody$1, { get children() {
					return [
						(0, import_web$12.createComponent)(TextBox, {
							get value() {
								return filter();
							},
							onInput: setFilter,
							placeholder: "Filter by tag or person…",
							"aria-label": "Filter"
						}),
						(0, import_web$12.createComponent)(Header$1, {
							get tag() {
								return HeaderTags$1.H5;
							},
							margin: true,
							children: "Tags"
						}),
						(0, import_web$12.createComponent)(Show, {
							get when() {
								return tags().length;
							},
							get fallback() {
								return (0, import_web$9.getNextElement)(_tmpl$5);
							},
							get children() {
								const _el$15 = (0, import_web$9.getNextElement)(_tmpl$4$1);
								(0, import_web$11.insert)(_el$15, (0, import_web$12.createComponent)(For, {
									get each() {
										return tags();
									},
									children: (tag) => (0, import_web$12.createComponent)(TagRowEntry, { tag })
								}));
								return _el$15;
							}
						}),
						(0, import_web$12.createComponent)(Divider$1, {
							mt: true,
							mb: true
						}),
						(0, import_web$12.createComponent)(Header$1, {
							get tag() {
								return HeaderTags$1.H5;
							},
							children: "Tagged people"
						}),
						(0, import_web$12.createComponent)(Show, {
							get when() {
								return users().length;
							},
							get fallback() {
								return (0, import_web$9.getNextElement)(_tmpl$6);
							},
							get children() {
								return (0, import_web$12.createComponent)(For, {
									get each() {
										return users();
									},
									children: (entry) => (() => {
										const _el$18 = (0, import_web$9.getNextElement)(_tmpl$7), _el$19 = _el$18.firstChild, _el$20 = _el$19.nextSibling, _el$21 = _el$20.nextSibling, [_el$22, _co$7] = (0, import_web$10.getNextMarker)(_el$21.nextSibling), _el$23 = _el$22.nextSibling, [_el$24, _co$8] = (0, import_web$10.getNextMarker)(_el$23.nextSibling);
										(0, import_web$11.insert)(_el$19, () => entry.name);
										(0, import_web$11.insert)(_el$20, (0, import_web$12.createComponent)(For, {
											get each() {
												return entry.tags;
											},
											children: (tag) => (0, import_web$12.createComponent)(Chip, { tag })
										}));
										(0, import_web$11.insert)(_el$18, (0, import_web$12.createComponent)(Button$1, {
											get size() {
												return ButtonSizes.TINY;
											},
											get look() {
												return ButtonLooks$1.OUTLINED;
											},
											onClick: () => openTagEditor(entry.userId),
											children: "Edit"
										}), _el$22, _co$7);
										(0, import_web$11.insert)(_el$18, (0, import_web$12.createComponent)(Button$1, {
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
										(0, import_web$7.effect)(() => (0, import_web$6.setAttribute)(_el$19, "title", entry.userId));
										return _el$18;
									})()
								});
							}
						}),
						(0, import_web$12.createComponent)(Show, {
							get when() {
								return (0, import_web$8.memo)(() => !!!users().length)() && !tags().length;
							},
							get children() {
								return (0, import_web$12.createComponent)(Text$1, {
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
				(0, import_web$12.createComponent)(ModalFooter$1, { get children() {
					return (0, import_web$12.createComponent)(ByIdAdder, {});
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
		const _el$25 = (0, import_web$9.getNextElement)(_tmpl$8), _el$26 = _el$25.firstChild, _el$27 = _el$26.firstChild, [_el$28, _co$9] = (0, import_web$10.getNextMarker)(_el$27.nextSibling), _el$29 = _el$28.nextSibling, [_el$30, _co$0] = (0, import_web$10.getNextMarker)(_el$29.nextSibling), _el$31 = _el$26.nextSibling, [_el$32, _co$1] = (0, import_web$10.getNextMarker)(_el$31.nextSibling);
		(0, import_web$11.insert)(_el$26, (0, import_web$12.createComponent)(TextBox, {
			get value() {
				return id();
			},
			onInput: setId,
			placeholder: "User ID",
			"aria-label": "User ID"
		}), _el$28, _co$9);
		(0, import_web$11.insert)(_el$26, (0, import_web$12.createComponent)(Button$1, {
			get disabled() {
				return !valid();
			},
			onClick: () => {
				openTagEditor(id().trim());
				setId("");
			},
			children: "Tag by ID"
		}), _el$30, _co$0);
		(0, import_web$11.insert)(_el$25, (0, import_web$12.createComponent)(Show, {
			get when() {
				return (0, import_web$8.memo)(() => !!id())() && !valid();
			},
			get children() {
				return (0, import_web$12.createComponent)(Text$1, {
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
const _tmpl$ = /*#__PURE__*/ (0, import_web.template)(`<div style="margin-top: 8px"></div>`, 2), _tmpl$2 = /*#__PURE__*/ (0, import_web.template)(`<div style="display: flex; gap: 8px; justify-content: flex-end; width: 100%"><!#><!/><!#><!/><!#><!/></div>`, 8), _tmpl$3 = /*#__PURE__*/ (0, import_web.template)(`<div style="margin: 8px 0 4px"></div>`, 2), _tmpl$4 = /*#__PURE__*/ (0, import_web.template)(`<div style="display: flex; gap: 8px; margin-top: 10px"><!#><!/><!#><!/></div>`, 6);
const { plugin: { store }, ui: { Button, ButtonColors, ButtonLooks, Divider, Header, HeaderTags, ModalBody, ModalFooter, ModalHeader, ModalRoot, ModalSizes, Slider, SwitchItem, Text, TextArea, ToastColors, openModal, showToast }, solid: { createMemo, createSignal } } = shelter;
const Toggle = (props) => (0, import_web$4.createComponent)(SwitchItem, {
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
		try {
			const count = importData(text(), { merge });
			showToast({
				title: "Friend Tags",
				content: `Imported tags for ${count} ${count === 1 ? "person" : "people"}.`,
				color: ToastColors.SUCCESS
			});
			props.close();
		} catch (err) {
			showToast({
				title: "Import failed",
				content: String(err.message ?? err),
				color: ToastColors.CRITICAL
			});
		}
	};
	return (0, import_web$4.createComponent)(ModalRoot, {
		get size() {
			return ModalSizes.MEDIUM;
		},
		get children() {
			return [
				(0, import_web$4.createComponent)(ModalHeader, {
					get close() {
						return props.close;
					},
					children: "Backup & restore"
				}),
				(0, import_web$4.createComponent)(ModalBody, { get children() {
					return [(0, import_web$4.createComponent)(Text, {
						style: {
							color: "var(--header-secondary)",
							"font-size": "14px"
						},
						children: "Copy this somewhere safe, or paste a previous backup in and import it."
					}), (() => {
						const _el$ = (0, import_web$2.getNextElement)(_tmpl$);
						(0, import_web$3.insert)(_el$, (0, import_web$4.createComponent)(TextArea, {
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
				(0, import_web$4.createComponent)(ModalFooter, { get children() {
					const _el$2 = (0, import_web$2.getNextElement)(_tmpl$2), _el$3 = _el$2.firstChild, [_el$4, _co$] = (0, import_web$1.getNextMarker)(_el$3.nextSibling), _el$5 = _el$4.nextSibling, [_el$6, _co$2] = (0, import_web$1.getNextMarker)(_el$5.nextSibling), _el$7 = _el$6.nextSibling, [_el$8, _co$3] = (0, import_web$1.getNextMarker)(_el$7.nextSibling);
					(0, import_web$3.insert)(_el$2, (0, import_web$4.createComponent)(Button, {
						get look() {
							return ButtonLooks.OUTLINED;
						},
						onClick: () => {
							navigator.clipboard.writeText(exportData());
							showToast({
								title: "Friend Tags",
								content: "Copied to clipboard."
							});
						},
						children: "Copy"
					}), _el$4, _co$);
					(0, import_web$3.insert)(_el$2, (0, import_web$4.createComponent)(Button, {
						get look() {
							return ButtonLooks.OUTLINED;
						},
						onClick: () => doImport(true),
						children: "Merge"
					}), _el$6, _co$2);
					(0, import_web$3.insert)(_el$2, (0, import_web$4.createComponent)(Button, {
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
		const userCount = Object.keys(store.tags).length;
		return `${tagCount} ${tagCount === 1 ? "tag" : "tags"} across ${userCount} ${userCount === 1 ? "person" : "people"}`;
	});
	return [
		(0, import_web$4.createComponent)(Header, {
			get tag() {
				return HeaderTags.H5;
			},
			children: "Where to show tags"
		}),
		(0, import_web$4.createComponent)(Toggle, {
			get checked() {
				return store.inFriends;
			},
			onChange: (v) => store.inFriends = v,
			note: "Hover someone in the friends list to add or edit their tags.",
			children: "Friends list"
		}),
		(0, import_web$4.createComponent)(Toggle, {
			get checked() {
				return store.inMessages;
			},
			onChange: (v) => store.inMessages = v,
			note: "Next to the username on every message, in servers and DMs.",
			children: "Chat messages"
		}),
		(0, import_web$4.createComponent)(Toggle, {
			get checked() {
				return store.inMembers;
			},
			onChange: (v) => store.inMembers = v,
			children: "Server member list"
		}),
		(0, import_web$4.createComponent)(Toggle, {
			get checked() {
				return store.inDms;
			},
			onChange: (v) => store.inDms = v,
			children: "DM list"
		}),
		(0, import_web$4.createComponent)(Toggle, {
			get checked() {
				return store.inProfiles;
			},
			onChange: (v) => store.inProfiles = v,
			note: "Profile popouts and the full profile modal — also editable here.",
			children: "Profiles"
		}),
		(0, import_web$4.createComponent)(Divider, {
			mt: true,
			mb: true
		}),
		(0, import_web$4.createComponent)(Header, {
			get tag() {
				return HeaderTags.H5;
			},
			children: "Appearance"
		}),
		(0, import_web$4.createComponent)(Toggle, {
			get checked() {
				return store.uppercase;
			},
			onChange: (v) => store.uppercase = v,
			children: "Display tags in uppercase"
		}),
		(0, import_web$4.createComponent)(Toggle, {
			get checked() {
				return store.animate;
			},
			onChange: (v) => store.animate = v,
			note: "Master switch for per-tag animations. Your OS “reduce motion” setting is always respected regardless.",
			children: "Play tag animations"
		}),
		(0, import_web$4.createComponent)(Header, {
			get tag() {
				return HeaderTags.H5;
			},
			margin: true,
			children: "Maximum tags shown per person"
		}),
		(0, import_web$4.createComponent)(Text, {
			style: {
				color: "var(--header-secondary)",
				"font-size": "14px"
			},
			children: "Any extras collapse into a “+n” pill you can hover. Set to 0 for no limit."
		}),
		(() => {
			const _el$9 = (0, import_web$2.getNextElement)(_tmpl$3);
			(0, import_web$3.insert)(_el$9, (0, import_web$4.createComponent)(Slider, {
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
		(0, import_web$4.createComponent)(Divider, {
			mt: true,
			mb: true
		}),
		(0, import_web$4.createComponent)(Header, {
			get tag() {
				return HeaderTags.H5;
			},
			children: "Your tags"
		}),
		(0, import_web$4.createComponent)(Text, {
			style: {
				color: "var(--header-secondary)",
				"font-size": "14px"
			},
			get children() {
				return summary();
			}
		}),
		(() => {
			const _el$0 = (0, import_web$2.getNextElement)(_tmpl$4), _el$1 = _el$0.firstChild, [_el$10, _co$4] = (0, import_web$1.getNextMarker)(_el$1.nextSibling), _el$11 = _el$10.nextSibling, [_el$12, _co$5] = (0, import_web$1.getNextMarker)(_el$11.nextSibling);
			(0, import_web$3.insert)(_el$0, (0, import_web$4.createComponent)(Button, {
				grow: true,
				onClick: () => openModal(TagManager),
				children: "Manage tags"
			}), _el$10, _co$4);
			(0, import_web$3.insert)(_el$0, (0, import_web$4.createComponent)(Button, {
				grow: true,
				get look() {
					return ButtonLooks.OUTLINED;
				},
				onClick: () => openModal(Backup),
				children: "Backup & restore"
			}), _el$12, _co$5);
			return _el$0;
		})(),
		(0, import_web$4.createComponent)(Divider, {
			mt: true,
			mb: true
		}),
		(0, import_web$4.createComponent)(Toggle, {
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
const { plugin: { scoped } } = shelter;
function onLoad() {
	scoped.ui.injectCss(styles_default);
	startInjection();
}
function onUnload() {
	removeInjections();
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