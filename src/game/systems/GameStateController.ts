export type GameState = "running" | "paused" | "gameover" | "victory";

export class GameStateController {
  private state: GameState = "running";

  getState(): GameState {
    return this.state;
  }

  isRunning(): boolean {
    return this.state === "running";
  }

  isPaused(): boolean {
    return this.state === "paused";
  }

  isGameOver(): boolean {
    return this.state === "gameover";
  }

  isVictory(): boolean {
    return this.state === "victory";
  }

  setPaused() {
    this.state = "paused";
  }

  setRunning() {
    this.state = "running";
  }

  setGameOver() {
    this.state = "gameover";
  }

  setVictory() {
    this.state = "victory";
  }
}
