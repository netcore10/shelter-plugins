const {
  ui: { TextBox },
  solid: { createEffect, createSignal, onCleanup },
} = shelter;

/**
 * Saturation/brightness square with a hue bar underneath.
 *
 * Lives inside its own modal window (see openColorPicker). Not
 * <input type="color">: that opens Chromium's colour popup, and the click that
 * closes it lands on shelter's modal backdrop, which is wired to popModal — so
 * choosing a colour applied it and then dismissed the whole styler.
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
  // HSV held locally so hue and saturation survive dragging into black or
  // white; re-deriving from hex every frame would lose them there.
  const [hsv, setHsv] = createSignal(hexToHsv(props.value ?? "#5865f2"));
  const [text, setText] = createSignal(props.value ?? "");

  // Once the user has touched the picker it owns its own state.
  //
  // This effect used to resync from props on every change, and it reads hsv()
  // — so it re-ran on each drag step and, whenever props.value hadn't caught
  // up yet, wrote the OLD colour straight back. The thumb snapped home and the
  // drag went nowhere, even though the colour itself had been applied.
  let userDriven = false;

  createEffect(() => {
    const value = props.value;
    if (userDriven || !value) return;

    setHsv(hexToHsv(value));
    setText(value);
  });

  const commit = (next) => {
    userDriven = true;
    setHsv(next);
    const hex = hsvToHex(next);
    setText(hex);
    props.onChange(hex);
  };

  /**
   * Drag handling. The box is measured ONCE, when the drag starts.
   *
   * Re-measuring per move, or switching between offsetX and bounding-rect
   * depending on what the pointer happened to be over, gives two subtly
   * different answers and the thumb jitters between them. One measurement for
   * the whole gesture is stable — and safe now that the picker only mounts
   * after the modal has finished animating, so the box isn't mid-transform.
   */
  const dragging = (compute) => (e) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();

    if (!rect.width || !rect.height) return;

    const apply = (event) =>
      compute(
        (event.clientX - rect.left) / rect.width,
        (event.clientY - rect.top) / rect.height,
      );

    apply(e);

    const stop = () => {
      window.removeEventListener("pointermove", apply);
      window.removeEventListener("pointerup", stop);
    };

    window.addEventListener("pointermove", apply);
    window.addEventListener("pointerup", stop);
    onCleanup(stop);
  };

  const onSquare = dragging((fx, fy) =>
    commit({ ...hsv(), s: clamp01(fx), v: 1 - clamp01(fy) }),
  );

  const onHue = dragging((fx) => commit({ ...hsv(), h: clamp01(fx) * 360 }));

  const onHexInput = (value) => {
    userDriven = true;
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
        class="ftags-picker-sv"
        style={{ "background-color": hsvToHex({ h: hsv().h, s: 1, v: 1 }) }}
        onPointerDown={onSquare}
      >
        <div
          class="ftags-picker-thumb"
          style={{ left: `${hsv().s * 100}%`, top: `${(1 - hsv().v) * 100}%` }}
        />
      </div>

      <div class="ftags-picker-hue" onPointerDown={onHue}>
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
