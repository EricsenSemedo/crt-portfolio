import type { ClientSite } from "../types";

// Prototype: live copies are served over Tailscale until the Cloudflare copies exist.
const PREVIEW_HOST = "http://100.120.188.124";

export const clientSites: ClientSite[] = [
  {
    id: "btb-creative-vision",
    client: "BTB Creative Vision",
    business: "Videographer · Providence",
    summary: "Portfolio site that puts a filmmaker's reels front and centre.",
    visibility: "public",
    poster: "/crt-portfolio/websites/btb-poster.jpg",
    clip: "/crt-portfolio/websites/btb-tour.mp4",
    liveUrl: `${PREVIEW_HOST}:8781/`,
  },
  {
    id: "edgewood-remodeling",
    client: "Edgewood Remodeling",
    business: "Remodeler · Rhode Island",
    summary: "Photography-led redesign that shows the work and makes quote requests easy.",
    visibility: "public",
    poster: "/crt-portfolio/websites/edgewood-poster.jpg",
    clip: "/crt-portfolio/projects/edgewood-demo-v2.webm",
    liveUrl: `${PREVIEW_HOST}:8782/`,
  },
  // Prototype example of an unreleased build.
  {
    id: "client-store",
    client: "Client store",
    business: "Clothing · Shopify",
    summary: "Online store build, launching soon.",
    visibility: "private",
  },
];

export default clientSites;
