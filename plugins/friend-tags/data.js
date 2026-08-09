import { loadSnapshot, saveSnapshot } from "./backup";
import { DEFAULT_STYLE, DURATIONS, LEGACY_ANIMATION_TRACK } from "./presets";

const {
  plugin: { store },
  flux: { storesFlat },
} = shelter;

// ---------------------------------------------------------------------------
// store shape
//
// shelter only auto-saves *top level* property writes, so every option lives at
// the top level, and the nested maps are always replaced wholesale rather than
// mutated in place. Replacing them is also what makes solid re-render the
// injected chips.
//
//   store.tags     : { [userId]: string[] }    tags applied to each user
//   store.colors   : { [tagKey]: "#rrggbb" }   manual colour override per tag
//   store.styles   : { [tagKey]: StyleConfig } gradient / font / animation
//   store.accounts : { [accountId]: { tags, colors, styles } }
//
// `colors` predates `styles` and is kept as the source of truth for a plain
// solid colour, so older backups keep working untouched.
//
// When multiAccount is off (the default) everything lives in the top-level
// maps. When it's on, reads and writes are routed into store.accounts[yourId]
// instead — see scopedId().
// ---------------------------------------------------------------------------

store.tags ??= {};
store.colors ??= {};
store.styles ??= {};
store.accounts ??= {};

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
store.multiAccount ??= false;
store.debug ??= false;

// --- account scoping -------------------------------------------------------

/** The logged-in account's ID, or undefined if Discord hasn't got there yet. */
export function currentAccountId() {
  try {
    return storesFlat.UserStore?.getCurrentUser?.()?.id;
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
const scopedId = () => (store.multiAccount ? currentAccountId() : undefined);

const rawMap = (name) => {
  const id = scopedId();
  return (id ? store.accounts[id]?.[name] : store[name]) ?? {};
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
function detach(value) {
  if (Array.isArray(value)) return value.map(detach);
  if (value && typeof value === "object") {
    const out = {};
    for (const key in value) out[key] = detach(value[key]);
    return out;
  }
  return value;
}

// Read straight from the store, detaching as we go.
//
// This used to go through memos in a module-level createRoot, to cut the
// per-chip signal churn shelter's store causes. That root is disposed on
// unload, and a disposed memo stops recomputing — so after a reload, reads
// returned stale data and newly added tags never appeared. Correctness wins;
// the saving was never measured against a real client anyway.
const readMap = (name) => detach(rawMap(name));

/** Display options. */
export const display = {
  uppercase: () => store.uppercase,
  maxShown: () => store.maxShown,
  animate: () => store.animate,
};

/** Kept so index.jsx's onUnload keeps working; nothing to dispose now. */
export const disposeStoreMemos = () => {};

function writeMap(name, value) {
  const id = scopedId();

  if (!id) {
    store[name] = value;
  } else {
    store.accounts = {
      ...store.accounts,
      [id]: { ...(store.accounts[id] ?? {}), [name]: value },
    };
  }

  scheduleBackup();
}

// --- durable backup --------------------------------------------------------

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
    saveSnapshot({
      tags: detach(store.tags),
      colors: detach(store.colors),
      styles: detach(store.styles),
      accounts: detach(store.accounts),
    });
  }, 400);
}

/**
 * Reload tags from the IndexedDB mirror when shelter's copy has been wiped.
 *
 * Only restores maps that are actually empty, so a live edit can never be
 * clobbered by a stale snapshot. Returns how many users were recovered.
 */
export async function restoreFromBackup() {
  const snapshot = await loadSnapshot();
  if (!snapshot) return 0;

  let recovered = 0;

  const isEmpty = (value) => !value || Object.keys(value).length === 0;

  if (isEmpty(store.tags) && !isEmpty(snapshot.tags)) {
    store.tags = snapshot.tags;
    recovered = Object.keys(snapshot.tags).length;
  }
  if (isEmpty(store.colors) && !isEmpty(snapshot.colors)) store.colors = snapshot.colors;
  if (isEmpty(store.styles) && !isEmpty(snapshot.styles)) store.styles = snapshot.styles;
  if (isEmpty(store.accounts) && !isEmpty(snapshot.accounts)) store.accounts = snapshot.accounts;

  return recovered;
}

/** Force a backup now, e.g. straight after an import. */
export const backupNow = () => scheduleBackup();

/**
 * Copy the shared data into this account's bucket, so switching multi-account
 * on doesn't look like everything vanished. Only ever seeds an empty bucket.
 */
