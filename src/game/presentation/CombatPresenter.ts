import { CombatSystem } from "../systems/CombatSystem";
import { PlayerVisualController } from "../visual/PlayerVisualController";
import { EnemyVisualController } from "../visual/EnemyVisualController";
import { Enemy } from "../entities/Enemy";

export class CombatPresenter {
  private combat: CombatSystem;
  private playerVisual: PlayerVisualController;

  private enemy: Enemy | null = null;
  private enemyVisual: EnemyVisualController | null = null;

  constructor(combat: CombatSystem, playerVisual: PlayerVisualController) {
    this.combat = combat;
    this.playerVisual = playerVisual;
  }

  setEnemy(enemy: Enemy, enemyVisual: EnemyVisualController) {
    console.log("🎯 CombatPresenter.setEnemy →", enemy);

    this.enemy = enemy;
    this.enemyVisual = enemyVisual;

    this.combat.setEnemy(enemy);

    this.enemyVisual.setHighlighted(true);

    // inicia loop de ataque (visual + lógica via CombatSystem)
    // this.playerVisual.startAttack();
  }

  clearEnemy() {
    console.log("🧹 CombatPresenter.clearEnemy");

    this.enemy = null;
    this.enemyVisual = null;

    this.combat.setEnemy(null);
  }

  update(delta: number) {
    // ⚙️ atualiza lógica de combate (timers, etc)
    this.combat.update(delta);

    if (this.enemyVisual) {
      this.enemyVisual.setHighlighted(true);
    }
  }

  destroy() {
    // não precisa mais limpar hit listeners
    console.log("🧨 CombatPresenter destroyed");
  }
}
