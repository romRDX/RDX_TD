import { CombatSystem } from "../systems/CombatSystem";
import { PlayerVisualController } from "../visual/PlayerVisualController";
import { EnemyVisualController } from "../visual/EnemyVisualController";
import { Enemy } from "../entities/Enemy";

export class CombatPresenter {
  private combat: CombatSystem;
  private enemyVisual: EnemyVisualController;
  private onEnemyDeath?: (enemy: Enemy) => void;

  private hitHandler: () => void;

  constructor(
    combat: CombatSystem,
    playerVisual: PlayerVisualController,
    enemyVisual: EnemyVisualController,
    onEnemyDeath?: (enemy: Enemy) => void,
  ) {
    this.combat = combat;
    this.enemyVisual = enemyVisual;
    this.onEnemyDeath = onEnemyDeath;

    this.hitHandler = () => {
      const enemy = this.combat.enemy;

      if (!enemy) return;
      if (enemy.isDead()) return;

      console.log("HIT FRAME → applying damage");

      this.combat.applyAttack();

      // inimigo pode ter morrido com este hit
      if (enemy.isDead()) return;

      this.enemyVisual.playHit();
    };

    playerVisual.onHit(this.hitHandler);
  }

  destroy(playerVisual: PlayerVisualController) {
    playerVisual.offHit(this.hitHandler);
  }

  setEnemy(enemy: Enemy, enemyVisual: EnemyVisualController) {
    console.log("CombatPresenter.setEnemy →", enemy);

    this.combat.setEnemy(enemy);
    this.enemyVisual = enemyVisual;

    this.enemyVisual.setHighlighted(true);

    // 🔥 REGISTRA O LISTENER DE MORTE
    enemy.onDeath(() => {
      console.log("💀 CombatPresenter received enemy death");

      this.onEnemyDeath?.(enemy);
    });
  }

  update(delta: number) {
    this.combat.update(delta);

    if (!this.combat.enemy) return;

    this.enemyVisual.setHighlighted(true);
  }
}