export function seedCurrentAccount() {
  const id = currentAccountId();
  if (!id || store.accounts[id]) return false;

  store.accounts = {
    ...store.accounts,
    [id]: { tags: { ...store.tags }, colors: { ...store.colors }, styles: { ...store.styles } },
  };
  return true;
}

/** Collapse whitespace and trim, so " best  friend " and "best friend" match. */
export const normalise = (tag) => String(tag ?? "").replace(/\s+/g, " ").trim();

/** Case-insensitive identity for a tag. Two tags are "the same" iff keys match. */
export const tagKey = (tag) => normalise(tag).toLowerCase();

export const allUserTags = () => readMap("tags");

export const getTags = (userId) => readMap("tags")[userId] ?? [];

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

  const next = { ...readMap("tags") };
  if (clean.length) next[userId] = clean;
  else delete next[userId];

  writeMap("tags", next);
}

export const addTag = (userId, tag) => setTags(userId, [...getTags(userId), tag]);

export const removeTag = (userId, tag) =>
  setTags(userId, getTags(userId).filter((t) => tagKey(t) !== tagKey(tag)));

export const clearUser = (userId) => setTags(userId, []);

/** Every distinct tag in use, with how many users carry it. Sorted by name. */
export function allTags() {
  const counts = new Map();

  for (const tags of Object.values(readMap("tags")))
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
  for (const [userId, tags] of Object.entries(readMap("tags"))) {
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

/** Remove a tag from every user. */
export function deleteTag(tag) {
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

// --- colours ---------------------------------------------------------------

// Mid-tone hues that stay legible against both Discord themes once we pick a
// black/white foreground for them.
export const PALETTE = [
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
  readMap("colors")[tagKey(tag)] ?? PALETTE[hashString(tagKey(tag)) % PALETTE.length];

export function setColor(tag, color) {
  writeMap("colors", { ...readMap("colors"), [tagKey(tag)]: color });
}

export function resetColor(tag) {
  const next = { ...readMap("colors") };
  delete next[tagKey(tag)];
  writeMap("colors", next);
}

/** Black or white, whichever stays readable on top of `hex`. */
export function textOn(hex) {
  const value = parseInt(String(hex).slice(1), 16);
  if (!Number.isFinite(value)) return "#fff";

  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;

  // Perceived brightness, the cheap ITU-R BT.601 approximation.
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#000" : "#fff";
}

// --- rich styles (gradient / font / animation) -----------------------------

/** A tag's full style, with every unset field filled in from the defaults. */
export function styleOf(tag) {
  const saved = readMap("styles")[tagKey(tag)] ?? {};
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
  writeMap("styles", { ...readMap("styles"), [key]: { ...readMap("styles")[key], ...patch } });

  // Keep the legacy colour map in step so plain-colour data stays portable.
  if (patch.color) setColor(tag, patch.color);
}

export function resetStyle(tag) {
  const next = { ...readMap("styles") };
  delete next[tagKey(tag)];
  writeMap("styles", next);
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

// --- import / export -------------------------------------------------------

export const exportData = () =>
  JSON.stringify(
    { tags: readMap("tags"), colors: readMap("colors"), styles: readMap("styles") },
    null,
    2,
  );

/**
 * Returns { users, tags } counts, or throws if the payload is unusable.
 *
 * A payload that parses but contains nothing is reported rather than treated as
 * a success — importing an empty backup used to look identical to a real one.
 */
export function importData(json, { merge = false } = {}) {
  const parsed = JSON.parse(json);
  if (!parsed || typeof parsed !== "object" || typeof parsed.tags !== "object" || parsed.tags === null)
    throw new Error("Expected an object with a `tags` property.");

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

  const counts = { users: Object.keys(incoming).length, tags: tagCount };

  if (!merge) {
    writeMap("tags", incoming);
    writeMap("colors", parsed.colors && typeof parsed.colors === "object" ? { ...parsed.colors } : {});
    writeMap("styles", parsed.styles && typeof parsed.styles === "object" ? { ...parsed.styles } : {});
    return counts;
  }

  const merged = { ...readMap("tags") };
  for (const [userId, tags] of Object.entries(incoming)) {
    const seen = new Set();
    merged[userId] = [...(merged[userId] ?? []), ...tags].filter((tag) => {
      if (seen.has(tagKey(tag))) return false;
      seen.add(tagKey(tag));
      return true;
    });
  }
  writeMap("tags", merged);

  if (parsed.colors && typeof parsed.colors === "object")
    writeMap("colors", { ...readMap("colors"), ...parsed.colors });

  if (parsed.styles && typeof parsed.styles === "object")
    writeMap("styles", { ...readMap("styles"), ...parsed.styles });

  return counts;
}
