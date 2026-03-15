export abstract class Action {
  abstract execute(): void | Promise<void>;
}
