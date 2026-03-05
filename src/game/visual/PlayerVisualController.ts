import Phaser from "phaser";

type PlayerVisualConfig = {
  idleAnim: string;
  attackAnim: string;
  attackLoopAnim?: string;
  scale?: number;
  depth?: number;
};

export class PlayerVisualController {
  private sprite: Phaser.GameObjects.Sprite;
  private attacking = false;
  private hitListeners: (() => void)[] = [];
  private config: PlayerVisualConfig;
  private isDead = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    textureKey: string,
    config: PlayerVisualConfig,
  ) {
    this.config = config;

    this.sprite = scene.add.sprite(x, y, textureKey);

    // pé no chão
    this.sprite.setOrigin(0.5, 1);

    if (config.scale !== undefined) {
      this.sprite.setScale(config.scale);
    }

    if (config.depth !== undefined) {
      this.sprite.setDepth(config.depth);
    }

    // ==========================
    // HIT FRAME
    // ==========================
    this.sprite.on(
      Phaser.Animations.Events.ANIMATION_UPDATE,
      (
        anim: Phaser.Animations.Animation,
        frame: Phaser.Animations.AnimationFrame,
      ) => {
        if (this.isDead) return;

        // garantir que é animação de ataque
        if (
          anim.key === this.config.attackAnim ||
          anim.key === this.config.attackLoopAnim
        ) {
          if (frame.index === 6) {
            for (const cb of this.hitListeners) {
              cb();
            }
          }
        }
      },
    );

    // ==========================
    // CONTROLE DE LOOP
    // ==========================
    this.sprite.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      if (this.isDead) return;

      if (this.attacking) {
        if (this.config.attackLoopAnim) {
          this.sprite.play(this.config.attackLoopAnim);
        } else {
          this.sprite.play(this.config.attackAnim);
        }
      } else {
        this.sprite.play(this.config.idleAnim);
      }
    });

    // animação inicial
    this.sprite.play(this.config.idleAnim);
  }

  // ==========================
  // API
  // ==========================

  startAttack() {
    if (this.isDead) return;
    if (this.attacking) return;

    this.attacking = true;
    this.sprite.play(this.config.attackAnim);
  }

  setAttackSpeed(multiplier: number) {
    this.sprite.anims.timeScale = multiplier;
  }

  stopAttack() {
    this.attacking = false;

    if (!this.isDead) {
      this.sprite.play(this.config.idleAnim);
    }
  }

  onHit(cb: () => void) {
    this.hitListeners.push(cb);
  }

  offHit(cb: () => void) {
    const index = this.hitListeners.indexOf(cb);
    if (index !== -1) {
      this.hitListeners.splice(index, 1);
    }
  }

  getSprite() {
    return this.sprite;
  }

  die() {
    this.isDead = true;
    this.attacking = false;

    this.hitListeners = []; // limpa listeners

    this.sprite.anims.stop();
    this.sprite.setFrame(0);
  }
}
