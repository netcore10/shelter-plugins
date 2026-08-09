const {
  ui: { TextBox },
  solid: { createEffect, createSignal, onCleanup },
} = shelter;

/**
 * A real colour picker: saturation/brightness square with a hue bar under it.
 *
 * Listeners are attached by hand in a `ref` callback rather than with Solid's
 * onPointerDown / onclick props. Solid routes its handlers through document
 * level event delegation, and delegated handlers on hand-written elements do
 * not fire inside a shelter modal — which is what made every previous attempt
 * at this look dead. addEventListener on the element itself always fires.
 *
 * Not <input type="color">: its Chromium popup closes onto shelter's modal
 * backdrop, which is wired to popModal, so choosing a colour killed the modal.
 */

export function normaliseHex(input) {
  const raw = String(input ?? "").trim().replace(/^#/, "");
  const full = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;

  return /^[0-9a-f]{6}$/i.test(full) ? `#${full.toLowerCase()}` : undefined;
}

const hexToRgb = (hex) => {
  const value = parseInt(String(hex ?? "").replace("#", ""), 16) || 0;
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
};

const rgbToHex = ({ r, g, b }) =>
  `#${[r, g, b].map((n) => Math.round(n).toString(16).padStart(2, "0")).join("")}`;

function rgbToHsv({ r, g, b }) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;

    h *= 60;
    if (h < 0) h += 360;
  }

  return { h, s: max ? d / max : 0, v: max };
}

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
const hexToHsv = (hex) => rgbToHsv(hexToRgb(hex));
const clamp01 = (n) => Math.min(1, Math.max(0, n));

export default function ColorPicker(props) {
  // HSV is held locally so hue and saturation survive dragging into black or
  // white; re-deriving from hex every frame would lose them there.
  const [hsv, setHsv] = createSignal(hexToHsv(props.value ?? "#5865f2"));
  const [text, setText] = createSignal(props.value ?? "");

  createEffect(() => {
    const value = props.value;
    if (!value) return;
    if (hsvToHex(hsv()) !== value) setHsv(hexToHsv(value));
    if (normaliseHex(text()) !== value) setText(value);
  });

  const commit = (patch) => {
    const next = { ...hsv(), ...patch };
    setHsv(next);
    const hex = hsvToHex(next);
    setText(hex);
    props.onChange(hex);
  };

  /**
   * Wire drag handling straight onto the element. Returns a ref callback.
   * `read` turns a pointer position within the element into an HSV patch.
   */
  const draggable = (read) => (element) => {
    if (!element) return;

    const apply = (event) => {
      const rect = element.getBoundingClientRect();
      commit(read(event, rect));
    };

    const onDown = (event) => {
      event.preventDefault();
      event.stopPropagation();
      apply(event);

      const onUp = () => {
        window.removeEventListener("pointermove", apply);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", apply);
      window.addEventListener("pointerup", onUp);
    };

    element.addEventListener("pointerdown", onDown);
    onCleanup(() => element.removeEventListener("pointerdown", onDown));
  };

  const squareRef = draggable((event, rect) => ({
    s: clamp01((event.clientX - rect.left) / rect.width),
    v: 1 - clamp01((event.clientY - rect.top) / rect.height),
  }));

  const hueRef = draggable((event, rect) => ({
    h: clamp01((event.clientX - rect.left) / rect.width) * 360,
  }));

  const onHexInput = (value) => {
    setText(value);
    // Full values only: "#aab" is valid 3-digit hex, so committing while typing
    // would flash a wrong colour partway through a 6-digit one.
    if (/^#?[0-9a-f]{6}$/i.test(value.trim())) {
      const hex = normaliseHex(value);
      setHsv(hexToHsv(hex));
      props.onChange(hex);
    }
  };

  const onHexBlur = () => {
    const hex = normaliseHex(text());
    if (hex) {
      setHsv(hexToHsv(hex));
      props.onChange(hex);
    } else setText(props.value ?? "");
  };

  return (
    <div class="ftags-picker">
      <div
        ref={squareRef}
        class="ftags-picker-sv"
        style={{ "background-color": hsvToHex({ h: hsv().h, s: 1, v: 1 }) }}
      >
        <div
          class="ftags-picker-thumb"
          style={{ left: `${hsv().s * 100}%`, top: `${(1 - hsv().v) * 100}%` }}
        />
      </div>

      <div ref={hueRef} class="ftags-picker-hue">
        <div class="ftags-picker-thumb" style={{ left: `${(hsv().h / 360) * 100}%`, top: "50%" }} />
      </div>

      <div class="ftags-picker-row">
        <span class="ftags-picker-preview" style={{ background: props.value }} />
        <TextBox
          value={text()}
          onInput={onHexInput}
          onBlur={onHexBlur}
          placeholder="#rrggbb"
          maxlength={7}
          aria-label={props.label ?? "Hex colour"}
        />
      </div>
    </div>
  );
}
