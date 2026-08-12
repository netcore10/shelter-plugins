import ToolbarButton from "./ui/ToolbarButton";
import { PanelHost } from "./ui/Panel";

const {
  plugin: { scoped },
  solid: { createRoot },
  ui: { ReactiveRoot },
} = shelter;

// Discord's top-right button group — the one holding Inbox and Help.
//
// `trailing_` on its own is not unique across the client, so the group also has
// to contain one of Discord's icon buttons. That pair has only ever matched the
// toolbar. Class names are hashed and change between builds, hence the
// substring matching throughout.
const GROUP = '[class*="trailing_"]:not([data-radio])';

// group element -> { mount, guard, dispose }
const injected = new Map();
let panel = null;

function isToolbarGroup(el) {
  return !!el.querySelector('[class*="clickable_"][role="button"], [class*="iconWrapper"]');
}

/** Borrow the class off a sibling so our button matches Discord's exactly. */
function nativeClass(group) {
  return group.querySelector('[class*="clickable_"][role="button"]')?.getAttribute("class") ?? "";
}

/**
 * Render into a reactive root we can actually tear down.
 *
 * ReactiveRoot has no teardown. A detached node whose effects are still live
 * keeps recomputing on every signal change for the rest of the session, and
 * every store property it read holds a store-wide subscription — so each
 * orphaned button makes every later store write a little more expensive. That
 * cost is invisible for minutes and obvious after hours.
 */
function render(build) {
  if (typeof createRoot !== "function") {
    // Older shelter: no disposal available, so at least keep it working.
    return { el: <ReactiveRoot>{build()}</ReactiveRoot>, dispose: () => {} };
  }

  let dispose = () => {};
  const el = createRoot((disposer) => {
    dispose = disposer;
    return build();
  });

  return { el, dispose };
}

/**
 * Drop anything whose toolbar React has since thrown away.
 *
 * A detached element's own MutationObserver never fires, so a group can't clean
 * itself up — something outside has to notice. New groups only appear when old
 * ones are replaced, which makes injection the natural place to check, and
 * keeps this O(live groups) rather than a timer.
 */
function sweep() {
  for (const [group, entry] of injected) {
    if (group.isConnected) continue;

    entry.guard.disconnect();
    entry.dispose();
    entry.mount.remove();
    injected.delete(group);
  }
}

function inject(group) {
  sweep();

  if (injected.has(group) || group.dataset.radio || !isToolbarGroup(group)) return;
  group.dataset.radio = "1";

  const mount = document.createElement("div");
  mount.className = "rad-mount";

  const { el, dispose } = render(() => <ToolbarButton native={nativeClass(group)} />);
  mount.append(el);
  group.prepend(mount);

  // React owns this container and re-renders it without knowing we're here.
  // observeDom only fires again if the whole group is rebuilt, so when React
  // drops just our node we put it back ourselves. Teardown is sweep()'s job.
  const guard = new MutationObserver(() => {
    if (group.isConnected && !mount.isConnected) group.prepend(mount);
  });

  guard.observe(group, { childList: true });
  injected.set(group, { mount, guard, dispose });
}

export function startInjection() {
  scoped.observeDom(GROUP, inject);

  // The panel lives at the top of the app rather than inside the toolbar: the
  // toolbar clips its overflow, and #app-mount is unlikely to carry a transform,
  // which would otherwise capture our position: fixed.
  const root = document.createElement("div");
  root.className = "rad-root";

  const { el, dispose } = render(() => <PanelHost />);
  root.append(el);
  (document.querySelector("#app-mount") ?? document.body).append(root);

  panel = { root, dispose };
}

/** How many toolbar mounts we're holding. Exposed for diagnosing slow sessions. */
export function stats() {
  return { mounts: injected.size, panel: !!panel };
}

export function removeInjections() {
  for (const entry of injected.values()) {
    entry.guard.disconnect();
    entry.dispose();
  }
  injected.clear();

  panel?.dispose();
  panel = null;

  // Query rather than only dropping the references we hold. Dev-mode hot
  // reloads unload and reload the plugin repeatedly, and a single missed node
  // leaves a dead panel on screen still bound to the previous instance's
  // signals — which reads exactly like reactivity being broken.
  document.querySelectorAll(".rad-root, .rad-mount").forEach((el) => el.remove());
  // Clear the markers too, or a re-enable would never re-inject.
  document.querySelectorAll("[data-radio]").forEach((el) => delete el.dataset.radio);
}
