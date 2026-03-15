import { Action } from "./Action";

export class ActionQueue {
  private queue: Action[] = [];
  private processing = false;

  enqueue(action: Action) {
    this.queue.push(action);
  }

  async process() {
    if (this.processing) return;

    this.processing = true;

    while (this.queue.length > 0) {
      const action = this.queue.shift();
      if (!action) continue;

      await action.execute();
    }

    this.processing = false;
  }

  clear() {
    this.queue = [];
  }
}
