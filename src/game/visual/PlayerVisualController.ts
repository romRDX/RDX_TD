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
  private onHitCallback?: () => void;
  private config: PlayerVisualConfig;

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

    // escala e depth vindos do GameScene
    if (config.scale !== undefined) {
      this.sprite.setScale(config.scale);
    }

    if (config.depth !== undefined) {
      this.sprite.setDepth(config.depth);
    }

    // ==========================
    // HIT FRAME (frame 6)
    // ==========================
    this.sprite.on(
      Phaser.Animations.Events.ANIMATION_UPDATE,
      (
        anim: Phaser.Animations.Animation,
        frame: Phaser.Animations.AnimationFrame,
      ) => {
        if (frame.index === 6) {
          if (this.onHitCallback) {
            this.onHitCallback();
          }
        }
      },
    );

    // ==========================
    // CONTROLE DE LOOP
    // ==========================
    this.sprite.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
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
    if (this.attacking) return;
    this.attacking = true;
    this.sprite.play(this.config.attackAnim);
  }

  setAttackSpeed(multiplier: number) {
    this.sprite.anims.timeScale = multiplier;
  }

  stopAttack() {
    this.attacking = false;
  }

  onHit(cb: () => void) {
    this.onHitCallback = cb;
  }

  getSprite() {
    return this.sprite;
  }
}
