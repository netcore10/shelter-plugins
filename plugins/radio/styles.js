// Colours are hard-coded rather than pulled from Discord's custom properties.
// var(--x, fallback) only uses the fallback when the variable is *undefined* —
// a variable that exists but resolves to something invalid computes to
// `initial`, which for a background means transparent. A floating panel that
// occasionally turns see-through is worse than one that doesn't track a custom
// theme, so the two themes are written out and keyed off Discord's own
// .theme-light / .theme-dark classes.

export default `
.rad-mount { display: contents; }

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

/* ------------------------------------------------------------------- panel */

.rad-panel {
  position: fixed;
  z-index: 3000;
  width: 328px;
  border-radius: 10px;
  overflow: hidden;
  background: #1a1b1e;
  color: #f2f3f5;
  border: 1px solid rgba(255, 255, 255, .07);
  box-shadow: 0 10px 34px rgba(0, 0, 0, .5);
  font-family: var(--font-primary, "gg sans", sans-serif);
  animation: rad-in 140ms ease-out;
}

.theme-light .rad-panel {
  background: #fff;
  color: #14151a;
  border-color: rgba(0, 0, 0, .09);
  box-shadow: 0 10px 34px rgba(0, 0, 0, .16);
}

@keyframes rad-in {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: none; }
}

.rad-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, .06);
}

.theme-light .rad-head { border-bottom-color: rgba(0, 0, 0, .07); }

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
  color: #949ba4;
  white-space: nowrap;
}

.theme-light .rad-station-group { color: #5c5e66; }

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
  background: rgba(255, 255, 255, .05);
}

.theme-light .rad-art { background: rgba(0, 0, 0, .05); }

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
  color: #b5bac1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.theme-light .rad-sub, .theme-light .rad-alt { color: #4e5058; }

.rad-alt { color: #80848e; font-size: 11px; }
.theme-light .rad-alt { color: #6d6f78; }

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
  background: rgba(255, 255, 255, .1);
  overflow: hidden;
}

.theme-light .rad-bar { background: rgba(0, 0, 0, .1); }

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
  color: #949ba4;
}

.theme-light .rad-times { color: #5c5e66; }

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
  color: #b5bac1;
}

.rad-mute:hover { color: #f2f3f5; }
.theme-light .rad-mute { color: #4e5058; }
.theme-light .rad-mute:hover { color: #14151a; }

/* shelter's Slider ships with margins meant for a settings page. */
.rad-volume [class*="slider"], .rad-volume [class*="scontainer"] { margin: 0 !important; flex: 1; }

/* The Slider sets --upper-half inline (its fill percentage) and paints the
   track from it in Discord's blurple. Reusing that variable recolours the fill
   to the station's accent without reimplementing the control. !important
   because shelter's own stylesheet is injected after ours. */
.rad-volume input[type="range"] {
  background: linear-gradient(
    to right,
    var(--rad-accent, #ff015b) 0%,
    var(--rad-accent, #ff015b) var(--upper-half, 0%),
    rgba(255, 255, 255, .14) var(--upper-half, 0%)
  ) !important;
}

.theme-light .rad-volume input[type="range"] {
  background: linear-gradient(
    to right,
    var(--rad-accent, #ff015b) 0%,
    var(--rad-accent, #ff015b) var(--upper-half, 0%),
    rgba(0, 0, 0, .14) var(--upper-half, 0%)
  ) !important;
}

/* ------------------------------------------------------------------ footer */

.rad-foot {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-top: 1px solid rgba(255, 255, 255, .06);
  font-size: 11px;
  color: #949ba4;
}

.theme-light .rad-foot {
  border-top-color: rgba(0, 0, 0, .07);
  color: #5c5e66;
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
  background: #949ba4;
}

.rad-dot[data-status="live"] { background: #23a55a; }
.rad-dot[data-status="connecting"] { background: #f0b232; animation: rad-blink 1s ease-in-out infinite; }
.rad-dot[data-status="error"] { background: #f23f43; }

@keyframes rad-blink { 50% { opacity: .3; } }

/* ------------------------------------------------------------ station list */

.rad-list {
  max-height: 340px;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 6px;
}

.rad-list::-webkit-scrollbar { width: 8px; }
.rad-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, .12);
  border-radius: 4px;
}

.rad-group {
  padding: 8px 6px 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .04em;
  text-transform: uppercase;
  color: #949ba4;
}

.theme-light .rad-group { color: #5c5e66; }

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

.rad-item:hover { background: rgba(255, 255, 255, .06); }
.theme-light .rad-item:hover { background: rgba(0, 0, 0, .05); }

.rad-item[aria-current="true"] { background: rgba(255, 255, 255, .09); }
.theme-light .rad-item[aria-current="true"] { background: rgba(0, 0, 0, .07); }

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
  color: #949ba4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.theme-light .rad-item-genre { color: #5c5e66; }

/* --------------------------------------------------------------- segmented */

.rad-seg {
  display: flex;
  gap: 4px;
  padding: 3px;
  border-radius: 7px;
  background: rgba(255, 255, 255, .05);
}

.theme-light .rad-seg { background: rgba(0, 0, 0, .05); }

.rad-seg button {
  flex: 1;
  padding: 5px 8px;
  border: 0;
  border-radius: 5px;
  background: none;
  color: #b5bac1;
  font: inherit;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}

.rad-seg button:hover { color: #f2f3f5; }
.theme-light .rad-seg button { color: #4e5058; }
.theme-light .rad-seg button:hover { color: #14151a; }

.rad-seg button[aria-pressed="true"] {
  background: rgba(255, 255, 255, .1);
  color: #fff;
}

.theme-light .rad-seg button[aria-pressed="true"] {
  background: #fff;
  color: #14151a;
  box-shadow: 0 1px 2px rgba(0, 0, 0, .12);
}

/* ---------------------------------------------------------------- settings */

.rad-settings-row { margin: 14px 0; }

.rad-settings-label {
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--header-secondary, #b5bac1);
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
