import { useState } from "react";
import { browseGroups } from "../../data/browse";
import GuideDirection from "./GuideDirection";
import IndexDirection from "./IndexDirection";
import ShelvesDirection from "./ShelvesDirection";
import StoreDirection from "./StoreDirection";
import type { BrowseDirectionProps } from "./types";
import WallDirection from "./WallDirection";

const DIRECTIONS = [
  { id: "shelves", label: "Shelves", from: "Apple TV", View: ShelvesDirection },
  { id: "guide", label: "Guide", from: "Pluto TV", View: GuideDirection },
  { id: "store", label: "Store", from: "Steam", View: StoreDirection },
  { id: "wall", label: "Wall", from: "itch.io", View: WallDirection },
  { id: "index", label: "Index", from: "Rauno", View: IndexDirection },
] as const;

type DirectionId = (typeof DIRECTIONS)[number]["id"];

const STORAGE_KEY = "crt-proto-browse-direction";

function savedDirection(): DirectionId {
  const saved = window.localStorage?.getItem(STORAGE_KEY);
  return DIRECTIONS.find((direction) => direction.id === saved)?.id ?? "shelves";
}

/** Prototype: the five browse directions for Projects, switchable from a remote pinned to the bottom. */
export default function BrowseDirections({ onOpen }: Pick<BrowseDirectionProps, "onOpen">) {
  const [directionId, setDirectionId] = useState<DirectionId>(savedDirection);
  const direction = DIRECTIONS.find((candidate) => candidate.id === directionId) ?? DIRECTIONS[0];
  const { View } = direction;

  function choose(id: DirectionId) {
    window.localStorage?.setItem(STORAGE_KEY, id);
    setDirectionId(id);
  }

  return (
    <>
      <View key={direction.id} groups={browseGroups} onOpen={onOpen} />

      <nav
        aria-label="Prototype layout"
        className="sticky bottom-3 z-40 mx-auto mt-10 grid w-full grid-cols-5 gap-1 border border-crt-border-secondary bg-crt-overlay/95 p-1 shadow-[0_10px_40px_rgb(0_0_0/0.6)] backdrop-blur sm:flex sm:w-fit"
      >
        {DIRECTIONS.map((candidate, index) => (
          <button
            key={candidate.id}
            type="button"
            aria-pressed={candidate.id === direction.id}
            onClick={() => choose(candidate.id)}
            className={"min-h-11 px-1 py-1 text-center font-mono text-xs transition-colors sm:px-3 sm:text-left sm:text-sm "
              + (candidate.id === direction.id ? "bg-crt-accent text-crt-on-accent" : "text-crt-text-secondary hover:bg-crt-surface-secondary hover:text-crt-text")}
          >
            <span className="block sm:inline">{index + 1}</span> {candidate.label}
            <span className={"hidden text-[0.65rem] sm:block " + (candidate.id === direction.id ? "text-crt-on-accent/75" : "text-crt-text-tertiary")}>
              like {candidate.from}
            </span>
          </button>
        ))}
      </nav>
    </>
  );
}
