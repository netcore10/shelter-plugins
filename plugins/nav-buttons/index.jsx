import css from "./styles";

const {
  plugin: { scoped },
} = shelter;

// Discord's top-bar leading group — the slot the desktop app puts its
// back/forward buttons in. `leading_` on its own isn't unique across the
// client, so the group also has to sit opposite a `trailing_` one, which is a
// pairing only the top bar has. Class names are hashed and change between
// builds, hence the substring matching.
const GROUP = '[class*="leading_"]:not([data-navbtns])';

// Discord's own arrow glyphs, so the pair is indistinguishable from the ones
// the desktop app draws.
const BACK =
  "M3.3 11.3a1 1 0 0 0 0 1.4l5 5a1 1 0 0 0 1.4-1.4L6.42 13H20a1 1 0 1 0 0-2H6.41l3.3-3.3a1 1 0 0 0-1.42-1.4l-5 5Z";
const FORWARD =
  "M20.7 12.7a1 1 0 0 0 0-1.4l-5-5a1 1 0 1 0-1.4 1.4l3.29 3.3H4a1 1 0 1 0 0 2h13.59l-3.3 3.3a1 1 0 0 0 1.42 1.4l5-5Z";

const mounts = new Set();

let originalPush = null;
let maxIndex = 0;

// --- history position -------------------------------------------------------
//
// Navigation itself is just history.back()/forward(): this client already
// routes the mouse's own back/forward buttons that way, so the SPA picks it up.
//
// Knowing whether there's anywhere to go is the harder half. Discord's router
// keeps a react-router style `idx` on history.state, which is what tells us
// we're at the start of the stack. When it isn't there we leave both buttons
// live rather than guess and disable a control that would have worked.

function index() {
  const idx = history.state?.idx;
  return typeof idx === "number" ? idx : null;
}

function setDisabled(button, disabled) {
  button.setAttribute("aria-disabled", String(disabled));
  button.setAttribute("tabindex", disabled ? "-1" : "0");
}

function refresh() {
  const idx = index();

  for (const { back, forward } of mounts) {
    setDisabled(back, idx !== null && idx <= 0);
    setDisabled(forward, idx !== null && idx >= maxIndex);
  }
}

function onPop() {
  const idx = index();
  if (idx !== null && idx > maxIndex) maxIndex = idx;
  refresh();
}

function patchHistory() {
  originalPush = history.pushState;

  // pushState fires no event of its own, and a push discards everything ahead
  // of the current entry — so this is the only moment we can learn that going
  // forward just stopped being possible.
  history.pushState = function (...args) {
    const result = originalPush.apply(this, args);
    maxIndex = index() ?? maxIndex;
    refresh();
    return result;
  };

  addEventListener("popstate", onPop);
}

// --- buttons ----------------------------------------------------------------

function go(delta, button) {
  if (button.getAttribute("aria-disabled") === "true") return;

  if (delta < 0) history.back();
  else history.forward();
}

function button(label, path, delta) {
  const el = (
    <div class="nav-btn" role="button" aria-label={label} tabindex="0" data-jump-section="global">
      <svg aria-hidden="true" role="img" width="18" height="18" fill="none" viewBox="0 0 24 24">
        <path fill="currentColor" d={path} />
      </svg>
    </div>
  );

  el.addEventListener("click", () => go(delta, el));
  el.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    go(delta, el);
  });

  return el;
}

/** Drop anything whose top bar React has since thrown away. */
function sweep() {
  for (const entry of mounts) {
    if (entry.root.isConnected) continue;

    entry.guard.disconnect();
    mounts.delete(entry);
  }
}

/**
 * The two ends of the top bar. Rather than assume they're direct siblings —
 * which would silently inject nothing the day Discord adds a wrapper — look for
 * the trailing group from a shared ancestor a few levels up.
 */
function inTopBar(group) {
  let node = group.parentElement;

  for (let depth = 0; node && depth < 3; depth++, node = node.parentElement) {
    if (node.querySelector('[class*="trailing_"]')) return true;
  }

  return false;
}

function inject(group) {
  sweep();

  if (group.dataset.navbtns || !inTopBar(group)) return;
  // A client that already ships the buttons doesn't need a second pair.
  if (group.querySelector('[class*="backForwardButtons"]')) return;

  group.dataset.navbtns = "1";

  const back = button("Go back", BACK, -1);
  const forward = button("Go forward", FORWARD, 1);

  const root = document.createElement("div");
  root.className = "nav-btns";
  root.append(back, forward);
  group.prepend(root);

  // React owns this container and re-renders it without knowing we're here.
  // observeDom only fires again if the whole group is rebuilt, so when React
  // drops just our node we put it back ourselves. Teardown is sweep()'s job —
  // an observer on a detached node never fires, so it can't clean itself up.
  const guard = new MutationObserver(() => {
    if (group.isConnected && !root.isConnected) group.prepend(root);
  });
  guard.observe(group, { childList: true });

  mounts.add({ root, back, forward, guard });
  refresh();
}

// --- lifecycle --------------------------------------------------------------

export function onLoad() {
  // Note: injectCss lives under scoped.ui, not on scoped directly.
  scoped.ui.injectCss(css);

  maxIndex = index() ?? 0;
  patchHistory();

  scoped.observeDom(GROUP, inject);
}

export function onUnload() {
  // Only safe because nothing else is expected to patch this. If another plugin
  // wrapped pushState after us, restoring the original drops their wrapper too.
  if (originalPush) history.pushState = originalPush;
  originalPush = null;
  removeEventListener("popstate", onPop);

  for (const entry of mounts) entry.guard.disconnect();
  mounts.clear();

  document.querySelectorAll(".nav-btns").forEach((el) => el.remove());
  // Clear the markers too, or a re-enable would never re-inject.
  document.querySelectorAll("[data-navbtns]").forEach((el) => delete el.dataset.navbtns);
}
