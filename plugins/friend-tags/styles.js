export default `
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
  padding: 18px;
  margin-bottom: 14px;
  border-radius: 8px;
  background: var(--background-secondary);
  border: 1px solid var(--background-modifier-accent);
  /* room for float/breathe to move without being clipped */
  overflow: visible;
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
