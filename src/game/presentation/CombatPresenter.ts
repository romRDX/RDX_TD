import { CombatSystem } from "../systems/CombatSystem";
import { PlayerVisualController } from "../visual/PlayerVisualController";
import { EnemyVisualController } from "../visual/EnemyVisualController";
import { Enemy } from "../entities/Enemy";

export class CombatPresenter {
  private combat: CombatSystem;
  private enemyVisual: EnemyVisualController;
  private onEnemyDeath?: (enemy: any) => void;
  private enemyDead = false;

  constructor(
    combat: CombatSystem,
    playerVisual: PlayerVisualController,
    enemyVisual: EnemyVisualController,
    onEnemyDeath?: (enemy: any) => void,
  ) {
    this.combat = combat;
    this.enemyVisual = enemyVisual;
    this.onEnemyDeath = onEnemyDeath;

    // player avisa quando o golpe conecta (frame 6)
    playerVisual.onHit(() => {
      if (this.enemyDead) return;

      this.combat.applyAttack();
      this.enemyVisual.playHit();
    });
  }

  setEnemy(enemy: Enemy, enemyVisual: EnemyVisualController) {
    this.combat.setEnemy(enemy);
    this.enemyVisual = enemyVisual;
    this.enemyDead = false;
  }

  update(delta: number) {
    this.combat.update(delta);

    const enemy = this.combat.enemy;

    this.enemyVisual.updateHealth(enemy.hp, enemy.maxHp);

    // 👇 detectar morte UMA vez
    if (!this.enemyDead && enemy.hp <= 0) {
      this.enemyDead = true;

      // this.enemyVisual.playDeath?.();
      console.log("Enemy died:", enemy);
      this.onEnemyDeath?.(enemy);
    }
  }
}
