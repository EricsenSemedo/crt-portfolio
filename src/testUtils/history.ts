import { act } from "react";

/** Wait for an actual history traversal before React assertions run. */
export async function navigateHistory(action: () => void) {
  await act(async () => {
    await new Promise<void>((resolve) => {
      window.addEventListener("popstate", () => resolve(), { once: true });
      action();
    });
  });
}
