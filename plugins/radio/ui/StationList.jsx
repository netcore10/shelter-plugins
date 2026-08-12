import { store } from "../data";
import { groupedStations } from "../stations";
import { selectStation } from "../session";
import Artwork from "./Artwork";

const {
  solid: { For, Show },
} = shelter;

export default function StationList() {
  return (
    <div class="rad-list">
      <For each={groupedStations()}>
        {(group) => (
          <>
            <div class="rad-group">{group.name}</div>
            <For each={group.stations}>
              {(station) => (
                <button
                  type="button"
                  class="rad-item"
                  aria-current={store.station === station.id}
                  onClick={() => selectStation(station.id)}
                >
                  <Artwork class="rad-item-art" station={station} />
                  <div class="rad-item-text">
                    <div class="rad-item-name">{station.name}</div>
                    <Show when={station.genre}>
                      <div class="rad-item-genre">{station.genre}</div>
                    </Show>
                  </div>
                </button>
              )}
            </For>
          </>
        )}
      </For>
    </div>
  );
}
