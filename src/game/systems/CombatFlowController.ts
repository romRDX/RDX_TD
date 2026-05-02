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
import { eventBus } from "../../core/instanceEventBus";

type GridToWorldFn = (row: number, col: number) => { x: number; y: number };

export class CombatFlowController {
  private movementResolver: EnemyMovementResolver;
  private playerCharacter!: Character;
  private playerVisual!: PlayerVisualController;
  private onNewTarget?: (enemy: EnemyEntry) => void;

  constructor(
    private enemyGrid: EnemyGrid,
    private enemyManager: EnemyManager,
    private waveController: WaveController,
    private gridToWorld: GridToWorldFn,
    private scene: Phaser.Scene,
  ) {
    this.movementResolver = new EnemyMovementResolver(enemyGrid);

    eventBus.on("enemy:death", async ({ enemy }) => {
      const nextTarget = await this.handleEnemyDeath(
        enemy,
        this.playerCharacter,
        this.playerVisual,
      );

      if (nextTarget) {
        this.onNewTarget?.(nextTarget);
      }
    });
  }

  setPlayer(character: Character, visual: PlayerVisualController) {
    this.playerCharacter = character;
    this.playerVisual = visual;
  }

  setOnNewTarget(callback: (enemy: EnemyEntry) => void) {
    this.onNewTarget = callback;
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

    console.log("💀 HANDLE DEATH", { deadRow, deadCol });

    // 1️⃣ remover do manager
    this.enemyManager.removeEnemy(deadEntry);

    // 2️⃣ remover do grid (ESSENCIAL antes da cascata)
    this.enemyGrid.removeEnemyAt(deadRow, deadCol);

    // 3️⃣ resolver cascata STEP-BY-STEP (CORREÇÃO PRINCIPAL)
    const allMovements: EnemyMovement[] = [];

    let currentRow = deadRow;
    let currentCol = deadCol;

    while (true) {
      console.log("🟡 CASCADE STEP START", {
        gap: { row: currentRow, col: currentCol },
      });

      const movements = this.movementResolver.resolveFromGap(
        currentRow,
        currentCol,
      );

      if (movements.length === 0) {
        console.log("🚫 CASCADE END");
        break;
      }

      const move = movements[0];

      console.log("➡️ CASCADE MOVE", move);

      allMovements.push(move);

      // 🔥 estado atual do grid após o move (importantíssimo)
      this.enemyGrid.debugPrintGrid();

      // 🔥 próximo gap correto
      currentRow = move.from.row;
      currentCol = move.from.col;

      console.log("🟢 NEW GAP", {
        row: currentRow,
        col: currentCol,
      });
    }

    console.log("🧱 FINAL CASCADE", allMovements);

    // 4️⃣ animar movimentações
    await this.animateMovements(allMovements);

    // 5️⃣ destruir visual
    deadEntry.visual.destroy();

    // 6️⃣ próximo alvo
    const nextTarget = this.enemyManager.getCurrentTarget();

    console.log("GRID AFTER CASCADE:", this.enemyGrid.getAllEnemies());

    if (!nextTarget) {
      const hasMoreWaves = this.waveController.handleWaveCleared();

      if (!hasMoreWaves) {
        playerVisual.stopAttack();
        return null;
      }

      return this.enemyManager.getCurrentTarget();
    }

    return nextTarget;
  }

  // private async animateMovements(movements: EnemyMovement[]) {
  //   const actions: MoveEnemyAction[] = [];

  //   for (const move of movements) {
  //     const entry = this.enemyManager.findByEnemy(move.enemy);
  //     if (!entry) continue;

  //     actions.push(
  //       new MoveEnemyAction(entry, move.to, this.gridToWorld, this.scene),
  //     );
  //   }

  //   const BASE_DELAY = 80;

  //   for (let i = 0; i < actions.length; i++) {
  //     const action = actions[i];
  //     const delay = BASE_DELAY * i;

  //     actionQueue.enqueue(async () => {
  //       await new Promise((resolve) => {
  //         this.scene.time.delayedCall(delay, async () => {
  //           await action.execute();
  //           resolve(null);
  //         });
  //       });
  //     });
  //   }

  //   // 🔥 IMPORTANTE: processar fila
  //   await actionQueue.process();
  // }

  private async animateMovements(movements: EnemyMovement[]) {
    const actions: MoveEnemyAction[] = [];

    for (const move of movements) {
      // 🔥 BUSCA DIRETO DO GRID (fonte única de verdade)
      const entry = this.enemyGrid.getEntryAt(move.to.row, move.to.col);

      if (!entry) {
        console.warn("⚠️ ENTRY NOT FOUND AFTER MOVE", move);
        continue;
      }

      actions.push(
        new MoveEnemyAction(entry, move.to, this.gridToWorld, this.scene),
      );
    }

    const BASE_DELAY = 80;

    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      const delay = BASE_DELAY * i;

      actionQueue.enqueue(async () => {
        await new Promise((resolve) => {
          this.scene.time.delayedCall(delay, async () => {
            await action.execute();
            resolve(null);
          });
        });
      });
    }

    await actionQueue.process();
  }
}
