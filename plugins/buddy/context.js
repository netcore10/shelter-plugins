// What a question is about, for questions that don't say ("what is this?", "who?"): the messages just above
// it in the open channel, else the person you're talking to. Nothing here leaves the machine; search.js only
// sees a topic after you press the button that shows it.
const {
  flux: {
    storesFlat: { MessageStore, SelectedChannelStore, ChannelStore, UserStore },
  },
} = shelter;

// Question words, pronouns and everyday filler: a question made only of these has no topic.
const FILLER = new Set(
  "what whats who whom whose where when why how which are was were the this that these those there here and for with you your yours can could would should will does did has have had any anyone someone something anything everything just really actually about from not but out get got doing going working work works good bad idea think thinking feel feeling like want need know mean say said okay yeah now today tonight tomorrow yesterday earlier later soon again ever never always thing things still stuff right wrong sure true real haha hahaha hehe lol lmao lmfao rofl omg yep yes nope nah wow bruh dude man guys thanks thank please sorry ok hey hello hiya heya howdy sup".split(" "),
);
const words = (s) => s.toLowerCase().match(/[a-z0-9']+/g) ?? [];
export const hasTopic = (t) => words(t).some((w) => w.length > 2 && !FILLER.has(w));

// Your own name is never the answer ("hey Sam, ..." above doesn't make "who?" mean you).
const mine = () => {
  const u = UserStore?.getCurrentUser?.();
  return [u?.globalName ?? u?.global_name, u?.username].filter(Boolean).map((n) => n.toLowerCase());
};
const isMe = (name) => mine().some((m) => name.toLowerCase() === m || words(name).includes(m));

const strip = (s) => s.replace(/<[^>]*>|https?:\/\/\S+|[*_`~|>]/g, " ").replace(/\s+/g, " ").trim();

/** The thing a message is about: a Name Like This (not at a sentence start), else its last two topic words. */
function topicOf(text, namesOnly) {
  const s = strip(text);
  const names = [...s.matchAll(/\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*/g)].filter((m) => m.index > 0 && !/[.!?]\s*$/.test(s.slice(0, m.index)) && !isMe(m[0]));
  if (names.length) return names.at(-1)[0];
  if (namesOnly) return "";
  return words(s).filter((w) => w.length > 2 && !FILLER.has(w) && !isMe(w)).slice(-2).join(" ");
}

const recent = () => {
  const id = SelectedChannelStore?.getChannelId?.();
  return (MessageStore?.getMessages?.(id)?.toArray?.() ?? []).slice(-3).reverse(); // newest first; the draft isn't in here
};

/** A topic from the last few messages, or "". `namesOnly`: just proper names (for "who"). */
export const topicAbove = (namesOnly) => {
  for (const m of recent()) {
    const t = m.content && topicOf(m.content, namesOnly);
    if (t) return t;
  }
  return "";
};

/** Who "who?" means with no name above: the person in this DM, else whoever spoke last. */
export function whoElse() {
  const id = SelectedChannelStore?.getChannelId?.();
  const ch = ChannelStore?.getChannel?.(id);
  const nameOf = (u) => u && (u.globalName ?? u.global_name ?? u.username);
  if (ch?.type === 1) {
    const name = nameOf(UserStore?.getUser?.(ch.recipients?.[0]));
    if (name) return `That's ${name}. You're chatting with them right now.`;
  }
  const me = UserStore?.getCurrentUser?.()?.id;
  const last = recent().find((m) => m.author && m.author.id !== me);
  const name = nameOf(last?.author);
  return name ? `The last person who spoke was ${name}.` : "";
}
