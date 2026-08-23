export type ScreenTransitionKind = "pinch" | "signal-acquisition" | "vertical-sync-roll";

const SCREEN_TRANSITIONS: ScreenTransitionKind[] = ["pinch", "signal-acquisition", "vertical-sync-roll"];

export function getRandomScreenTransitionKind(random = Math.random): ScreenTransitionKind {
  const index = Math.min(Math.floor(random() * SCREEN_TRANSITIONS.length), SCREEN_TRANSITIONS.length - 1);
  return SCREEN_TRANSITIONS[index];
}

export function getScreenTransitionDuration(kind: ScreenTransitionKind) {
  if (kind === "pinch") return 320;
  if (kind === "signal-acquisition") return 240;
  return 460;
}
