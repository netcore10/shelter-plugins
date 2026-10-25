import css from "./styles";
import { FEET, SIDE, FW, FH, FRAMES, STATES, EYES, loadSheet, makeEyes } from "./sheet";
import { clamp, plan, range } from "./path";
import { SONGS } from "./songs";
import SONG_CLIPS from "./song-clips";
import { BAKED, GREETINGS, LINES, TIPS, DIALOGS, TYPING, SEARCH, DICT } from "./lines";
import { search, define } from "./search";
import { hasTopic, topicAbove, whoElse } from "./context";
import CLIPS from "./voice";

const {
  plugin: { store, scoped },
  ui: { showToast },
} = shelter;

const synth = window.speechSynthesis;

const rand = (a) => a[(Math.random() * a.length) | 0];

const SLEEP_MS = 60_000;

let root, sprite, bubble, state;
let x = 0;
let y = 0;
let speaking = false;
let asleep = false;
let dead = false;
let walking = false;
let held = false; // being dragged: nothing may move him but the pointer
let pose = "talk"; // what plays while speaking: "talk", or "point" when gesturing at the UI
let utt;
let hat; // the accessory on his head
let hideT, watchT, sleepT, chatT, greetT, homeT, wanderT, dodgeT, gravT;

const size = () => ({ w: FW * store.scale, h: FH * store.scale });

// --- animation --------------------------------------------------------------
// One CSS steps() animation over a sprite sheet: no JS per frame, the compositor
// does the work. JS only ever switches which row plays.

function setState(name) {
  const s = STATES[name];
  state = name;
  const st = sprite.style;
  st.setProperty("--row", s.row);
  st.setProperty("--fps", s.fps);
  st.setProperty("--iter", s.once ? 1 : "infinite");
  sprite.classList.toggle("hold", !!s.hold);
  sprite.classList.toggle("looking", name === "watch");
  st.animation = "none";
  void sprite.offsetWidth; // restart even if the same row is replayed
  st.animation = "";
  if (name === "watch") look();
}

const settle = () => setState(walking ? "walk" : speaking ? pose : onBox() ? "watch" : asleep ? "sleep" : "idle");

function activity() {
  clearTimeout(sleepT);
  if (asleep) {
    asleep = false;
    if (!speaking) settle();
  }
  sleepT = setTimeout(() => {
    asleep = true;
    if (!speaking) settle();
  }, SLEEP_MS);
}

// --- speech -----------------------------------------------------------------

function showBubble(text, img) {
  bubble.textContent = text;
  bubble.classList.remove("below", "ask");
  bubble.style.setProperty("--dx", "0px");
  bubble.classList.add("on");

  // keep it on screen: flip below if there's no room above, nudge if it hangs off a side
  const fit = () => {
    const r = bubble.getBoundingClientRect();
    bubble.classList.toggle("below", r.top < 8);
    const dx = r.left < 8 ? 8 - r.left : r.right > innerWidth - 8 ? innerWidth - 8 - r.right : 0;
    bubble.style.setProperty("--dx", dx + "px");
  };
  fit();
  if (img) {
    const i = document.createElement("img"); // src was checked against the GIF hosts in search.js
    i.className = "bd-img";
    i.alt = "";
    i.onload = fit; // the bubble just grew
    i.src = img;
    bubble.append(i);
  }
}

export function say(text, opts = {}) {
  if (!root) return;
  activity();
  stopWalk();
  clearTimeout(homeT);
  clearTimeout(hideT);
  clearTimeout(watchT);
  synth?.cancel();
  if (utt instanceof Audio) utt.pause();

  speaking = true;
  pose = opts.pose ?? "talk";
  setState(pose);
  showBubble(text, opts.img);
  const said = text;

  const end = () => {
    loading = false;
    syncDots();
    clearTimeout(watchT);
    speaking = false;
    settle();
    hideT = setTimeout(() => bubble?.classList.remove("on"), opts.img ? 12_000 : 1500);
    opts.then?.();
    ground();
  };

  const speakSystem = () => {
    clearTimeout(watchT);
    if (!synth) return void (watchT = setTimeout(end, 2500 + said.length * 60));
    const u = (utt = new SpeechSynthesisUtterance(said));
    u.voice = synth.getVoices().find((v) => v.name === store.voice) ?? null;
    u.rate = store.rate;
    u.pitch = store.pitch;
    u.volume = store.volume / 100;
    // a cancelled utterance fires onerror later; `utt === u` drops those stale ends
    u.onend = u.onerror = () => utt === u && end();
    synth.speak(u);
    watchT = setTimeout(end, 30_000); // engine that never reports back
  };

  if (opts.sing && store.speak) {
    // a baked DECtalk song, played as is
    const a = (utt = new Audio(opts.sing));
    a.volume = store.volume / 100;
    a.onended = a.onerror = () => utt === a && end();
    a.play().catch(() => utt === a && end());
    watchT = setTimeout(end, 60_000);
  } else if (!store.speak) {
    utt = null;
    watchT = setTimeout(end, 2500 + said.length * 60);
  } else if (store.sam) {
    // Order of preference: the baked clip (instant, offline), then the live SAPI4
    // service at tetyys.com, then the system voice. Played through an <audio> pointed
    // straight at the URL: the service sends no CORS headers, so fetch() would be blocked.
    let live = 0; // live retries used on this part
    const parts = chunks(said); // the service rejects text over 300 chars, so a long answer plays part by part
    let part = 0;
    const playSam = (a) => {
      utt = a;
      a.volume = store.volume / 100;
      a.currentTime = 0;
      let failed = false;
      const fail = () => {
        if (utt !== a || failed) return;
        failed = true;
        cache.delete(a.src);
        if (a.src.startsWith("data:")) {
          console.warn("[buddy] baked clip blocked, going live");
          return playSam(new Audio(samUrl(parts[part])));
        }
        // The service 503s now and then. Never swap to another voice: retry, and if it stays down just show the text.
        if (live++ < 3) {
          console.warn("[buddy] SAM voice failed, retrying", live);
          return void setTimeout(() => utt === a && playSam(new Audio(samUrl(parts[part]))), 1500 * live);
        }
        console.warn("[buddy] SAM voice unavailable, staying silent");
        bubble?.append(" \u{1F507}"); // a silent line is visibly a failed voice, not a bug in him
        clearTimeout(watchT);
        watchT = setTimeout(end, 2500 + said.length * 60);
      };
      if (!a.readyState) setState("think"); // still synthesising
      if (!a.readyState && !a.src.startsWith("data:")) ((loading = true), syncDots());
      a.onplaying = () => {
        if (utt !== a) return;
        loading = false;
        syncDots();
        setState(pose);
        if (parts[part + 1]) prefetch(parts[part + 1]); // synthesise the next part while this one plays
      };
      a.onended = () => {
        if (utt !== a) return;
        if (++part < parts.length) {
          live = 0;
          playSam(takeAudio(parts[part]));
        } else end();
      };
      a.onerror = fail;
      if (a.error) fail();
      else a.play().catch(fail);
    };
    playSam(takeAudio(parts[0]));
    watchT = setTimeout(end, 30_000 * parts.length);
  } else speakSystem();
}

