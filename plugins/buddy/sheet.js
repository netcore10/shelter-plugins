// Sprite sheet: FRAMES columns, one row per key of STATES (in order), FW x FH px per frame.
export const FW = 64;
export const FH = 48;
export const FRAMES = 4;

// Raster density of the generated sheet: every frame is FW*RES x FH*RES real pixels (CSS scales it down).
const RES = 4;

// Where the feet touch, as a fraction of the frame height below them (transparent
// padding under the feet). Match this to your art or he'll float or sink.
export const FEET = 2 / 48;

// Empty margin on each side of the body, as a fraction of the frame width. He may
// walk until his BODY (not the frame) meets the window edge. Match this to your art.
export const SIDE = 2 / 64;

export const STATES = {
  idle: { row: 0, fps: 3 },
  talk: { row: 1, fps: 8 },
  think: { row: 2, fps: 3 },
  wave: { row: 3, fps: 6, once: true },
  sleep: { row: 4, fps: 2 },
  walk: { row: 5, fps: 8 },
  point: { row: 6, fps: 6 },
  // A still of the face with EMPTY eyes (whites only). While he watches you type, the buddy
  // lays real pupils over them and slides them along with the text caret.
  watch: { row: 7, fps: 1, hold: true },
};

import ART, { PARTS } from "./wumpus";

// Wumpus is 196x140; scaled to fit the frame with his feet 2px above the bottom edge.
const K = 60 / 196; // art units -> frame px
const OX = 2;
const OY = 46 - 140 * K;

// His eyes are big black dots on the sides of his head. EYES: their height in the frame, how far
// (frame px) they may slide while he watches you type, and their colour. The watch row must
// leave the eyes out: the buddy lays makeEyes() over it.
// Eye centres in the art's own units:
const EYE_C = [[49.5, 71.5], [162, 71.5]];
const MOUTH_C = [108.5, 123];
const RAW = [386.812322, 76.889335]; // the SVG's own offset
export const EYES = { y: OY + 71.5 * K, reach: 2, color: "#000" };

let art;
const artImage = () =>
  (art ??= new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(ART);
  }));

// How the one drawing is posed in each state and frame: dy lift, rot degrees (about his feet),
// sy squash, shut eyes, lx/ly where the eyes look.
const POSES = {
  idle: (f) => ({ dy: [0, -1, 0, -1][f], shut: f === 3 }),
  talk: (f) => ({ sy: [1, 0.96, 1, 0.96][f], mouth: [1, 2.6, 1, 2.6][f] }),
  think: () => ({ rot: -4, lx: -1, ly: -1.2 }),
  wave: (f) => ({ rot: [-5, 5, -5, 5][f], dy: [0, -3, 0, -3][f] }),
  sleep: (f) => ({ dy: [0, 1, 2, 1][f], shut: true }),
  walk: (f) => ({ rot: [-3, 0, 3, 0][f], dy: [0, -2, 0, -2][f] }),
  point: (f) => ({ rot: [5, 6, 5, 6][f], lx: 1.5 }),
  watch: () => ({ noEyes: true }),
};

// One of the SVG's own parts, moved by (dx, dy) frame px and squashed by sy about its centre.
function part(g, d, [cx, cy], dx, dy, sy) {
  g.save();
  g.translate(OX, OY);
  g.scale(K, K);
  g.translate(cx + dx / K, cy + dy / K);
  g.scale(1, sy);
  g.translate(-cx - RAW[0], -cy - RAW[1]);
  g.fillStyle = EYES.color;
  g.fill(new Path2D(d));
  g.restore();
}

/** Both eyes alone, at rest, rasterised exactly like a sheet frame. The buddy slides this over the watch row. */
export function makeEyes() {
  const c = document.createElement("canvas");
  c.width = FW * RES;
  c.height = FH * RES;
  const g = c.getContext("2d");
  g.scale(RES, RES);
  part(g, PARTS.eyeL, EYE_C[0], 0, 0, 1);
  part(g, PARTS.eyeR, EYE_C[1], 0, 0, 1);
  return c;
}

