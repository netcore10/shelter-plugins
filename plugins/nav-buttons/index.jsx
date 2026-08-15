import css from "./styles";

const {
  plugin: { scoped },
} = shelter;

// The top bar, measured in the real client rather than guessed from class
// stems (which put these on the channel header twice):
//
//   bar_c38106 theme-dark theme-darker images-dark
//     ├ leading_c38106     empty, measures 0x0 — where these belong
//     ├ title_c38106
//     └ trailing_c38106    the icon buttons, 96x24
//
// So the gate is the shape of the bar itself: a `bar_` element whose direct
// children include both a title and a trailing group. `leading_` and
// `trailing_` are reused elsewhere in Discord; that three-part structure is
// not.
const GROUP = '[class*="leading_"]:not([data-navbtns])';


// Discord's own arrow glyphs, so the pair is indistinguishable from the ones
// the desktop app draws.
const BACK =
  "M3.3 11.3a1 1 0 0 0 0 1.4l5 5a1 1 0 0 0 1.4-1.4L6.42 13H20a1 1 0 1 0 0-2H6.41l3.3-3.3a1 1 0 0 0-1.42-1.4l-5 5Z";
const FORWARD =
  "M20.7 12.7a1 1 0 0 0 0-1.4l-5-5a1 1 0 1 0-1.4 1.4l3.29 3.3H4a1 1 0 1 0 0 2h13.59l-3.3 3.3a1 1 0 0 0 1.42 1.4l5-5Z";

const mounts = new Set();

// --- buttons ----------------------------------------------------------------
//
// Both buttons are always live. Discord's own pair greys out at the ends of the
// history stack, but nothing exposes the position needed to do that honestly:
// history has a length but no index, popstate doesn't say which way it moved,
// and this client's router keeps no index of its own. Tracking it meant
// patching pushState and replaceState to stamp entries — a lot of machinery
// whose only failure mode was disabling a button that would have worked.
//
// A back press at the bottom of the stack simply does nothing, which is a much
// better outcome than a dead-looking button.

function button(label, path, delta) {
  const el = (
    <div class="nav-btn" role="button" aria-label={label} tabindex="0" data-jump-section="global">
      <svg aria-hidden="true" role="img" width="18" height="18" fill="none" viewBox="0 0 24 24">
        <path fill="currentColor" d={path} />
      </svg>
    </div>
  );

  const go = () => (delta < 0 ? history.back() : history.forward());

  el.addEventListener("click", go);
  el.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    go();
  });

  return el;
}

// --- injection --------------------------------------------------------------

/**
 * Is this the window's top bar, and not one of the other places Discord reuses
 * these class stems? Checks the bar's own shape: `bar_` (not `toolbar_`, hence
 * the word boundary) with a title and a trailing group as direct children.
 */
function isTopBar(leading) {
  const bar = leading.parentElement;
  if (!bar || !/(^|\s)bar_/.test(bar.className)) return false;

  return !!bar.querySelector(':scope > [class*="title_"]') && !!bar.querySelector(':scope > [class*="trailing_"]');
}

/** Drop anything whose top bar React has since thrown away. */
function sweep() {
  for (const entry of mounts) {
    if (entry.root.isConnected) continue;

    entry.guard.disconnect();
    mounts.delete(entry);
  }
}

function inject(leading) {
  sweep();

  if (leading.dataset.navbtns || !isTopBar(leading)) return;

  const bar = leading.parentElement;

  // A client that already ships the buttons doesn't need a second pair.
  if (bar.querySelector('[class*="backForwardButtons"]')) return;

  leading.dataset.navbtns = "1";

  const root = document.createElement("div");
  root.className = "nav-btns";
  root.append(button("Go back", BACK, -1), button("Go forward", FORWARD, 1));

  let host = leading;
  host.prepend(root);

  // React owns this container and re-renders it without knowing we're here.
  // observeDom only fires again if the whole group is rebuilt, so when React
  // drops just our node we put it back ourselves. Teardown is sweep()'s job —
  // an observer on a detached node never fires, so it can't clean itself up.
  const guard = new MutationObserver(() => {
    if (host.isConnected && !root.isConnected) host.prepend(root);
  });
  guard.observe(host, { childList: true });

  // Measured after a frame, because nothing has been laid out at this point.
  requestAnimationFrame(() => {
    // The leading group can measure 0x0 in clients that collapse the top bar.
    // If it gave us no width, sit directly in the bar instead. The bar's own
    // height is left alone: whatever collapses it also resets it, and fighting
    // that belongs upstream, not here.
    if (!root.isConnected || root.getBoundingClientRect().width > 0) return;

    host = bar;
    bar.insertBefore(root, bar.firstChild);

    // Follow the move, or the guard would be watching a container the buttons
    // no longer live in.
    guard.disconnect();
    guard.observe(host, { childList: true });
  });

  mounts.add({ root, guard });
}

// --- lifecycle --------------------------------------------------------------

export function onLoad() {
  // Note: injectCss lives under scoped.ui, not on scoped directly.
  scoped.ui.injectCss(css);
  scoped.observeDom(GROUP, inject);
}

export function onUnload() {
  for (const entry of mounts) entry.guard.disconnect();
  mounts.clear();

  document.querySelectorAll(".nav-btns").forEach((el) => el.remove());
  // Clear the markers too, or a re-enable would never re-inject.
  document.querySelectorAll("[data-navbtns]").forEach((el) => delete el.dataset.navbtns);
}
