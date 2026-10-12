const FRAME_COUNT = 6;
const FRAME_WIDTH = 384;
const FRAME_HEIGHT = 216;
// Snow changes about 24 times a second, like an untuned set.
const FRAME_MS = 42;

let frames: HTMLCanvasElement[] | null = null;

/**
 * A few frames of real snow, made once and shared by every screen that loses its signal.
 * Each line carries a little of the dot before it, so the grain streaks sideways the way
 * an analogue picture does instead of reading as a digital checkerboard.
 */
function getStaticFrames() {
  if (frames) return frames;
  frames = Array.from({ length: FRAME_COUNT }, () => {
    const canvas = document.createElement("canvas");
    canvas.width = FRAME_WIDTH;
    canvas.height = FRAME_HEIGHT;
    const context = canvas.getContext("2d");
    if (!context) return canvas;
    const image = context.createImageData(FRAME_WIDTH, FRAME_HEIGHT);
    for (let y = 0; y < FRAME_HEIGHT; y++) {
      const lineGain = 0.7 + Math.random() * 0.6;
      let carry = Math.random();
      for (let x = 0; x < FRAME_WIDTH; x++) {
        carry = carry * 0.4 + Math.random() * 0.6;
        const value = Math.min(255, carry * carry * 300 * lineGain);
        const index = (y * FRAME_WIDTH + x) * 4;
        // A faint blue cast, from the set's phosphor rather than pure grey.
        image.data[index] = value * 0.9;
        image.data[index + 1] = value * 0.94;
        image.data[index + 2] = value;
        image.data[index + 3] = 255;
      }
    }
    context.putImageData(image, 0, 0);
    return canvas;
  });
  return frames;
}

/**
 * Paints snow over a region at the given strength (0 to 1). A random offset on every
 * call keeps the handful of frames from ever visibly repeating.
 */
export function drawTvStatic(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  amount: number,
  time: number,
) {
  if (amount <= 0) return;
  const frame = getStaticFrames()[Math.floor(time / FRAME_MS) % FRAME_COUNT];
  const scale = Math.max(width / FRAME_WIDTH, height / FRAME_HEIGHT);
  const offsetX = Math.random() * FRAME_WIDTH;
  const offsetY = Math.floor(Math.random() * FRAME_HEIGHT);
  context.save();
  context.beginPath();
  context.rect(x, y, width, height);
  context.clip();
  context.globalAlpha = Math.min(amount, 1);
  context.imageSmoothingEnabled = true;
  context.translate(x, y);
  context.scale(scale, scale);
  // Four tiles around the offset cover the region however it wraps.
  for (const tileX of [-offsetX, FRAME_WIDTH - offsetX]) {
    for (const tileY of [-offsetY, FRAME_HEIGHT - offsetY]) context.drawImage(frame, tileX, tileY);
  }
  context.restore();
}
