import { DEFAULT_STYLE, DURATIONS, LEGACY_ANIMATION_TRACK } from "./presets";

const {
  plugin: { store },
} = shelter;

// ---------------------------------------------------------------------------
// store shape
//
// shelter only auto-saves *top level* property writes, so every option lives at
// the top level, and the two nested maps are always replaced wholesale rather
// than mutated in place. Replacing them is also what makes solid re-render the
// injected chips.
//
//   store.tags   : { [userId]: string[] }   tags applied to each user
//   store.colors : { [tagKey]: "#rrggbb" }  manual colour override per tag name
//   store.styles : { [tagKey]: StyleConfig } gradient / font / animation
//
// `colors` predates `styles` and is kept as the source of truth for a plain
// solid colour, so older backups keep working untouched.
// ---------------------------------------------------------------------------

store.tags ??= {};
store.colors ??= {};
store.styles ??= {};

// display surfaces
store.inFriends ??= true;
store.inMessages ??= true;
store.inMembers ??= true;
store.inDms ??= true;
store.inProfiles ??= true;

// behaviour
store.uppercase ??= true;
store.maxShown ??= 3;
store.animate ??= true;
store.debug ??= false;

/** Collapse whitespace and trim, so " best  friend " and "best friend" match. */
export const normalise = (tag) => String(tag ?? "").replace(/\s+/g, " ").trim();

/** Case-insensitive identity for a tag. Two tags are "the same" iff keys match. */
export const tagKey = (tag) => normalise(tag).toLowerCase();

export const getTags = (userId) => store.tags[userId] ?? [];

export const hasTags = (userId) => getTags(userId).length > 0;

/** Replace a user's whole tag list. Empty list removes the user entirely. */
export function setTags(userId, tags) {
  const seen = new Set();
  const clean = [];

  for (const raw of tags) {
    const tag = normalise(raw);
    if (!tag || seen.has(tagKey(tag))) continue;
    seen.add(tagKey(tag));
    clean.push(tag);
  }

  const next = { ...store.tags };
  if (clean.length) next[userId] = clean;
  else delete next[userId];

  store.tags = next;
}

export const addTag = (userId, tag) => setTags(userId, [...getTags(userId), tag]);

export const removeTag = (userId, tag) =>
  setTags(userId, getTags(userId).filter((t) => tagKey(t) !== tagKey(tag)));

export const clearUser = (userId) => setTags(userId, []);

