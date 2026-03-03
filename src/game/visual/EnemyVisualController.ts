import Phaser from "phaser";
import { HealthBar } from "./HealthBar";
import type { Enemy } from "../entities/Enemy";

type EnemyVisualConfig = {
  textureKey: string;
  scale?: number;
  flipX?: boolean;
  depth?: number;
};

export class EnemyVisualController {
  private sprite: Phaser.GameObjects.Sprite;
  private healthBar: HealthBar;
  private footOffset = 18; // ajuste fino aqui
  private healthBarOffsetY = 20; // ajuste fino aqui
  private healthBarOffsetX = 40; // ajuste fino aqui

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: EnemyVisualConfig,
    enemy: Enemy,
  ) {
    this.sprite = scene.add.sprite(x, y, config.textureKey);

    this.sprite
      .setOrigin(0.5, 1)
      .setScale(config.scale ?? 1)
      .setFlipX(config.flipX ?? false)
      .setDepth(config.depth ?? 2);

    this.healthBar = new HealthBar(scene, {
      width: 6,
      height: 40,
      fillColor: 0xff3333, // vermelho para inimigos
    });

    enemy.onHealthChange((hp, maxHp) => {
      this.updateHealth(hp, maxHp);
    });

    // renderiza estado inicial
    this.updateHealth(enemy.hp, enemy.stats.maxHp);
  }

  playIdle(animKey: string) {
    this.sprite.play(animKey);
  }

  playHit() {
    // feedback simples de dano (sem sprite novo)
    this.sprite.setTint(0xffaaaa);
    this.sprite.scene.time.delayedCall(80, () => {
      this.sprite.clearTint();
    });
  }

  updateHealth(currentHp: number, maxHp: number) {
    this.healthBar.update(currentHp / maxHp);
  }

  setPosition(x: number, y: number) {
    const adjustedY = y + this.footOffset;

    this.sprite.setPosition(x, adjustedY);

    // barra na lateral esquerda, alinhada ao sprite
    this.healthBar.setPosition(
      x - this.sprite.displayWidth / 2 + this.healthBarOffsetX,
      adjustedY - this.sprite.displayHeight / 2 + this.healthBarOffsetY,
    );
  }

  setHighlighted(value: boolean) {
    this.healthBar.setHighlighted(value);
  }

  moveTo(x: number, y: number, scene: Phaser.Scene) {
    const adjustedY = y + this.footOffset;

    scene.tweens.add({
      targets: this.sprite,
      x,
      y: adjustedY,
      duration: 200,
      ease: "Power2",
    });

    this.healthBar.moveTo(
      x - this.sprite.displayWidth / 2 + this.healthBarOffsetX,
      adjustedY - this.sprite.displayHeight / 2 + this.healthBarOffsetY,
      scene,
    );
  }

  destroy() {
    this.sprite.destroy();
    this.healthBar.destroy();
  }
}
