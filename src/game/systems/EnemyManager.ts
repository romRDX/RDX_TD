import { Enemy } from "../entities/Enemy";

export class EnemyManager {
  private enemies: Enemy[] = [];

  addEnemy(enemy: Enemy) {
    this.enemies.push(enemy);
  }

  removeEnemy(enemy: Enemy) {
    this.enemies = this.enemies.filter((e) => e !== enemy);
  }

  getAllEnemies(): Enemy[] {
    return this.enemies;
  }

  hasEnemies(): boolean {
    return this.enemies.length > 0;
  }

  /**
   * Regra simples por enquanto:
   * - primeiro inimigo da lista
   * (mais tarde isso vira targeting de verdade)
   */
  getCurrentTarget(): Enemy | null {
    return this.enemies.length > 0 ? this.enemies[0] : null;
  }
}
