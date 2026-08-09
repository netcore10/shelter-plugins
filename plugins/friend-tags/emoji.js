const {
  flux: { storesFlat },
} = shelter;

// ---------------------------------------------------------------------------
// Emoji lookup for the autocomplete.
//
// Custom server emoji come from Discord's EmojiStore, which is an internal API
// that moves around between builds — so every access is optional-chained and
// the whole thing is wrapped. If it breaks, custom emoji quietly stop being
// suggested rather than the picker exploding.
//
// Unicode emoji use the curated list below instead of Discord's internals, so
// the picker always has something useful to offer even if EmojiStore changes
// shape entirely.
// ---------------------------------------------------------------------------

// prettier-ignore
const UNICODE = {
  grinning:"😀", smile:"😄", joy:"😂", rofl:"🤣", sweat_smile:"😅", wink:"😉", blush:"😊",
  yum:"😋", sunglasses:"😎", heart_eyes:"😍", kissing_heart:"😘", thinking:"🤔", neutral_face:"😐",
  expressionless:"😑", smirk:"😏", unamused:"😒", pensive:"😔", confused:"😕", worried:"😟",
  cry:"😢", sob:"😭", angry:"😠", rage:"😡", triumph:"😤", sleepy:"😪", sleeping:"😴",
  mask:"😷", nauseated:"🤢", dizzy_face:"😵", cowboy:"🤠", clown:"🤡", skull:"💀",
  ghost:"👻", alien:"👽", robot:"🤖", smiling_imp:"😈", imp:"👿", japanese_ogre:"👹",
  poop:"💩", upside_down:"🙃", money_mouth:"🤑", nerd:"🤓", star_struck:"🤩", partying:"🥳",
  melting:"🫠", pleading:"🥺", yawning:"🥱", woozy:"🥴", hot:"🥵", cold:"🥶",
  heart:"❤️", orange_heart:"🧡", yellow_heart:"💛", green_heart:"💚", blue_heart:"💙",
  purple_heart:"💜", black_heart:"🖤", white_heart:"🤍", brown_heart:"🤎", broken_heart:"💔",
  two_hearts:"💕", sparkling_heart:"💖", heartpulse:"💗", cupid:"💘", gift_heart:"💝",
  thumbsup:"👍", thumbsdown:"👎", ok_hand:"👌", punch:"👊", fist:"✊", wave:"👋",
  raised_hands:"🙌", pray:"🙏", clap:"👏", muscle:"💪", point_up:"☝️", point_down:"👇",
  point_left:"👈", point_right:"👉", v:"✌️", crossed_fingers:"🤞", metal:"🤘", call_me:"🤙",
  eyes:"👀", brain:"🧠", tongue:"👅", lips:"👄", ear:"👂", nose:"👃",
  fire:"🔥", sparkles:"✨", star:"⭐", star2:"🌟", zap:"⚡", boom:"💥", collision:"💢",
  dizzy:"💫", sweat_drops:"💦", dash:"💨", tornado:"🌪️", rainbow:"🌈", sunny:"☀️",
  cloud:"☁️", snowflake:"❄️", crescent_moon:"🌙", full_moon:"🌕", earth:"🌍", comet:"☄️",
  crown:"👑", gem:"💎", ring:"💍", lipstick:"💄", high_heel:"👠", dress:"👗",
  tada:"🎉", confetti_ball:"🎊", balloon:"🎈", gift:"🎁", birthday:"🎂", cake:"🍰",
  pizza:"🍕", hamburger:"🍔", fries:"🍟", hotdog:"🌭", taco:"🌮", burrito:"🌯",
  popcorn:"🍿", doughnut:"🍩", cookie:"🍪", chocolate:"🍫", candy:"🍬", lollipop:"🍭",
  coffee:"☕", tea:"🍵", beer:"🍺", beers:"🍻", wine_glass:"🍷", cocktail:"🍸",
  tropical_drink:"🍹", champagne:"🍾", milk:"🥛", apple:"🍎", banana:"🍌", cherries:"🍒",
  grapes:"🍇", strawberry:"🍓", peach:"🍑", watermelon:"🍉", avocado:"🥑", eggplant:"🍆",
  dog:"🐶", cat:"🐱", mouse:"🐭", fox:"🦊", bear:"🐻", panda:"🐼", koala:"🐨",
  tiger:"🐯", lion:"🦁", cow:"🐮", pig:"🐷", frog:"🐸", monkey:"🐵", chicken:"🐔",
  penguin:"🐧", bird:"🐦", duck:"🦆", eagle:"🦅", owl:"🦉", bat:"🦇", wolf:"🐺",
  unicorn:"🦄", horse:"🐴", bee:"🐝", bug:"🐛", butterfly:"🦋", snail:"🐌", spider:"🕷️",
  snake:"🐍", turtle:"🐢", dragon:"🐉", whale:"🐳", dolphin:"🐬", fish:"🐟", octopus:"🐙",
  crab:"🦀", shark:"🦈", rose:"🌹", tulip:"🌷", sunflower:"🌻", cherry_blossom:"🌸",
  hibiscus:"🌺", bouquet:"💐", herb:"🌿", four_leaf_clover:"🍀", maple_leaf:"🍁",
  cactus:"🌵", palm_tree:"🌴", christmas_tree:"🎄", mushroom:"🍄",
  music:"🎵", notes:"🎶", headphones:"🎧", guitar:"🎸", microphone:"🎤", drum:"🥁",
  video_game:"🎮", dart:"🎯", game_die:"🎲", trophy:"🏆", medal:"🏅", soccer:"⚽",
  basketball:"🏀", football:"🏈", tennis:"🎾", skull_crossbones:"☠️", knife:"🔪",
  gun:"🔫", bomb:"💣", syringe:"💉", pill:"💊", key:"🔑", lock:"🔒", unlock:"🔓",
  hourglass:"⌛", alarm_clock:"⏰", watch:"⌚", bell:"🔔", loudspeaker:"📢", mega:"📣",
  book:"📖", books:"📚", pencil:"✏️", pen:"🖊️", scissors:"✂️", paperclip:"📎",
  computer:"💻", keyboard:"⌨️", phone:"📱", camera:"📷", tv:"📺", radio:"📻",
  bulb:"💡", flashlight:"🔦", battery:"🔋", plug:"🔌", magnet:"🧲", wrench:"🔧",
  hammer:"🔨", gear:"⚙️", link:"🔗", moneybag:"💰", dollar:"💵", credit_card:"💳",
  check:"✅", x:"❌", warning:"⚠️", question:"❓", exclamation:"❗", heavy_plus_sign:"➕",
  recycle:"♻️", infinity:"♾️", peace:"☮️", yin_yang:"☯️", biohazard:"☣️", radioactive:"☢️",
  no_entry:"⛔", "100":"💯", ok:"🆗", new:"🆕", cool:"🆒", free:"🆓", sos:"🆘",
};

