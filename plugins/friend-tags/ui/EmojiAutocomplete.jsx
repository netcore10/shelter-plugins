import { applyEmoji, emojiQuery, searchEmoji } from "../emoji";

const {
  solid: { For, Show, createEffect, createMemo, createSignal, onCleanup },
  solidWeb: { Portal },
  ui: { getRoot },
} = shelter;

/**
 * Discord-style emoji autocomplete for a text input.
 *
 *   const ac = createEmojiAutocomplete(() => draft(), setDraft);
 *   <div ref={ac.setAnchor}>
 *     <TextBox value={draft()} onInput={setDraft} onKeyDown={ac.keydown} />
 *   </div>
 *   <EmojiAutocomplete controller={ac} />
 *
 * The popup is portalled out of the modal body (which scrolls, and would clip
 * it) and positioned over the anchor with `position: fixed`.
 *
 * It must be portalled into the modal's own <dialog>, NOT document.body:
 * shelter opens modals with dialogEl.showModal(), which puts the dialog in the
 * browser's top layer. Top-layer content paints above everything in the normal
 * document regardless of z-index, so a popup on document.body is rendered
 * behind the modal and is simply invisible.
 *
 * Matching is anchored to the END of the value rather than the caret, because
 * shelter's TextBox doesn't expose a ref to the underlying input. Typing at the
 * end is the normal case; editing mid-string just doesn't trigger it.
 */
export function createEmojiAutocomplete(value, setValue) {
  const [selected, setSelected] = createSignal(0);
  const [dismissed, setDismissed] = createSignal(false);
  const [anchor, setAnchor] = createSignal();
  const [rect, setRect] = createSignal();

  const [caret, setCaret] = createSignal(null);

  const input = () => anchor()?.querySelector("input, textarea");

  // Track the caret so `:` triggers wherever it's typed, not just at the end of
  // the field. This matters most in the styler, whose Name box is pre-filled
  // with the existing tag — typing `:` there is always mid-string, so an
  // end-anchored match never fired and the picker appeared to be broken.
  createEffect(() => {
    const element = input();
    if (!element) return;

    const sync = () => setCaret(element.selectionStart);
    const events = ["input", "keyup", "click", "select", "focus"];

    for (const event of events) element.addEventListener(event, sync);
    sync();

    onCleanup(() => {
      for (const event of events) element.removeEventListener(event, sync);
    });
  });

  /** The text up to the caret — what a shortcode is matched against. */
  const head = () => {
    const position = caret();
    const text = value();
    return position == null || position > text.length ? text : text.slice(0, position);
  };

  const query = createMemo(() => emojiQuery(head()));
  const results = createMemo(() => (query() === undefined ? [] : searchEmoji(query(), 10)));
  const open = () => !dismissed() && results().length > 0;

  createEffect(() => {
    query();
    setSelected(0);
  });

  createEffect(() => {
    if (query() === undefined) setDismissed(false);
  });

  createEffect(() => {
    const element = anchor();
    if (!element) return;

    const measure = () => setRect(element.getBoundingClientRect());

    // Measure as soon as there's an anchor, so the popup has real coordinates
    // on its very first paint rather than a frame of display:none.
    measure();

    // Listeners only while it's actually open. Capture-phase scroll so it
    // follows the modal body scrolling, not just the window.
    if (!open()) return;

    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    onCleanup(() => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    });
  });

  const pick = (emoji) => {
    const text = value();
    const position = caret() ?? text.length;

    // Replace the shortcode being typed, keeping whatever follows the caret.
    const replaced = applyEmoji(text.slice(0, position), emoji);
    setValue(replaced + text.slice(position));
    setDismissed(true);

    // Put the caret just after what we inserted, so typing carries on naturally
    // instead of jumping to the end of the field.
    queueMicrotask(() => {
      const element = input();
      if (!element) return;
      element.focus();
      element.selectionStart = element.selectionEnd = replaced.length;
      setCaret(replaced.length);
    });
  };

  const keydown = (e) => {
    if (!open()) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelected((i) => (i + 1) % results().length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelected((i) => (i - 1 + results().length) % results().length);
        break;
      case "Enter":
      case "Tab":
        e.preventDefault();
        // Stop Enter from also submitting whatever we're inside.
        e.stopPropagation();
        pick(results()[selected()]);
        break;
      case "Escape":
        e.preventDefault();
        e.stopPropagation();
        setDismissed(true);
        break;
    }
  };

  /**
   * Where the popup gets portalled. getRoot walks up to the nearest <dialog>,
   * shadow root, or body — so inside a modal this lands in the top-layer
   * dialog, and outside one it falls back to the body.
   */
  const mount = () => {
    const element = anchor();
    try {
      return (element && getRoot?.(element)) || document.body;
    } catch {
      return document.body;
    }
  };

  return { query, results, open, selected, setSelected, pick, keydown, setAnchor, rect, mount };
}

const POPUP_MAX_HEIGHT = 290;

export default function EmojiAutocomplete(props) {
  const c = () => props.controller;

  const position = createMemo(() => {
    const r = c().rect();
    if (!r) return { display: "none" };

    // Prefer above the field, like Discord's; flip below when there's no room.
    const above = r.top >= POPUP_MAX_HEIGHT + 12;

    return {
      position: "fixed",
      left: `${r.left}px`,
      width: `${r.width}px`,
      ...(above
        ? { bottom: `${window.innerHeight - r.top + 8}px` }
        : { top: `${r.bottom + 8}px` }),
    };
  });

  return (
    <Show when={c().open()}>
      <Portal mount={c().mount()}>
        <div class="ftags-ac" style={position()}>
          <div class="ftags-ac-header">
            Emoji matching <strong>:{c().query()}</strong>
          </div>

          <div class="ftags-ac-list">
            <For each={c().results()}>
              {(emoji, i) => (
                <div
                  class={`ftags-ac-row${i() === c().selected() ? " ftags-ac-row--on" : ""}`}
                  onMouseEnter={() => c().setSelected(i())}
                  // mousedown, not click: the input would blur first otherwise.
                  onMouseDown={(e) => {
                    e.preventDefault();
                    c().pick(emoji);
                  }}
                >
                  <span class="ftags-ac-emoji">
                    <Show
                      when={emoji.id}
                      fallback={<span class="ftags-ac-char">{emoji.char}</span>}
                    >
                      <img
                        src={`https://cdn.discordapp.com/emojis/${emoji.id}.${
                          emoji.animated ? "gif" : "webp"
                        }?size=44`}
                        alt={emoji.key}
                        draggable={false}
                      />
                    </Show>
                  </span>
                  <span class="ftags-ac-name">:{emoji.key}:</span>
                  <Show when={emoji.id}>
                    <span class="ftags-ac-badge">server</span>
                  </Show>
                </div>
              )}
            </For>
          </div>
        </div>
      </Portal>
    </Show>
  );
}
