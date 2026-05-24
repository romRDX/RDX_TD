import { Enemy } from "../entities/Enemy";
import type { EnemyEntry } from "../types/EnemyEntry";

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

  // 🔥 AGORA CORRETO
  private cells: (EnemyEntry | null)[][];

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

  // 🔥 AGORA RECEBE EnemyEntry (não Enemy)
  addEnemy(entry: EnemyEntry, row: number, col: number): boolean {
    if (!this.isValidPosition(row, col)) return false;
    if (!this.isEmpty(row, col)) return false;

    entry.row = row;
    entry.col = col;

    // 🔥 sincroniza Enemy também
    entry.enemy.row = row;
    entry.enemy.col = col;

    console.log("➕ ADD ENEMY TO GRID", {
      row,
      col,
      enemyId: entry.enemy.id,
    });

    this.cells[row][col] = entry;

    this.debugPrintGrid();

    return true;
  }

  resolveRowShift(row: number, startCol: number): GridMovement[] {
    const movements: GridMovement[] = [];

    for (let col = startCol; col < this.cols - 1; col++) {
      const nextCol = col + 1;

      if (this.cells[row][col] === null && this.cells[row][nextCol]) {
        const entry = this.cells[row][nextCol]!;

        this.cells[row][col] = entry;
        this.cells[row][nextCol] = null;

        entry.row = row;
        entry.col = col;

        movements.push({
          enemy: entry.enemy,
          from: { row, col: nextCol },
          to: { row, col },
        });
      }
    }

    return movements;
  }

  removeEnemyAt(row: number, col: number): void {
    console.log("🗑️ REMOVE FROM GRID", { row, col });

    this.cells[row][col] = null;

    // 🔥 DEBUG
    this.debugPrintGrid();
  }

  removeEnemyByInstance(enemy: Enemy): void {
    console.log("🧪 REMOVE CALLED WITH:", enemy);

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const entry = this.cells[r][c];

        console.log("🔍 CHECK CELL:", {
          row: r,
          col: c,
          gridEnemy: entry?.enemy,
          sameRef: entry?.enemy === enemy,
        });

        if (entry?.enemy.id === enemy.id) {
          console.log("✅ REMOVED AT:", r, c);
          this.cells[r][c] = null;
          return;
        }
      }
    }

    console.log("❌ NOT FOUND TO REMOVE");
  }

  getAllEnemies(): EnemyEntry[] {
    const result: EnemyEntry[] = [];

    for (let col = 0; col < this.cols; col++) {
      const columnEnemies = this.getEnemiesInColumn(col);
      result.push(...columnEnemies);
    }

    return result;
  }

  getEnemiesInColumn(col: number): EnemyEntry[] {
    const result: EnemyEntry[] = [];

    for (let row = 0; row < this.rows; row++) {
      const entry = this.cells[row][col];

      if (entry) {
        result.push(entry);
      }
    }

    return result;
  }

  findEnemy(enemy: Enemy): { row: number; col: number } | null {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const entry = this.cells[r][c];

        if (entry?.enemy === enemy) {
          return { row: r, col: c };
        }
      }
    }
    return null;
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

  getEnemiesAt(row: number, col: number): Enemy | null {
    // return this.cells[row]?.[col] ?? null;
    const entry = this.cells[row]?.[col];
    return entry ? entry.enemy : null;
  }

  getEntryAt(row: number, col: number): EnemyEntry | null {
    console.log("📦 GRID CHECK", row, col, this.cells[row]?.[col]);
    return this.cells[row]?.[col] ?? null;
  }

  isCellEmpty(row: number, col: number) {
    return !this.cells[row]?.[col];
  }

  getColumn(col: number): EnemyEntry[] {
    const result: EnemyEntry[] = [];

    for (let row = 0; row < this.rows; row++) {
      const entry = this.cells[row]?.[col];
      if (entry) {
        result.push(entry);
      }
    }

    return result;
  }

  getFrontColumn(): number | null {
    for (let col = 0; col < this.cols; col++) {
      if (this.columnHasEnemies(col)) {
        return col;
      }
    }

    return null;
  }

  columnHasEnemies(col: number) {
    for (let row = 0; row < this.rows; row++) {
      if (this.cells[row]?.[col]) {
        return true;
      }
    }

    return false;
  }

  moveEnemy(fromRow: number, fromCol: number, toRow: number, toCol: number) {
    const entry = this.cells[fromRow][fromCol];

    if (!entry) {
      throw new Error("No enemy at source cell");
    }

    if (this.cells[toRow][toCol]) {
      throw new Error("Target cell is not empty");
    }

    console.log("🚚 MOVE GRID", {
      from: { row: fromRow, col: fromCol },
      to: { row: toRow, col: toCol },
      enemyId: entry.enemy.id,
    });

    this.cells[fromRow][fromCol] = null;
    this.cells[toRow][toCol] = entry;

    // 🔥 sincroniza EnemyEntry
    entry.row = toRow;
    entry.col = toCol;

    // 🔥 sincroniza Enemy
    entry.enemy.row = toRow;
    entry.enemy.col = toCol;

    console.log("📍 ENEMY POSITION SYNC", {
      enemyRow: entry.enemy.row,
      enemyCol: entry.enemy.col,
    });

    // 🔥 DEBUG VISUAL DO GRID APÓS CADA MOVE
    this.debugPrintGrid();
  }

  debugPrintGrid() {
    console.log("🧱 GRID:");

    for (let r = 0; r < this.rows; r++) {
      let line = "";

      for (let c = 0; c < this.cols; c++) {
        const cell = this.cells[r][c];
        line += cell ? "X " : ". ";
      }

      console.log(line);
    }
  }
}
