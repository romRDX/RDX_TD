import Phaser from "phaser";

import { Character } from "../entities/Character";
import { Enemy } from "../entities/Enemy";
import { CombatSystem } from "../systems/CombatSystem";
import { EnemyGrid } from "../systems/EnemyGrid";

import { preloadAssets } from "../assets/preloadAssets";
import { createAnimations } from "../animations/createAnimations";

import { defaultStageConfig } from "../stage/StageConfig";
import { GridHudRenderer } from "../grid/GridHudRenderer";
import { generateDiamondGrid } from "../grid/DiamondGridGenerator";

import { PlayerVisualController } from "../visual/PlayerVisualController";
import { EnemyVisualController } from "../visual/EnemyVisualController";
import { CombatPresenter } from "../presentation/CombatPresenter";

const GROUND_Y = 360;
const KNIGHT_FOOT_OFFSET = 35;
const KOBOLD_FOOT_OFFSET = 0;

export class GameScene extends Phaser.Scene {
  private enemyGrid!: EnemyGrid;
  private combatPresenter!: CombatPresenter;

  private playerVisual!: PlayerVisualController;
  private enemyVisual!: EnemyVisualController;

  private gridHud!: GridHudRenderer;

  private lastAttackTime = 0;
  private attackSpeed = 1;

  constructor() {
    super("GameScene");
  }

  // ======================
  // PRELOAD
  // ======================
  preload() {
    preloadAssets(this, {
      enemies: [
        {
          key: "kobold-idle",
          path: "src/assets/enemies/FREE_Kobold Warrior 2D Pixel Art/Sprites/without_outline/IDLE.png",
          frameWidth: 148,
          frameHeight: 96,
        },
      ],
    });
  }

  // ======================
  // CREATE
  // ======================
  create() {
    const stageConfig = defaultStageConfig;

    // ======================
    // BACKGROUND
    // ======================
    const castle = this.add.image(240, GROUND_Y, "castle");

    castle.setOrigin(1.0, 0.83).setScale(0.6).setFlipX(true).setDepth(0);

    castle.setCrop(0, 0, castle.width, castle.height);

    // ======================
    // ANIMATIONS
    // ======================
    createAnimations(this.anims);

    // ======================
    // GRID HUD
    // ======================
    this.gridHud = new GridHudRenderer(this, {
      radius: 26,
      strokeColor: 0xffffff,
      strokeAlpha: 0.35,
      strokeWidth: 2,
      depth: 1,
    });

    const cells = generateDiamondGrid(stageConfig.grid.radius);

    const halfW = stageConfig.grid.cellWidth / 2;
    const halfH = stageConfig.grid.cellHeight / 2;

    for (const { row, col } of cells) {
      const x = stageConfig.grid.originX + (col - row) * halfW;
      const y = stageConfig.grid.originY + (col + row) * halfH;

      this.gridHud.drawCell(x, y);
    }

    // ======================
    // GRID LÓGICO
    // ======================
    this.enemyGrid = new EnemyGrid(
      stageConfig.grid.rows,
      stageConfig.grid.cols,
    );

    // ======================
    // PLAYER VISUAL
    // ======================
    this.playerVisual = new PlayerVisualController(
      this,
      215,
      GROUND_Y + KNIGHT_FOOT_OFFSET,
      "knight-idle",
      {
        idleAnim: "knight-idle",
        attackAnim: "knight-attack",
        attackLoopAnim: "knight-attack-loop",
        scale: 1.8, // 👈 agora funciona
        depth: 2,
      },
    );

    // ======================
    // ENEMY (TESTE)
    // ======================
    const enemyGridRow = 1;
    const enemyGridCol = 1;

    const enemyX =
      stageConfig.grid.originX + (enemyGridCol - enemyGridRow) * halfW;

    const enemyY =
      stageConfig.grid.originY + (enemyGridCol + enemyGridRow) * halfH;

    this.enemyVisual = new EnemyVisualController(
      this,
      enemyX,
      enemyY + KOBOLD_FOOT_OFFSET,
      {
        textureKey: "kobold-idle",
        scale: 1,
        flipX: true,
        depth: 2,
      },
    );

    this.enemyVisual.playIdle("kobold-idle");

    // ======================
    // COMBATE
    // ======================
    const character = new Character({
      maxHp: 100,
      damage: 10,
      attackSpeed: this.attackSpeed,
    });

    const enemy = new Enemy(250);

    this.enemyGrid.addEnemy(enemy, enemyGridRow, enemyGridCol);

    const combat = new CombatSystem(character, enemy);

    this.combatPresenter = new CombatPresenter(
      combat,
      this.playerVisual,
      this.enemyVisual,
    );
  }

  // ======================
  // UPDATE
  // ======================

  update(time: number, delta: number) {
    this.combatPresenter.update(delta);

    const attackIntervalMs = 1000 / this.attackSpeed;
    const attackIntervalSec = attackIntervalMs / 1000;

    // 🔹 duração base da animação (frameCount / frameRate)
    const ATTACK_ANIM_DURATION = 0.7; // 7 frames / 10 fps

    let animationSpeedMultiplier = 1;

    // 👇 só acelera se a animação NÃO couber no intervalo
    if (ATTACK_ANIM_DURATION > attackIntervalSec) {
      animationSpeedMultiplier = ATTACK_ANIM_DURATION / attackIntervalSec;
    }

    // 👇 nunca deixa a animação lenta demais
    animationSpeedMultiplier = Math.max(animationSpeedMultiplier, 1);

    this.playerVisual.setAttackSpeed(animationSpeedMultiplier);

    if (time - this.lastAttackTime >= attackIntervalMs) {
      this.lastAttackTime = time;
      this.playerVisual.startAttack();
    }
  }

  // update(time: number, delta: number) {
  //   this.combatPresenter.update(delta);

  //   // 👇 CONVERSÃO attackSpeed → multiplicador de animação
  //   const attackSpeedMultiplier = this.attackSpeed / 5;
  //   // 5 = attackSpeed base (ajuste se quiser)

  //   this.playerVisual.setAttackSpeed(attackSpeedMultiplier);

  //   const attackIntervalMs = 1000 / this.attackSpeed;

  //   if (time - this.lastAttackTime >= attackIntervalMs) {
  //     this.lastAttackTime = time;
  //     this.playerVisual.startAttack();
  //   }
  // }
}
