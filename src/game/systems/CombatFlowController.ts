import { Enemy } from "../entities/Enemy";
import type { EnemyEntry } from "../types/EnemyEntry";
import { EnemyGrid } from "./EnemyGrid";
import { EnemyManager } from "./EnemyManager";
import { WaveController } from "./WaveController";
import { PlayerVisualController } from "../visual/PlayerVisualController";
import type { Character } from "../entities/Character";

type GridToWorldFn = (row: number, col: number) => { x: number; y: number };

export class CombatFlowController {
  constructor(
    private enemyGrid: EnemyGrid,
    private enemyManager: EnemyManager,
    private waveController: WaveController,
    private gridToWorld: GridToWorldFn,
    private scene: Phaser.Scene,
  ) {}

  handleEnemyDeath(
    deadEnemy: Enemy,
    playerCharacter: Character,
    playerVisual: PlayerVisualController,
  ): EnemyEntry | null {
    const deadEntry = this.enemyManager.findByEnemy(deadEnemy);
    if (!deadEntry) return null;

    const deadRow = deadEntry.row;
    const deadCol = deadEntry.col;

    // 1️⃣ remover do grid
    this.enemyGrid.removeEnemyByInstance(deadEnemy);

    // 2️⃣ resolver movimentação
    const movements = this.enemyGrid.resolveRowShift(deadRow, deadCol);

    for (const move of movements) {
      const entry = this.enemyManager.findByEnemy(move.enemy);
      if (!entry) continue;

      const { x, y } = this.gridToWorld(move.to.row, move.to.col);

      entry.visual.moveTo(x, y, this.scene);

      entry.row = move.to.row;
      entry.col = move.to.col;
    }

    // 3️⃣ remover do manager
    this.enemyManager.removeEnemy(deadEntry);

    // 4️⃣ destruir visual
    deadEntry.visual.destroy();

    // 5️⃣ verificar se ainda há inimigos
    const nextTarget = this.enemyManager.getCurrentTarget();

    // ================================
    // CASO 1: não há inimigos
    // ================================
    if (!nextTarget) {
      const hasMoreWaves = this.waveController.handleWaveCleared();

      if (!hasMoreWaves) {
        playerVisual.stopAttack();
        return null;
      }

      return this.enemyManager.getCurrentTarget();
    }

    // ================================
    // CASO 2: ainda há inimigos
    // ================================
    return nextTarget;
  }
}
