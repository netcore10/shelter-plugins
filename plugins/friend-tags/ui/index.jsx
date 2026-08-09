import TagManager from "./TagManager";
import { allTags, exportData, importData } from "../data";

const {
  plugin: { store },
  ui: {
    Button,
    ButtonColors,
    ButtonLooks,
    Divider,
    Header,
    HeaderTags,
    ModalBody,
    ModalFooter,
    ModalHeader,
    ModalRoot,
    ModalSizes,
    Slider,
    SwitchItem,
    Text,
    TextArea,
    ToastColors,
    openModal,
    showToast,
  },
  solid: { createMemo, createSignal },
} = shelter;

// `checked` is the documented prop; `value` is what older shelter builds used.
// Passing both keeps this working either way.
const Toggle = (props) => (
  <SwitchItem
    checked={props.checked}
    value={props.checked}
    onChange={props.onChange}
    note={props.note}
    hideBorder
  >
    {props.children}
  </SwitchItem>
);

function Backup(props) {
  const [text, setText] = createSignal(exportData());

  const doImport = (merge) => {
    try {
      const count = importData(text(), { merge });
      showToast({
        title: "Friend Tags",
        content: `Imported tags for ${count} ${count === 1 ? "person" : "people"}.`,
        color: ToastColors.SUCCESS,
      });
      props.close();
    } catch (err) {
      showToast({
        title: "Import failed",
        content: String(err.message ?? err),
        color: ToastColors.CRITICAL,
      });
    }
  };

  return (
    <ModalRoot size={ModalSizes.MEDIUM}>
      <ModalHeader close={props.close}>Backup &amp; restore</ModalHeader>

      <ModalBody>
        <Text style={{ color: "var(--header-secondary)", "font-size": "14px" }}>
          Copy this somewhere safe, or paste a previous backup in and import it.
        </Text>
        <div style="margin-top: 8px">
          <TextArea value={text()} onInput={setText} mono resize-y aria-label="Tag data" />
        </div>
      </ModalBody>

      <ModalFooter>
        <div style="display: flex; gap: 8px; justify-content: flex-end; width: 100%">
          <Button
            look={ButtonLooks.OUTLINED}
            onClick={() => {
              navigator.clipboard.writeText(exportData());
              showToast({ title: "Friend Tags", content: "Copied to clipboard." });
            }}
          >
            Copy
          </Button>
          <Button look={ButtonLooks.OUTLINED} onClick={() => doImport(true)}>
            Merge
          </Button>
          <Button color={ButtonColors.RED} onClick={() => doImport(false)}>
            Replace all
          </Button>
        </div>
      </ModalFooter>
    </ModalRoot>
  );
}

export default function Settings() {
  const summary = createMemo(() => {
    const tagCount = allTags().length;
    const userCount = Object.keys(store.tags).length;
    return `${tagCount} ${tagCount === 1 ? "tag" : "tags"} across ${userCount} ${
      userCount === 1 ? "person" : "people"
    }`;
  });

  return (
    <>
      <Header tag={HeaderTags.H5}>Where to show tags</Header>

      <Toggle
        checked={store.inFriends}
        onChange={(v) => (store.inFriends = v)}
        note="Hover someone in the friends list to add or edit their tags."
      >
        Friends list
      </Toggle>

      <Toggle
        checked={store.inMessages}
        onChange={(v) => (store.inMessages = v)}
        note="Next to the username on every message, in servers and DMs."
      >
        Chat messages
      </Toggle>

      <Toggle checked={store.inMembers} onChange={(v) => (store.inMembers = v)}>
        Server member list
      </Toggle>

      <Toggle checked={store.inDms} onChange={(v) => (store.inDms = v)}>
        DM list
      </Toggle>

      <Toggle
        checked={store.inProfiles}
        onChange={(v) => (store.inProfiles = v)}
        note="Profile popouts and the full profile modal — also editable here."
      >
        Profiles
      </Toggle>

      <Divider mt mb />

      <Header tag={HeaderTags.H5}>Appearance</Header>

      <Toggle checked={store.uppercase} onChange={(v) => (store.uppercase = v)}>
        Display tags in uppercase
      </Toggle>

      <Toggle
        checked={store.animate}
        onChange={(v) => (store.animate = v)}
        note="Master switch for per-tag animations. Your OS “reduce motion” setting is always respected regardless."
      >
        Play tag animations
      </Toggle>

      <Header tag={HeaderTags.H5} margin>
        Maximum tags shown per person
      </Header>
      <Text style={{ color: "var(--header-secondary)", "font-size": "14px" }}>
        Any extras collapse into a “+n” pill you can hover. Set to 0 for no limit.
      </Text>
      <div style="margin: 8px 0 4px">
        <Slider
          value={store.maxShown}
          onInput={(v) => (store.maxShown = Math.round(v))}
          min={0}
          max={8}
          step={1}
          tick={1}
        />
      </div>

      <Divider mt mb />

      <Header tag={HeaderTags.H5}>Your tags</Header>
      <Text style={{ color: "var(--header-secondary)", "font-size": "14px" }}>
        {summary()}
      </Text>

      <div style="display: flex; gap: 8px; margin-top: 10px">
        <Button grow onClick={() => openModal(TagManager)}>
          Manage tags
        </Button>
        <Button grow look={ButtonLooks.OUTLINED} onClick={() => openModal(Backup)}>
          Backup &amp; restore
        </Button>
      </div>

      <Divider mt mb />

      <Toggle
        checked={store.debug}
        onChange={(v) => (store.debug = v)}
        note="Logs to the console when a tag can't be attached. Useful if Discord changes its layout and a surface stops working."
      >
        Debug logging
      </Toggle>
    </>
  );
}
