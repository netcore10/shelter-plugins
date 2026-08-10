import ColorPicker from "./ColorPicker";

const {
  ui: { Button, ModalBody, ModalFooter, ModalHeader, ModalRoot, ModalSizes, openModal },
  solid: { Show, createSignal, onMount },
} = shelter;

/**
 * Open the colour picker as its own stacked modal.
 *
 * `value` is an accessor, not a value, so the picker tracks changes live while
 * it's open and the tag preview underneath updates as you drag.
 */
export function openColorPicker({ label, value, onChange }) {
  return openModal((props) => {
    const [ready, setReady] = createSignal(false);
    // shelter's modal transition is 250ms.
    onMount(() => setTimeout(() => setReady(true), 300));

    return (
    <ModalRoot size={ModalSizes.SMALL}>
      <ModalHeader close={props.close}>{label}</ModalHeader>

      <ModalBody>
        {/* Mounted only once the modal has finished animating in.
            shelter scales a new modal up from transform: scale(0), and while
            that runs the picker measures wrong and won't drag — which is the
            entire difference between a first and a second open. Waiting for
            the transition makes every open behave like a second one. */}
        <div class="ftags-picker-slot">
          <Show when={ready()}>
            <ColorPicker label={label} value={value()} onChange={onChange} />
          </Show>
        </div>
      </ModalBody>

      <ModalFooter>
        <div style="display: flex; justify-content: flex-end; width: 100%">
          <Button onClick={props.close}>Done</Button>
        </div>
      </ModalFooter>
      </ModalRoot>
    );
  });
}
