import { Enemy } from "../entities/Enemy";

export type GridPosition = {
  row: number;
  col: number;
};

export type GridMovement = {
  enemy: Enemy;
  from: GridPosition;
  to: GridPosition;
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

  resolveRowShift(row: number, startCol: number): GridMovement[] {
    const movements: GridMovement[] = [];

    for (let col = startCol; col < this.cols - 1; col++) {
      const nextCol = col + 1;

      if (this.cells[row][col] === null && this.cells[row][nextCol]) {
        const enemy = this.cells[row][nextCol]!;

        this.cells[row][col] = enemy;
        this.cells[row][nextCol] = null;

        movements.push({
          enemy,
          from: { row, col: nextCol },
          to: { row, col },
        });
      }
    }

    return movements;
  }

  private findBestCandidate(
    targetRow: number,
    targetCol: number,
  ): {
    enemy: Enemy;
    fromRow: number;
    fromCol: number;
  } | null {
    for (let distance = 1; distance < this.rows; distance++) {
      const row = targetRow + distance;

      if (row >= this.rows) break;

      // prioridade: mesma coluna
      if (this.cells[row][targetCol]) {
        return {
          enemy: this.cells[row][targetCol]!,
          fromRow: row,
          fromCol: targetCol,
        };
      }

      // diagonal esquerda
      const leftCol = targetCol - 1;
      if (leftCol >= 0 && this.cells[row][leftCol]) {
        return {
          enemy: this.cells[row][leftCol]!,
          fromRow: row,
          fromCol: leftCol,
        };
      }

      // diagonal direita
      const rightCol = targetCol + 1;
      if (rightCol < this.cols && this.cells[row][rightCol]) {
        return {
          enemy: this.cells[row][rightCol]!,
          fromRow: row,
          fromCol: rightCol,
        };
      }
    }

    return null;
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

  debugPrint() {
    console.log(
      this.cells
        .map((row) => row.map((cell) => (cell ? "E" : ".")).join(" "))
        .join("\n"),
    );
  }
}
