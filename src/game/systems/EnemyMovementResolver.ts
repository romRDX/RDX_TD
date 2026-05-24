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

  findBestFrontlinerCandidate(): EnemyEntry | null {
    console.log("🛡️ FIND FRONTLINER START");

    const allEnemies = this.grid.getAllEnemies();

    console.log(
      "🛡️ ALL ENEMIES:",
      allEnemies.map((e) => ({
        row: e.row,
        col: e.col,
        archetype: e.enemy.stats.archetype,
      })),
    );

    if (allEnemies.length === 0) {
      console.log("🚫 NO ENEMIES AVAILABLE");
      return null;
    }

    const rows = this.grid.rows;

    // 🔥 centro do grid
    const centerPositions =
      rows % 2 === 0 ? [rows / 2 - 1, rows / 2] : [Math.floor(rows / 2)];

    const distToCenter = (r: number) =>
      Math.min(...centerPositions.map((c) => Math.abs(r - c)));

    const candidates = [...allEnemies];

    candidates.sort((a, b) => {
      console.log("⚖️ FRONTLINE COMPARE", {
        A: { row: a.row, col: a.col },
        B: { row: b.row, col: b.col },
      });

      // 1️⃣ MAIS PRÓXIMO DA COLUNA 0
      if (a.col !== b.col) {
        console.log("🏆 WIN BY COLUMN", a.col < b.col ? "A" : "B");

        return a.col - b.col;
      }

      // 2️⃣ MAIS PRÓXIMO DO CENTRO
      const distA = distToCenter(a.row);
      const distB = distToCenter(b.row);

      if (distA !== distB) {
        console.log("🏆 WIN BY CENTER", distA < distB ? "A" : "B");

        return distA - distB;
      }

      // 3️⃣ MAIS EMBAIXO
      console.log("🏆 WIN BY LOWER ROW", a.row > b.row ? "A" : "B");

      return b.row - a.row;
    });

    const best = candidates[0];

    console.log("🛡️ FRONTLINER SELECTED", {
      row: best.row,
      col: best.col,
      archetype: best.enemy.stats.archetype,
    });

    return best;
  }

  private wantsToMove(entry: EnemyEntry): boolean {
    const enemy = entry.enemy;

    const archetype = enemy.stats.archetype;
    const range = enemy.stats.range;

    const inRange = this.isInRange(entry.col, range);

    console.log("🧠 WANTS TO MOVE CHECK", {
      row: entry.row,
      col: entry.col,
      archetype,
      range,
      inRange,
    });

    // 🔥 melee sempre quer avançar
    if (archetype === "melee") {
      console.log("⚔️ MELEE -> WANTS TO MOVE");

      return true;
    }

    // 🔥 ranged parado enquanto em range
    if (archetype === "ranged") {
      const wants = !inRange;

      console.log(
        wants
          ? "🏹 RANGED -> OUT OF RANGE -> MOVE"
          : "🏹 RANGED -> IN RANGE -> STAY",
      );

      return wants;
    }

    // 🔥 hybrid (temporário)
    if (archetype === "hybrid") {
      console.log("🗡️ HYBRID -> WANTS TO MOVE");

      return true;
    }

    console.log("❓ UNKNOWN ARCHETYPE -> STAY");

    return false;
  }

  resolveFromGap(row: number, col: number): EnemyMovement[] {
    const movements: EnemyMovement[] = [];

    // const rawCandidates = [
    //   { row, col: col + 1 }, // mesma linha
    //   { row: row - 1, col: col + 1 }, // cima
    //   { row: row + 1, col: col + 1 }, // baixo
    // ];

    const rawCandidates = [];

    for (let d = 1; d <= 3; d++) {
      rawCandidates.push(
        { row, col: col + d },
        { row: row - d, col: col + d },
        { row: row + d, col: col + d },
      );
    }

    const validCandidates: {
      entry: EnemyEntry;
      row: number;
      col: number;
      colDist: number; // 🔥 NOVO
    }[] = [];

    for (const candidate of rawCandidates) {
      if (!this.grid.isValidPosition(candidate.row, candidate.col)) continue;

      const entry = this.grid.getEntryAt(candidate.row, candidate.col);

      if (entry) {
        console.log("🔍 CANDIDATE FOUND", {
          row: candidate.row,
          col: candidate.col,
          archetype: entry.enemy.stats.archetype,
        });

        const wantsToMove = this.wantsToMove(entry);

        console.log("🧠 CANDIDATE WANTS TO MOVE?", wantsToMove);

        if (!wantsToMove) {
          console.log("🛑 CANDIDATE REFUSED MOVE");

          continue;
        }

        validCandidates.push({
          entry,
          row: candidate.row,
          col: candidate.col,
          colDist: candidate.col - col,
        });

        console.log("✅ VALID MOVE CANDIDATE ADDED");
      }
    }

    if (validCandidates.length === 0) {
      return movements;
    }

    const rows = this.grid.rows;

    // 🔥 centros (suporta 6 ou 7 corretamente)
    const centerPositions =
      rows % 2 === 0 ? [rows / 2 - 1, rows / 2] : [Math.floor(rows / 2)];

    const distToCenter = (r: number) =>
      Math.min(...centerPositions.map((c) => Math.abs(r - c)));

    // 🔥 SORT COM TODAS AS REGRAS
    validCandidates.sort((a, b) => {
      // 1. distância física (hex) — (aqui é sempre igual hoje, mas mantém correto)
      const hexA = this.hexDistance(a.row, a.col, row, col);
      const hexB = this.hexDistance(b.row, b.col, row, col);
      if (hexA !== hexB) return hexA - hexB;

      // 2. distância em coluna (CRÍTICO — AGORA FUNCIONA)
      if (a.colDist !== b.colDist) return a.colDist - b.colDist;

      // 3. distância do centro (MAIS LONGE primeiro)
      const distA = distToCenter(a.row);
      const distB = distToCenter(b.row);
      if (distA !== distB) return distB - distA;

      // 4. mais acima
      return a.row - b.row;
    });

    const best = validCandidates[0];

    this.grid.moveEnemy(best.row, best.col, row, col);

    return [
      {
        enemy: best.entry.enemy,
        from: { row: best.row, col: best.col },
        to: { row, col },
      },
    ];
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
