import { Character } from "../entities/Character";
import { Enemy } from "../entities/Enemy";

export class CombatSystem {
  character: Character;
  enemy: Enemy | null;

  constructor(character: Character, enemy: Enemy) {
    this.character = character;
    this.enemy = enemy;
  }

  setEnemy(enemy: Enemy) {
    this.enemy = enemy;
  }

  /**
   * Atualiza apenas timers / estado.
   * NÃO aplica dano.
   */
  update(delta: number) {
    this.character.update(delta);
  }

  /**
   * Aplica dano exatamente no hit frame da animação.
   */
  public applyAttack() {
    if (!this.enemy) return;
    if (this.enemy.isDead()) return;

    const damage = this.character.stats.damage;

    const hpBefore = this.enemy.hp;

    console.log("Applying attack to enemy:", this.enemy);
    console.log("Enemy HP before:", hpBefore, "damage:", damage);

    this.enemy.takeDamage(damage);

    console.log("Enemy HP after:", this.enemy.hp);
  }
}
