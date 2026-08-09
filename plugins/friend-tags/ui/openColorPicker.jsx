import ColorPicker from "./ColorPicker";

const {
  ui: { Button, ModalBody, ModalFooter, ModalHeader, ModalRoot, ModalSizes, openModal },
} = shelter;

/**
 * Open the colour picker as its own stacked modal.
 *
 * `value` is an accessor, not a value, so the picker tracks changes live while
 * it's open and the tag preview underneath updates as you drag.
 */
export function openColorPicker({ label, value, onChange }) {
  return openModal((props) => (
    <ModalRoot size={ModalSizes.SMALL}>
      <ModalHeader close={props.close}>{label}</ModalHeader>

      <ModalBody>
        <div style="padding-bottom: 10px">
          <ColorPicker label={label} value={value()} onChange={onChange} />
        </div>
      </ModalBody>

      <ModalFooter>
        <div style="display: flex; justify-content: flex-end; width: 100%">
          <Button onClick={props.close}>Done</Button>
        </div>
      </ModalFooter>
    </ModalRoot>
  ));
}