/**
 * Custom emoji visible to the user.
 *
 * These are the real EmojiStore methods, per Discord's own typings:
 *   EmojiStore.getGuilds()                     -> { [guildId]: { emojis: [] } }
 *   EmojiStore.getGuildEmoji(guildId)          -> CustomEmoji[]
 *   ctx.getDisambiguatedEmoji()                -> Emoji[]  (custom have an id)
 *   ctx.getCustomEmoji()                       -> { [name]: CustomEmoji }
 *   ctx.getGroupedCustomEmoji()                -> { [guildId]: CustomEmoji[] }
 *
 * Several are tried because which ones are populated depends on Nitro state and
 * on the guild argument. Each is wrapped: this is internal API, and the picker
 * should degrade to unicode-only rather than throw.
 */
// Rebuilding the list means walking every emoji in every guild — for someone in
// 30+ servers that's thousands of objects, and it was happening on every
// shortcode lookup and every keystroke in the picker. Cached, with a name index
// so lookups are O(1), and refreshed on a timer so newly added emoji show up.
const CACHE_MS = 30_000;
let cache;
let cacheIndex;
let cachedAt = 0;
let generation = 0;

/** Bumped whenever the emoji list is rebuilt, so callers can drop derived caches. */
export const emojiGeneration = () => generation;

function customEmoji() {
  if (cache && Date.now() - cachedAt < CACHE_MS) return cache;

  cache = buildCustomEmoji();
  cacheIndex = new Map(cache.map((emoji) => [emoji.key.toLowerCase(), emoji]));
  cachedAt = Date.now();
  generation++;

  return cache;
}

