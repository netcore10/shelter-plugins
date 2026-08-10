import Chip from "./Chip";
import { openTagEditor } from "./TagRow";
import { openStyler } from "./openStyler";
import { allTags, allUserTags, clearUser, deleteTag, renameTag } from "../data";

const {
  flux: {
    storesFlat: { UserStore },
  },
  ui: {
    Button,
    ButtonColors,
    ButtonLooks,
    ButtonSizes,
    Divider,
    Header,
    HeaderTags,
    ModalBody,
    ModalFooter,
    ModalHeader,
    ModalRoot,
    ModalSizes,
    Text,
    TextBox,
    openConfirmationModal,
  },
  solid: { For, Show, createMemo, createSignal },
} = shelter;

function TagRowEntry(props) {
  const [renaming, setRenaming] = createSignal(false);
  const [draft, setDraft] = createSignal(props.tag.label);

  const commit = () => {
    renameTag(props.tag.label, draft());
    setRenaming(false);
  };

  return (
    <>
      <Button
        size={ButtonSizes.TINY}
        look={ButtonLooks.OUTLINED}
        onClick={() => openStyler(props.tag.label)}
      >
        Style
      </Button>

      <Show when={renaming()} fallback={<Chip tag={props.tag.label} animate={false} />}>
        <div style="display: flex; gap: 6px; align-items: center">
          <TextBox value={draft()} onInput={setDraft} aria-label="Rename tag" maxlength={40} />
          <Button size={ButtonSizes.TINY} onClick={commit}>
            Save
          </Button>
        </div>
      </Show>

      <span class="ftags-count">
        {props.tag.count} {props.tag.count === 1 ? "person" : "people"}
      </span>

      <div style="display: flex; gap: 6px">
        <Button
          size={ButtonSizes.TINY}
          look={ButtonLooks.OUTLINED}
          onClick={() => {
            setDraft(props.tag.label);
            setRenaming(!renaming());
          }}
        >
          {renaming() ? "Cancel" : "Rename"}
        </Button>
        <Button
          size={ButtonSizes.TINY}
          look={ButtonLooks.OUTLINED}
          color={ButtonColors.RED}
          onClick={() =>
            openConfirmationModal({
              header: () => `Delete "${props.tag.label}"?`,
              body: () =>
                `This removes the tag from all ${props.tag.count} ${
                  props.tag.count === 1 ? "person" : "people"
                } who have it.`,
              confirmText: "Delete",
              type: "danger",
            }).then(
              () => deleteTag(props.tag.label),
              () => {},
            )
          }
        >
          Delete
        </Button>
      </div>
    </>
  );
}

export default function TagManager(props) {
  const [filter, setFilter] = createSignal("");

  const tags = createMemo(() => {
    const query = filter().toLowerCase();
    return allTags().filter((t) => !query || t.key.includes(query));
  });

  const users = createMemo(() => {
    const query = filter().toLowerCase();

    // allUserTags(), not store.tags: the raw store is the wrong source once
    // per-account tags are on, and it sidesteps the memo everything else reads
    // from — which is how a cleared user could still be listed here.
    return Object.entries(allUserTags())
      .map(([userId, userTags]) => {
        const user = UserStore.getUser(userId);
        return {
          userId,
          tags: userTags,
          name: user?.globalName ?? user?.username ?? userId,
        };
      })
      .filter(
        (entry) =>
          !query ||
          entry.name.toLowerCase().includes(query) ||
          entry.tags.some((t) => t.toLowerCase().includes(query)),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  return (
    <ModalRoot size={ModalSizes.MEDIUM}>
      <ModalHeader close={props.close}>Manage tags</ModalHeader>

      <ModalBody>
        <TextBox
          value={filter()}
          onInput={setFilter}
          placeholder="Filter by tag or person…"
          aria-label="Filter"
        />

        <Header tag={HeaderTags.H5} margin>
          Tags
        </Header>
        <Show
          when={tags().length}
          fallback={<span class="ftags-empty">No tags yet.</span>}
        >
          <div class="ftags-manager-grid">
            <For each={tags()}>{(tag) => <TagRowEntry tag={tag} />}</For>
          </div>
        </Show>

        <Divider mt mb />

        <Header tag={HeaderTags.H5}>Tagged people</Header>
        <Show
          when={users().length}
          fallback={<span class="ftags-empty">Nobody is tagged yet.</span>}
        >
          <For each={users()}>
            {(entry) => (
              <div class="ftags-user-row">
                <span class="ftags-user-name" title={entry.userId}>
                  {entry.name}
                </span>

                <span class="ftags-user-tags">
                  <For each={entry.tags}>{(tag) => <Chip tag={tag} animate={false} />}</For>
                </span>

                <Button
                  size={ButtonSizes.TINY}
                  look={ButtonLooks.OUTLINED}
                  onClick={() => openTagEditor(entry.userId)}
                >
                  Edit
                </Button>
                <Button
                  size={ButtonSizes.TINY}
                  look={ButtonLooks.OUTLINED}
                  color={ButtonColors.RED}
                  onClick={() => clearUser(entry.userId)}
                >
                  Clear
                </Button>
              </div>
            )}
          </For>
        </Show>

        <Show when={!users().length && !tags().length}>
          <Text style={{ color: "var(--text-muted)", "font-size": "13px" }}>
            Open your friends list and hover someone to add your first tag.
          </Text>
        </Show>
      </ModalBody>

      <ModalFooter>
        <ByIdAdder />
      </ModalFooter>
    </ModalRoot>
  );
}

/**
 * Escape hatch: tag someone by raw ID. Discord reshuffles its class names from
 * time to time, and if that ever breaks the friends list injection this stays
 * working regardless.
 */
function ByIdAdder() {
  const [id, setId] = createSignal("");

  const valid = () => /^\d{17,20}$/.test(id().trim());

  return (
    <div style="width: 100%">
      <div style="display: flex; gap: 8px; align-items: center">
        <TextBox value={id()} onInput={setId} placeholder="User ID" aria-label="User ID" />
        <Button
          disabled={!valid()}
          onClick={() => {
            openTagEditor(id().trim());
            setId("");
          }}
        >
          Tag by ID
        </Button>
      </div>
      <Show when={id() && !valid()}>
        <Text style={{ color: "var(--text-danger)", "font-size": "13px" }}>
          That doesn't look like a user ID.
        </Text>
      </Show>
    </div>
  );
}
