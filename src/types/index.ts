// Project types
export interface ProjectDemo {
  type: 'video' | 'gif' | 'image';
  src: string;
  alt: string;
}

export interface ProjectSourceLink {
  label: string;
  href: string;
}

export interface ProjectStoryStep {
  label: string;
  title: string;
  description: string;
}

export interface ProjectDetailedDescription {
  contribution: string;
  problem: string;
  solution: string;
  impact: string;
  highlights: string[];
}

export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  status: string;
  tech: string[];
  image?: string;
  github?: string;
  demo?: ProjectDemo;
  media?: ProjectDemo[];
  detailLayout?: 'case-study' | 'game' | 'hackathon';
  sources?: ProjectSourceLink[];
  storySteps?: ProjectStoryStep[];
  detailedDescription: ProjectDetailedDescription;
}

// A client website shown on the Websites channel
interface ClientSiteBase {
  id: string;
  client: string;
  business: string;
  summary: string;
}

export interface PublicClientSite extends ClientSiteBase {
  visibility: 'public';
  poster: string;
  clip?: string;
  liveUrl?: string;
}

/** Private sites carry no media: anything in the build can be downloaded, so previews are sent by hand. */
export interface PrivateClientSite extends ClientSiteBase {
  visibility: 'private';
}

export type ClientSite = PublicClientSite | PrivateClientSite;

// Pan/Camera state
export interface PanState {
  selectedId: string | null;
  scale: number;
  isAnimating: boolean;
}

// TV configuration
export interface TVConfig {
  id: string;
  title: string;
  width: number;
}

// Navigation function type
export type NavigateFunction = (targetId: string) => void;
