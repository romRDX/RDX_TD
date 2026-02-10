import Phaser from "phaser";

export class EnemyHealthBar {
  private graphics: Phaser.GameObjects.Graphics;

  private width = 34;
  private height = 5;
  private offsetY = -48;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.graphics = scene.add.graphics();
    this.setPosition(x, y);
  }

  setPosition(x: number, y: number) {
    this.graphics.setPosition(x, y + this.offsetY);
  }

  update(percentage: number) {
    this.graphics.clear();

    // fundo preto
    this.graphics.fillStyle(0x000000, 1);
    this.graphics.fillRect(
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height,
    );

    // contorno branco
    this.graphics.lineStyle(1, 0xffffff, 1);
    this.graphics.strokeRect(
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height,
    );

    // vida atual
    const innerWidth = (this.width - 2) * Phaser.Math.Clamp(percentage, 0, 1);
    this.graphics.fillStyle(0xff3333, 1);
    this.graphics.fillRect(
      -this.width / 2 + 1,
      -this.height / 2 + 1,
      innerWidth,
      this.height - 2,
    );
  }

  destroy() {
    this.graphics.destroy();
  }
}
