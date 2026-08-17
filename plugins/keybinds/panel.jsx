const {
  flux: { dispatcher },
  util: { getFiberOwner, log },
} = shelter;

// ---------------------------------------------------------------------------
// Repairs Dorion's bundled "Dorion Custom Keybinds" panel.
//
// It reads two lists off a React fiber owner:
//
//   const owner = shelter.util.getFiberOwner(browserNotice)
//   keybindActionTypes={owner.props.keybindActionTypes.filter(...)}
//   keybindDescriptions={owner.props.keybindDescriptions}
//
// Discord stopped passing either, so Add Keybind throws
// "Cannot read properties of undefined (reading 'filter')" and the dialog never
// opens. Upstream: SpikeHD/Dorion#492.
//
// This supplies what it expects and re-fires the event it listens on, so its
// own render path runs again and succeeds.
// ---------------------------------------------------------------------------

// The actions that plugin's actionMap can perform. Anything outside this list
// it wouldn't know how to dispatch, so Discord's (now absent) list was never
// the authority. PUSH_TO_TALK stays in — the plugin filters it out itself.
const ACTIONS = [
  "UNASSIGNED",
  "TOGGLE_MUTE",
  "TOGGLE_DEAFEN",
  "TOGGLE_STREAMER_MODE",
  "TOGGLE_VOICE_MODE",
  "PUSH_TO_TALK",
  "PUSH_TO_TALK_PRIORITY",
  "PUSH_TO_MUTE",
];

const title = (value) =>
  value
    .split("_")
    .map((word) => word[0] + word.slice(1).toLowerCase())
    .join(" ");

const ACTION_TYPES = ACTIONS.map((value) => ({ value, label: title(value) }));

const NOTICE = '[data-nav-anchor-key="custom_keybinds_setting"]';
const PANE = "system_panel";

let replaying = false;
let unsubscribe = null;
const patched = new Set();

/** Add our lists to a props object, leaving a good one alone. */
function fill(props) {
  if (!props || Array.isArray(props.keybindActionTypes)) return props;

  try {
    props.keybindActionTypes = ACTION_TYPES;
    props.keybindDescriptions ??= {};
  } catch (err) {
    log(`keybinds: couldn't supply props: ${err}`, "warn");
  }

  return props;
}

/**
 * Keep the lists present across re-renders.
 *
 * Filling once isn't enough: the plugin passes these through JSX, which Solid
 * compiles into getters that re-read owner.props on every access. Clicking Add
 * Keybind reads it again, long after React has swapped in a fresh props object
 * and dropped what we put there — which is why it worked once and then threw.
 */
function supplyProps() {
  const notice = document.querySelector(NOTICE);
  if (!notice) return false;

  const owner = getFiberOwner(notice);
  if (!owner?.props) return false;

  fill(owner.props);

  if (!patched.has(owner)) {
    let current = owner.props;

    try {
      Object.defineProperty(owner, "props", {
        configurable: true,
        enumerable: true,
        get: () => current,
        set: (next) => (current = fill(next)),
      });
      patched.add(owner);
    } catch (err) {
      log(`keybinds: couldn't hold props across renders: ${err}`, "warn");
    }
  }

  return true;
}

/** Give the owners back a plain `props`, exactly as they were. */
function unpatch() {
  for (const owner of patched) {
    try {
      const value = owner.props;
      delete owner.props;
      owner.props = value;
    } catch {
      // Gone with the component; nothing to restore.
    }
  }

  patched.clear();
}

function onTrack(payload) {
  if (replaying) return;
  if (payload?.event !== "settings_pane_viewed") return;
  if (payload?.properties?.destination_pane !== PANE) return;

  // Their plugin loads with Dorion so it subscribes first, meaning its failing
  // pass has already run. Deferring a tick also lets the panel finish
  // rendering, so the element we need exists when we re-fire.
  setTimeout(() => {
    if (!supplyProps()) return;

    replaying = true;
    try {
      dispatcher.dispatch({
        type: "TRACK",
        event: "settings_pane_viewed",
        properties: { destination_pane: PANE },
      });
    } finally {
      replaying = false;
    }
  }, 0);
}

export function start() {
  if (unsubscribe) return;
  unsubscribe = dispatcher.subscribe("TRACK", onTrack);

  // In case the panel is already open when this loads.
  supplyProps();
}

export function stop() {
  if (unsubscribe) {
    if (typeof unsubscribe === "function") unsubscribe();
    else dispatcher.unsubscribe?.("TRACK", onTrack);
  }

  unsubscribe = null;
  unpatch();
}
