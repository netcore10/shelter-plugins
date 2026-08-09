import Chip from "./Chip";
import EmojiAutocomplete, { createEmojiAutocomplete } from "./EmojiAutocomplete";
import { normalise, renameTag, resetStyle, setStyle, styleOf } from "../data";
import { COLOR_ANIMS, FONTS, GRADIENT_PRESETS, MOTIONS } from "../presets";

const {
  ui: {
    Button,
    ButtonColors,
    ButtonLooks,
    ButtonSizes,
    Divider,
    Header,
    HeaderTags,
    ModalBody,
    ModalFooter,
    ModalHeader,
    ModalRoot,
    ModalSizes,
    Slider,
    SwitchItem,
    Text,
    TextBox,
  },
  solid: { For, Show, createSignal },
} = shelter;

const label = { color: "var(--header-secondary)", "font-size": "12px", "text-transform": "uppercase", "font-weight": 700 };

export default function TagStyler(props) {
  // Edited locally so the preview updates instantly and Cancel can walk away.
  const [draft, setDraft] = createSignal(styleOf(props.tag));
  const [name, setName] = createSignal(props.tag);
  const autocomplete = createEmojiAutocomplete(name, setName);

  const patch = (changes) => setDraft({ ...draft(), ...changes });

  const renamed = () => normalise(name()) && normalise(name()) !== props.tag;

  const setStop = (index, value) => {
    const colors = [...draft().colors];
    colors[index] = value;
    patch({ colors });
  };

  const addStop = () => patch({ colors: [...draft().colors, "#ffffff"] });
  const removeStop = (index) =>
    patch({ colors: draft().colors.filter((_, i) => i !== index) });

  const save = () => {
    // Rename first so the style lands on the new name — renameTag carries the
    // existing colour and style over, then setStyle overwrites with the draft.
    const target = renamed() ? normalise(name()) : props.tag;
    if (renamed()) renameTag(props.tag, target);
    setStyle(target, draft());
    props.close();
  };

  return (
    <ModalRoot size={ModalSizes.MEDIUM}>
      <ModalHeader close={props.close}>Style “{props.tag}”</ModalHeader>

      <ModalBody>
        <div class="ftags-preview">
          {/* animate is forced on so you can see the effect while choosing it,
              even if animations are globally muted in settings */}
          <Chip tag={normalise(name()) || props.tag} style={draft()} animate />
          <Chip tag={normalise(name()) || props.tag} style={draft()} animate plain />
        </div>

        <Header tag={HeaderTags.H5}>Name</Header>
        <div class="ftags-field" ref={autocomplete.setAnchor}>
          <TextBox
            value={name()}
            onInput={setName}
            maxlength={80}
            placeholder="Tag name"
            aria-label="Tag name"
            onKeyDown={autocomplete.keydown}
          />
          <EmojiAutocomplete controller={autocomplete} />
          <Show when={renamed()}>
            <Text style={{ color: "var(--text-muted)", "font-size": "12px" }}>
              Renaming on save — this updates the tag on everyone who has it.
            </Text>
          </Show>
        </div>

        <Divider mt mb />
        <Header tag={HeaderTags.H5}>Fill</Header>
        <div style="display: flex; gap: 8px; margin-bottom: 10px">
          <Button
            grow
            look={draft().fill === "solid" ? ButtonLooks.FILLED : ButtonLooks.OUTLINED}
            onClick={() => patch({ fill: "solid" })}
          >
            Solid
          </Button>
          <Button
            grow
            look={draft().fill === "gradient" ? ButtonLooks.FILLED : ButtonLooks.OUTLINED}
            onClick={() => patch({ fill: "gradient" })}
          >
            Gradient
          </Button>
        </div>

        <Show when={draft().fill === "solid"}>
          <div class="ftags-field">
            <span style={label}>Colour</span>
            <input
              type="color"
              class="ftags-swatch"
              aria-label="Tag colour"
              value={draft().color}
              onInput={(e) => patch({ color: e.currentTarget.value })}
            />
          </div>
        </Show>

        <Show when={draft().fill === "gradient"}>
          <div class="ftags-field">
            <span style={label}>Stops</span>
            <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap">
              <For each={draft().colors}>
                {(stop, i) => (
                  <span style="display: inline-flex; gap: 2px; align-items: center">
                    <input
                      type="color"
                      class="ftags-swatch"
                      aria-label={`Gradient stop ${i() + 1}`}
                      value={stop}
                      onInput={(e) => setStop(i(), e.currentTarget.value)}
                    />
                    <Show when={draft().colors.length > 2}>
                      <button
                        class="ftags-stop-remove"
                        aria-label={`Remove stop ${i() + 1}`}
                        onClick={() => removeStop(i())}
                      >
                        ×
                      </button>
                    </Show>
                  </span>
                )}
              </For>
              <Show when={draft().colors.length < 5}>
                <Button size={ButtonSizes.TINY} look={ButtonLooks.OUTLINED} onClick={addStop}>
                  + Stop
                </Button>
              </Show>
            </div>
          </div>

          <div class="ftags-field">
            <span style={label}>Angle — {draft().angle}°</span>
            <Slider
              value={draft().angle}
              onInput={(v) => patch({ angle: Math.round(v) })}
              min={0}
              max={360}
              step={15}
            />
          </div>

          <div class="ftags-field">
            <span style={label}>Presets</span>
            <div class="ftags-suggestions">
              <For each={GRADIENT_PRESETS}>
                {(preset) => (
                  <Chip
                    class="ftags-suggestion"
                    tag={preset.label}
                    style={{ ...draft(), fill: "gradient", colors: preset.colors, angle: preset.angle }}
                    animate={false}
                    onClick={() =>
                      patch({ fill: "gradient", colors: [...preset.colors], angle: preset.angle })
                    }
                  />
                )}
              </For>
            </div>
          </div>
        </Show>

        <Divider mt mb />
        <Header tag={HeaderTags.H5}>Text</Header>

        <div class="ftags-field">
          <span style={label}>Colour</span>
          <div style="display: flex; gap: 8px; align-items: center">
            <Button
              size={ButtonSizes.TINY}
              look={draft().text === "auto" ? ButtonLooks.FILLED : ButtonLooks.OUTLINED}
              onClick={() => patch({ text: "auto" })}
            >
              Auto
            </Button>
            <input
              type="color"
              class="ftags-swatch"
              aria-label="Text colour"
              value={draft().text === "auto" ? "#ffffff" : draft().text}
              onInput={(e) => patch({ text: e.currentTarget.value })}
            />
            <Text style={{ color: "var(--text-muted)", "font-size": "12px" }}>
              Auto picks black or white for contrast.
            </Text>
          </div>
        </div>

        <div class="ftags-field">
          <span style={label}>Font</span>
          <div class="ftags-font-grid">
            <For each={FONTS}>
              {(font) => (
                <button
                  class={`ftags-font-option${draft().font === font.id ? " ftags-font-option--on" : ""}`}
                  style={{ "font-family": font.id || "inherit" }}
                  onClick={() => patch({ font: font.id })}
                >
                  {font.label}
                </button>
              )}
            </For>
          </div>
          <TextBox
            value={draft().font}
            onInput={(v) => patch({ font: v })}
            placeholder="…or a custom font-family"
            aria-label="Custom font family"
          />
        </div>

        <div class="ftags-field">
          <span style={label}>Weight — {draft().weight}</span>
          <Slider
            value={draft().weight}
            onInput={(v) => patch({ weight: Math.round(v) })}
            min={400}
            max={900}
            step={100}
            tick={100}
          />
        </div>

        <SwitchItem
          checked={draft().italic}
          value={draft().italic}
          onChange={(v) => patch({ italic: v })}
          hideBorder
        >
          Italic
        </SwitchItem>

        <Divider mt mb />
        <Header tag={HeaderTags.H5}>Animation</Header>
        <Text style={{ color: "var(--text-muted)", "font-size": "12px" }}>
          Colour and movement are separate — pick one of each, or just one.
        </Text>

        <div class="ftags-field" style={{ "margin-top": "10px" }}>
          <span style={label}>Colour</span>
          <div class="ftags-anim-grid">
            <For each={COLOR_ANIMS}>
              {(anim) => (
                <button
                  class={`ftags-anim-option${draft().colorAnim === anim.id ? " ftags-anim-option--on" : ""}`}
                  title={anim.note}
                  onClick={() => patch({ colorAnim: anim.id })}
                >
                  {anim.label}
                </button>
              )}
            </For>
          </div>

          <Show when={draft().colorAnim === "flow" && draft().fill !== "gradient"}>
            <Text style={{ color: "var(--text-warning, var(--text-muted))", "font-size": "12px" }}>
              Flow needs a gradient fill to have anything to slide.
            </Text>
          </Show>

          <Show when={draft().colorAnim !== "none"}>
            <span style={label}>Colour speed — {draft().colorSpeed}×</span>
            <Slider
              value={draft().colorSpeed}
              onInput={(v) => patch({ colorSpeed: Math.round(v * 4) / 4 })}
              min={0.25}
              max={3}
              step={0.25}
            />
          </Show>
        </div>

        <div class="ftags-field">
          <span style={label}>Movement</span>
          <div class="ftags-anim-grid">
            <For each={MOTIONS}>
              {(anim) => (
                <button
                  class={`ftags-anim-option${draft().motion === anim.id ? " ftags-anim-option--on" : ""}`}
                  title={anim.note}
                  onClick={() => patch({ motion: anim.id })}
                >
                  {anim.label}
                </button>
              )}
            </For>
          </div>

          <Show when={draft().motion !== "none"}>
            <span style={label}>Movement speed — {draft().motionSpeed}×</span>
            <Slider
              value={draft().motionSpeed}
              onInput={(v) => patch({ motionSpeed: Math.round(v * 4) / 4 })}
              min={0.25}
              max={3}
              step={0.25}
            />
          </Show>
        </div>
      </ModalBody>

      <ModalFooter>
        <div style="display: flex; gap: 8px; justify-content: flex-end; width: 100%">
          <Button
            look={ButtonLooks.OUTLINED}
            color={ButtonColors.RED}
            onClick={() => {
              resetStyle(props.tag);
              props.close();
            }}
          >
            Reset
          </Button>
          <Button look={ButtonLooks.OUTLINED} onClick={props.close}>
            Cancel
          </Button>
          <Button onClick={save}>Save</Button>
        </div>
      </ModalFooter>
    </ModalRoot>
  );
}
