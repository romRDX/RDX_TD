import { Enemy } from "../entities/Enemy";

export class EnemyRangeResolver {
  /**
   * Verifica se o inimigo está em range do player
   * Player sempre está na coluna 0
   */
  static isEnemyInRange(enemy: Enemy): boolean {
    const distanceToPlayer = enemy.col;

    return distanceToPlayer <= enemy.stats.range;
  }
}
