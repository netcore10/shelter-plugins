import Chip from "./Chip";
import TagEditor from "./TagEditor";
import { display, getTags } from "../data";

const {
  ui: { openModal },
  solid: { For, Show, createMemo },
} = shelter;

export const openTagEditor = (userId) =>
  openModal((props) => <TagEditor userId={userId} close={props.close} />);

/**
 * The chip strip injected next to a username.
 *
 * `show` is an accessor rather than a plain boolean so that toggling a surface
 * off in settings updates already-injected rows instantly, with no reload.
 */
export default function TagRow(props) {
  const tags = createMemo(() => getTags(props.userId));

  const shown = createMemo(() => {
    const limit = display.maxShown();
    return limit > 0 ? tags().slice(0, limit) : tags();
  });
  const overflow = createMemo(() => tags().length - shown().length);

  const edit = (e) => {
    e.stopPropagation();
    e.preventDefault();
    openTagEditor(props.userId);
  };

  return (
    <Show when={props.show?.() ?? true}>
      <Show when={props.editable || tags().length}>
        <span
          class={`ftags-row${props.compact ? " ftags-row--compact" : ""}${
            props.editable ? " ftags-row--editable" : ""
          }${!tags().length ? " ftags-row--empty" : ""}`}
        >
          <For each={shown()}>
            {(tag) => <Chip tag={tag} onClick={props.editable ? edit : undefined} />}
          </For>

          <Show when={overflow() > 0}>
            <span
              class="ftags-chip ftags-chip--more"
              title={tags().join(", ")}
              onClick={props.editable ? edit : undefined}
            >
              +{overflow()}
            </span>
          </Show>

          <Show when={props.editable}>
            <button class="ftags-add" aria-label="Edit tags for this user" onClick={edit}>
              +
            </button>
          </Show>
        </span>
      </Show>
    </Show>
  );
}
