import { CombatSystem } from "../systems/CombatSystem";
import { PlayerVisualController } from "../visual/PlayerVisualController";
import { EnemyVisualController } from "../visual/EnemyVisualController";

export class CombatPresenter {
  private combat: CombatSystem;
  private enemyVisual: EnemyVisualController;

  constructor(
    combat: CombatSystem,
    playerVisual: PlayerVisualController,
    enemyVisual: EnemyVisualController,
  ) {
    this.combat = combat;
    this.enemyVisual = enemyVisual;

    // player avisa quando o golpe conecta (frame 6)
    playerVisual.onHit(() => {
      this.combat.applyAttack();
      this.enemyVisual.playHit();
    });
  }

  update(delta: number) {
    this.combat.update(delta);

    const enemy = this.combat.enemy;
    this.enemyVisual.updateHealth(enemy.hp, enemy.maxHp);
  }
}
