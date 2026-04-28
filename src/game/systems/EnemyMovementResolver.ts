import { EnemyGrid } from "../systems/EnemyGrid";
import { Enemy } from "../entities/Enemy";
import type { EnemyEntry } from "../types/EnemyEntry";

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

  private getDirectionalNeighbors(row: number, col: number, startCol: number) {
    const neighbors = this.getHexNeighbors(row, col);

    // 🔥 só mantém posições "para trás"
    return neighbors.filter((pos) => pos.col > startCol);
  }

  private resolveFromGap(startRow: number, startCol: number): Movement[] {
    const movements: Movement[] = [];
    const MAX_DISTANCE = 3;

    console.log("🧩 resolveFromGap START", { startRow, startCol });

    if (!this.grid.isCellEmpty(startRow, startCol)) {
      console.log("⛔ GAP NOT EMPTY - abort");
      return movements;
    }

    const visited = new Set<string>();
    const queue: { row: number; col: number; dist: number }[] = [];

    queue.push({ row: startRow, col: startCol, dist: 0 });
    visited.add(`${startRow},${startCol}`);

    let bestCandidate: {
      entry: EnemyEntry;
      row: number;
      col: number;
      hexDist: number;
      colDist: number;
    } | null = null;

    while (queue.length > 0) {
      console.log("🧱 NEW BFS ITERATION");

      const layerSize = queue.length;
      const layerCandidates: {
        entry: EnemyEntry;
        row: number;
        col: number;
        hexDist: number;
        colDist: number;
      }[] = [];

      console.log("🧱 PROCESSING LAYER", {
        layerSize,
        queueSnapshot: queue.map((q) => `[${q.row},${q.col}]`).join(" "),
      });

      for (let i = 0; i < layerSize; i++) {
        const current = queue.shift()!;
        const { row, col, dist } = current;

        console.log("🔍 VISITING NODE", { row, col, dist });

        if (dist >= MAX_DISTANCE) {
          console.log("🛑 SKIP (MAX DIST REACHED)", { row, col, dist });
          continue;
        }

        const nextPositions = this.getDirectionalNeighbors(row, col, startCol);

        console.log("➡️ EXPANDING FROM", {
          current: { row, col, dist },
          nextPositions,
        });

        for (const pos of nextPositions) {
          if (!this.grid.isValidPosition(pos.row, pos.col)) {
            console.log("❌ INVALID POSITION", pos);
            continue;
          }

          if (pos.col > startCol + MAX_DISTANCE) {
            console.log("🛑 BLOCKED BY MAX COLUMN DIST", pos);
            continue;
          }

          const key = `${pos.row},${pos.col}`;
          if (visited.has(key)) {
            console.log("🔁 SKIP VISITED", pos);
            continue;
          }

          visited.add(key);

          const entry = this.grid.getEntryAt(pos.row, pos.col);

          console.log("🔎 CHECK CELL", {
            pos,
            hasEnemy: !!entry,
          });

          if (entry) {
            const enemy = entry.enemy;

            const colDist = pos.col - startCol;
            const isInRange = colDist <= enemy.stats.range - 1;

            console.log("📏 RANGE CHECK", {
              pos,
              colDist,
              range: enemy.stats.range,
              isInRange,
            });

            if (!isInRange) {
              const hexDist = this.hexDistance(
                pos.row,
                pos.col,
                startRow,
                startCol,
              );

              console.log("✅ CANDIDATE ADDED", {
                pos,
                hexDist,
                colDist,
                layer: dist + 1,
              });

              layerCandidates.push({
                entry,
                row: pos.row,
                col: pos.col,
                hexDist,
                colDist,
              });
            } else {
              console.log("❌ REJECTED (IN RANGE)", pos);
            }
          }

          queue.push({
            row: pos.row,
            col: pos.col,
            dist: dist + 1,
          });

          console.log("📥 PUSH TO QUEUE", {
            pos,
            nextDist: dist + 1,
          });
        }
      }

      console.log("📊 LAYER CANDIDATES RESULT", layerCandidates);

      if (layerCandidates.length > 0) {
        console.log("🛑 STOP AT LAYER (FOUND CANDIDATES)");

        const center = Math.floor(this.grid.rows / 2);

        layerCandidates.sort((a, b) => {
          if (a.colDist !== b.colDist) return a.colDist - b.colDist;
          if (a.hexDist !== b.hexDist) return a.hexDist - b.hexDist;

          const distA = Math.abs(a.row - center);
          const distB = Math.abs(b.row - center);
          if (distA !== distB) return distB - distA;

          return a.row - b.row;
        });

        console.log("📊 SORTED LAYER CANDIDATES", layerCandidates);

        bestCandidate = layerCandidates[0];
        break;
      }
    }

    if (!bestCandidate) {
      console.log("🚫 NO CANDIDATE FOUND");
      return movements;
    }

    console.log("🏆 FINAL SELECTED", bestCandidate);

    this.grid.moveEnemy(
      bestCandidate.row,
      bestCandidate.col,
      startRow,
      startCol,
    );

    console.log("🚚 MOVE EXECUTED", {
      from: { row: bestCandidate.row, col: bestCandidate.col },
      to: { row: startRow, col: startCol },
    });

    movements.push({
      enemy: bestCandidate.entry.enemy,
      from: { row: bestCandidate.row, col: bestCandidate.col },
      to: { row: startRow, col: startCol },
    });

    console.log("✅ resolveFromGap END", movements);

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