/** Every distinct tag in use, with how many users carry it. Sorted by name. */
export function allTags() {
  const counts = new Map();

  for (const tags of Object.values(store.tags))
    for (const tag of tags) {
      const key = tagKey(tag);
      const entry = counts.get(key);
      if (entry) entry.count++;
      else counts.set(key, { key, label: tag, count: 1 });
    }

  return [...counts.values()].sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Rename a tag everywhere it is used, carrying its colour and style across.
 *
 * Compares the literal strings, not the keys: changing only capitalisation
 * ("goth girl" -> "GOTH GIRL") is a rename users expect to work, and comparing
 * keys made it silently do nothing.
 */
export function renameTag(from, to) {
  const target = normalise(to);
  if (!target || normalise(from) === target) return;

  const nextTags = {};
  for (const [userId, tags] of Object.entries(store.tags)) {
    const seen = new Set();
    const mapped = [];

    for (const tag of tags) {
      const next = tagKey(tag) === tagKey(from) ? target : tag;
      if (seen.has(tagKey(next))) continue; // renaming may collide with an existing tag
      seen.add(tagKey(next));
      mapped.push(next);
    }

    if (mapped.length) nextTags[userId] = mapped;
  }
  store.tags = nextTags;

  const nextColors = { ...store.colors };
  const colour = nextColors[tagKey(from)];
  delete nextColors[tagKey(from)];
  if (colour) nextColors[tagKey(target)] = colour;
  store.colors = nextColors;

  const nextStyles = { ...store.styles };
  const style = nextStyles[tagKey(from)];
  delete nextStyles[tagKey(from)];
  if (style) nextStyles[tagKey(target)] = style;
  store.styles = nextStyles;
}

/** Remove a tag from every user. */
export function deleteTag(tag) {
  const nextTags = {};
  for (const [userId, tags] of Object.entries(store.tags)) {
    const kept = tags.filter((t) => tagKey(t) !== tagKey(tag));
    if (kept.length) nextTags[userId] = kept;
  }
  store.tags = nextTags;

  const nextColors = { ...store.colors };
  delete nextColors[tagKey(tag)];
  store.colors = nextColors;

  const nextStyles = { ...store.styles };
  delete nextStyles[tagKey(tag)];
  store.styles = nextStyles;
}

// --- colours ---------------------------------------------------------------

// Mid-tone hues that stay legible against both Discord themes once we pick a
// black/white foreground for them.
const PALETTE = [
  "#5865F2", "#3BA55D", "#FAA81A", "#ED4245", "#EB459E",
  "#00A8FC", "#F47B67", "#9B59B6", "#1ABC9C", "#E67E22",
  "#7289DA", "#43B581", "#C77DFF", "#F0B232",
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (Math.imul(hash, 31) + str.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

/** A tag's colour: the user's override if set, else a stable colour from its name. */
export const colorOf = (tag) =>
  store.colors[tagKey(tag)] ?? PALETTE[hashString(tagKey(tag)) % PALETTE.length];

export function setColor(tag, color) {
  store.colors = { ...store.colors, [tagKey(tag)]: color };
}

export function resetColor(tag) {
  const next = { ...store.colors };
  delete next[tagKey(tag)];
  store.colors = next;
}

// --- rich styles (gradient / font / animation) -----------------------------

/** A tag's full style, with every unset field filled in from the defaults. */
export function styleOf(tag) {
  const saved = store.styles[tagKey(tag)] ?? {};
  const style = { ...DEFAULT_STYLE, ...saved, color: saved.color ?? colorOf(tag) };

  // Styles saved before motion and colour became separate tracks carried a
  // single `animation`; drop it into whichever track it belongs to.
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

export function setStyle(tag, patch) {
  const key = tagKey(tag);
  const next = { ...store.styles, [key]: { ...store.styles[key], ...patch } };
  store.styles = next;

  // Keep the legacy colour map in step so plain-colour data stays portable.
  if (patch.color) setColor(tag, patch.color);
}

export function resetStyle(tag) {
  const next = { ...store.styles };
  delete next[tagKey(tag)];
  store.styles = next;
  resetColor(tag);
}

/**
 * Turn a style config into inline CSS for a chip.
 *
 * Returned as a plain object so solid can apply it directly, and so the styler
 * preview and the real chips can never drift apart.
 */
export function styleToCss(style, { animate = true } = {}) {
  const gradient = style.fill === "gradient" && style.colors?.length > 1;

  const background = gradient
    ? `linear-gradient(${style.angle ?? 90}deg, ${style.colors.join(", ")})`
    : style.color;

  // Contrast is judged against the average of the gradient stops, since that's
  // roughly what sits behind the middle of the text.
  const backdrop = gradient ? averageColor(style.colors) : style.color;

  const css = {
    background,
    color: style.text && style.text !== "auto" ? style.text : textOn(backdrop),
    "font-weight": String(style.weight ?? 700),
  };

  if (style.font) css["font-family"] = style.font;
  if (style.italic) css["font-style"] = "italic";

  if (!animate) return css;

  // The two tracks animate disjoint properties, so both can run at once as a
  // comma-separated animation list.
  const tracks = [];
  const add = (name, speed) => {
    const duration = DURATIONS[name];
    if (!duration) return;
    tracks.push(`ftags-${name} ${(duration / (speed > 0 ? speed : 1)).toFixed(2)}s ease-in-out infinite`);
  };

  add(style.motion, style.motionSpeed);
  // Hue cycling and gradient sliding read better at a constant rate.
  if (style.colorAnim === "rainbow" || style.colorAnim === "flow") {
    const duration = DURATIONS[style.colorAnim];
    const speed = style.colorSpeed > 0 ? style.colorSpeed : 1;
    tracks.push(`ftags-${style.colorAnim} ${(duration / speed).toFixed(2)}s linear infinite`);
  } else {
    add(style.colorAnim, style.colorSpeed);
  }

  if (tracks.length) css.animation = tracks.join(", ");

  // Shimmer sweeps a highlight across, which needs a second layer to travel on.
  if (style.colorAnim === "shimmer") {
    const base = gradient ? background : `linear-gradient(90deg, ${style.color}, ${style.color})`;
    css["background-image"] = `${base}, linear-gradient(100deg, transparent 20%, rgba(255,255,255,.55) 50%, transparent 80%)`;
    css["background-size"] = "100% 100%, 220% 100%";
    css["background-repeat"] = "no-repeat";
  }

  // Flow slides the gradient itself, so it needs room to slide into.
  if (style.colorAnim === "flow" && gradient) {
    css["background-size"] = "200% 100%";
  }

  return css;
}

function averageColor(hexes) {
  let r = 0;
  let g = 0;
  let b = 0;

  for (const hex of hexes) {
    const value = parseInt(String(hex).slice(1), 16);
    if (!Number.isFinite(value)) continue;
    r += (value >> 16) & 255;
    g += (value >> 8) & 255;
    b += value & 255;
  }

  const n = hexes.length || 1;
  const toHex = (c) => Math.round(c / n).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Black or white, whichever stays readable on top of `hex`. */
export function textOn(hex) {
  const value = parseInt(hex.slice(1), 16);
  if (!Number.isFinite(value)) return "#fff";

  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;

  // Perceived brightness, the cheap ITU-R BT.601 approximation.
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#000" : "#fff";
}

// --- import / export -------------------------------------------------------

export const exportData = () =>
  JSON.stringify({ tags: store.tags, colors: store.colors, styles: store.styles }, null, 2);

/** Returns the number of users imported, or throws if the payload is unusable. */
export function importData(json, { merge = false } = {}) {
  const parsed = JSON.parse(json);
  if (!parsed || typeof parsed !== "object" || typeof parsed.tags !== "object")
    throw new Error("Expected an object with a `tags` property.");

  const incoming = {};
  for (const [userId, tags] of Object.entries(parsed.tags)) {
    if (!Array.isArray(tags)) continue;
    const clean = tags.map(normalise).filter(Boolean);
    if (clean.length) incoming[userId] = clean;
  }

  if (!merge) {
    store.tags = incoming;
    store.colors = parsed.colors && typeof parsed.colors === "object" ? { ...parsed.colors } : {};
    store.styles = parsed.styles && typeof parsed.styles === "object" ? { ...parsed.styles } : {};
    return Object.keys(incoming).length;
  }

  const merged = { ...store.tags };
  for (const [userId, tags] of Object.entries(incoming)) {
    const seen = new Set();
    merged[userId] = [...(merged[userId] ?? []), ...tags].filter((tag) => {
      if (seen.has(tagKey(tag))) return false;
      seen.add(tagKey(tag));
      return true;
    });
  }
  store.tags = merged;

  if (parsed.colors && typeof parsed.colors === "object")
    store.colors = { ...store.colors, ...parsed.colors };

  if (parsed.styles && typeof parsed.styles === "object")
    store.styles = { ...store.styles, ...parsed.styles };

  return Object.keys(incoming).length;
}
