import type { BrowseGroup } from "../../data/browse";
import type { Project } from "../../types";

export interface BrowseDirectionProps {
  groups: BrowseGroup[];
  /** Opens a project, carrying the clicked screen into its page. */
  onOpen: (project: Project, screen?: Element | null) => void;
}
