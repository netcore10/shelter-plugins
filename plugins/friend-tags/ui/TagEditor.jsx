import Chip from "./Chip";
import { openStyler } from "./openStyler";
import {
  addTag,
  allTags,
  clearUser,
  colorOf,
  getTags,
  normalise,
  removeTag,
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
    TextBox,
  },
  solid: { For, Show, createMemo, createSignal },
} = shelter;

export default function TagEditor(props) {
  const [draft, setDraft] = createSignal("");

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

        <div class="ftags-add-row">
          <TextBox
            value={draft()}
            placeholder="New tag…"
            maxlength={40}
            aria-label="New tag"
            onInput={setDraft}
          />
          <Button onClick={commit} disabled={!canAdd()} size={ButtonSizes.SMALL}>
            Add
          </Button>
        </div>

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
                  <Chip tag={tag} />
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

        <Show when={suggestions().length}>
          <Header tag={HeaderTags.H5} margin>
            Existing tags
          </Header>
          <div class="ftags-suggestions">
            <For each={suggestions()}>
              {(t) => (
                <Chip
                  class="ftags-suggestion"
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
