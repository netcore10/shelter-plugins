// Animation and font options offered by the tag styler.
//
// Keyframes themselves live in styles.js so they're injected once; this file is
// just the menu of what's available, kept separate so adding an effect is a
// two-line change in each place rather than a hunt through the UI code.
//
// Animations come in two independent tracks so you can animate the colour
// without the tag moving, or move it without cycling the colour, or both:
//
//   motion   -> transform / opacity   (breathe, wiggle, float, shake, pulse)
//   colour   -> filter / background   (rainbow, glow, shimmer, flow)
//
// They're kept apart on purpose: everything in `motion` animates a property
// that nothing in `colour` touches, so the two can run at once without one
// overriding the other. Two effects from the same track WOULD collide, which is
// why each track is single-select.

export const MOTIONS = [
  { id: "none", label: "None" },
  { id: "breathe", label: "Breathe", note: "Gentle scale in and out" },
  { id: "wiggle", label: "Wiggle", note: "Rocks side to side" },
  { id: "float", label: "Float", note: "Bobs up and down" },
  { id: "shake", label: "Shake", note: "Fast nervous jitter" },
  { id: "pulse", label: "Pulse", note: "Fades in and out" },
];

export const COLOR_ANIMS = [
  { id: "none", label: "None" },
  { id: "rainbow", label: "Rainbow", note: "Cycles the hue" },
  { id: "glow", label: "Glow", note: "Soft halo that swells" },
  { id: "shimmer", label: "Shimmer", note: "Sweeps a highlight across" },
  { id: "flow", label: "Flow", note: "Slides the gradient along — needs a gradient fill" },
];

// Base durations in seconds, divided by that track's speed multiplier.
export const DURATIONS = {
  breathe: 3,
  wiggle: 1.2,
  float: 2.6,
  shake: 0.5,
  pulse: 2.4,
  rainbow: 6,
  glow: 2.6,
  shimmer: 2.8,
  flow: 4,
};

// Maps the old single-animation setting onto the new two-track model.
export const LEGACY_ANIMATION_TRACK = {
  breathe: "motion",
  wiggle: "motion",
  float: "motion",
  shake: "motion",
  pulse: "motion",
  rainbow: "color",
  glow: "color",
  shimmer: "color",
};

// Only families that ship with Discord or the OS — a remote @font-face would be
// blocked by Discord's CSP, so there's no point offering web fonts.
export const FONTS = [
  { id: "", label: "Discord default" },
  { id: "var(--font-display)", label: "Discord display" },
  { id: "var(--font-code)", label: "Monospace" },
  { id: "Georgia, 'Times New Roman', serif", label: "Serif" },
  { id: "'Comic Sans MS', 'Chalkboard SE', cursive", label: "Comic" },
  { id: "'Brush Script MT', cursive", label: "Handwriting" },
  { id: "Impact, Haettenschweiler, sans-serif", label: "Impact" },
  { id: "'Courier New', monospace", label: "Typewriter" },
  { id: "system-ui, sans-serif", label: "System" },
];

export const GRADIENT_PRESETS = [
  { label: "Sunset", colors: ["#FF6B6B", "#FFA36B", "#FFD86B"], angle: 90 },
  { label: "Vaporwave", colors: ["#FF71CE", "#B967FF", "#01CDFE"], angle: 90 },
  { label: "Goth", colors: ["#2B1331", "#7A1FA2", "#E040FB"], angle: 90 },
  { label: "Toxic", colors: ["#00F260", "#0575E6"], angle: 90 },
  { label: "Blood", colors: ["#8E0E00", "#FF4B2B"], angle: 90 },
  { label: "Ocean", colors: ["#2E3192", "#1BFFFF"], angle: 90 },
  { label: "Gold", colors: ["#B78628", "#FCC201", "#B78628"], angle: 90 },
  { label: "Mono", colors: ["#434343", "#000000"], angle: 90 },
];

export const DEFAULT_STYLE = {
  fill: "solid", // "solid" | "gradient"
  color: undefined, // solid fill; falls back to the auto colour for the name
  colors: ["#FF71CE", "#01CDFE"], // gradient stops
  angle: 90,
  text: "auto", // "auto" | "#rrggbb"
  font: "",
  weight: 700,
  italic: false,
  motion: "none",
  motionSpeed: 1,
  colorAnim: "none",
  colorSpeed: 1,
};
