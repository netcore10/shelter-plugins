// Theming
//
// Colours come from Discord's own custom properties, so custom themes restyle
// this panel for free. Two things make that safe:
//
// 1. Every token ends in a hard-coded fallback, and the chain runs newest name
//    first — Discord has renamed these across builds and both generations are
//    still in the wild. var(--a, var(--b, #hex)) picks whichever exists.
//
// 2. The fallbacks themselves are theme-aware, so even a build where none of
//    the variables resolve still looks right in light mode.
//
// The catch worth knowing: var(--x, fallback) only uses the fallback when --x
// is *undefined*. A variable that exists but holds something invalid computes
// to `initial`, which for a background means transparent. So anything that must
// never be see-through sets a hard-coded background-color and layers the themed
// colour over it as a background-image — if the variable is bad the image drops
// to none and the solid colour underneath still paints.
//
// The panel is mounted outside Discord's themed subtree, so ui/Panel.jsx copies
// the .theme-light / .theme-dark class onto our root. That's what puts these
// variables in scope at all.

export default `
.rad-mount, .rad-host { display: contents; }

.rad-root {
  --rad-fb-bg: #111214;
  --rad-fb-text: #f2f3f5;
  --rad-fb-dim: #b5bac1;
  --rad-fb-muted: #949ba4;
  --rad-fb-line: rgba(255, 255, 255, .07);
  --rad-fb-hover: rgba(255, 255, 255, .06);
  --rad-fb-active: rgba(255, 255, 255, .09);
  --rad-fb-track: rgba(255, 255, 255, .12);
  --rad-fb-shadow: rgba(0, 0, 0, .5);
}

.rad-root.theme-light {
  --rad-fb-bg: #fff;
  --rad-fb-text: #14151a;
  --rad-fb-dim: #4e5058;
  --rad-fb-muted: #5c5e66;
  --rad-fb-line: rgba(0, 0, 0, .09);
  --rad-fb-hover: rgba(0, 0, 0, .05);
  --rad-fb-active: rgba(0, 0, 0, .07);
  --rad-fb-track: rgba(0, 0, 0, .12);
  --rad-fb-shadow: rgba(0, 0, 0, .16);
}

.rad-root {
  /* Darkest-first, and the base tokens lead deliberately.
     Measured on a current build: --background-floating and --background-secondary
     both come back EMPTY, and an empty custom property still counts as defined —
     var() takes the empty value rather than the fallback, and the declaration
     goes invalid at computed-value time. They stay in the chain for older builds
     that do define them, but never ahead of a token known to resolve. */
  --rad-bg: var(--background-base-lowest, var(--background-base-lower, var(--background-floating, var(--background-secondary, var(--rad-fb-bg)))));
  --rad-text: var(--text-default, var(--text-normal, var(--rad-fb-text)));
  --rad-dim: var(--text-secondary, var(--interactive-normal, var(--rad-fb-dim)));
  --rad-muted: var(--text-muted, var(--channels-default, var(--rad-fb-muted)));
  --rad-line: var(--border-subtle, var(--background-modifier-accent, var(--rad-fb-line)));
  --rad-hover: var(--background-modifier-hover, var(--rad-fb-hover));
  --rad-active: var(--background-modifier-selected, var(--rad-fb-active));
  --rad-track: var(--background-modifier-accent, var(--rad-fb-track));
}

/* ------------------------------------------------------------------ button */

.rad-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  cursor: pointer;
}

/* Decorative, not a spectrum: the streams send no CORS headers, so Web Audio
   can't see the audio at all. */
.rad-bars {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 13px;
}

.rad-bars i {
  width: 2.5px;
  height: 100%;
  border-radius: 1px;
  background: currentColor;
  transform-origin: bottom;
  animation: rad-bar 900ms ease-in-out infinite;
}

.rad-bars i:nth-child(2) { animation-delay: -300ms; }
.rad-bars i:nth-child(3) { animation-delay: -600ms; }

@keyframes rad-bar {
  0%, 100% { transform: scaleY(.28); }
  50%      { transform: scaleY(1); }
}

@media (prefers-reduced-motion: reduce) {
  .rad-bars i { animation: none; transform: scaleY(.6); }
}

/* ------------------------------------------------------------------- panel */

.rad-panel {
  position: fixed;
  z-index: 3000;
  width: 328px;
  border-radius: 10px;
  overflow: hidden;
  /* Solid colour underneath, themed colour layered on top. A bad theme
     variable kills the image, never the colour, so this can't go transparent. */
  background-color: var(--rad-fb-bg);
  background-image: linear-gradient(var(--rad-bg), var(--rad-bg));
  color: var(--rad-text);
  border: 1px solid var(--rad-line);
  box-shadow: 0 10px 34px var(--rad-fb-shadow);
  font-family: var(--font-primary, "gg sans", sans-serif);
  animation: rad-in 140ms ease-out;
}

@keyframes rad-in {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  .rad-panel { animation: none; }
}

.rad-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--rad-line);
}

.rad-station {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: baseline;
  gap: 6px;
  cursor: pointer;
  background: none;
  border: 0;
  padding: 0;
  color: inherit;
  font: inherit;
  text-align: left;
}

.rad-station-name {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rad-station-group {
  font-size: 11px;
  color: var(--rad-muted);
  white-space: nowrap;
}

.rad-head-btn {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
  color: var(--rad-muted);
}

.rad-head-btn:hover { color: var(--rad-text); }

.rad-station .rad-caret {
  flex: 0 0 auto;
  opacity: .55;
  transition: transform 120ms ease;
}

.rad-station:hover .rad-caret { opacity: 1; }

/* --------------------------------------------------------------- now playing */

.rad-body { padding: 14px 12px 12px; }

.rad-track {
  display: flex;
  gap: 12px;
  align-items: center;
}

.rad-art {
  flex: 0 0 auto;
  width: 72px;
  height: 72px;
  border-radius: 8px;
  object-fit: cover;
  background: var(--rad-hover);
}

.rad-art-blank {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, .3);
}

.rad-meta {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* Two lines, then ellipsis. Track titles get long and a panel that changes
   height every few minutes is distracting. */
.rad-title {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  overflow-wrap: anywhere;
}

.rad-sub, .rad-alt {
  font-size: 12px;
  color: var(--rad-dim);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rad-alt { color: var(--rad-muted); font-size: 11px; }

.rad-tag {
  align-self: flex-start;
  margin-top: 2px;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .02em;
  text-transform: uppercase;
  color: #fff;
}

/* ---------------------------------------------------------------- progress */

.rad-progress { margin: 12px 0 2px; }

.rad-bar {
  height: 4px;
  border-radius: 2px;
  background: var(--rad-track);
  overflow: hidden;
}

/* Matches the 1s tick, so the fill glides instead of stepping. */
.rad-bar span {
  display: block;
  height: 100%;
  border-radius: 2px;
  transition: width 1s linear;
}

.rad-times {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  color: var(--rad-muted);
}

/* ---------------------------------------------------------------- controls */

.rad-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
}

.rad-play {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: 0;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  transition: transform 100ms ease, filter 100ms ease;
}

.rad-play:hover { filter: brightness(1.12); }
.rad-play:active { transform: scale(.93); }

.rad-spinner {
  width: 15px;
  height: 15px;
  border: 2px solid rgba(255, 255, 255, .35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: rad-spin 700ms linear infinite;
}

@keyframes rad-spin { to { transform: rotate(360deg); } }

.rad-volume {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.rad-mute {
  flex: 0 0 auto;
  display: flex;
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
  color: var(--rad-dim);
}

.rad-mute:hover { color: var(--rad-text); }

/* shelter's Slider is built for a settings page: --bar-offset gives it 24px of
   lead-in for tick labels we don't use, making the control 48px tall. */
.rad-volume [class*="scontainer"] {
  --bar-offset: 0px;
  margin: 0 !important;
  flex: 1;
  height: 24px;
}

/* The fill is painted on the track pseudo-elements (::-webkit-slider-runnable-track
   and friends) from var(--blurple-50) — the input's own background is
   transparent, which is why styling it did nothing. Redefining the variable
   here recolours the fill to the station accent: custom properties inherit into
   pseudo-elements, so there's no need to restate the gradient or fight
   specificity. */
.rad-volume input[type="range"] {
  --blurple-50: var(--rad-accent, #ff015b);
}

/* ------------------------------------------------------------------ footer */

.rad-foot {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-top: 1px solid var(--rad-line);
  font-size: 11px;
  color: var(--rad-muted);
}

.rad-foot-text {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rad-dot {
  flex: 0 0 auto;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--rad-muted);
}

/* Status colours are semantic, not decorative — Discord's own green/amber/red
   where the build exposes them. */
.rad-dot[data-status="live"] { background: var(--status-positive, var(--text-positive, #23a55a)); }
.rad-dot[data-status="connecting"] { background: var(--status-warning, var(--text-warning, #f0b232)); animation: rad-blink 1s ease-in-out infinite; }
.rad-dot[data-status="error"] { background: var(--status-danger, var(--text-danger, #f23f43)); }

@keyframes rad-blink { 50% { opacity: .3; } }

@media (prefers-reduced-motion: reduce) {
  .rad-dot[data-status="connecting"] { animation: none; }
}

/* ------------------------------------------------------------ station list */

.rad-list {
  max-height: 340px;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 6px;
}

.rad-list::-webkit-scrollbar { width: 8px; }
.rad-list::-webkit-scrollbar-thumb {
  background: var(--rad-track);
  border-radius: 4px;
}

.rad-group {
  padding: 8px 6px 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .04em;
  text-transform: uppercase;
  color: var(--rad-muted);
}

.rad-item {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 6px;
  border: 0;
  border-radius: 6px;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.rad-item:hover { background: var(--rad-hover); }
.rad-item[aria-current="true"] { background: var(--rad-active); }

.rad-item-art {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  object-fit: cover;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
}

.rad-item-text { min-width: 0; flex: 1; }

.rad-item-name {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rad-item-genre {
  font-size: 11px;
  color: var(--rad-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* --------------------------------------------------------------- segmented */

.rad-seg {
  display: flex;
  gap: 4px;
  padding: 3px;
  border-radius: 7px;
  background: var(--rad-hover);
}

.rad-seg button {
  flex: 1;
  padding: 5px 8px;
  border: 0;
  border-radius: 5px;
  background: none;
  color: var(--rad-dim);
  font: inherit;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}

.rad-seg button:hover { color: var(--rad-text); }

.rad-seg button[aria-pressed="true"] {
  background: var(--rad-active);
  color: var(--rad-text);
}

/* ---------------------------------------------------------------- settings */

/* Rendered inside Discord's settings modal, which is already in the themed
   subtree, so these read the variables directly. */
.rad-settings-row { margin: 14px 0; }

.rad-settings-label {
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--header-secondary, var(--text-secondary, #b5bac1));
}

.rad-custom {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
}

.rad-custom-text { flex: 1; min-width: 0; }

.rad-custom-url {
  font-size: 11px;
  color: var(--text-muted, #949ba4);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
`;
