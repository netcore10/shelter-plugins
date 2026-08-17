import { ACTIONS } from "./actions";
import css from "./styles";

const {
  plugin: { store, scoped },
} = shelter;

// mouse4 and mouse5 are `button` 3 and 4 — the back and forward side buttons.
const BUTTONS = { 3: "mouse4", 4: "mouse5" };

store.mouse4 ??= "NONE";
store.mouse5 ??= "NONE";

// Which buttons are currently held, so a release only fires for a press we
// handled — otherwise switching the binding mid-hold leaves push to talk stuck
// open with no matching release.
const held = new Set();

const actionFor = (button) => ACTIONS[store[BUTTONS[button]]] ?? ACTIONS.NONE;

function onDown(e) {
  if (!BUTTONS[e.button]) return;

  const action = actionFor(e.button);
  if (action === ACTIONS.NONE) return;

  // Stop the browser treating these as back/forward. Whether it obeys depends
  // on the client: some route side buttons at a level the page can't cancel.
  e.preventDefault();

  held.add(e.button);
  action.press?.();
}

function onUp(e) {
  if (!held.has(e.button)) return;

  held.delete(e.button);
  e.preventDefault();
  actionFor(e.button).release?.();
}

// Some clients navigate on auxclick rather than mouseup, so it's cancelled too.
function onAux(e) {
  if (BUTTONS[e.button] && actionFor(e.button) !== ACTIONS.NONE) e.preventDefault();
}

/**
 * Release everything still held.
 *
 * Losing focus mid-hold means the mouseup never arrives, which would leave push
 * to talk transmitting indefinitely.
 */
function releaseAll() {
  for (const button of held) actionFor(button).release?.();
  held.clear();
}

export function onLoad() {
  // Note: injectCss lives under scoped.ui, not on scoped directly.
  scoped.ui.injectCss(css);

  // Console control, for when shelter's settings page can't render — which is
  // the situation this was written in. Same store the settings UI writes to.
  window.keybinds = {
    get: () => ({ mouse4: store.mouse4, mouse5: store.mouse5 }),
    actions: () => Object.keys(ACTIONS),
    set(button, action) {
      const key = String(button).replace(/^mouse/i, "mouse");
      if (!["mouse4", "mouse5"].includes(key)) return "button must be mouse4 or mouse5";
      if (!ACTIONS[action]) return `action must be one of: ${Object.keys(ACTIONS).join(", ")}`;

      store[key] = action;
      return `${key} → ${action}`;
    },
  };

  // Capture, so this runs before Discord's own handlers and preventDefault has
  // a chance to matter.
  addEventListener("mousedown", onDown, true);
  addEventListener("mouseup", onUp, true);
  addEventListener("auxclick", onAux, true);
  addEventListener("blur", releaseAll);
}

export function onUnload() {
  releaseAll();
  delete window.keybinds;

  removeEventListener("mousedown", onDown, true);
  removeEventListener("mouseup", onUp, true);
  removeEventListener("auxclick", onAux, true);
  removeEventListener("blur", releaseAll);
}

export { default as settings } from "./settings";
