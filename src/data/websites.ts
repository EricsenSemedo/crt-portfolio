import type { Project } from "../types";
import { browseGroups, browseMedia } from "./browse";

// The Websites channel shows the same client sites as the Client Websites shelf in Projects.
export interface ClientSite {
  project: Project;
  business: string;
  poster: string;
  clip?: string;
  liveUrl?: string;
}

const BUSINESS: Record<string, string> = {
  "edgewood-remodeling": "Remodeler · Rhode Island",
  "btb-creative-vision": "Filmmaker · Providence",
  "luis-rosa": "Illustrator · Rhode Island",
};

export const clientSites: ClientSite[] = (browseGroups.find((group) => group.id === "client-websites")?.projects ?? [])
  .flatMap((project) => {
    const media = browseMedia(project);
    if (!media) return [];
    return [{
      project,
      business: BUSINESS[project.id] ?? project.category,
      poster: media.poster,
      clip: media.clip,
      liveUrl: project.sources?.find((source) => source.label === "Visit site")?.href,
    }];
  });

export default clientSites;
