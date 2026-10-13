// Photograph the room overview for the loading screen, which shows it before the 3D is ready.
// Needs a running build and playwright-core:
//   PLAYWRIGHT_CORE=/path/to/node_modules/playwright-core CHROMIUM=/usr/bin/chromium \
//     node scripts/capture-room-stills.mjs http://localhost:4173/crt-portfolio/
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_CORE ?? "playwright-core");
const base = process.argv[2] ?? "http://localhost:4173/crt-portfolio/";
const out = fileURLToPath(new URL("../public/room/", import.meta.url));
// The camera keeps a fixed vertical field of view, so a still at the widest aspect each layout
// allows lines up with the live room at any narrower one when both fill the height (object-fit: cover).
const STILLS = [
  ["overview-wide.jpg", 1920, 800],
  // Just under the 0.72 aspect where the scene switches to its portrait layout.
  ["overview-tall.jpg", 574, 800],
];

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM, args: ["--use-angle=gl-egl", "--enable-gpu", "--ignore-gpu-blocklist"] });
for (const [file, width, height] of STILLS) {
  // Reduced motion holds the camera still and shows each set's plain channel card.
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion: "reduce" });
  await page.goto(`${base}?room-still#/`);
  await page.locator(".crt-loading-screen").waitFor({ state: "detached", timeout: 60_000 });
  await page.waitForTimeout(2500);
  await page.addStyleTag({ content: ".global-crt-overlay { display: none !important; }" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: out + file, type: "jpeg", quality: 72 });
  console.log(file, width, height);
  await page.close();
}
await browser.close();
