export class ActionQueue {
  private queue: Array<() => Promise<void>> = [];
  private isProcessing = false;

  enqueue(action: () => Promise<void>) {
    this.queue.push(action);
  }

  process() {
    if (this.isProcessing) return;

    this.isProcessing = true;

    const run = async () => {
      while (this.queue.length > 0) {
        const action = this.queue.shift();
        if (!action) continue;

        console.log("⚙️ Executing queued action");

        await action();
      }

      this.isProcessing = false;
    };

    run();
  }

  clear() {
    this.queue = [];
  }
}
