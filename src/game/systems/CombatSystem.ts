import { Character } from "../entities/Character";
import { Enemy } from "../entities/Enemy";

export class CombatSystem {
  character: Character;
  enemy: Enemy;

  constructor(character: Character, enemy: Enemy) {
    this.character = character;
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
    if (this.enemy.isDead()) return;

    this.enemy.takeDamage(this.character.stats.damage);
  }
}
