import { Enemy } from "../entities/Enemy";

export type GridPosition = {
  row: number;
  col: number;
};

export class EnemyGrid {
  readonly rows: number;
  readonly cols: number;

  private cells: (Enemy | null)[][];

  constructor(rows: number, cols: number) {
    this.rows = rows;
    this.cols = cols;

    this.cells = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => null),
    );
  }

  isValidPosition(row: number, col: number): boolean {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
  }

  isEmpty(row: number, col: number): boolean {
    if (!this.isValidPosition(row, col)) return false;
    return this.cells[row][col] === null;
  }

  addEnemy(enemy: Enemy, row: number, col: number): boolean {
    if (!this.isValidPosition(row, col)) return false;
    if (!this.isEmpty(row, col)) return false;

    this.cells[row][col] = enemy;
    return true;
  }

  removeEnemyByInstance(enemy: Enemy): void {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.cells[r][c] === enemy) {
          this.cells[r][c] = null;
          return;
        }
      }
    }
  }

  getAllEnemies(): Enemy[] {
    return this.cells.flat().filter(Boolean) as Enemy[];
  }

  getEmptyPositions(): GridPosition[] {
    const result: GridPosition[] = [];

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.cells[r][c] === null) {
          result.push({ row: r, col: c });
        }
      }
    }

    return result;
  }
}
