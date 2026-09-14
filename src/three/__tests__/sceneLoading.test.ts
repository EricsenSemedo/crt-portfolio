import { describe, expect, it, vi } from "vitest";
import { SceneLoadingTracker } from "../sceneLoading";

describe("SceneLoadingTracker", () => {
  it("reports only settled asset counts and resolves after every task settles", async () => {
    const progress = vi.fn();
    const tracker = new SceneLoadingTracker(2, progress);
    let resolveFirst!: () => void;
    let rejectSecond!: () => void;
    const first = new Promise<void>((resolve) => { resolveFirst = resolve; });
    const second = new Promise<void>((_, reject) => { rejectSecond = reject; });

    tracker.track(first);
    tracker.track(second);
    resolveFirst();
    await Promise.resolve();
    expect(progress).toHaveBeenLastCalledWith({ settled: 1, total: 2 });

    rejectSecond();
    await tracker.ready;
    expect(progress).toHaveBeenLastCalledWith({ settled: 2, total: 2 });
    expect(progress).toHaveBeenCalledTimes(3);
  });

  it("stops notifications and releases readiness when disposed", async () => {
    const progress = vi.fn();
    const tracker = new SceneLoadingTracker(1, progress);
    let resolveTask!: () => void;
    tracker.track(new Promise<void>((resolve) => { resolveTask = resolve; }));

    tracker.dispose();
    await tracker.ready;
    resolveTask();
    await Promise.resolve();
    expect(progress).toHaveBeenCalledTimes(1);
  });
});