function draw(g, img, name, f, ox, oy) {
  const p = POSES[name](f);
  g.save();
  g.beginPath();
  g.rect(ox, oy, FW, FH);
  g.clip(); // a tilted frame must not bleed into its neighbour
  g.translate(ox + FW / 2, oy + 46); // pivot: his feet
  g.rotate(((p.rot ?? 0) * Math.PI) / 180);
  g.scale(1, p.sy ?? 1);
  g.translate(-FW / 2, -46 + (p.dy ?? 0));
  g.drawImage(img, OX, OY, 196 * K, 140 * K);

  // eyes and mouth: the SVG's own shapes, moved / squashed about their centres
  if (!p.noEyes) {
    part(g, PARTS.eyeL, EYE_C[0], p.lx ?? 0, p.ly ?? 0, p.shut ? 0.12 : 1);
    part(g, PARTS.eyeR, EYE_C[1], p.lx ?? 0, p.ly ?? 0, p.shut ? 0.12 : 1);
  }
  part(g, PARTS.mouth, MOUTH_C, 0, 0, p.mouth ?? 1);
  if (name === "sleep") {
    g.fillStyle = "#fff";
    g.font = "bold 8px sans-serif";
    g.globalAlpha = 0.4 + f * 0.2;
    g.fillText("z", 48, 12 - f * 2);
  }
  g.restore();
}

async function placeholder() {
  const img = await artImage();
  const names = Object.keys(STATES);
  const c = document.createElement("canvas");
  c.width = FW * FRAMES * RES;
  c.height = FH * names.length * RES;
  const g = c.getContext("2d");
  g.scale(RES, RES);
  names.forEach((name, row) => {
    for (let f = 0; f < FRAMES; f++) draw(g, img, name, f, f * FW, row * FH);
  });
  return c.toDataURL("image/webp", 1); // quality 1 = lossless in Chromium; smaller than PNG
}

// --- persistence ------------------------------------------------------------
// The user's sheet lives in our own IndexedDB: shelter wipes plugin storage on
// update and when dev mode ends, and art shouldn't go with it.

const idb = (mode, fn) =>
  new Promise((res, rej) => {
    const o = indexedDB.open("buddy", 1);
    o.onupgradeneeded = () => o.result.createObjectStore("kv");
    o.onerror = () => rej(o.error);
    o.onsuccess = () => {
      const r = fn(o.result.transaction("kv", mode).objectStore("kv"));
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    };
  });

// Raced against a timeout: if IndexedDB never answers he must still appear (with the placeholder).
const saved = () =>
  Promise.race([idb("readonly", (s) => s.get("sheet")), new Promise((r) => setTimeout(r, 1500))]).catch(() => null);

async function decode(src) {
  const img = new Image();
  img.src = src;
  await img.decode();
  return img;
}

const fits = (img) => img.width % FRAMES === 0 && img.height * FW * FRAMES === img.width * FH * Object.keys(STATES).length;

/** The sheet in use: the user's, else the placeholder. Decoded up front so frame 1 never pops in. */
export async function loadSheet() {
  const src = await saved();
  try {
    // a sheet saved before a row was added has the wrong height: use the placeholder, keep the save
    if (src) {
      const img = await decode(src);
      if (fits(img)) return src;
    }
  } catch {} // corrupt save: fall through to the placeholder
  const ph = await placeholder();
  await decode(ph);
  return ph;
}

/** Download the current sheet as a WebP to edit in any pixel editor. */
export async function exportSheet() {
  const a = document.createElement("a");
  a.href = (await saved()) || (await placeholder());
  a.download = "buddy-sheet.webp";
  a.click();
}

/** Validate, save and return a user's PNG/WebP sheet. Throws a readable Error if the layout is wrong. */
export async function importSheet(file) {
  const src = await new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = () => rej(r.error);
    r.readAsDataURL(file);
  });
  const img = await decode(src).catch(() => {
    throw new Error("That isn't an image the browser can read.");
  });
  const rows = Object.keys(STATES).length;
  if (!fits(img))
    throw new Error(`Need ${FRAMES} columns x ${rows} rows of ${FW}x${FH} frames (e.g. ${FW * FRAMES}x${FH * rows}). This is ${img.width}x${img.height}.`);
  await idb("readwrite", (s) => s.put(src, "sheet"));
  return src;
}

export const resetSheet = () => idb("readwrite", (s) => s.delete("sheet"));
