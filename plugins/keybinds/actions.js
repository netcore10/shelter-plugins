const {
  flux: { dispatcher, storesFlat },
} = shelter;

// The dispatch shapes Discord's own keybinds use. Same events the keybind
// system fires internally, so these behave identically to a real keybind —
// the mute sound plays, the state syncs to the server, and so on.

const currentUserId = () => storesFlat.UserStore?.getCurrentUser?.()?.id;

/**
 * Push to talk is the awkward one: as well as the two dispatches, the media
 * engine has to be told directly to open the input, or the state changes
 * without any audio actually being transmitted.
 */
function pushToTalk(active) {
  const userId = currentUserId();
  if (userId) {
    dispatcher.dispatch({ type: "SPEAKING", context: "default", speakingFlags: active ? 1 : 0, userId });
  }

  dispatcher.dispatch({
    type: "PUSH_TO_TALK_STATE_CHANGE",
    isActive: active,
    isPriority: false,
    isLatched: active,
  });

  try {
    storesFlat.MediaEngineStore?.getMediaEngine?.()?.eachConnection?.((connection) =>
      connection.setForceAudioInput(active, false, false),
    );
  } catch {
    // No active voice connection — the dispatches above are still correct.
  }
}

const toggle = (type) => () =>
  dispatcher.dispatch({ type, context: "default", syncRemote: true, playSoundEffect: true });

export const ACTIONS = {
  NONE: { label: "None" },
  TOGGLE_MUTE: { label: "Mute", press: toggle("AUDIO_TOGGLE_SELF_MUTE") },
  TOGGLE_DEAFEN: { label: "Deafen", press: toggle("AUDIO_TOGGLE_SELF_DEAF") },
  PUSH_TO_TALK: {
    label: "Push to talk",
    press: () => pushToTalk(true),
    release: () => pushToTalk(false),
  },
};

export const ACTION_KEYS = Object.keys(ACTIONS);