function buildCustomEmoji() {
  const out = [];
  const seen = new Set();

  const push = (emoji) => {
    if (!emoji?.id || !emoji?.name || seen.has(emoji.id)) return;
    seen.add(emoji.id);
    out.push({
      key: emoji.name,
      id: emoji.id,
      animated: !!emoji.animated,
      // What gets typed into the tag: the explicit form always renders, with no
      // dependence on the store being available later.
      insert: `<${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}>`,
    });
  };

  const harvest = (value) => {
    if (Array.isArray(value)) value.forEach(push);
    else if (value && typeof value === "object")
      for (const entry of Object.values(value)) {
        if (Array.isArray(entry)) entry.forEach(push);
        else if (Array.isArray(entry?.emojis)) entry.emojis.forEach(push);
        else push(entry);
      }
  };

  const store = storesFlat.EmojiStore;

  const attempt = (fn) => {
    try {
      harvest(fn());
    } catch {
      /* try the next shape */
    }
  };

  attempt(() => store?.getGuilds?.());

  attempt(() => {
    const context = store?.getDisambiguatedEmojiContext?.();
    return context?.getCustomEmoji?.();
  });

  attempt(() => {
    const context = store?.getDisambiguatedEmojiContext?.();
    return context?.getGroupedCustomEmoji?.();
  });

  attempt(() => {
    const context = store?.getDisambiguatedEmojiContext?.();
    // Includes unicode too; push() ignores anything without an id.
    return context?.getDisambiguatedEmoji?.();
  });

  return out;
}

/**
 * A custom emoji by shortcode name, case-insensitively.
 *
 * Custom emoji win over unicode with the same name, which is what Discord does
 * and what people expect: if your server has a "Wave" emoji, `:Wave:` should be
 * that, not 👋.
 */
export function customEmojiByName(name) {
  customEmoji(); // ensures the index is built and fresh
  return cacheIndex?.get(String(name ?? "").toLowerCase());
}

/** How many custom emoji we can see — surfaced in settings for diagnosis. */
export const customEmojiCount = () => customEmoji().length;

const UNICODE_LIST = Object.entries(UNICODE).map(([key, char]) => ({
  key,
  char,
  insert: char,
}));

/**
 * The character for a `:shortcode:`, or undefined.
 *
 * Shared with the renderer so a shortcode the picker offers is always one the
 * chip can draw. Case-insensitive because Discord emoji names are lowercase but
 * people type ":Wave:".
 */
export const unicodeFor = (name) => UNICODE[String(name ?? "").toLowerCase()];

/** Prefix matches rank above substring ones, so ":fi" offers fire before high_five. */
function rank(pool, q) {
  const prefix = [];
  const contains = [];

  for (const emoji of pool) {
    const key = emoji.key.toLowerCase();
    if (key.startsWith(q)) prefix.push(emoji);
    else if (key.includes(q)) contains.push(emoji);
  }

  return [...prefix, ...contains];
}

/**
 * Suggestions for a partial `:shortcode`.
 *
 * Server and unicode emoji are ranked separately then interleaved, so neither
 * can crowd the other out of the list — a server with twenty emoji starting
 * "fi" shouldn't hide 🔥, and vice versa.
 */
export function searchEmoji(query, limit = 10) {
  const q = String(query ?? "").toLowerCase();

  const custom = rank(customEmoji(), q);
  const unicode = rank(UNICODE_LIST, q);

  const out = [];
  let i = 0;
  let j = 0;

  while (out.length < limit && (i < custom.length || j < unicode.length)) {
    if (i < custom.length) out.push(custom[i++]);
    if (out.length < limit && j < unicode.length) out.push(unicode[j++]);
  }

  return out;
}

/** The trailing `:partial` being typed, or undefined if there isn't one. */
export const emojiQuery = (text) => /:([a-zA-Z0-9_+-]*)$/.exec(String(text ?? ""))?.[1];

/** Replace the trailing `:partial` with a chosen emoji. */
export const applyEmoji = (text, emoji) =>
  String(text ?? "").replace(/:([a-zA-Z0-9_+-]*)$/, emoji.insert);
