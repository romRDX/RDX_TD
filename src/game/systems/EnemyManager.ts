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
    if (this.enemies.length === 0) {
      console.log("🎯 NO TARGET AVAILABLE");
      return null;
    }

    const rows = 7;

    // centros do grid
    const centerPositions =
      rows % 2 === 0 ? [rows / 2 - 1, rows / 2] : [Math.floor(rows / 2)];

    const distToCenter = (row: number) =>
      Math.min(...centerPositions.map((c) => Math.abs(row - c)));

    const sorted = [...this.enemies].sort((a, b) => {
      // 1️⃣ menor coluna primeiro
      if (a.col !== b.col) {
        return a.col - b.col;
      }

      // 2️⃣ mais próximo do centro
      const distA = distToCenter(a.row);
      const distB = distToCenter(b.row);

      if (distA !== distB) {
        return distA - distB;
      }

      // 3️⃣ mais acima
      return a.row - b.row;
    });

    console.log(
      "🎯 TARGET SORT:",
      sorted.map((e) => ({
        row: e.row,
        col: e.col,
        archetype: e.enemy.stats.archetype,
      })),
    );

    console.log("🎯 TARGET SELECTED:", {
      row: sorted[0].row,
      col: sorted[0].col,
      archetype: sorted[0].enemy.stats.archetype,
    });

    return sorted[0];
  }

  /**
   * Permite encontrar um entry pelo Enemy lógico
   * Útil para casos onde só temos a referência do Enemy
   */
  findByEnemy(enemy: EnemyEntry["enemy"]): EnemyEntry | undefined {
    return this.enemies.find((e) => e.enemy === enemy);
  }
}
