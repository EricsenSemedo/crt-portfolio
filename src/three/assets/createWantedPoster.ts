import {
  CanvasTexture, Group, Mesh, MeshStandardMaterial, PlaneGeometry, SphereGeometry, SRGBColorSpace,
} from "three";

const WIDTH = 512;
const HEIGHT = 724;
const INK = "#3a2416";
const SERIF = "Georgia, 'Times New Roman', 'DejaVu Serif', serif";

/**
 * A pirate-style bounty poster with the owner's name, pinned to the garage wall.
 * Everything is drawn here as canvas art in homage to the style; no show artwork is used.
 */
export function createWantedPoster() {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext("2d");
  if (context) drawPoster(context);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  // A touch of self-light keeps the print readable in the dim corner without adding a lamp.
  const paper = new MeshStandardMaterial({
    map: texture, emissiveMap: texture, emissive: "#ffffff", emissiveIntensity: 0.16, roughness: 0.92,
  });
  const pinMaterial = new MeshStandardMaterial({ color: "#b3261e", roughness: 0.4, metalness: 0.1 });
  const sheet = new PlaneGeometry(0.86, 0.86 * (HEIGHT / WIDTH));
  const pin = new SphereGeometry(0.018, 10, 8);

  const group = new Group();
  group.name = "WantedPoster";
  const poster = new Mesh(sheet, paper);
  poster.receiveShadow = true;
  group.add(poster);
  for (const [x, y] of [[-0.38, 0.55], [0.38, 0.55]]) {
    const head = new Mesh(pin, pinMaterial);
    head.position.set(x, y, 0.012);
    group.add(head);
  }

  return {
    group,
    dispose() {
      texture.dispose();
      paper.dispose();
      pinMaterial.dispose();
      sheet.dispose();
      pin.dispose();
    },
  };
}

function drawPoster(context: CanvasRenderingContext2D) {
  drawPaper(context);
  context.fillStyle = INK;
  context.textAlign = "center";
  context.textBaseline = "alphabetic";

  fitText(context, "WANTED", WIDTH / 2, 132, 440, `900 132px ${SERIF}`, 0.06);

  // The picture: the flag in a thin photo frame.
  const frame = { x: 56, y: 162, width: 400, height: 292 };
  context.fillStyle = "#1b1310";
  context.fillRect(frame.x, frame.y, frame.width, frame.height);
  drawJollyRoger(context, frame.x + frame.width / 2, frame.y + frame.height / 2 + 6, 1);
  context.strokeStyle = INK;
  context.lineWidth = 5;
  context.strokeRect(frame.x - 6, frame.y - 6, frame.width + 12, frame.height + 12);

  context.fillStyle = INK;
  fitText(context, "DEAD OR ALIVE", WIDTH / 2, 512, 420, `700 44px ${SERIF}`, 0.04);
  fitText(context, "ERICSEN SEMEDO", WIDTH / 2, 586, 430, `900 54px ${SERIF}`, 0.02);
  drawBounty(context, WIDTH / 2, 660);
  context.font = `600 15px ${SERIF}`;
  context.globalAlpha = 0.7;
  context.fillText("SOFTWARE & GAME DEVELOPER · LAST SEEN IN THIS GARAGE", WIDTH / 2, 700);
  context.globalAlpha = 1;
}

function drawPaper(context: CanvasRenderingContext2D) {
  const base = context.createRadialGradient(WIDTH / 2, HEIGHT / 2, 80, WIDTH / 2, HEIGHT / 2, HEIGHT * 0.7);
  base.addColorStop(0, "#efdcae");
  base.addColorStop(0.7, "#dcc28b");
  base.addColorStop(1, "#a9844f");
  context.fillStyle = base;
  context.fillRect(0, 0, WIDTH, HEIGHT);

  // Age: fibres, foxing spots and two fold creases.
  for (let i = 0; i < 2600; i++) {
    context.fillStyle = `rgba(90, 60, 30, ${Math.random() * 0.08})`;
    context.fillRect(Math.random() * WIDTH, Math.random() * HEIGHT, 1 + Math.random() * 3, 1);
  }
  for (let i = 0; i < 14; i++) {
    const x = Math.random() * WIDTH;
    const y = Math.random() * HEIGHT;
    const spot = context.createRadialGradient(x, y, 0, x, y, 6 + Math.random() * 22);
    spot.addColorStop(0, "rgba(120, 80, 35, .16)");
    spot.addColorStop(1, "rgba(120, 80, 35, 0)");
    context.fillStyle = spot;
    context.fillRect(x - 30, y - 30, 60, 60);
  }
  context.strokeStyle = "rgba(255, 245, 220, .35)";
  context.lineWidth = 2;
  for (const y of [HEIGHT * 0.36, HEIGHT * 0.69]) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(WIDTH, y + 4);
    context.stroke();
  }
  context.strokeStyle = "rgba(70, 45, 20, .22)";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(WIDTH / 2 + 3, 0);
  context.lineTo(WIDTH / 2 - 2, HEIGHT);
  context.stroke();
}

