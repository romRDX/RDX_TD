import { EnemyGrid } from "../systems/EnemyGrid";
import { Enemy } from "../entities/Enemy";

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

    let moved = true;
    let currentRow = row;
    let currentCol = col;

    while (moved) {
      moved = false;

      const movements = this.resolveFromGap(currentRow, currentCol);

      if (movements.length > 0) {
        moved = true;
        allMovements.push(...movements);

        // 🔥 pega o novo gap (posição antiga do inimigo que moveu)
        const lastMove = movements[0];
        currentRow = lastMove.from.row;
        currentCol = lastMove.from.col;
      }
    }

    return allMovements;
  }

  // resolveAfterDeath(row: number, col: number): Movement[] {
  //   const allMovements: Movement[] = [];

  //   // 🔥 se não há inimigos, não há o que mover
  //   if (this.grid.getAllEnemies().length === 0) {
  //     return allMovements;
  //   }

  //   let moved = true;

  //   while (moved) {
  //     moved = false;

  //     // 🔥 resolve movimento a partir do gap (posição onde morreu)
  //     const movements = this.resolveFromGap(row, col);

  //     if (movements.length > 0) {
  //       moved = true;
  //       allMovements.push(...movements);
  //     }
  //   }

  //   return allMovements;
  // }

  private resolveFromGap(startRow: number, startCol: number): Movement[] {
    const movements: Movement[] = [];

    const MAX_DISTANCE = 3;

    // se o gap não está vazio, não faz nada
    if (!this.grid.isCellEmpty(startRow, startCol)) {
      return movements;
    }

    const visited = new Set<string>();
    const queue: { row: number; col: number; dist: number }[] = [];

    queue.push({ row: startRow, col: startCol, dist: 0 });
    visited.add(`${startRow},${startCol}`);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const { row, col, dist } = current;

      // 🔥 limite de distância (permite até MAX_DISTANCE)
      if (dist > MAX_DISTANCE) continue;

      const nextPositions = [
        { row: row, col: col + 1 }, // direto atrás (prioridade máxima)
        { row: row - 1, col: col + 1 }, // diagonal cima
        { row: row + 1, col: col + 1 }, // diagonal baixo
      ];

      for (const pos of nextPositions) {
        if (!this.grid.isValidPosition(pos.row, pos.col)) continue;

        const key = `${pos.row},${pos.col}`;
        if (visited.has(key)) continue;

        visited.add(key);

        const entry = this.grid.getEntryAt(pos.row, pos.col);
        if (!entry) continue;

        const enemy = entry.enemy;

        const isInRange = this.isInRange(pos.col, enemy.stats.range);

        // 🔥 move se precisar (fora de range)
        if (!isInRange) {
          this.grid.moveEnemy(pos.row, pos.col, startRow, startCol);

          movements.push({
            enemy,
            from: { row: pos.row, col: pos.col },
            to: { row: startRow, col: startCol },
          });

          return movements;
        }

        // 🔥 continua busca (BFS)
        queue.push({
          row: pos.row,
          col: pos.col,
          dist: dist + 1,
        });
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
