import Phaser from "phaser";

export class EnemyHealthBar {
  private graphics: Phaser.GameObjects.Graphics;

  private width = 6; // largura fina
  private height = 40; // altura vertical
  private offsetX = -24; // deslocamento para frente do sprite
  private offsetY = -20; // ajuste fino vertical
  private lastPercentage = 1;

  private highlighted = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.graphics = scene.add.graphics();
    this.setPosition(x, y);
  }

  setPosition(x: number, y: number) {
    this.graphics.setPosition(x + this.offsetX, y + this.offsetY);
  }

  setHighlighted(value: boolean) {
    this.highlighted = value;
    this.update(this.lastPercentage ?? 1);
  }

  update(percentage: number) {
    const clamped = Phaser.Math.Clamp(percentage, 0, 1);

    this.graphics.clear();

    this.lastPercentage = clamped;

    // fundo

    this.graphics.fillStyle(clamped > 0.5 ? 0x00cc66 : 0xff3333, 1);

    if (percentage <= 49) {
      this.graphics.fillStyle(0x000000, 1);
    } else {
      this.graphics.fillRect(
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height,
      );
    }

    // contorno (diferente se for alvo atual)
    this.graphics.lineStyle(
      this.highlighted ? 2 : 1,
      this.highlighted ? 0xffcc00 : 0xffffff,
      1,
    );
    this.graphics.strokeRect(
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height,
    );

    // vida (de cima para baixo)
    const innerHeight = (this.height - 2) * clamped;

    this.graphics.fillStyle(0xff3333, 1);

    const missingHeight = (this.height - 2) * (1 - clamped);

    this.graphics.fillRect(
      -this.width / 2 + 1,
      -this.height / 2 + 1 + missingHeight,
      this.width - 2,
      this.height - 2 - missingHeight,
    );
  }

  destroy() {
    this.graphics.destroy();
  }
}
