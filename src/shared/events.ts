type GameEventMap = {
  END_RUN: void;
};

type EventKey = keyof GameEventMap;
type Listener<T> = (payload: T) => void;

class EventBus {
  private listeners = new Map<EventKey, Set<Listener<any>>>();

  on<K extends EventKey>(event: K, listener: Listener<GameEventMap[K]>) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  off<K extends EventKey>(event: K, listener: Listener<GameEventMap[K]>) {
    this.listeners.get(event)?.delete(listener);
  }

  emit<K extends EventKey>(event: K, payload: GameEventMap[K]) {
    this.listeners.get(event)?.forEach((listener) => listener(payload));
  }
}

export const gameEvents = new EventBus();
