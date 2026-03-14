import type { EnemyEntry } from "../types/EnemyEntry";

export class EnemyManager {
  private enemies: EnemyEntry[] = [];

  addEnemy(entry: EnemyEntry) {
    entry.enemy.row = entry.row;
    entry.enemy.col = entry.col;

    this.enemies.push(entry);
  }

  removeEnemy(entry: EnemyEntry) {
    this.enemies = this.enemies.filter((e) => e !== entry);
  }

  getAllEnemies(): EnemyEntry[] {
    return this.enemies;
  }

  hasEnemies(): boolean {
    return this.enemies.length > 0;
  }

  /**
   * Regra simples por enquanto:
   * - primeiro inimigo da lista
   * (mais tarde isso vira targeting real)
   */
  getCurrentTarget(): EnemyEntry | null {
    return this.enemies.length > 0 ? this.enemies[0] : null;
  }

  /**
   * Permite encontrar um entry pelo Enemy lógico
   * Útil para casos onde só temos a referência do Enemy
   */
  findByEnemy(enemy: EnemyEntry["enemy"]): EnemyEntry | undefined {
    return this.enemies.find((e) => e.enemy === enemy);
  }
}
