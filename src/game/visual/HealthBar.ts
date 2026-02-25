import Phaser from "phaser";

export type HealthBarConfig = {
  width: number;
  height: number;
  backgroundColor?: number;
  fillColor?: number;
  borderColor?: number;
  orientation?: "vertical" | "horizontal";
};

export class HealthBar {
  private graphics: Phaser.GameObjects.Graphics;

  private width: number;
  private height: number;
  private orientation: "vertical" | "horizontal";

  private backgroundColor: number;
  private fillColor: number;
  private borderColor: number;

  private lastPercentage = 1;
  private highlighted = false;

  constructor(scene: Phaser.Scene, config: HealthBarConfig) {
    this.graphics = scene.add.graphics();

    this.width = config.width;
    this.height = config.height;
    this.orientation = config.orientation ?? "vertical";

    this.backgroundColor = config.backgroundColor ?? 0x000000;
    this.fillColor = config.fillColor ?? 0x00cc66;
    this.borderColor = config.borderColor ?? 0xffffff;
  }

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

    // background
    this.graphics.fillStyle(this.backgroundColor, 1);
    this.graphics.fillRect(
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height,
    );

    // border
    this.graphics.lineStyle(
      this.highlighted ? 2 : 1,
      this.highlighted ? 0xffcc00 : this.borderColor,
      1,
    );

    this.graphics.strokeRect(
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height,
    );

    // fill
    this.graphics.fillStyle(this.fillColor, 1);

    if (this.orientation === "vertical") {
      const innerHeight = (this.height - 2) * clamped;

      this.graphics.fillRect(
        -this.width / 2 + 1,
        -this.height / 2 + 1 + (this.height - 2 - innerHeight),
        this.width - 2,
        innerHeight,
      );
    } else {
      // VIDA HORIZONTAL (da esquerda para direita)
      const innerWidth = (this.width - 2) * clamped;

      this.graphics.fillRect(
        -this.width / 2 + 1,
        -this.height / 2 + 1,
        innerWidth,
        this.height - 2,
      );
    }
  }

  destroy() {
    this.graphics.destroy();
  }
}
