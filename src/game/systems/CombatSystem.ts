import { Character } from "../entities/Character";
import { Enemy } from "../entities/Enemy";

export class CombatSystem {
  character: Character;
  enemy: Enemy | null = null;

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
  }

  /**
   * Aplica dano exatamente no hit frame da animação.
   */
  applyAttack() {
    if (!this.enemy) return;
    if (this.enemy.isDead()) return;

    console.log("Applying attack to enemy:", this.enemy);

    const hpBefore = this.enemy.hp;

    this.enemy.takeDamage(this.character.stats.damage);

    console.log(
      "Enemy HP before:",
      hpBefore,
      "damage:",
      this.character.stats.damage,
    );

    console.log("Enemy HP after:", this.enemy.hp);
  }
}
