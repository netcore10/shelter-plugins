// Wumpus's web search: Wikipedia's intro and picture (no key), else a GIF from Discord's own GIF
// search. Discord's own CSP only allows Discord hosts; Dorion strips it, which is why Wikipedia works. Everything shown is checked against BLOCK first, and is only
// ever put in the bubble as text or as an <img> from a known GIF host.
const {
  plugin: { store },
  http,
} = shelter;

// Whole words, case-insensitive. A starting point, not a guarantee: add your own in settings.
const BLOCK =
  /\b(porn\w*|xxx|nsfw|nude\w*|naked|sex\w*|hentai|onlyfans|erotic\w*|fetish\w*|gore|beheading\w*|snuff|suicide|self[- ]?harm|kill (my|your)self|kys|n[i1]gg\w*|f[a4]gg?\w*|retard\w*|tranny|kike|chink|spic|meth|cocaine|heroin|fentanyl|bomb[- ]making|how to (make|build) (a )?(bomb|explosive)s?|child\s*(porn|abuse)|loli\w*|doxx?\w*|swat(ting)?)\b/i;

const extra = () =>
  (store.blockExtra ?? "")
    .split(",")
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean);

/** True if `s` should never be searched for or shown. */
export const blocked = (s) => BLOCK.test(s) || extra().some((w) => s.toLowerCase().includes(w));

const IMG_HOST = /^https:\/\/(upload\.wikimedia\.org|duckduckgo\.com|media\.tenor\.(com|co)|c\.tenor\.com|[\w-]+\.giphy\.com|[\w-]+\.discordapp\.(net|com))\//;

// Whole sentences only, up to n chars: it's shown AND read out, and a half sentence sounds broken.
// A first sentence longer than n is cut at a word and given a full stop.
const clip = (s, n = 400) => {
  s = s.replace(/\s+/g, " ").trim();
  let out = "";
  for (const sentence of s.split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/)) {
    if ((out + " " + sentence).trim().length > n) break;
    out = (out + " " + sentence).trim();
  }
  if (out) return out;
  // one sentence longer than n: end it at its last clause break, never mid-clause ("..., or")
  const cut = s.slice(0, n);
  const at = Math.max(cut.lastIndexOf(", "), cut.lastIndexOf("; "), cut.lastIndexOf(": "), cut.lastIndexOf(" ("));
  return cut.slice(0, at > n / 3 ? at : cut.lastIndexOf(" ")).replace(/[,;:\s]+$/, "") + ".";
};

// Wiktionary's HTML carries <style> blocks (TemplateStyles); textContent would read them out as CSS
// Drop (pronunciations, native spellings, dates), innermost first so nested ones go too: they read out as noise.
const plain = (s) => {
  for (let p; p !== s; ) (p = s), (s = s.replace(/\s*\([^()]*\)/g, ""));
  // Wikipedia's own extracts sometimes lose the closing bracket ("(known in Nepali as ... Chomolangma is the highest"): cut back to the verb
  return s.replace(/\s*\((?![^)]*\))[^]*?(?= (?:is|was|are|were) )/, "");
};

const text = (html) => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("style, script, link").forEach((n) => n.remove());
  return doc.body.textContent;
};

/** One word's meaning from Wiktionary (keyless, CORS-open). Same result shape as search(). */
export async function define(raw) {
  const w = raw.trim().slice(0, 40);
  if (!w || blocked(w)) return { kind: "blocked" };
  const res = await fetch("https://en.wiktionary.org/api/rest_v1/page/definition/" + encodeURIComponent(w.toLowerCase()));
  if (res.status === 404) return { kind: "none" };
  if (!res.ok) throw new Error("wiktionary " + res.status);
  const senses = ((await res.json()).en ?? [])
    .map((e) => [e.partOfSpeech.toLowerCase(), text(e.definitions.find((d) => d.definition)?.definition ?? "").trim()])
    .filter(([p, d]) => d && p !== "symbol" && !blocked(d))
    .slice(0, 1); // one sense: it has to be synthesised live, so short
  if (!senses.length) return { kind: "none" };
  return { kind: "ok", text: clip(`${w}. ` + senses.map(([p, d]) => `${p[0].toUpperCase() + p.slice(1)}: ${d.replace(/[.\s]+$/, "")}.`).join(" ")) };
}

