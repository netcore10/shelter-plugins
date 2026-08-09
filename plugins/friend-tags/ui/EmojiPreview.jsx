const {
  flux: { storesFlat },
  solidWeb: { render },
  ui: { getRoot },
} = shelter;

// ---------------------------------------------------------------------------
// Click-to-preview for an emoji inside a tag.
//
// Imperative rather than a mounted component, because chips are injected into
// dozens of places all over Discord (and inside modals) and there is no single
// parent to hang a popover off. Opening one closes any other.
// ---------------------------------------------------------------------------

let dispose;

export function closeEmojiPreview() {
  dispose?.();
  dispose = undefined;
}

/** Where a custom emoji comes from, if Discord will tell us. */
function sourceOf(emoji) {
  if (!emoji.id) return "Standard emoji";

  try {
    const custom = storesFlat.EmojiStore?.getCustomEmojiById?.(emoji.id);
    const guild = custom?.guildId && storesFlat.GuildStore?.getGuild?.(custom.guildId);
    if (guild?.name) return `Server emoji — ${guild.name}`;
  } catch {
    /* fall through to the generic label */
  }

  return "Server emoji";
}

function Preview(props) {
  const rect = props.rect;

  // Sit above the emoji where possible, centred on it, and flip below when
  // there isn't room. Fixed positioning so page scroll containers can't clip it.
  const width = 190;
  const height = 150;
  const above = rect.top > height + 12;

  const left = Math.min(
    Math.max(8, rect.left + rect.width / 2 - width / 2),
    window.innerWidth - width - 8,
  );

  return (
    <div
      class="ftags-preview-pop"
      style={{
        left: `${left}px`,
        width: `${width}px`,
        ...(above
          ? { bottom: `${window.innerHeight - rect.top + 10}px` }
          : { top: `${rect.bottom + 10}px` }),
      }}
      // Clicks inside shouldn't count as "outside" and close it.
      onClick={(e) => e.stopPropagation()}
    >
      <div class="ftags-preview-art">
        {props.emoji.id ? (
          <img
            src={`https://cdn.discordapp.com/emojis/${props.emoji.id}.${
              props.emoji.animated ? "gif" : "webp"
            }?size=128`}
            alt={props.emoji.name ?? ""}
            draggable={false}
          />
        ) : (
          <span class="ftags-preview-char">{props.emoji.char}</span>
        )}
      </div>

      <div class="ftags-preview-name">:{props.emoji.name ?? "emoji"}:</div>
      <div class="ftags-preview-source">{sourceOf(props.emoji)}</div>
    </div>
  );
}

/**
 * Show the preview for an emoji, anchored to the element that was clicked.
 * Dismissed by any click elsewhere, Escape, or scrolling away.
 */
export function showEmojiPreview(emoji, anchor) {
  closeEmojiPreview();

  const root = (() => {
    try {
      return getRoot?.(anchor) || document.body;
    } catch {
      return document.body;
    }
  })();

  const container = document.createElement("div");
  container.className = "ftags-preview-host";
  root.appendChild(container);

  const rect = anchor.getBoundingClientRect();
  const unrender = render(() => <Preview emoji={emoji} rect={rect} />, container);

  const onKey = (e) => {
    if (e.key === "Escape") closeEmojiPreview();
  };

  // Deferred so the click that opened this one doesn't immediately close it.
  const listen = () => {
    document.addEventListener("click", closeEmojiPreview);
    document.addEventListener("keydown", onKey, true);
    window.addEventListener("scroll", closeEmojiPreview, true);
  };
  const timer = setTimeout(listen);

  dispose = () => {
    clearTimeout(timer);
    document.removeEventListener("click", closeEmojiPreview);
    document.removeEventListener("keydown", onKey, true);
    window.removeEventListener("scroll", closeEmojiPreview, true);
    unrender();
    container.remove();
  };
}
