import { createBasementRoom } from "./createBasementRoom";
import { createBasketball } from "./createBasketball";
import { createController } from "./createController";
import { createDiscTV } from "./createDiscTV";
import { createGameConsole } from "./createGameConsole";
import { createGameTV } from "./createGameTV";
import { createTable } from "./createTable";
import { createVhsTV } from "./createVhsTV";
import type { Group } from "three";

export interface ViewableAsset {
  id: string;
  label: string;
  category: string;
  accent: string;
  create: () => {
    group: Group;
    dispose: () => void;
  };
}

export const viewableAssets: ViewableAsset[] = [
  {
    id: "vhs-tv",
    label: "VHS CRT",
    category: "Television",
    accent: "#22d3ee",
    create: createVhsTV,
  },
  {
    id: "disc-tv",
    label: "Disc CRT",
    category: "Television",
    accent: "#67e8f9",
    create: createDiscTV,
  },
  {
    id: "game-tv",
    label: "Game CRT",
    category: "Television",
    accent: "#f97316",
    create: createGameTV,
  },
  {
    id: "basement-room",
    label: "Basement Room",
    category: "Scene",
    accent: "#84cc16",
    create: createBasementRoom,
  },
  {
    id: "table",
    label: "Long Table",
    category: "Furniture",
    accent: "#f59e0b",
    create: createTable,
  },
  {
    id: "game-console",
    label: "Game Console",
    category: "Prop",
    accent: "#ef4444",
    create: createGameConsole,
  },
  {
    id: "wired-controller",
    label: "Wired Controller",
    category: "Prop",
    accent: "#f43f5e",
    create: createController,
  },
  {
    id: "basketball",
    label: "Basketball",
    category: "Prop",
    accent: "#fb923c",
    create: createBasketball,
  },
];
