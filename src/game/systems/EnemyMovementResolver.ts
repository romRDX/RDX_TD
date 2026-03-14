import { EnemyGrid } from "../systems/EnemyGrid";
import { Enemy } from "../entities/Enemy";

type Movement = {
  enemy: Enemy;
  from: { row: number; col: number };
  to: { row: number; col: number };
};

export class EnemyMovementResolver {
  constructor(private grid: EnemyGrid) {}

  resolveAfterDeath(row: number, col: number): Movement[] {
    const movements: Movement[] = [];

    const frontColumn = this.grid.getFrontColumn();

    if (frontColumn === null) {
      return movements;
    }

    // se já estamos na coluna 0 ninguém avança
    if (frontColumn === 0) {
      return movements;
    }

    const enemies = this.grid.getEnemiesInColumn(frontColumn);

    for (const e of enemies) {
      const targetRow = e.row;
      const targetCol = frontColumn - 1;

      if (this.grid.isCellEmpty(targetRow, targetCol)) {
        this.grid.moveEnemy(e.row, e.col, targetRow, targetCol);

        movements.push({
          enemy: e.enemy,
          from: { row: e.row, col: e.col },
          to: { row: targetRow, col: targetCol },
        });
      }
    }

    return movements;
  }

  private findFrontEnemyColumn(): number | null {
    for (let col = 0; col < this.grid.cols; col++) {
      const enemies = this.grid.getEnemiesInColumn(col);

      if (enemies.length > 0) {
        return col;
      }
    }

    return null;
  }

  private moveColumnToFront(col: number): Movement[] {
    const movements: Movement[] = [];

    const enemies = this.grid.getEnemiesInColumn(col);

    for (const e of enemies) {
      const targetRow = e.row;
      const targetCol = 0;

      if (this.grid.isCellEmpty(targetRow, targetCol)) {
        this.grid.moveEnemy(e.row, e.col, targetRow, targetCol);

        movements.push({
          enemy: e.enemy,
          from: { row: e.row, col: e.col },
          to: { row: targetRow, col: targetCol },
        });
      }
    }

    return movements;
  }
}
