import RichText, { plainText } from "./RichText";
import { styleOf, styleToCss } from "../data";

const {
  plugin: { store },
} = shelter;

/**
 * A single tag pill. Shared by every surface and every modal, so what you see
 * in the styler preview is exactly what lands next to a username.
 *
 * Pass `style` to render an unsaved config (the live preview); otherwise the
 * tag's saved style is looked up, which keeps chips reactive to edits.
 */
export default function Chip(props) {
  const config = () => props.style ?? styleOf(props.tag);

  const css = () =>
    styleToCss(config(), { animate: props.animate ?? store.animate });

  return (
    <span
      class={`ftags-chip${store.uppercase && !props.plain ? " ftags-chip--upper" : ""}${
        props.class ? ` ${props.class}` : ""
      }`}
      style={css()}
      title={props.title ?? plainText(props.tag)}
      onClick={props.onClick}
    >
      {/* Inner span so the whole label is ONE flex item. Without it each run of
          text is its own anonymous flex item and flex layout strips the spaces
          around it, so "~a~ b" renders as "ab". */}
      <span class="ftags-chip-text">
        <RichText text={props.tag} />
      </span>
    </span>
  );
}
