import { Action } from "./Action";
import type { EnemyEntry } from "../../../src/game/types/EnemyEntry";

type GridToWorldFn = (row: number, col: number) => { x: number; y: number };

export class MoveEnemyAction extends Action {
  constructor(
    private entry: EnemyEntry,
    private toRow: number,
    private toCol: number,
    private gridToWorld: GridToWorldFn,
    private scene: Phaser.Scene,
  ) {
    super();
  }

  async execute() {
    const { x, y } = this.gridToWorld(this.toRow, this.toCol);

    this.entry.visual.moveTo(x, y, this.scene);

    this.entry.row = this.toRow;
    this.entry.col = this.toCol;

    this.entry.enemy.row = this.toRow;
    this.entry.enemy.col = this.toCol;
  }
}
