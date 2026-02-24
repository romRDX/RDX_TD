import Phaser from "phaser";
import { EnemyHealthBar } from "./EnemyHealthBar";
import type { Enemy } from "../entities/Enemy";

type EnemyVisualConfig = {
  textureKey: string;
  scale?: number;
  flipX?: boolean;
  depth?: number;
};

export class EnemyVisualController {
  private sprite: Phaser.GameObjects.Sprite;
  private healthBar: EnemyHealthBar;

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

    this.healthBar = new EnemyHealthBar(scene, x, y);

    enemy.onHealthChange((hp, maxHp) => {
      this.updateHealth(hp, maxHp);
    });

    // renderiza estado inicial
    this.updateHealth(enemy.hp, enemy.maxHp);
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
    this.sprite.setPosition(x, y);
    this.healthBar.setPosition(x, y);
  }

  setHighlighted(value: boolean) {
    this.healthBar.setHighlighted(value);
  }

  destroy() {
    this.sprite.destroy();
    this.healthBar.destroy();
  }
}
