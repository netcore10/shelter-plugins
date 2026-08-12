import { panelOpen, togglePanel } from "../session";
import { playing } from "../player";
import { currentStation } from "../stations";
import { Bars, BroadcastIcon } from "./icons";

const {
  solid: { Show },
} = shelter;

export default function ToolbarButton(props) {
  const activate = (e) => togglePanel(e.currentTarget);

  return (
    <div
      // Discord's own button classes come along so we inherit their hover,
      // focus ring and icon colour exactly; ours only handles layout.
      class={`rad-btn ${props.native ?? ""}`}
      role="button"
      tabIndex={0}
      aria-label="Radio"
      aria-expanded={panelOpen()}
      onClick={activate}
      onKeyDown={(e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        activate(e);
      }}
    >
      <Show when={playing()} fallback={<BroadcastIcon />}>
        <div style={{ color: currentStation().accent }}>
          <Bars />
        </div>
      </Show>
    </div>
  );
}
