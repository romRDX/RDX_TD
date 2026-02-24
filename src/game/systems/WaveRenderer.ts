import { EnemiesFactory } from "../factories/EnemiesFactory";
import { EnemyGrid } from "./EnemyGrid";
import { EnemyManager } from "./EnemyManager";
import type { WaveBlueprint } from "../types/WaveBlueprint";

type GridCell = {
  row: number;
  col: number;
};

type GridToWorldFn = (
  row: number,
  col: number,
) => {
  x: number;
  y: number;
};

type WaveRendererConfig = {
  scene: Phaser.Scene;
  enemyGrid: EnemyGrid;
  enemyManager: EnemyManager;
  gridToWorld: GridToWorldFn;
  cellRadius: number; // 👈 importante
};

export class WaveRenderer {
  private scene: Phaser.Scene;
  private enemyGrid: EnemyGrid;
  private enemyManager: EnemyManager;
  private gridToWorld: GridToWorldFn;
  private cellRadius: number;

  constructor(config: WaveRendererConfig) {
    this.scene = config.scene;
    this.enemyGrid = config.enemyGrid;
    this.enemyManager = config.enemyManager;
    this.gridToWorld = config.gridToWorld;
    this.cellRadius = config.cellRadius;
  }

  public renderWave(blueprint: WaveBlueprint) {
    blueprint.units.forEach((unit) => {
      if (!unit.position) {
        throw new Error("Unit must have explicit position");
      }

      this.spawnUnit(unit.enemyTypeId, unit.position);
    });
  }

  private spawnUnit(enemyTypeId: number, cell: GridCell) {
    const entry = EnemiesFactory.create({
      scene: this.scene,
      enemyTypeId,
    });

    const world = this.gridToWorld(cell.row, cell.col);

    // ajuste fino vertical
    const FOOT_ADJUST = 18; // teste entre 15 e 25

    entry.visual.setPosition(world.x, world.y + FOOT_ADJUST);

    this.enemyGrid.addEnemy(entry.enemy, cell.row, cell.col);
    this.enemyManager.addEnemy(entry);

    console.log(
      `Spawned enemy type ${enemyTypeId} at (${cell.row}, ${cell.col})`,
    );
  }
}