// Wikipedia needs no key and sends CORS headers. One call: the best-matching article's intro and picture.
async function wiki(q) {
  const res = await fetch(
    "https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&generator=search&gsrlimit=3" +
      "&prop=extracts|pageimages&exintro=1&explaintext=1&exsentences=2&piprop=thumbnail&pithumbsize=300&gsrsearch=" +
      encodeURIComponent(q),
  );
  if (!res.ok) throw new Error("wikipedia " + res.status);
  // Wikipedia's own rank puts "Bonsai Kitten" above "Bonsai" for "bonzai plant". Prefer the title that matches
  // the query's words (first 3 letters, so a typo still counts) with the fewest extra words; ties keep Wikipedia's order.
  const qw = q.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  const score = ({ title, extract = "" }) => {
    const tw = title.toLowerCase().match(/[a-z0-9]+/g) ?? [];
    const hits = tw.filter((t) => qw.some((w) => w.slice(0, 3) === t.slice(0, 3))).length;
    const body = (title + " " + extract).toLowerCase();
    const mentioned = qw.filter((w) => body.includes(w.slice(0, 4))).length / (qw.length || 1); // "snake" must show up somewhere
    return hits - 0.5 * (tw.length - hits) + mentioned;
  };
  const pages = Object.values((await res.json()).query?.pages ?? {}).sort((a, b) => score(b) - score(a) || a.index - b.index);
  const p = pages.find((p) => p.extract && !/may (also )?refer to/i.test(p.extract) && !blocked(p.title + " " + p.extract));
  // drop (pronunciations, native spellings, dates): they read out as noise
  return p && { text: clip(plain(p.extract)), img: IMG_HOST.test(p.thumbnail?.source ?? "") ? p.thumbnail.source : undefined };
}

async function gif(q) {
  const r = await http.get({ url: `/gifs/search?q=${encodeURIComponent(q)}&media_format=gif&provider=tenor&locale=en-US` });
  const it = (r.body ?? []).find((g) => IMG_HOST.test(g.gif_src ?? "") && !blocked(`${g.title ?? ""} ${g.url ?? ""}`));
  return it?.gif_src ?? null;
}

// DuckDuckGo's Instant Answer API: keyless and CORS-open, but it only answers things DDG has a card for.
// (Its real web results are 403 / not CORS-readable from a browser page.)
async function ddg(q) {
  const res = await fetch("https://api.duckduckgo.com/?format=json&no_html=1&skip_disambig=1&no_redirect=1&q=" + encodeURIComponent(q));
  if (!res.ok) throw new Error("ddg " + res.status);
  const d = await res.json();
  const t = d.AbstractText || d.Answer || d.Definition; // not RelatedTopics: those are only loosely related
  if (!t || blocked(`${d.Heading} ${t}`)) return null;
  const img = d.Image?.startsWith("/") ? "https://duckduckgo.com" + d.Image : d.Image;
  return { text: clip(plain(String(t))), img: IMG_HOST.test(img ?? "") ? img : undefined };
}

/** -> { kind: "blocked" | "none" | "fail" | "ok", text?, img? } */
export async function search(raw) {
  const q = raw.replace(/\s+/g, " ").replace(/[?!.]+$/, "").trim().slice(0, 100);
  if (!q || blocked(q)) return { kind: "blocked" };
  const [d, g] = await Promise.allSettled([ddg(q), gif(q)]);
  const w = d.value ? d : await Promise.allSettled([wiki(q)]).then(([x]) => x); // DDG has no card: ask Wikipedia
  const text = w.value?.text;
  const img = w.value?.img ?? g.value ?? undefined; // the article's picture, else a GIF
  if (text || img) return { kind: "ok", text, img };
  return { kind: w.status === "rejected" && d.status === "rejected" && g.status === "rejected" ? "fail" : "none" };
}
