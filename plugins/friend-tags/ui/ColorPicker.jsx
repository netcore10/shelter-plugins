const {
  ui: { Button, ButtonSizes, TextBox },
  solid: { For, createEffect, createSignal },
} = shelter;

/**
 * Colour picker built entirely from shelter Buttons.
 *
 * Confirmed the hard way: inside a shelter modal, ONLY shelter's own
 * components receive clicks. A drag square, bare buttons and clickable spans
 * all render and hover correctly but never fire, whether wired with Solid's
 * delegated handlers, lowercase direct props, or addEventListener on a ref.
 * <input type="color"> is out too — its Chromium popup closes onto shelter's
 * modal backdrop, which pops the modal.
 *
 * So the picker is a grid: hues across, shades down, every cell a Button.
 * Same job as a drag square, made of the one thing that works.
 */

export function normaliseHex(input) {
  const raw = String(input ?? "").trim().replace(/^#/, "");
  const full = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;

  return /^[0-9a-f]{6}$/i.test(full) ? `#${full.toLowerCase()}` : undefined;
}

const rgbToHex = ({ r, g, b }) =>
  `#${[r, g, b].map((n) => Math.round(n).toString(16).padStart(2, "0")).join("")}`;

function hsvToRgb({ h, s, v }) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  const [r, g, b] =
    h < 60 ? [c, x, 0]
    : h < 120 ? [x, c, 0]
    : h < 180 ? [0, c, x]
    : h < 240 ? [0, x, c]
    : h < 300 ? [x, 0, c]
    : [c, 0, x];

  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

const hsvToHex = (hsv) => rgbToHex(hsvToRgb(hsv));

// 14 hues across the spectrum, 6 shades each: bright and pale at the top,
// deep and dark at the bottom.
const HUES = Array.from({ length: 14 }, (_, i) => (i * 360) / 14);
const SHADES = [
  { s: 0.35, v: 1.0 },
  { s: 0.6, v: 1.0 },
  { s: 0.85, v: 1.0 },
  { s: 1.0, v: 0.82 },
  { s: 1.0, v: 0.6 },
  { s: 1.0, v: 0.38 },
];

const GREYS = ["#ffffff", "#c9cdd4", "#9aa0a8", "#6b7079", "#3f434a", "#23262b", "#000000"];

const ROWS = SHADES.map((shade) => HUES.map((h) => hsvToHex({ h, ...shade })));

export default function ColorPicker(props) {
  const [text, setText] = createSignal(props.value ?? "");

  createEffect(() => {
    const value = props.value;
    if (value && normaliseHex(text()) !== value) setText(value);
  });

  const onHexInput = (value) => {
    setText(value);
    // Full values only: "#aab" is valid 3-digit hex, so committing while typing
    // would flash a wrong colour partway through a 6-digit one.
    if (/^#?[0-9a-f]{6}$/i.test(value.trim())) props.onChange(normaliseHex(value));
  };

  const onHexBlur = () => {
    const hex = normaliseHex(text());
    if (hex) props.onChange(hex);
    else setText(props.value ?? "");
  };

  const selected = () => String(props.value ?? "").toLowerCase();

  const Cell = (cellProps) => (
    <Button
      size={ButtonSizes.NONE}
      class={`ftags-cell${selected() === cellProps.colour.toLowerCase() ? " ftags-cell--on" : ""}`}
      style={{ background: cellProps.colour }}
      aria-label={cellProps.colour}
      onClick={() => props.onChange(cellProps.colour)}
    />
  );

  return (
    <div class="ftags-picker">
      <div class="ftags-grid">
        <For each={ROWS}>
          {(row) => <For each={row}>{(colour) => <Cell colour={colour} />}</For>}
        </For>
      </div>

      <div class="ftags-grid ftags-grid--greys">
        <For each={GREYS}>{(colour) => <Cell colour={colour} />}</For>
      </div>

      <div class="ftags-picker-row">
        <span class="ftags-picker-preview" style={{ background: props.value }} />
        <TextBox
          value={text()}
          onInput={onHexInput}
          onBlur={onHexBlur}
          placeholder="#rrggbb — any colour"
          maxlength={7}
          aria-label={props.label ?? "Hex colour"}
        />
      </div>
    </div>
  );
}
