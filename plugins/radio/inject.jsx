import ToolbarButton from "./ui/ToolbarButton";
import { PanelHost } from "./ui/Panel";

const {
  plugin: { scoped },
  ui: { ReactiveRoot },
} = shelter;

// Discord's top-right button group — the one holding Inbox and Help.
//
// `trailing_` on its own is not unique across the client, so the group also has
// to contain one of Discord's icon buttons. That pair has only ever matched the
// toolbar. Class names are hashed and change between builds, hence the
// substring matching throughout.
const GROUP = '[class*="trailing_"]:not([data-radio])';

const guards = new Set();
let panelRoot = null;

function isToolbarGroup(el) {
  return !!el.querySelector('[class*="clickable_"][role="button"], [class*="iconWrapper"]');
}

/** Borrow the class off a sibling so our button matches Discord's exactly. */
function nativeClass(group) {
  return group.querySelector('[class*="clickable_"][role="button"]')?.getAttribute("class") ?? "";
}

function inject(group) {
  if (group.dataset.radio || !isToolbarGroup(group)) return;
  group.dataset.radio = "1";

  const mount = document.createElement("div");
  mount.className = "rad-mount";
  mount.append(
    <ReactiveRoot>
      <ToolbarButton native={nativeClass(group)} />
    </ReactiveRoot>,
  );

  group.prepend(mount);

  // React owns this container and re-renders it without knowing we're here.
  // observeDom only fires again if the whole group is rebuilt, so when React
  // drops just our node we put it back ourselves.
  const guard = new MutationObserver(() => {
    if (!group.isConnected) {
      guard.disconnect();
      guards.delete(guard);
      return;
    }

    if (!mount.isConnected) group.prepend(mount);
  });

  guard.observe(group, { childList: true });
  guards.add(guard);
}

export function startInjection() {
  scoped.observeDom(GROUP, inject);

  // The panel lives at the top of the app rather than inside the toolbar: the
  // toolbar clips its overflow, and mounting inside #app-mount means Discord's
  // .theme-light / .theme-dark class is still an ancestor of ours.
  panelRoot = document.createElement("div");
  panelRoot.className = "rad-root";
  panelRoot.append(
    <ReactiveRoot>
      <PanelHost />
    </ReactiveRoot>,
  );

  (document.querySelector("#app-mount") ?? document.body).append(panelRoot);
}

export function removeInjections() {
  guards.forEach((guard) => guard.disconnect());
  guards.clear();

  panelRoot = null;

  // Query rather than only dropping the references we hold. Dev-mode hot
  // reloads unload and reload the plugin repeatedly, and a single missed node
  // leaves a dead panel on screen still bound to the previous instance's
  // signals — which reads exactly like reactivity being broken.
  document.querySelectorAll(".rad-root, .rad-mount").forEach((el) => el.remove());
  // Clear the markers too, or a re-enable would never re-inject.
  document.querySelectorAll("[data-radio]").forEach((el) => delete el.dataset.radio);
}
