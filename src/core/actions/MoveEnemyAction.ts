import { Action } from "./Action";
import { Enemy } from "../../game/entities/Enemy";
import type { EnemyEntry } from "../../game/types/EnemyEntry";

type GridPosition = {
  row: number;
  col: number;
};

export class MoveEnemyAction extends Action {
  constructor(
    private entry: EnemyEntry,
    private to: GridPosition,
    private gridToWorld: (row: number, col: number) => { x: number; y: number },
    private scene: Phaser.Scene,
  ) {
    super();
  }

  async execute(): Promise<void> {
    const { x, y } = this.gridToWorld(this.to.row, this.to.col);

    await this.entry.visual.moveTo(x, y, this.scene);

    // 🔥 Atualiza estado lógico
    this.entry.row = this.to.row;
    this.entry.col = this.to.col;

    this.entry.enemy.row = this.to.row;
    this.entry.enemy.col = this.to.col;
  }
}
