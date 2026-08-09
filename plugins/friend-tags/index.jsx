// Imported first and for its side effects: evaluating ./data fills in the store
// defaults, which everything else reads.
import { disposeStoreMemos } from "./data";
import css from "./styles";
import { removeInjections, startInjection } from "./inject";

const {
  plugin: { scoped },
} = shelter;

export function onLoad() {
  // Note: injectCss lives under scoped.ui, not on scoped directly.
  scoped.ui.injectCss(css);
  startInjection();
}

export function onUnload() {
  // The scoped API tears down the observers, subscriptions and CSS for us; the
  // chips already on the page are ours to clean up, as is the reactive root the
  // store memos live in.
  removeInjections();
  disposeStoreMemos();
}

export { default as settings } from "./ui";
