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
