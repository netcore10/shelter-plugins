// Imported first and for its side effects: evaluating ./data fills in the store
// defaults, which everything else reads.
import { disposeStoreMemos, restoreFromBackup } from "./data";
import css from "./styles";
import { refreshInjections, removeInjections, startInjection } from "./inject";

const {
  plugin: { scoped },
  ui: { ToastColors, showToast },
} = shelter;

export function onLoad() {
  // Note: injectCss lives under scoped.ui, not on scoped directly.
  scoped.ui.injectCss(css);
  startInjection();

  // shelter wipes a plugin's storage when the plugin is updated, reinstalled,
  // or when dev mode ends — so tags are mirrored to our own IndexedDB and
  // pulled back here whenever shelter's copy has come back empty.
  restoreFromBackup().then((recovered) => {
    if (!recovered) return;

    refreshInjections();
    showToast({
      title: "Friend Tags",
      content: `Restored tags for ${recovered} ${recovered === 1 ? "person" : "people"} after the update.`,
      color: ToastColors.SUCCESS,
    });
  });
}

export function onUnload() {
  // The scoped API tears down the observers, subscriptions and CSS for us; the
  // chips already on the page are ours to clean up, as is the reactive root the
  // store memos live in.
  removeInjections();
  disposeStoreMemos();
}

export { default as settings } from "./ui";