// Fixed lines are baked into voice.js. Everything else (a friend's name in a ping)
// goes to the live service, which takes a few seconds to synthesise, so it's fetched
// BEFORE it's needed: a ping starts loading before he's walked over. Keyed by URL, so
// changing voice/pitch/speed just misses. Capped small: each entry is a ~150 KB WAV.
const cache = new Map();

// baked clips only match the voice they were rendered with
const baked = (text) =>
  store.samVoice === BAKED.voice && store.samPitch === BAKED.pitch && store.samSpeed === BAKED.speed
    ? CLIPS[text]
    : undefined;

function prefetch(text) {
  if (!store.speak || !store.sam || baked(text)) return;
  const url = samUrl(text);
  if (cache.has(url)) return;
  const a = new Audio(url);
  a.preload = "auto";
  a.load();
  cache.set(url, a);
  if (cache.size > 4) cache.delete(cache.keys().next().value);
}

function takeAudio(text) {
  const clip = baked(text);
  return clip ? new Audio(clip) : cache.get(samUrl(text)) ?? new Audio(samUrl(text));
}

let queued;
/** A random quip, with the one after it already loading. */
function takeLine() {
  const line = queued ?? rand(LINES);
  queued = rand(LINES);
  prefetch(queued);
  return line;
}

/** `text` in pieces of at most 280 chars (the service's hard limit is 300), cut at sentence ends, else clause breaks, else spaces. */
function chunks(text, max = 280) {
  const out = [];
  let rest = text.trim();
  while (rest.length > max) {
    const head = rest.slice(0, max);
    const at = [/[.!?]["')\]]?\s(?!.*[.!?]["')\]]?\s)/, /[,;:]\s(?!.*[,;:]\s)/, /\s(?!.*\s)/]
      .map((re) => head.search(re))
      .find((i) => i > max / 4);
    const cut = at === undefined ? max : at + 1;
    out.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  return rest || !out.length ? [...out, rest] : out;
}

const samUrl = (text) =>
  "https://www.tetyys.com/SAPI4/SAPI4?text=" +
  encodeURIComponent(text) +
  "&voice=" +
  encodeURIComponent(store.samVoice) +
  "&pitch=" +
  store.samPitch +
  "&speed=" +
  store.samSpeed;

// --- placement --------------------------------------------------------------

// Feet sit this fraction of the frame above its bottom edge (transparent padding).
const PAD = FEET;
const GRAVITY = 2400; // px/s^2
const WALK_PX_S = 140;

const standY = (top) => top - size().h * (1 - PAD);

function place(nx, ny) {
  const { w, h } = size();
  // clamp the visible body to the window, not the frame (which has empty margin)
  x = Math.min(Math.max(-w * SIDE, nx), Math.max(-w * SIDE, innerWidth - w * (1 - SIDE)));
  y = Math.min(Math.max(0, ny), Math.max(0, innerHeight - h * (1 - PAD)));
  root.style.transform = `translate3d(${x}px,${y}px,0)`;
}

// --- the ground -------------------------------------------------------------
// He stands on the top edges of a few UI elements, or the bottom of the window.
// These selectors are guesses at Discord's markup: a miss just means fewer
// platforms, and the window bottom is always there.
const PLATFORMS =
  '[class*="channelTextArea_"], [role="textbox"], a[href^="/channels/"], [data-list-item-id^="guildsnav___"], [class*="panels_"], [class*="pictureInPicture"], [class*="videoWrapper_"], [class*="voiceUser_"]';

// Voice/video windows he should never sit on top of: if he ends up inside one, he steps out.
// ponytail: class-name guesses like PLATFORMS; confirm with Alt+Shift+D / Alt+Shift+R.
const AVOID = '[class*="pictureInPicture"], [class*="videoWrapper_"], [class*="callContainer_"]';

/**
 * Rect of a voice window his body is inside, or undefined. Standing on something INSIDE the
 * window (a friend's row in a call) is fine: that's a platform, not covering it. Rate-limited
 * so a bad guess about Discord's markup can never turn into a hop-and-fall loop.
 */
let lastStepOut = 0;
function covering(ps) {
  if (performance.now() - lastStepOut < 5000) return;
  const { w, h } = size();
  const cx = x + w / 2;
  const cy = y + h / 2;
  const feet = y + h * (1 - PAD);
  for (const el of document.querySelectorAll(AVOID)) {
    const r = el.getBoundingClientRect();
    if (r.width < 30 || r.width > innerWidth * 0.8 || r.height > innerHeight * 0.8) continue;
    if (!(cx > r.left && cx < r.right && cy > r.top && cy < r.bottom && feet > r.top + 8)) continue;
    if (ps.some((p) => p.el && el.contains(p.el) && Math.abs(p.top - feet) <= 8)) continue;
    return r;
  }
}

function stepOut(r) {
  const { w, h } = size();
  note("stepping out of a voice window");
  lastStepOut = performance.now();
  if (r.top >= h * (1 - PAD)) return moveTo(x, standY(r.top)); // hop onto its top edge
  moveTo(r.left - w * (1 - SIDE) > 0 ? r.left - w * (1 - SIDE) : r.right - w * SIDE, y); // no headroom: step aside
}

function platforms() {
  const { h } = size();
  const out = [{ el: null, l: 0, r: innerWidth, top: innerHeight }];
  // ponytail: scans on demand (wander, gravity tick), never per frame; the cap keeps a huge list cheap
  for (const el of [...document.querySelectorAll(PLATFORMS)].slice(0, 300)) {
    const r = el.getBoundingClientRect();
    if (r.width < 30 || r.width > innerWidth * 0.8 || r.right <= 0 || r.left >= innerWidth) continue;
    if (r.top < h * (1 - PAD) || r.top >= innerHeight - 4) continue; // no room for his head / offscreen
    out.push({ el, l: r.left, r: r.right, top: r.top });
  }
  return out;
}

// A short ring buffer of what he's been doing, for Alt+Shift+R's report.
const events = [];
const note = (msg) => {
  events.push(`${(performance.now() / 1000).toFixed(1)}s ${msg}`);
  if (events.length > 60) events.shift();
};

// --- movement ---------------------------------------------------------------
// Web Animations on the root's transform: compositor-driven, nothing per frame.
// Flat = walk. Sideways/upward = jump arc. Straight down = fall with gravity.
let anim;

function moveTo(nx, ny, done, speed = WALK_PX_S) {
  if (held) return;
  stopMove();
  const x0 = x;
  const y0 = y;
  place(nx, ny);
  const dx = x - x0;
  const dy = y - y0;
  const dist = Math.hypot(dx, dy);
  if (dist < 4) return done?.();

  const { h } = size();
  const t = (px, py) => `translate3d(${px}px,${py}px,0)`;
  let frames, ms, pose;
  if (Math.abs(dy) < 3) {
    frames = [{ transform: t(x0, y0) }, { transform: t(x, y) }];
    ms = (dist / speed) * 1000;
    pose = "walk";
  } else if (dy > h * 0.8 && Math.abs(dx) <= 8) {
    // a real drop only: a step down (the next icon, the next row) is a hop below, not a fall
    frames = [{ transform: t(x0, y0), easing: "ease-in" }, { transform: t(x, y) }];
    ms = Math.sqrt((2 * dy) / GRAVITY) * 1000;
    pose = "wave"; // flailing
  } else {
    const peak = Math.min(y0, y) - h * 0.4;
    frames = [
      { transform: t(x0, y0), easing: "ease-out" },
      { transform: t((x0 + x) / 2, peak), easing: "ease-in" },
      { transform: t(x, y) },
    ];
    ms = 450 + dist / 2;
    pose = "walk";
  }

  note(`${pose} ${Math.round(x0)},${Math.round(y0)} -> ${Math.round(x)},${Math.round(y)} in ${Math.round(ms)}ms`);
  if (Math.abs(dx) > 4) sprite.style.setProperty("--flip", dx < 0 ? -1 : 1);
  walking = true;
  setState(pose);
  anim = root.animate(frames, { duration: ms });
  anim.onfinish = () => {
    anim = null;
    walking = false;
    settle();
    done?.();
  };
}

/** Freeze where he visibly is; the finished-callback is dropped with the animation. */
function stopMove() {
  if (!anim) return;
  const r = root.getBoundingClientRect();
  note(`interrupted at ${Math.round(r.left)},${Math.round(r.top)}`);
  anim.onfinish = null;
  anim.cancel();
  anim = null;
  walking = false;
  place(r.left, r.top);
  settle();
}
const stopWalk = stopMove;

/**
 * Every platform under his feet, best first. Judged by his center, with slack so a wide body on a
 * narrow icon still counts. The slack makes neighbours overlap, so the one his center is truly
 * over comes first, then the highest.
 */
function supporting(ps) {
  const { w, h } = size();
  const fx = x + w / 2;
  const feet = y + h * (1 - PAD);
  const over = (p) => (p.l <= fx && fx <= p.r ? 0 : 1);
  // what his feet are actually on comes first: at a screen edge the SIDE clamp pushes his center past a
  // narrow icon, and "center is over it" alone would pick a wide bar far below (he'd ping-pong between them)
  const at = (p) => (Math.abs(p.top - feet) <= 8 ? 0 : 1);
  return ps
    .filter((p) => p.l - w * 0.3 <= fx && fx <= p.r + w * 0.3 && p.top >= feet - 6)
    .sort((a, b) => at(a) - at(b) || over(a) - over(b) || a.top - b.top);
}
const standingOn = (ps = platforms()) => supporting(ps)[0];

/**
 * Gravity: if nothing is under his feet, drop to whatever is. Forgiving on purpose:
 * "supported" allows a few px either way, and being unsupported has to last a moment
 * before he falls, because Discord re-renders and briefly moves or drops elements.
 * `now` skips the wait (he was just dropped, or the layout just scrolled).
 */
let unsupportedSince = 0;
function ground(now) {
  if (!root || walking || held) return;
  const { w, h } = size();
  const ps = platforms();
  const hit = covering(ps);
  if (hit) return stepOut(hit);
  const fx = x + w / 2;
  const feet = y + h * (1 - PAD);
  const covers = (p) => p.l - w * 0.3 <= fx && fx <= p.r + w * 0.3;

  if (ps.some((p) => covers(p) && Math.abs(p.top - feet) <= 8)) return void (unsupportedSince = 0);

  const t = performance.now();
  if (!unsupportedSince) unsupportedSince = t;
  if (!now && t - unsupportedSince < 400) return;
  unsupportedSince = 0;

  const under = ps.filter(covers).filter((p) => p.top >= feet - 6).sort((a, b) => a.top - b.top)[0];
  note(`FELL from ${Math.round(x)},${Math.round(y)}: nothing within 8px of feet ${Math.round(feet)}`);
  console.log("[buddy] falling: nothing under feet", {
    center: Math.round(fx),
    feet: Math.round(feet),
    to: under && Math.round(under.top),
    nearby: ps.filter(covers).map((p) => [Math.round(p.top), p.el?.className.slice(0, 40) ?? "window"]),
  });
  moveTo(x, standY(under.top));
}

// --- pathfinding ------------------------------------------------------------
// The window is his level: platforms are nodes; an edge means "walk to a launch
// point on A, hop to B" (at most HOP_X sideways, HOP_UP up; any drop, gravity
// handles it). Dijkstra finds the cheapest route, and he only ever executes ONE
// segment (walk, then a short hop) before re-planning from where he landed, so
// scrolling, dragging or a re-render mid-route just changes the next plan.
/**
 * Get to `goal` = { el, frac }: the platform for `el` (null = window bottom) and
 * how far along it (0..1) to stand. Calls done(reached) when finished or stuck.
 */
function go(goal, done, budget = 80) {
  if (!root) return;
  if (held) return done?.(false);
  const { w, h } = size();
  const ps = platforms();
  const gi = ps.findIndex((p) => p.el === goal.el);
  // if the goal is one of the platforms under him he's already there (without this he ping-pongs
  // between two overlapping neighbours, each time deciding he's on the other one)
  const sup = supporting(ps);
  const start = sup.find((p) => p.el === goal.el) ?? sup[0];
  const c = x + w / 2;

  if (gi < 0 || !start || !budget) {
    note("can't path: goal gone or out of steps");
    console.log("[buddy] can't path: goal gone or out of steps");
    return done?.(false);
  }

  const [gl, gr] = range(ps[gi], w);
  const gc = gl + goal.frac * (gr - gl);
  const si = ps.indexOf(start);

  if (si === gi) return Math.abs(gc - c) < 4 ? done?.(true) : moveTo(gc - w / 2, y, () => done?.(true));

  const step = plan(ps, si, c, gi, w, h);
  if (!step) {
    note("can't path: no route");
    console.log("[buddy] can't path: no route");
    return done?.(false);
  }
  const hop = () => moveTo(step.land - w / 2, standY(step.to.top), () => go(goal, done, budget - 1));
  if (Math.abs(step.launch - c) < 4) hop();
  else moveTo(step.launch - w / 2, y, hop);
}

/** Where along its platform he's standing, as a goal he can path back to later. */
function here() {
  const { w } = size();
  const p = standingOn();
  if (!p) return { el: null, frac: 0.5 };
  const [lo, hi] = range(p, w);
  return { el: p.el, frac: hi > lo ? clamp((x + w / 2 - lo) / (hi - lo), 0, 1) : 0.5 };
}

/** Path up to `el`, stand on it, point at it, say `text`, then path back. Just talks if he can't get there. */
export function ping(text, el) {
  if (!root) return;
  clearTimeout(homeT);
  prefetch(text); // loads while he walks over
  const home = here();
  go({ el, frac: 0.85 }, (reached) => {
    if (reached) sprite.style.setProperty("--flip", -1); // the row is to his left
    say(text, {
      pose: reached ? "point" : "talk",
      then: () => reached && (homeT = setTimeout(() => go(home, ground), 1200)),
    });
  });
}

// He's an overlay, so he sits on top of whatever you're trying to click. Rest the
// cursor on him without pressing and he steps aside; press quickly and he's yours.
function dodge(e) {
  const p = standingOn();
  if (!p) return;
  const { w } = size();
  const lo = p.l - w * 0.8; // his center may hang 0.3w past an edge, same slack as standingOn
  const hi = p.r + w * 0.3 - w / 2;
  const dir = e.clientX < x + w / 2 ? 1 : -1;
  const step = (d) => Math.min(Math.max(x + d * (w + 16), lo), hi);
  const nx = Math.abs(step(dir) - x) >= Math.abs(step(-dir) - x) ? step(dir) : step(-dir);
  if (Math.abs(nx - x) < w * 0.4) return; // nowhere to go on this platform: stay put rather than fall
  moveTo(nx, y);
}

// --- watching you type --------------------------------------------------------
// Click into the message box and he walks to it, stands just left of the text
// caret, and his pupils slide along with it as you type (see look()).
const BOX = '[role="textbox"]';
let watching; // the textbox being typed in
let watchTick;

// ponytail: an empty box gives no caret rect, so fall back to its left edge
function caretPoint(box) {
  const s = getSelection();
  const r = s?.rangeCount && box.contains(s.anchorNode) ? s.getRangeAt(0).getClientRects()[0] : null;
  if (r) return { x: r.left, y: r.top + r.height / 2 };
  const b = box.getBoundingClientRect();
  return { x: b.left + 16, y: b.top + b.height / 2 };
}

/** True only while he's actually standing on the box he's watching, not merely while it has focus. */
function onBox() {
  if (!watching?.isConnected) return false;
  const { w, h } = size();
  const r = watching.getBoundingClientRect();
  const fx = x + w / 2;
  return fx >= r.left - w * 0.3 && fx <= r.right + w * 0.3 && Math.abs(r.top - (y + h * (1 - PAD))) <= 8;
}

/** Slide the pupils toward the caret. Cheap, so it runs on every caret move; the CSS transition smooths it. */
function look() {
  if (state !== "watch" || !watching?.isConnected) return;
  const { w, h } = size();
  const c = caretPoint(watching);
  const reach = (w * EYES.reach) / FW;
  const dx = c.x - (x + w / 2);
  const dy = c.y - (y + (h * EYES.y) / FH);
  sprite.style.setProperty("--lx", clamp(dx / (w * 1.5), -1, 1) * reach + "px");
  sprite.style.setProperty("--ly", clamp(dy / h, -1, 1) * reach + "px");
}

function faceCaret() {
  if (!watching?.isConnected) return (watching = null);
  if (held || speaking) return;
  activity();
  const { w } = size();
  const cx = caretPoint(watching).x;
  if (!walking) {
    sprite.style.setProperty("--flip", 1);
    settle(); // watch pose if he's on the box, otherwise whatever he was doing
    look();
  }
  const p = platforms().find((p) => p.el === watching);
  if (!p || walking || Math.abs(cx - w * 0.8 - (x + w / 2)) < w * 0.6) return;
  const [lo, hi] = range(p, w);
  go({ el: watching, frac: hi > lo ? clamp((cx - w * 0.8 - lo) / (hi - lo), 0, 1) : 0.5 }, settle);
}

const onFocusIn = (e) => {
  const box = store.watch && e.target instanceof Element && e.target.closest(BOX);
  if (!box) return;
  watching = box;
  fired.clear();
  clearTimeout(homeT);
  faceCaret();
};
const onFocusOut = (e) => {
  if (!(e.target instanceof Element) || e.target.closest(BOX) !== watching) return;
  watching = null;
  settle();
};
const onCaret = () => {
  look();
  typing();
  if (watching && !watchTick) watchTick = setTimeout(() => ((watchTick = 0), faceCaret()), 250);
};

/** One wander: wake up, pick a nearby platform, path there. */
export function wanderNow() {
  if (!root || speaking || walking || watching) return;
  activity(); // strolling wakes him (and he only dozes off again if wandering is off)
  const { w, h } = size();
  const ps = platforms();
  // nearby only: a wander is a stroll, not an expedition
  const near = ps.filter((p) => Math.hypot((p.l + p.r) / 2 - (x + w / 2), p.top - (y + h)) < 700);
  const p = rand(near.length ? near : ps);
  console.log("[buddy] wander:", ps.length, "platforms,", near.length, "near");
  go({ el: p.el, frac: Math.random() });
}

function armWander() {
  clearTimeout(wanderT);
  if (!store.wander) return;
  wanderT = setTimeout(() => {
    if (Math.random() < 0.2) stunt();
    else wanderNow();
    armWander();
  }, 10_000 + Math.random() * 15_000);
}

/** Settings-panel test: run the friend-ping routine against the first DM row on screen. */
export function testPing() {
  const el = document.querySelector('a[href^="/channels/@me/"]');
  console.log("[buddy] test ping; DM row:", el, "platforms:", platforms().length);
  ping("Testing! This is where a friend's message would show up.", el);
}

// Gravity check: on a timer, and shortly after anything scrolls out from under him.
let gravDebounce;
const onScroll = () => {
  clearTimeout(gravDebounce);
  gravDebounce = setTimeout(() => !speaking && ground(true), 200);
};

function drag(e) {
  if (e.button) return; // right/middle click must not interrupt him
  clearTimeout(dodgeT);
  clearTimeout(homeT);
  stopWalk();
  held = true;
  sprite.setPointerCapture(e.pointerId);
  const sx = e.clientX;
  const sy = e.clientY;
  const ox = sx - x;
  const oy = sy - y;
  let moved = false;

  sprite.onpointermove = (m) => {
    if (!moved && Math.hypot(m.clientX - sx, m.clientY - sy) < 4) return;
    moved = true;
    place(m.clientX - ox, m.clientY - oy);
  };
  sprite.onpointerup = sprite.onpointercancel = () => {
    held = false;
    sprite.onpointermove = sprite.onpointerup = sprite.onpointercancel = null;
    if (moved) {
      store.pos = { x, y }; // top-level write, or it doesn't persist
      ground(true); // let go mid-air and he falls
    } else say(rand(TIPS));
  };
}

const onResize = () => root && place(x, y);

function armChatter() {
  clearTimeout(chatT);
  if (store.chatter) {
    chatT = setTimeout(() => {
      // one in four is a fake dialog box instead
      if (!speaking) {
        const r = Math.random();
        r < 0.1 ? offerSong() : r < 0.3 ? ask(...rand(DIALOGS)) : say(takeLine());
      }
      armChatter();
    }, store.chatter * 60_000);
  }
}

/** Re-read size and chatter settings. Called from the settings panel. */
export function apply() {
  if (!root) return;
  const { w, h } = size();
  root.style.setProperty("--w", w + "px");
  root.style.setProperty("--h", h + "px");
  sprite.style.backgroundSize = `${w * FRAMES}px ${h * Object.keys(STATES).length}px`;
  place(x, y);
  sprite.style.filter = store.hue ? `hue-rotate(${store.hue}deg)` : "";
  hat.textContent = store.hat ?? "";
  armChatter();
  armWander();
}

export function resetPosition() {
  if (!root) return;
  const { w, h } = size();
  store.pos = undefined;
  place(innerWidth - w - 24, innerHeight);
  ground();
}

/** Swap in the saved (or placeholder) sheet without reloading the plugin. */
export async function reloadSheet() {
  const src = await loadSheet();
  if (sprite) sprite.style.backgroundImage = `url(${src})`;
}

// Alt+Shift+D: draw every platform he can stand on (green = the one he's on), and
// log what each one is, so "he's not walking on the right things" can be seen.
let dbg, dbgT;
function toggleDebug() {
  if (dbg) {
    clearInterval(dbgT);
    dbg.remove();
    dbg = null;
    return;
  }
  dbg = document.createElement("div");
  dbg.className = "bd-debug";
  document.body.append(dbg);
  const draw = () => {
    const ps = platforms();
    const me = standingOn(ps);
    dbg.replaceChildren(
      ...ps.map((p) => {
        const d = document.createElement("div");
        d.className = p === me ? "bd-plat me" : "bd-plat";
        d.style.cssText = `left:${p.l}px;top:${Math.min(p.top, innerHeight - 2)}px;width:${p.r - p.l}px`;
        return d;
      }),
    );
  };
  draw();
  dbgT = setInterval(draw, 400);
  console.log("[buddy] platforms:", platforms().map((p) => p.el?.className.slice(0, 60) ?? "(window bottom)"));
}

// Alt+Shift+R: copy everything needed to diagnose him (state, every platform he can
// see, his recent moves) to the clipboard.
async function report() {
  const { h } = size();
  const ps = platforms();
  const text = JSON.stringify(
    {
      viewport: [innerWidth, innerHeight, devicePixelRatio],
      scale: store.scale,
      at: [Math.round(x), Math.round(y)],
      feet: Math.round(y + h * (1 - PAD)),
      walking,
      speaking,
      standingOn: standingOn(ps)?.el?.className.slice(0, 60) ?? "window",
      platforms: ps.map((p) => ({
        top: Math.round(p.top),
        l: Math.round(p.l),
        r: Math.round(p.r),
        el: p.el?.className.slice(0, 50) ?? "window",
      })),
      events,
    },
    null,
    1,
  );
  try {
    await navigator.clipboard.writeText(text);
    showToast({ title: "Buddy", content: "Report copied to the clipboard.", duration: 4000 });
  } catch {
    console.log("[buddy] report", text);
  }
}

// TEMPORARY, for recording: an enhanced streamer mode. Blurs message text, names and
// avatars (chat, member list, DM list, user panel) and leaves the send box alone.
const BLUR = [
  '[data-list-id="chat-messages"]',
  '[class*="members_"] [class*="member_"]',
  '[data-list-item-id^="private-channels"]',
  '[class*="panels_"]',
  '[class*="avatar"]',
  '[class*="username"]',
  '[class*="nameTag"]',
].join(",");
let blurCss;
function toggleBlur() {
  if (blurCss) return blurCss = void blurCss.remove();
  blurCss = document.createElement("style");
  blurCss.textContent = `${BLUR} { filter: blur(10px); }`;
  document.head.append(blurCss);
}

// Hotkeys, so testing doesn't mean digging through settings. e.code, not e.key:
// Alt+Shift changes what e.key reports on some layouts.
const onKey = (e) => {
  if (!e.altKey || !e.shiftKey || e.ctrlKey || e.metaKey) return;
  const act = { KeyW: wanderNow, KeyP: testPing, KeyD: toggleDebug, KeyR: report, KeyS: stunt, KeyG: greet, KeyK: offerSong, KeyB: toggleBlur }[e.code];
  if (!act) return;
  e.preventDefault();
  act();
};

// --- antics -----------------------------------------------------------------

let lastAntic = 0;
/** Gate for anything he says unprompted: the setting, not mid-sentence, at most one a minute. */
export function antic(force) {
  // `force`: he's reacting to something you just did, so the one-a-minute limit and "mid-sentence" don't apply
  if (!store.antics || !root || (!force && (speaking || performance.now() - lastAntic < 60_000))) return false;
  lastAntic = performance.now();
  return true;
}

/** Walk to the middle of the window bottom (for a dramatic announcement). */
export const goCenter = (then) => go({ el: null, frac: 0.5 }, then);

/** Say `text`, then show buttons: [[label, reply], ...]. Whatever you press, he has something to say. */
export function ask(text, options) {
  if (!root || speaking) return;
  say(text, {
    then: () => {
      clearTimeout(hideT);
      const row = document.createElement("div");
      row.className = "bd-opts";
      for (const [label, reply] of options) {
        const b = document.createElement("button");
        b.textContent = label;
        b.onclick = () => {
          clearTimeout(hideT);
          bubble.classList.remove("on", "ask");
          typeof reply === "function" ? reply() : say(reply);
        };
        row.append(b);
      }
      bubble.append(row);
      bubble.classList.add("ask", "on");
      hideT = setTimeout(() => bubble?.classList.remove("on", "ask"), 20_000);
    },
  });
}

/** Sing `song` (a baked DECtalk clip) with the lyrics in the bubble. */
const sing = (song) => say(`Here is ${song.title}.`, { sing: SONG_CLIPS[song.title] });

/** Offer the songbook as a fake dialog. */
function offerSong() {
  ask("I know a few songs. Would you like to hear one?", [
    ...SONGS.map((s) => [s.title, () => sing(s)]),
    ["No", "Fine. I'll sing it in my head. Very loudly."],
  ]);
}

// Three dots over his mouth while he's busy: searching, or waiting on a live voice clip.
let searching = false;
let loading = false;
let dotsEl;
function syncDots() {
  if ((searching || loading) && sprite) {
    if (dotsEl?.isConnected) return;
    dotsEl = document.createElement("span");
    dotsEl.className = "bd-dots";
    dotsEl.append(...[0, 1, 2].map(() => document.createElement("i")));
    sprite.append(dotsEl);
  } else {
    dotsEl?.remove();
    dotsEl = null;
  }
}

/** A highlighted selection: one word gets a choice of dictionary or general search; anything else just searches. */
export function pick(q) {
  if (!/^[\p{L}][\p{L}'-]*$/u.test(q)) return lookup(q);
  ask(DICT.q, [["Dictionary", () => lookup(q, define)], ["General", () => lookup(q)]]);
}

/** Search the web for `q` and answer in the bubble: a snippet, a GIF, or why not. */
export async function lookup(q, find = search) {
  if (!root) return;
  say(SEARCH.working, { pose: "think" });
  searching = true;
  syncDots();
  let r;
  try {
    r = await find(q);
  } catch (e) {
    console.warn("[buddy] search failed", e);
    r = { kind: "fail" };
  }
  searching = false;
  syncDots(); // say() below keeps them up while its voice clip loads
  if (r.kind !== "ok") return say(SEARCH[r.kind]);
  say(r.text ?? SEARCH.gif, { img: r.img });
}

// What he notices while you type, once each per time you click into the box.
const fired = new Set();
let lastTyped = 0;

function typing() {
  if (!watching?.isConnected) return;
  const t = watching.textContent.trim();
  if (!t) fired.clear(); // the box is empty again (you sent it): the next message can trigger him afresh

  // A question with no topic of its own ("what is this?", "who?") is about what was just said; for "who" with
  // no name above, it's about the person you're talking to (answered locally, no search).
  const isQ = /\?$/.test(t) && t.length >= 8;
  const isWho = /\bwho\b/i.test(t);
  let query = t;
  let who = "";
  if (isQ && !hasTopic(t)) {
    query = topicAbove(isWho);
    if (!query && isWho) who = whoElse();
  }

  const hit =
    t.length > 200
      ? "long"
      : /^(hi+|hey+|hello|yo|sup|howdy|heya|hiya)\b/i.test(t) && t.length < 30
        ? "hi"
        : isQ && (query || who)
          ? "q"
          : null;
  // once per message per kind, at most one reaction every 20s, never over himself; the setting still applies
  if (!hit || fired.has(hit) || speaking || performance.now() - lastTyped < 20_000 || !antic(true)) return;
  lastTyped = performance.now();
  fired.add(hit);
  if (hit === "long") say(TYPING.long);
  else if (hit === "hi") say(TYPING.hi);
  else if (who) say(who);
  else {
    // the button shows what he'll look up when it came from above rather than from you
    const [q, [[yes, yesSay], no]] = TYPING.q;
    const label = query === t ? yes : `${yes}: "${query.slice(0, 24)}"`;
    ask(q, [[label, () => say(yesSay, { then: () => lookup(query) })], no]);
  }
}

// Stunts: a dash to the far end of whatever he's standing on and back, or a backflip on the spot.
function sprint() {
  const p = standingOn();
  const { w } = size();
  if (!p) return flip();
  const [lo, hi] = range(p, w);
  if (hi - lo < w * 0.5) return flip(); // no room to run
  const x0 = x;
  const far = x + w / 2 - lo > hi - (x + w / 2) ? lo : hi;
  moveTo(far - w / 2, y, () => moveTo(x0, y, null, 800), 800);
}

function flip() {
  const { h } = size();
  const t = (py, r) => `translate3d(${x}px,${py}px,0) rotate(${r}deg)`;
  walking = true;
  setState("wave");
  anim = root.animate(
    [{ transform: t(y, 0), easing: "ease-out" }, { transform: t(y - h * 0.7, 180), easing: "ease-in" }, { transform: t(y, 360) }],
    { duration: 800 },
  );
  anim.onfinish = () => {
    anim = null;
    walking = false;
    settle();
  };
}

export function stunt() {
  if (!root || speaking || walking || held || watching) return;
  activity();
  note("stunt");
  rand([sprint, flip])();
}

// --- lifecycle --------------------------------------------------------------

export async function start() {
  console.log("[buddy] starting");
  dead = false;
  scoped.ui.injectCss(css); // cleaned up by shelter on unload

  root = (
    <div class="bd-root" popover="manual">
      <div class="bd-bubble" role="status" aria-live="polite" />
      <div class="bd-sprite" role="img" aria-label="Buddy" style={`--n:${FRAMES}`} />
    </div>
  );
  bubble = root.firstChild;
  sprite = root.lastChild;
  hat = document.createElement("span");
  hat.className = "bd-hat";
  root.append(hat); // a sibling of the sprite, so the hue shift doesn't tint it
  const eyes = makeEyes();
  eyes.className = "bd-eyes";
  sprite.append(eyes);
  sprite.addEventListener("pointerdown", drag);
  sprite.addEventListener("pointerenter", (e) => {
    if (!store.dodge || walking) return;
    clearTimeout(dodgeT);
    dodgeT = setTimeout(() => dodge(e), 250);
  });
  sprite.addEventListener("pointerleave", () => clearTimeout(dodgeT));
  sprite.addEventListener("animationend", () => STATES[state].once && settle());

  const src = await loadSheet().catch((e) => console.error("[buddy] sheet failed", e));
  if (dead || !src) return;

  sprite.style.backgroundImage = `url(${src})`;
  document.body.append(root);
  // Popover = the browser's top layer, above every z-index (voice windows, popouts).
  // Older engines ignore it and fall back to the big z-index in the CSS.
  root.showPopover?.();

  const { w, h } = size();
  ({ x, y } = store.pos ?? { x: innerWidth - w - 24, y: innerHeight });
  addEventListener("resize", onResize);
  addEventListener("focusin", onFocusIn, true);
  addEventListener("focusout", onFocusOut, true);
  document.addEventListener("selectionchange", onCaret);
  addEventListener("keydown", onKey, true);
  addEventListener("scroll", onScroll, { capture: true, passive: true });
  gravT = setInterval(() => !speaking && !document.hidden && ground(), 500);
  apply();
  setState("idle");
  root.classList.add("ready");
  activity();

  ground();
  console.log("[buddy] ready");
  takeLine();
  // the intro is for the very first run only; Alt+Shift+G plays it again
  // shelter wipes plugin storage on update/reinstall/dev mode, so the flag also lives in localStorage
  if (!store.greeted && !localStorage.getItem("buddy-greeted")) greet(1200);
  store.greeted = true;
  localStorage.setItem("buddy-greeted", "1");
}

/** The three-line intro, in order. */
function greet(delay = 300) {
  clearTimeout(greetT);
  const intro = (n) => {
    setState("wave");
    say(GREETINGS[n], { then: () => GREETINGS[n + 1] && (greetT = setTimeout(() => intro(n + 1), 700)) });
  };
  greetT = setTimeout(() => intro(0), delay);
}

export function stop() {
  dead = true;
  held = false;
  synth?.cancel();
  if (utt instanceof Audio) utt.pause();
  [hideT, watchT, sleepT, chatT, greetT, homeT, wanderT, dodgeT, gravDebounce].forEach(clearTimeout);
  clearInterval(gravT);
  if (dbg) toggleDebug();
  if (blurCss) toggleBlur();
  anim?.cancel();
  anim = null;
  removeEventListener("resize", onResize);
  removeEventListener("focusin", onFocusIn, true);
  removeEventListener("focusout", onFocusOut, true);
  document.removeEventListener("selectionchange", onCaret);
  clearTimeout(watchTick);
  watchTick = 0;
  watching = null;
  removeEventListener("keydown", onKey, true);
  removeEventListener("scroll", onScroll, { capture: true });
  searching = loading = false;
  root?.remove();
  cache.clear();
  queued = undefined;
  root = sprite = bubble = hat = utt = null;
  speaking = asleep = walking = false;
}
