import { Character } from "../entities/Character";
import { Enemy } from "../entities/Enemy";

export class CombatSystem {
  character: Character;
  enemy: Enemy | null = null;

  private attackTimer = 0;

  constructor(character: Character) {
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

    const attackInterval = 1000 / this.character.stats.attackSpeed;

    this.attackTimer += delta;

    if (this.attackTimer >= attackInterval) {
      this.attackTimer = 0;

      this.character.performAttack();
    }
  }

  /**
   * Aplica dano exatamente no hit frame da animação.
   */
  public applyAttack() {
    const enemy = this.enemy;

    if (!enemy) return;

    if (enemy.isDead()) return;

    console.log("Applying attack to enemy:", enemy);

    const hpBefore = enemy.hp;

    enemy.takeDamage(this.character.stats.damage);

    console.log(
      "Enemy HP before:",
      hpBefore,
      "damage:",
      this.character.stats.damage,
    );
    console.log("Enemy HP after:", enemy.hp);
  }
}
