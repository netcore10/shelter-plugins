import { showEmojiPreview } from "./EmojiPreview";
import { customEmojiByName, unicodeFor } from "../emoji";

const {
  flux: { storesFlat },
  solid: { For },
} = shelter;

// ---------------------------------------------------------------------------
// Tiny inline renderer for tag text: Discord emoji plus the inline markdown
// people actually type into a short label.
//
// Not a general markdown implementation on purpose — tags are one line, so
// block constructs (lists, quotes, code fences) are out of scope and would only
// create ways for a tag to break its own chip.
// ---------------------------------------------------------------------------

const EMOJI_CDN = "https://cdn.discordapp.com/emojis";

/**
 * Resolve a `:shortcode:` against Discord's emoji data.
 *
 * Every lookup is optional-chained and wrapped: these are internal Discord
 * APIs, and a rename upstream should degrade to showing the literal `:name:`
 * rather than throwing inside a chip that's rendered hundreds of times.
 */
/**
 * Both kinds of emoji are supported, and `:name:` means the unicode one.
 *
 * This mirrors Discord: a bare shortcode is the standard emoji, and a server
 * emoji is written `<:name:id>` — which is unambiguous and exactly what the
 * picker inserts. So `:wave:` stays 👋 even if you also have a "Wave" emoji,
 * and both remain reachable. A server emoji whose name ISN'T a standard
 * shortcode still resolves from a bare `:name:`, as a convenience.
 */
function lookupShortcode(name) {
  const char = unicodeFor(name);
  if (char) return { text: char };

  try {
    const context = storesFlat.EmojiStore?.getDisambiguatedEmojiContext?.();
    const found = context?.getByName?.(String(name).toLowerCase()) ?? context?.getByName?.(name);

    // Unicode entries come back with the character itself rather than an ID.
    if (found?.surrogates) return { text: found.surrogates };
    if (found?.id) return { id: found.id, name: found.name, animated: !!found.animated };
  } catch {
    /* fall through to custom emoji */
  }

  try {
    const custom = customEmojiByName(name);
    if (custom) return { id: custom.id, name: custom.key, animated: custom.animated };
  } catch {
    /* leave the shortcode as literal text */
  }
}

// <:name:id> and <a:name:id> are unambiguous and need no store lookup, so they
// are matched first and always work.
const CUSTOM_EMOJI = /<(a?):(\w+):(\d+)>/;
const SHORTCODE = /:([a-zA-Z0-9_+-]+):/;

/** Split text into plain strings and emoji descriptors. */
function tokeniseEmoji(text) {
  const out = [];
  let rest = text;

  while (rest) {
    const custom = CUSTOM_EMOJI.exec(rest);
    const short = SHORTCODE.exec(rest);

    // Whichever comes first wins; a custom form starting at the same index as a
    // shortcode is the more specific match.
    const match =
      custom && short ? (custom.index <= short.index ? custom : short) : (custom ?? short);

    if (!match) {
      out.push(rest);
      break;
    }

    if (match.index > 0) out.push(rest.slice(0, match.index));

    if (match === custom) {
      out.push({ id: match[3], name: match[2], animated: match[1] === "a" });
    } else {
      const found = lookupShortcode(match[1]);
      // Carry the shortcode through so the preview can name it.
      // Unknown shortcode: leave it exactly as typed.
      out.push(found ? { ...found, name: found.name ?? match[1] } : match[0]);
    }

    rest = rest.slice(match.index + match[0].length);
  }

  return out;
}

// Longest markers first so ** isn't eaten by *, and __ isn't eaten by _.
const MARKS = [
  { open: "***", tag: "bi" },
  { open: "**", tag: "b" },
  { open: "__", tag: "u" },
  { open: "~~", tag: "s" },
  { open: "`", tag: "code" },
  { open: "*", tag: "i" },
  { open: "_", tag: "i" },
  // Single tilde isn't Discord syntax, but it's what people reach for.
  { open: "~", tag: "s" },
];

/**
 * Parse inline markdown into a tree of { tag, children } nodes.
 * Unmatched markers stay literal, so a tag named "C++ ~ Rust" survives intact.
 */
function parseMarkdown(text) {
  const nodes = [];
  let buffer = "";

  const flush = () => {
    if (buffer) {
      nodes.push(...tokeniseEmoji(buffer));
      buffer = "";
    }
  };

  const isWord = (char) => !!char && /\w/.test(char);

  let i = 0;
  while (i < text.length) {
    const mark = MARKS.find((m) => text.startsWith(m.open, i));

    if (mark) {
      const close = text.indexOf(mark.open, i + mark.open.length);

      // Underscores only italicise at word boundaries, matching Discord. Without
      // this a tag called big_tiddy_goth_girl comes out as big<i>tiddy</i>goth_girl.
      const underscore = mark.open === "_" || mark.open === "__";
      const bounded =
        !underscore ||
        (!isWord(text[i - 1]) && !isWord(text[close + mark.open.length]));

      if (close !== -1 && bounded) {
        flush();
        nodes.push({
          tag: mark.tag,
          children: parseMarkdown(text.slice(i + mark.open.length, close)),
        });
        i = close + mark.open.length;
        continue;
      }
    }

    buffer += text[i];
    i++;
  }

  flush();
  return nodes;
}

/**
 * Open the preview, and stop the click there.
 *
 * Without stopping it, the same click also hits whatever the chip sits on — the
 * tag editor on an editable chip, or Discord's own handler for a username in
 * chat, which would open a profile behind the preview.
 */
const previewOnClick = (emoji) => (e) => {
  e.preventDefault();
  e.stopPropagation();
  showEmojiPreview(emoji, e.currentTarget);
};

function Node(props) {
  const node = () => props.node;

  return (
    <>
      {typeof node() === "string" ? (
        node()
      ) : node().text ? (
        // Wrapped so a unicode emoji is a click target too; bare text isn't.
        <span
          class="ftags-emoji-char"
          onClick={previewOnClick({ char: node().text, name: node().name })}
        >
          {node().text}
        </span>
      ) : node().id ? (
        <img
          class="ftags-emoji"
          src={`${EMOJI_CDN}/${node().id}.${node().animated ? "gif" : "webp"}?size=44`}
          alt={`:${node().name}:`}
          draggable={false}
          onClick={previewOnClick(node())}
        />
      ) : (
        <Marked node={node()} />
      )}
    </>
  );
}

function Marked(props) {
  const children = () => <For each={props.node.children}>{(child) => <Node node={child} />}</For>;

  switch (props.node.tag) {
    case "b":
      return <b>{children()}</b>;
    case "i":
      return <i>{children()}</i>;
    case "u":
      return <u>{children()}</u>;
    case "s":
      return <s>{children()}</s>;
    case "bi":
      return (
        <b>
          <i>{children()}</i>
        </b>
      );
    case "code":
      return <code class="ftags-code">{children()}</code>;
    default:
      return <>{children()}</>;
  }
}

const CUSTOM_EMOJI_ALL = /<(a?):(\w+):(\d+)>/g;

/** Strip markup so it can be used in a title/aria attribute. */
export const plainText = (text) =>
  String(text ?? "")
    .replace(CUSTOM_EMOJI_ALL, (_, __, name) => `:${name}:`)
    .replace(/\*\*\*|\*\*|__|~~|`|\*|_|~/g, "");

export default function RichText(props) {
  const nodes = () => parseMarkdown(String(props.text ?? ""));

  return <For each={nodes()}>{(node) => <Node node={node} />}</For>;
}
