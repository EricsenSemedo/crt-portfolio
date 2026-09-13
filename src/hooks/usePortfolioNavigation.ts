import { useCallback } from "react";
import { matchPath, useLocation, useNavigate } from "react-router";
import { type PortfolioChannelId } from "../data/channels";
import projects from "../data/projects";
import type { Project } from "../types";

interface PortfolioNavigationState {
  portfolioNavigation?: {
    previousPathname?: string;
  };
}

interface PortfolioNavigation {
  channel: PortfolioChannelId | null;
  project: Project | null;
  redirectTo: string | null;
  navigateToTV: (targetId: string) => void;
  openProject: (project: Project) => void;
  closeProject: () => void;
  closeTV: () => void;
}

const channelPaths: Record<PortfolioChannelId, string> = {
  home: "/profile",
  portfolio: "/portfolio",
  contact: "/contact",
};

function getPreviousPathname(state: unknown) {
  return (state as PortfolioNavigationState | null)?.portfolioNavigation?.previousPathname;
}

export default function usePortfolioNavigation(): PortfolioNavigation {
  const location = useLocation();
  const navigate = useNavigate();
  const projectMatch = matchPath("/portfolio/:projectId", location.pathname);
  const project = projectMatch
    ? projects.find((candidate) => candidate.id === projectMatch.params.projectId) ?? null
    : null;

  let channel: PortfolioChannelId | null = null;
  let redirectTo: string | null = null;

  if (matchPath("/", location.pathname)) {
    channel = null;
  } else if (matchPath("/profile", location.pathname) || matchPath("/home", location.pathname)) {
    channel = "home";
    if (matchPath("/home", location.pathname)) redirectTo = "/profile";
  } else if (matchPath("/portfolio", location.pathname)) {
    channel = "portfolio";
  } else if (projectMatch) {
    channel = "portfolio";
    if (!project) redirectTo = "/portfolio";
  } else if (matchPath("/contact", location.pathname)) {
    channel = "contact";
  } else {
    redirectTo = "/";
  }

  const navigateToTV = useCallback((targetId: string) => {
    if (!(targetId in channelPaths)) return;
    const targetPath = channelPaths[targetId as PortfolioChannelId];
    if (location.pathname === targetPath) return;
    navigate(targetPath, {
      state: { portfolioNavigation: { previousPathname: location.pathname } },
    });
  }, [location.pathname, navigate]);

  const openProject = useCallback((nextProject: Project) => {
    const targetPath = `/portfolio/${nextProject.id}`;
    if (location.pathname === targetPath) return;
    navigate(targetPath, {
      state: { portfolioNavigation: { previousPathname: location.pathname } },
    });
  }, [location.pathname, navigate]);

  const closeProject = useCallback(() => {
    if (getPreviousPathname(location.state) === "/portfolio") {
      navigate(-1);
      return;
    }
    navigate("/portfolio", { replace: true, state: null });
  }, [location.state, navigate]);

  const closeTV = useCallback(() => {
    if (getPreviousPathname(location.state) === "/") {
      navigate(-1);
      return;
    }
    navigate("/", { replace: true, state: null });
  }, [location.state, navigate]);

  return { channel, project, redirectTo, navigateToTV, openProject, closeProject, closeTV };
}
