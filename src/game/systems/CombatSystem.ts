import { DamageAction } from "../../core/actions/DamageAction";
import { actionQueue } from "../../core/actions/instanceActionQueue";
import { Character } from "../entities/Character";
import { Enemy } from "../entities/Enemy";
import { AttackAction } from "../../core/actions/AttackAction";
import { PlayerVisualController } from "../visual/PlayerVisualController";

export class CombatSystem {
  character: Character;
  enemy: Enemy | null = null;

  private attackTimer = 0;

  constructor(
    character: Character,
    private playerVisual: PlayerVisualController,
    private scene: Phaser.Scene,
  ) {
    this.character = character;
  }

  setEnemy(enemy: Enemy | null) {
    this.enemy = enemy;
  }

  /**
   * Atualiza apenas timers / estado.
   */
  update(delta: number) {
    this.character.update(delta);

    if (!this.enemy) return;
    if (this.enemy.isDead()) return;

    this.playerVisual.setAttackSpeed(this.character.stats.attackSpeed);

    const attackInterval = 1000 / this.character.stats.attackSpeed;

    this.attackTimer += delta;

    if (this.attackTimer >= attackInterval) {
      this.attackTimer = 0;

      console.log("⚔️ Attack triggered");

      this.applyAttack();
    }
  }

  /**
   * Aplica dano exatamente no hit frame da animação.
   */
  public applyAttack() {
    const enemy = this.enemy;

    if (!enemy) {
      console.log("❌ applyAttack: no enemy");
      return;
    }

    if (enemy.isDead()) {
      console.log("❌ applyAttack: enemy already dead");
      return;
    }

    const damage = this.character.stats.damage;

    console.log("🟡 APPLY ATTACK → enqueue AttackAction", {
      enemyHp: enemy.hp,
      damage,
    });

    actionQueue.enqueue(async () => {
      console.log("⚙️ EXECUTING AttackAction");

      const action = new AttackAction(
        enemy,
        damage,
        this.playerVisual,
        this.scene,
      );

      await action.execute();

      console.log("✅ AttackAction finished", {
        enemyHpAfter: enemy.hp,
      });
    });
  }
}