/** A straw hat on a grinning skull over crossed bones. */
function drawJollyRoger(context: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  context.save();
  context.translate(x, y);
  context.scale(scale, scale);
  const bone = "#f3eee2";

  // Crossed bones, each a bar with knuckled ends.
  context.fillStyle = bone;
  for (const angle of [0.62, -0.62]) {
    context.save();
    context.rotate(angle);
    context.fillRect(-118, -9, 236, 18);
    for (const end of [-118, 118]) {
      for (const side of [-1, 1]) {
        context.beginPath();
        context.arc(end, side * 11, 14, 0, Math.PI * 2);
        context.fill();
      }
    }
    context.restore();
  }

  // Skull and jaw.
  context.beginPath();
  context.ellipse(0, 4, 64, 58, 0, 0, Math.PI * 2);
  context.fill();
  context.fillRect(-36, 40, 72, 42);
  context.fillStyle = "#1b1310";
  for (const side of [-1, 1]) {
    context.beginPath();
    context.ellipse(side * 25, 14, 17, 19, 0, 0, Math.PI * 2);
    context.fill();
  }
  context.beginPath();
  context.moveTo(0, 34);
  context.lineTo(-8, 50);
  context.lineTo(8, 50);
  context.closePath();
  context.fill();
  context.lineWidth = 3;
  context.strokeStyle = "#1b1310";
  for (let tooth = -27; tooth <= 27; tooth += 13.5) {
    context.beginPath();
    context.moveTo(tooth, 64);
    context.lineTo(tooth, 82);
    context.stroke();
  }

  // The straw hat: a wide brim, a low crown, and a red band.
  context.fillStyle = "#e6b84a";
  context.beginPath();
  context.ellipse(0, -36, 104, 22, 0, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.ellipse(0, -52, 58, 40, 0, Math.PI, Math.PI * 2);
  context.fill();
  context.fillStyle = "#c0352b";
  context.fillRect(-58, -54, 116, 14);
  context.strokeStyle = "rgba(120, 80, 20, .55)";
  context.lineWidth = 2;
  for (let weave = -90; weave <= 90; weave += 15) {
    context.beginPath();
    context.moveTo(weave, -44);
    context.lineTo(weave * 1.08, -26);
    context.stroke();
  }
  context.restore();
}

/** The bounty in Berries: a B with two strokes through it, then the figure. */
function drawBounty(context: CanvasRenderingContext2D, centerX: number, baseline: number) {
  const amount = "1,500,000,000-";
  context.font = `900 50px ${SERIF}`;
  const symbolWidth = context.measureText("B").width;
  const total = symbolWidth + 12 + context.measureText(amount).width;
  const left = centerX - total / 2;
  context.textAlign = "left";
  context.fillText("B", left, baseline);
  context.fillRect(left + symbolWidth * 0.3, baseline - 46, 4, 54);
  context.fillRect(left + symbolWidth * 0.62, baseline - 46, 4, 54);
  context.fillText(amount, left + symbolWidth + 12, baseline);
  context.textAlign = "center";
}

function fitText(
  context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, font: string, tracking: number,
) {
  context.font = font;
  const size = Number(/(\d+)px/.exec(font)?.[1] ?? 40);
  context.letterSpacing = `${size * tracking}px`;
  const width = context.measureText(text).width;
  context.save();
  context.translate(x, y);
  if (width > maxWidth) context.scale(maxWidth / width, 1);
  context.fillText(text, 0, 0);
  context.restore();
  context.letterSpacing = "0px";
}
