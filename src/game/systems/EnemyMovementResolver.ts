import { EnemyGrid } from "../systems/EnemyGrid";
import { Enemy } from "../entities/Enemy";
import type { EnemyEntry } from "../types/EnemyEntry";
import type { EnemyMovement } from "../types/EnemyMovement";

type Movement = {
  enemy: Enemy;
  from: { row: number; col: number };
  to: { row: number; col: number };
};

const MAX_DISTANCE = 3;

export class EnemyMovementResolver {
  constructor(private grid: EnemyGrid) {}

  private canMoveForward(row: number, col: number): boolean {
    let blockedCount = 0;

    for (let c = col - 1; c >= 0; c--) {
      const enemies = this.grid.getEnemiesInColumn(c);

      if (enemies.length > 0) {
        blockedCount++;

        if (blockedCount >= 2) {
          return false; // 🔥 bloqueado
        }
      }
    }

    return true; // 🔥 pode mover
  }

  resolveAfterDeath(row: number, col: number): Movement[] {
    const allMovements: Movement[] = [];

    const gapQueue: { row: number; col: number }[] = [];
    gapQueue.push({ row, col });

    while (gapQueue.length > 0) {
      const gap = gapQueue.shift()!;
      const movements = this.resolveFromGap(gap.row, gap.col);

      if (movements.length === 0) continue;

      for (const move of movements) {
        allMovements.push(move);

        // 🔥 cada movimento cria um novo gap na posição antiga
        gapQueue.push({
          row: move.from.row,
          col: move.from.col,
        });
      }
    }

    return allMovements;
  }

  private toAxial(row: number, col: number) {
    const q = col;
    const r = row - Math.floor(col / 2);
    return { q, r };
  }

  private hexDistance(aRow: number, aCol: number, bRow: number, bCol: number) {
    const a = this.toAxial(aRow, aCol);
    const b = this.toAxial(bRow, bCol);

    const dq = a.q - b.q;
    const dr = a.r - b.r;

    return Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dq + dr));
  }

  private getBackNeighbors(row: number, col: number) {
    const isEvenCol = col % 2 === 0;

    if (isEvenCol) {
      return [
        { row: row, col: col + 1 },
        { row: row + 1, col: col + 1 },
      ];
    } else {
      return [
        { row: row, col: col + 1 },
        { row: row - 1, col: col + 1 },
      ];
    }
  }

  private getHexNeighbors(row: number, col: number) {
    const isEvenCol = col % 2 === 0;

    if (isEvenCol) {
      return [
        { row: row - 1, col }, // cima
        { row: row + 1, col }, // baixo
        { row: row - 1, col: col - 1 },
        { row: row, col: col - 1 },
        { row: row - 1, col: col + 1 },
        { row: row, col: col + 1 },
      ];
    } else {
      return [
        { row: row - 1, col },
        { row: row + 1, col },
        { row: row, col: col - 1 },
        { row: row + 1, col: col - 1 },
        { row: row, col: col + 1 },
        { row: row + 1, col: col + 1 },
      ];
    }
  }

  private getDirectionalNeighbors(row: number, col: number) {
    const isOdd = col % 2 === 1;

    if (isOdd) {
      return [
        { row: row, col: col + 1 },
        { row: row - 1, col: col + 1 },
      ];
    } else {
      return [
        { row: row, col: col + 1 },
        { row: row + 1, col: col + 1 },
      ];
    }
  }

  private getLayerNeighbors(row: number, col: number) {
    const isEvenCol = col % 2 === 0;

    if (isEvenCol) {
      return [
        { row: row, col: col + 1 },
        { row: row + 1, col: col + 1 },
      ];
    } else {
      return [
        { row: row, col: col + 1 },
        { row: row - 1, col: col + 1 },
      ];
    }
  }

  resolveFromGap(row: number, col: number): EnemyMovement[] {
    const movements: EnemyMovement[] = [];

    const candidates = [
      { row, col: col + 1 }, // mesma linha (PRIORIDADE)
      { row: row - 1, col: col + 1 }, // diagonal cima
      { row: row + 1, col: col + 1 }, // diagonal baixo
    ];

    for (const candidate of candidates) {
      if (!this.grid.isValidPosition(candidate.row, candidate.col)) continue;

      const entry = this.grid.getEntryAt(candidate.row, candidate.col);

      if (entry) {
        this.grid.moveEnemy(candidate.row, candidate.col, row, col);

        return [
          {
            enemy: entry.enemy,
            from: { row: candidate.row, col: candidate.col },
            to: { row, col },
          },
        ];
      }
    }

    return movements;
  }

  private isInRange(col: number, range: number): boolean {
    return col <= range - 1;
  }

  private isProtected(col: number): boolean {
    for (let c = 0; c < col; c++) {
      const enemies = this.grid.getEnemiesInColumn(c);

      for (const entry of enemies) {
        const enemy = entry.enemy;

        if (this.isInRange(c, enemy.stats.range)) {
          return true;
        }
      }
    }

    return false;
  }
}
