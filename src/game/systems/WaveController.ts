import type { WaveBlueprint } from "../types/WaveBlueprint";
import { WaveRenderer } from "./WaveRenderer";
import { EnemyManager } from "./EnemyManager";

export class WaveController {
  private waves: WaveBlueprint[];
  private currentWaveIndex = 0;

  private waveRenderer: WaveRenderer;
  private enemyManager: EnemyManager;

  constructor(
    waves: WaveBlueprint[],
    waveRenderer: WaveRenderer,
    enemyManager: EnemyManager,
  ) {
    this.waves = waves;
    this.waveRenderer = waveRenderer;
    this.enemyManager = enemyManager;
  }

  start(): void {
    this.currentWaveIndex = 0;
    this.spawnCurrentWave();
  }

  handleWaveCleared(): boolean {
    this.currentWaveIndex++;

    if (this.currentWaveIndex >= this.waves.length) {
      console.log("All waves completed");
      return false; // não há mais waves
    }

    this.spawnCurrentWave();
    return true; // ainda há waves
  }

  private spawnCurrentWave(): void {
    const wave = this.waves[this.currentWaveIndex];

    if (!wave) return;

    this.waveRenderer.renderWave(wave);

    console.log(
      "Wave spawned:",
      this.currentWaveIndex + 1,
      "Enemies:",
      this.enemyManager.getAllEnemies().length,
    );
  }

  hasActiveEnemies(): boolean {
    return this.enemyManager.getAllEnemies().length > 0;
  }
}
