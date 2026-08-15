import TagManager from "./TagManager";
import { refreshInjections } from "../inject";
import { customEmojiCount } from "../emoji";
import {
  allTags,
  allUserTags,
  currentAccountId,
  exportData,
  exportFile,
  importData,
  importFile,
  seedCurrentAccount,
} from "../data";

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
  let picker;
  const setPicker = (el) => (picker = el);

  const doImport = (merge) => {
    let counts;
    try {
      counts = importData(text(), { merge });
    } catch (err) {
      showToast({
        title: "Import failed",
        content: String(err.message ?? err),
        color: ToastColors.CRITICAL,
      });
      return;
    }

    // A backup can parse perfectly and still contain nothing — which is exactly
    // what a backup taken after dev mode wiped the store looks like. Saying
    // "imported!" for that is how you lose an afternoon.
    if (!counts.users) {
      showToast({
        title: "Nothing to import",
        content: "That backup parsed fine but contains no tags.",
        color: ToastColors.WARNING,
        duration: 6000,
      });
      return;
    }

    refreshInjections();
    showToast({
      title: "Friend Tags",
      content: `Imported ${counts.tags} ${counts.tags === 1 ? "tag" : "tags"} across ${counts.users} ${
        counts.users === 1 ? "person" : "people"
      }.`,
      color: ToastColors.SUCCESS,
    });
    props.close();
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
          {/* Hidden picker, driven by the Load file button. */}
          <input
            type="file"
            accept=".gz,.json,application/json,application/gzip"
            style="display: none"
            ref={setPicker}
            onChange={async (e) => {
              const file = e.currentTarget.files?.[0];
              e.currentTarget.value = ""; // let the same file be picked again
              if (!file) return;

              let counts;
              try {
                counts = await importFile(file, { merge: false });
              } catch (err) {
                showToast({
                  title: "Import failed",
                  content: String(err.message ?? err),
                  color: ToastColors.CRITICAL,
                });
                return;
              }

              refreshInjections();
              showToast({
                title: "Friend Tags",
                content: `Restored ${counts.tags} ${counts.tags === 1 ? "tag" : "tags"} across ${counts.users} ${
                  counts.users === 1 ? "person" : "people"
                }.`,
                color: ToastColors.SUCCESS,
              });
              props.close();
            }}
          />

          <Button
            look={ButtonLooks.OUTLINED}
            onClick={async () => {
              const { blob, raw, gzipped } = await exportFile();

              const link = document.createElement("a");
              link.href = URL.createObjectURL(blob);
              link.download = `friend-tags-${new Date().toISOString().slice(0, 10)}.json${gzipped ? ".gz" : ""}`;
              link.click();
              URL.revokeObjectURL(link.href);

              showToast({
                title: "Friend Tags",
                content: gzipped
                  ? `Saved — ${(blob.size / 1024).toFixed(1)} KB, down from ${(raw / 1024).toFixed(1)} KB.`
                  : `Saved — ${(blob.size / 1024).toFixed(1)} KB.`,
                color: ToastColors.SUCCESS,
              });
            }}
          >
            Save file
          </Button>
          <Button look={ButtonLooks.OUTLINED} onClick={() => picker?.click()}>
            Load file
          </Button>
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
    const userCount = Object.keys(allUserTags()).length;
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
        checked={store.inDmHeader}
        onChange={(v) => (store.inDmHeader = v)}
        note="The name above “This is the beginning of your direct message history…”."
      >
        DM header
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

      <Header tag={HeaderTags.H5}>Accounts</Header>
      <Toggle
        checked={store.multiAccount}
        onChange={(v) => {
          // Seed before switching on, so this account starts from what you can
          // already see rather than from nothing.
          if (v) seedCurrentAccount();
          store.multiAccount = v;
          refreshInjections();
        }}
        note={
          currentAccountId()
            ? "Give each Discord account its own tags. Turning this on copies your current tags to this account, and never deletes the shared set — switch it back off to get them again."
            : "Give each Discord account its own tags. (Your account ID isn't readable right now, so the shared set is still in use.)"
        }
      >
        Separate tags per account
      </Toggle>

      <Divider mt mb />

      <Text style={{ color: "var(--text-muted)", "font-size": "13px" }}>
        {customEmojiCount()
          ? `${customEmojiCount()} custom emoji available to the picker.`
          : "No custom emoji found — the picker will only offer unicode ones. Discord may have moved its emoji API; turn on debug logging and let me know."}
      </Text>

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
