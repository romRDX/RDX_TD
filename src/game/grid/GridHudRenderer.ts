import Phaser from "phaser";

export type GridHudStyle = {
  radius: number;
  strokeColor: number;
  strokeAlpha: number;
  strokeWidth: number;
  depth?: number;
};

export class GridHudRenderer {
  private scene: Phaser.Scene;
  private style: GridHudStyle;

  constructor(scene: Phaser.Scene, style: GridHudStyle) {
    this.scene = scene;
    this.style = style;
  }

  public drawCell(x: number, y: number) {
    const g = this.scene.add.graphics();

    g.lineStyle(
      this.style.strokeWidth,
      this.style.strokeColor,
      this.style.strokeAlpha,
    );

    g.strokeCircle(x, y, this.style.radius);

    g.setDepth(this.style.depth ?? 1);
  }

  public drawGrid(
    cells: { row: number; col: number }[],
    getWorldPosition: (row: number, col: number) => { x: number; y: number },
  ) {
    for (const { row, col } of cells) {
      const pos = getWorldPosition(row, col);
      this.drawCell(pos.x, pos.y);
    }
  }
}
