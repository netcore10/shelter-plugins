import Settings from "../settings";

const {
  ui: { openModal, ModalRoot, ModalHeader, ModalBody, ModalSizes },
} = shelter;

/**
 * The same settings component shelter renders on the plugin card, in a modal
 * reachable from the panel — getting there through shelter's plugin list for a
 * volume tweak is a lot of clicks.
 *
 * Nothing here measures itself on mount, which matters: shelter's modals
 * animate in from transform: scale(0), so anything sizing itself immediately
 * would read a box that isn't its final one.
 */
export default function openSettings() {
  openModal((props) => (
    <ModalRoot size={ModalSizes.MEDIUM}>
      <ModalHeader close={props.close}>Radio</ModalHeader>
      <ModalBody>
        <Settings />
      </ModalBody>
    </ModalRoot>
  ));
}
