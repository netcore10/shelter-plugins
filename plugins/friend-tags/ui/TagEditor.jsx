import Chip from "./Chip";
import EmojiAutocomplete, { createEmojiAutocomplete } from "./EmojiAutocomplete";
import { openStyler } from "./openStyler";
import {
  addTag,
  allTags,
  clearUser,
  colorOf,
  getNote,
  getTags,
  normalise,
  removeTag,
  setNote,
  tagKey,
  textOn,
} from "../data";

const {
  flux: {
    storesFlat: { UserStore },
  },
  ui: {
    Button,
    ButtonColors,
    ButtonLooks,
    ButtonSizes,
    Header,
    HeaderTags,
    ModalBody,
    ModalFooter,
    ModalHeader,
    ModalRoot,
    ModalSizes,
    Text,
    TextArea,
    TextBox,
  },
  solid: { For, Show, createMemo, createSignal },
} = shelter;

export default function TagEditor(props) {
  const [draft, setDraft] = createSignal("");
  const [note, setNoteDraft] = createSignal(getNote(props.userId));
  const autocomplete = createEmojiAutocomplete(draft, setDraft);

  const user = createMemo(() => UserStore.getUser(props.userId));
  const name = () => user()?.globalName ?? user()?.username ?? props.userId;

  const tags = createMemo(() => getTags(props.userId));

  // Tags used elsewhere that this user does not have yet.
  const suggestions = createMemo(() => {
    const mine = new Set(tags().map(tagKey));
    return allTags()
      .filter((t) => !mine.has(t.key))
      .slice(0, 12);
  });

  const duplicate = () => tags().some((t) => tagKey(t) === tagKey(draft()));
  const canAdd = () => !!normalise(draft()) && !duplicate();

  const commit = () => {
    if (!canAdd()) return;
    addTag(props.userId, draft());
    setDraft("");
  };

  return (
    <ModalRoot size={ModalSizes.SMALL}>
      <ModalHeader close={props.close}>Tags for {name()}</ModalHeader>

      <ModalBody>
        <div class="ftags-editor-list">
          <Show
            when={tags().length}
            fallback={<span class="ftags-empty">No tags yet — add one below.</span>}
          >
            <For each={tags()}>
              {(tag) => (
                <span
                  class="ftags-editor-chip"
                  style={{ background: colorOf(tag), color: textOn(colorOf(tag)) }}
                >
                  {tag}
                  <button
                    aria-label={`Remove tag ${tag}`}
                    onClick={() => removeTag(props.userId, tag)}
                  >
                    ×
                  </button>
                </span>
              )}
            </For>
          </Show>
        </div>

        <div class="ftags-add-row" ref={autocomplete.setAnchor}>
          <TextBox
            value={draft()}
            placeholder="New tag… try :fire: or ~strike~"
            maxlength={80}
            aria-label="New tag"
            onInput={setDraft}
            onKeyDown={(e) => {
              autocomplete.keydown(e);
              // Enter adds the tag, unless the autocomplete just consumed it.
              if (e.key === "Enter" && !e.defaultPrevented) commit();
            }}
          />
          <Button onClick={commit} disabled={!canAdd()} size={ButtonSizes.SMALL}>
            Add
          </Button>
          <EmojiAutocomplete controller={autocomplete} />
        </div>

        <Show when={draft()}>
          <div class="ftags-live-preview">
            <span class="ftags-live-label">Preview</span>
            <Chip tag={draft()} animate={false} />
          </div>
        </Show>

        <Show when={duplicate()}>
          <Text style={{ color: "var(--text-danger)", "font-size": "13px" }}>
            {name()} already has that tag.
          </Text>
        </Show>

        <Show when={tags().length}>
          <Header tag={HeaderTags.H5} margin>
            Appearance
          </Header>
          <div style="display: flex; flex-direction: column; gap: 6px">
            <For each={tags()}>
              {(tag) => (
                <div style="display: flex; align-items: center; gap: 8px">
                  <Chip tag={tag} animate={false} />
                  <div style="flex: 1" />
                  <Button
                    size={ButtonSizes.TINY}
                    look={ButtonLooks.OUTLINED}
                    onClick={() => openStyler(tag)}
                  >
                    Style
                  </Button>
                </div>
              )}
            </For>
          </div>
        </Show>

        <Header tag={HeaderTags.H5} margin>
          Note
        </Header>
        <Text style={{ color: "var(--text-muted)", "font-size": "12px" }}>
          Private to you, and never shown next to their name.
        </Text>
        <div style="margin-top: 6px">
          <TextArea
            value={note()}
            onInput={(value) => {
              setNoteDraft(value);
              // Saved as you type; there's no confirm step to forget.
              setNote(props.userId, value);
            }}
            placeholder="How you know them, what they like…"
            maxlength={500}
            resize-y
            aria-label="Private note"
          />
        </div>

        <Show when={suggestions().length}>
          <Header tag={HeaderTags.H5} margin>
            Existing tags
          </Header>
          <div class="ftags-suggestions">
            <For each={suggestions()}>
              {(t) => (
                <Chip
                  class="ftags-suggestion"
                  animate={false}
                  tag={t.label}
                  title={`Used by ${t.count} ${t.count === 1 ? "person" : "people"}`}
                  onClick={() => addTag(props.userId, t.label)}
                />
              )}
            </For>
          </div>
        </Show>
      </ModalBody>

      <ModalFooter>
        <div style="display: flex; gap: 8px; justify-content: flex-end; width: 100%">
          <Show when={tags().length}>
            <Button
              look={ButtonLooks.OUTLINED}
              color={ButtonColors.RED}
              onClick={() => clearUser(props.userId)}
            >
              Remove all
            </Button>
          </Show>
          <Button onClick={props.close}>Done</Button>
        </div>
      </ModalFooter>
    </ModalRoot>
  );
}
