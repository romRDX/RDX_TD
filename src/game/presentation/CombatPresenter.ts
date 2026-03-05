import { CombatSystem } from "../systems/CombatSystem";
import { PlayerVisualController } from "../visual/PlayerVisualController";
import { EnemyVisualController } from "../visual/EnemyVisualController";
import { Enemy } from "../entities/Enemy";

export class CombatPresenter {
  private combat: CombatSystem;
  private playerVisual: PlayerVisualController;

  private enemy: Enemy | null = null;
  private enemyVisual: EnemyVisualController | null = null;

  private onEnemyDeath?: (enemy: Enemy) => void;

  private hitHandler: () => void;

  constructor(
    combat: CombatSystem,
    playerVisual: PlayerVisualController,
    onEnemyDeath?: (enemy: Enemy) => void,
  ) {
    this.combat = combat;
    this.playerVisual = playerVisual;
    this.onEnemyDeath = onEnemyDeath;

    this.hitHandler = () => {
      if (!this.enemy) return;
      if (this.enemy.isDead()) return;

      console.log("HIT FRAME → applying damage");

      this.combat.applyAttack();

      if (this.enemyVisual) {
        this.enemyVisual.playHit();
      }
    };

    playerVisual.onHit(this.hitHandler);
  }

  destroy() {
    this.playerVisual.offHit(this.hitHandler);
  }

  setEnemy(enemy: Enemy, enemyVisual: EnemyVisualController) {
    console.log("CombatPresenter.setEnemy →", enemy);

    this.enemy = enemy;
    this.enemyVisual = enemyVisual;

    this.combat.setEnemy(enemy);

    this.enemyVisual.setHighlighted(true);

    this.playerVisual.startAttack();

    enemy.onDeath(() => {
      console.log("💀 CombatPresenter received enemy death");

      this.enemy = null;

      this.onEnemyDeath?.(enemy);
    });
  }

  clearEnemy() {
    this.enemy = null;
    this.enemyVisual = null;

    this.combat.setEnemy(null);
  }

  update(delta: number) {
    this.combat.update(delta);

    if (this.enemyVisual) {
      this.enemyVisual.setHighlighted(true);
    }
  }
}
