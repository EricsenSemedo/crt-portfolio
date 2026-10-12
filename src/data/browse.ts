import type { Project } from "../types";
import projects from "./projects";

// Prototype: how Projects groups its channels in the five browse directions.
export interface BrowseGroup {
  id: string;
  title: string;
  projects: Project[];
}

export interface BrowseMedia {
  poster: string;
  clip?: string;
}

const groupLineup = [
  { id: "software", title: "Software & AI", ids: ["pullworth", "toonsync", "stitch", "derma", "shadi", "project-manager-pro", "maze-generator"] },
  { id: "games", title: "Games", ids: ["heros-quest", "physics-grab", "dont-get-caught", "grow-your-plant", "zombies-game", "roblox-ai-system"] },
  { id: "client-websites", title: "Client websites", ids: ["edgewood-remodeling", "btb-creative-vision"] },
];

export const browseGroups: BrowseGroup[] = groupLineup.map(({ ids, ...group }) => ({
  ...group,
  projects: ids.flatMap((id) => projects.filter((project) => project.id === id)),
}));

export const browseLineup = browseGroups.flatMap((group) => group.projects);

const BROWSE_ROOT = "/crt-portfolio/projects/browse";
// Shadi has a single still, and Corruption Co. is off the air until it's repaired.
const STILL_ONLY = new Set(["shadi"]);
const OFF_AIR = new Set(["roblox-ai-system"]);

export function browseMedia(project: Project): BrowseMedia | null {
  if (OFF_AIR.has(project.id)) return null;
  return {
    poster: `${BROWSE_ROOT}/${project.id}.jpg`,
    clip: STILL_ONLY.has(project.id) ? undefined : `${BROWSE_ROOT}/${project.id}.webm`,
  };
}

/** Channel numbers run across every group, so each project keeps one number everywhere. */
export function channelNumber(project: Project) {
  return String(browseLineup.indexOf(project) + 1).padStart(2, "0");
}
