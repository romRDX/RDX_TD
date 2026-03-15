import { Enemy } from "../entities/Enemy";
import type { EnemyEntry } from "../types/EnemyEntry";
import { EnemyGrid } from "./EnemyGrid";
import { EnemyManager } from "./EnemyManager";
import { WaveController } from "./WaveController";
import { PlayerVisualController } from "../visual/PlayerVisualController";
import type { Character } from "../entities/Character";
import { EnemyMovementResolver } from "./EnemyMovementResolver";
import type { EnemyMovement } from "../types/EnemyMovement";
import { actionQueue } from "../../core/actions/instanceActionQueue";
import { MoveEnemyAction } from "../../core/actions/MoveEnemyAction";

type GridToWorldFn = (row: number, col: number) => { x: number; y: number };

export class CombatFlowController {
  private movementResolver: EnemyMovementResolver;

  constructor(
    private enemyGrid: EnemyGrid,
    private enemyManager: EnemyManager,
    private waveController: WaveController,
    private gridToWorld: GridToWorldFn,
    private scene: Phaser.Scene,
  ) {
    this.movementResolver = new EnemyMovementResolver(enemyGrid);
  }

  async handleEnemyDeath(
    deadEnemy: Enemy,
    playerCharacter: Character,
    playerVisual: PlayerVisualController,
  ): Promise<EnemyEntry | null> {
    const deadEntry = this.enemyManager.findByEnemy(deadEnemy);
    if (!deadEntry) return null;

    const deadRow = deadEntry.row;
    const deadCol = deadEntry.col;

    // 1️⃣ remover do grid
    this.enemyGrid.removeEnemyByInstance(deadEnemy);

    // 2️⃣ resolver movimentação lógica
    const movements = this.movementResolver.resolveAfterDeath(deadRow, deadCol);

    // 3️⃣ animar movimentações
    await this.animateMovements(movements);

    // 4️⃣ remover do manager
    this.enemyManager.removeEnemy(deadEntry);

    // 5️⃣ destruir visual
    deadEntry.visual.destroy();

    // 6️⃣ verificar se ainda há inimigos
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

  private async animateMovements(movements: EnemyMovement[]) {
    for (const move of movements) {
      const entry = this.enemyManager.findByEnemy(move.enemy);
      if (!entry) continue;

      actionQueue.enqueue(
        new MoveEnemyAction(
          entry,
          move.to.row,
          move.to.col,
          this.gridToWorld,
          this.scene,
        ),
      );
    }

    await actionQueue.process();
  }
}
