import { ACTIONS, ACTION_KEYS } from "./actions";

const {
  plugin: { store },
  solid: { For },
  ui: { Header, HeaderTags, Text },
} = shelter;

// shelter-ui has no select, and four options read better as a row of buttons
// than a dropdown anyway.
function Row(props) {
  return (
    <div class="mkb-row">
      <Text class="mkb-label">{props.label}</Text>

      <div class="mkb-seg" role="group">
        <For each={ACTION_KEYS}>
          {(key) => (
            <button
              type="button"
              aria-pressed={store[props.setting] === key}
              onClick={() => (store[props.setting] = key)}
            >
              {ACTIONS[key].label}
            </button>
          )}
        </For>
      </div>
    </div>
  );
}

export default function Settings() {
  return (
    <>
      <Header tag={HeaderTags.H3}>Mouse side buttons</Header>

      <Row label="Mouse 4 (back)" setting="mouse4" />
      <Row label="Mouse 5 (forward)" setting="mouse5" />

      <div class="mkb-note">
        These fire while Discord has focus. A truly global binding has to be registered with the OS,
        which a plugin can't do from inside the page.
        <br />
        Binding a button also stops it navigating back or forward — though some clients handle the
        side buttons at a level the page can't override, in which case it will do both.
      </div>
    </>
  );
}
