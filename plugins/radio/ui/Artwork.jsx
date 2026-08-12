const {
  solid: { createSignal, createMemo, Show },
} = shelter;

/**
 * Album art with two fallbacks: the station's own logo, then a tile in the
 * station's accent colour. Remote images fail often enough — a station between
 * tracks, a CDN hiccup — that a broken-image glyph in the panel would be a
 * regular sight without this.
 */
export default function Artwork(props) {
  const [broken, setBroken] = createSignal(null);

  const src = createMemo(() => {
    const candidate = props.src || props.station?.logo || null;
    return candidate && candidate !== broken() ? candidate : null;
  });

  return (
    <Show
      when={src()}
      fallback={
        <div
          class={`${props.class} rad-art-blank`}
          style={{ background: props.station?.accent ?? "#5865f2" }}
          aria-hidden="true"
        >
          {(props.station?.name ?? "?").trim().charAt(0).toUpperCase()}
        </div>
      }
    >
      <img class={props.class} src={src()} alt="" loading="lazy" onError={() => setBroken(src())} />
    </Show>
  );
}
