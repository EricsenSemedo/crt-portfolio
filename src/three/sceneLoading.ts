export interface SceneLoadingProgress {
  settled: number;
  total: number;
}

/** Tracks asset completion without relying on Three's process-wide loading manager. */
export class SceneLoadingTracker {
  readonly ready: Promise<void>;

  private settled = 0;
  private disposed = false;
  private resolveReady!: () => void;

  constructor(
    private readonly total: number,
    private readonly onProgress?: (progress: SceneLoadingProgress) => void,
  ) {
    this.ready = new Promise<void>((resolve) => {
      this.resolveReady = resolve;
    });
    this.notify();
  }

  track(task: Promise<unknown>) {
    void task.then(
      () => this.settle(),
      () => this.settle(),
    );
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.resolveReady();
  }

  private settle() {
    if (this.disposed) return;
    this.settled = Math.min(this.settled + 1, this.total);
    this.notify();
    if (this.settled === this.total) this.resolveReady();
  }

  private notify() {
    if (this.disposed) return;
    try {
      this.onProgress?.({ settled: this.settled, total: this.total });
    } catch {
      // A consumer's callback cannot prevent scene readiness.
    }
  }
}
