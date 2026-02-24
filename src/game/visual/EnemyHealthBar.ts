import Phaser from "phaser";

export class EnemyHealthBar {
  private graphics: Phaser.GameObjects.Graphics;

  private width = 6;
  private height = 40;

  private lastPercentage = 1;
  private highlighted = false;

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics();
  }

  // 🔹 agora não aplica nenhum offset interno
  setPosition(x: number, y: number) {
    this.graphics.setPosition(x, y);
  }

  moveTo(x: number, y: number, scene: Phaser.Scene) {
    scene.tweens.add({
      targets: this.graphics,
      x,
      y,
      duration: 200,
      ease: "Power2",
    });
  }

  setHighlighted(value: boolean) {
    this.highlighted = value;
    this.update(this.lastPercentage);
  }

  update(percentage: number) {
    const clamped = Phaser.Math.Clamp(percentage, 0, 1);
    this.lastPercentage = clamped;

    this.graphics.clear();

    // fundo
    this.graphics.fillStyle(0x000000, 1);
    this.graphics.fillRect(
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height,
    );

    // contorno
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
    const missingHeight = (this.height - 2) * (1 - clamped);

    this.graphics.fillStyle(0xff3333, 1);

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

  // 🔹 caso precise acessar externamente no futuro
  getGraphics() {
    return this.graphics;
  }
}
