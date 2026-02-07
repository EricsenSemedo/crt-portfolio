// Project types
export interface ProjectDemo {
  type: 'video' | 'gif' | 'image';
  src: string;
  alt: string;
}

export interface ProjectDetailedDescription {
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
  image: string;
  github?: string;
  demo: ProjectDemo;
  detailedDescription: ProjectDetailedDescription;
}

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

// Theme
export type Theme = "dark" | "light";
