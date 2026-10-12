// Capture the Profile and Contact pages as tall stills for the room TVs to scroll through.
// Needs a running build and playwright-core:
//   PLAYWRIGHT_CORE=/path/to/node_modules/playwright-core CHROMIUM=/usr/bin/chromium \
//     node scripts/capture-room-previews.mjs http://localhost:4173/crt-portfolio/
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_CORE ?? "playwright-core");
const base = process.argv[2] ?? "http://localhost:4173/crt-portfolio/";
const out = new URL("../public/room/", import.meta.url).pathname;
// 960 wide keeps the desktop layout and shrinks cleanly onto the 768-wide screen texture.
const WIDTH = 960;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM, args: ["--use-angle=gl-egl", "--enable-gpu"] });
for (const [route, file] of [["profile", "profile-preview.jpg"], ["contact", "contact-preview.jpg"]]) {
  const page = await browser.newPage({ viewport: { width: WIDTH, height: 540 }, reducedMotion: "reduce" });
  await page.goto(`${base}#/${route}`);
  await page.locator(".crt-page").waitFor();
  await page.waitForTimeout(2500);
  await page.addStyleTag({ content: ".global-crt-overlay { display: none !important; }" });
  const height = await page.locator(".crt-page").evaluate((element) => Math.max(element.scrollHeight, 540));
  await page.setViewportSize({ width: WIDTH, height });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: out + file, type: "jpeg", quality: 78 });
  console.log(file, WIDTH, height);
  await page.close();
}
await browser.close();
