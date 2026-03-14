type EventHandler<T = any> = (payload: T) => void;

export class EventBus {
  private listeners: Map<string, Set<EventHandler>> = new Map();

  on<T = any>(event: string, handler: EventHandler<T>) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(handler);
  }

  off<T = any>(event: string, handler: EventHandler<T>) {
    const handlers = this.listeners.get(event);
    if (!handlers) return;

    handlers.delete(handler);
  }

  emit<T = any>(event: string, payload?: T) {
    const handlers = this.listeners.get(event);
    if (!handlers) return;

    for (const handler of handlers) {
      handler(payload);
    }
  }

  clear() {
    this.listeners.clear();
  }
}
