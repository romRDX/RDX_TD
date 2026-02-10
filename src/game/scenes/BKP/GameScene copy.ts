// import Phaser from "phaser";
// import { Character } from "../entities/Character";
// import { Enemy } from "../entities/Enemy";
// import { CombatSystem } from "../systems/CombatSystem";
// import { EnemyGrid } from "../systems/EnemyGrid";
// import { gameEvents } from "../../shared/events";
// import { createAnimations } from "../animations/createAnimations";
// import { preloadAssets } from "../assets/preloadAssets";

// const GROUND_Y = 360;

// // ======================
// // OFFSETS VISUAIS
// // ======================
// const KNIGHT_FOOT_OFFSET = 35;
// const KOBOLD_FOOT_OFFSET = 0;

// // ======================
// // GRID HUD (CÍRCULO)
// // ======================
// const GRID_CELL_RADIUS = 26;
// const GRID_CELL_STROKE_COLOR = 0xffffff;
// const GRID_CELL_STROKE_ALPHA = 0.35;
// const GRID_CELL_STROKE_WIDTH = 2;

// // ======================
// // TIPOS
// // ======================
// type StageConfig = {
//   grid: {
//     rows: number;
//     cols: number;
//     cellWidth: number;
//     cellHeight: number;
//     originX: number;
//     originY: number;
//   };
// };

// export class GameScene extends Phaser.Scene {
//   private combat!: CombatSystem;
//   private enemyGrid!: EnemyGrid;

//   private enemyText!: Phaser.GameObjects.Text;

//   private playerSprite!: Phaser.GameObjects.Sprite;
//   private enemySprite!: Phaser.GameObjects.Sprite;
//   private enemyBaseX = 0;

//   private castleSprite!: Phaser.GameObjects.Image;

//   private lastAttackTime = 0;
//   private isAttacking = false;
//   private didHitThisAttack = false;
//   private lastAnimFrameIndex = -1;

//   private attackSpeed = 5;

//   private stageConfig!: StageConfig;

//   constructor() {
//     super("GameScene");
//   }

//   // ======================
//   // PRELOAD
//   // ======================
//   preload() {
//     preloadAssets(this, {
//       enemies: [
//         {
//           key: "kobold-idle",
//           path: "src/assets/enemies/FREE_Kobold Warrior 2D Pixel Art/Sprites/without_outline/IDLE.png",
//           frameWidth: 148,
//           frameHeight: 96,
//         },
//       ],
//     });
//   }

//   // ======================
//   // CREATE
//   // ======================
//   create() {
//     // ======================
//     // CONFIGURAÇÃO DO ESTÁGIO
//     // ======================
//     this.stageConfig = {
//       grid: {
//         rows: 3,
//         cols: 3,
//         cellWidth: 130,
//         cellHeight: 95,
//         originX: 520,
//         originY: GROUND_Y,
//       },
//     };

//     // ======================
//     // CASTLE
//     // ======================
//     this.castleSprite = this.add.image(240, GROUND_Y, "castle");

//     this.castleSprite
//       .setOrigin(1.0, 0.83)
//       .setScale(0.6)
//       .setFlipX(true)
//       .setDepth(0);

//     this.castleSprite.setCrop(
//       0,
//       0,
//       this.castleSprite.width,
//       this.castleSprite.height,
//     );

//     // ======================
//     // ANIMAÇÕES
//     // ======================
//     createAnimations(this.anims);

//     // ======================
//     // PLAYER
//     // ======================
//     this.playerSprite = this.add.sprite(
//       200,
//       GROUND_Y + KNIGHT_FOOT_OFFSET,
//       "knight-idle",
//     );

//     this.playerSprite
//       .setOrigin(0.3, 1)
//       .setScale(1.95)
//       .play("knight-idle")
//       .setDepth(2);

//     this.bindPlayerAttackAnimation();

//     // ======================
//     // GRID LÓGICO
//     // ======================
//     const { rows, cols } = this.stageConfig.grid;
//     this.enemyGrid = new EnemyGrid(rows, cols);

//     // ======================
//     // GRID HUD (CÍRCULOS)
//     // ======================
//     this.drawGridHud();

//     // ======================
//     // INIMIGO DE TESTE
//     // ======================
//     const enemy = new Enemy(10250);
//     this.enemyGrid.addEnemy(enemy, 1, 1);

//     const pos = this.getGridWorldPosition(1, 1);

//     this.enemySprite = this.add.sprite(
//       pos.x,
//       pos.y + KOBOLD_FOOT_OFFSET,
//       "kobold-idle",
//     );

//     this.enemySprite
//       .setOrigin(0.5, 1)
//       .setScale(1)
//       .setFlipX(true)
//       .play("kobold-idle")
//       .setDepth(2);

//     this.enemyBaseX = this.enemySprite.x;

//     // ======================
//     // COMBATE
//     // ======================
//     const character = new Character({
//       maxHp: 100,
//       damage: 10,
//       attackSpeed: this.attackSpeed,
//     });

//     this.combat = new CombatSystem(character, enemy);

//     // ======================
//     // HUD TEXTO
//     // ======================
//     const HUD_MARGIN = 20;

//     this.add
//       .text(this.scale.width - HUD_MARGIN, HUD_MARGIN, "Combat running", {
//         color: "#ffffff",
//       })
//       .setOrigin(1, 0);

//     this.enemyText = this.add
//       .text(this.scale.width - HUD_MARGIN, HUD_MARGIN + 30, "", {
//         color: "#ff5555",
//       })
//       .setOrigin(1, 0);

//     this.updateEnemyText(enemy);
//   }

//   // ======================
//   // UPDATE
//   // ======================
//   update(time: number, delta: number) {
//     this.combat.update(delta);

//     const enemy = this.combat.enemy;
//     this.updateEnemyText(enemy);

//     const attackIntervalMs = 1000 / this.attackSpeed;
//     const attackIntervalSec = attackIntervalMs / 1000;

//     if (
//       time - this.lastAttackTime >= attackIntervalMs &&
//       !this.isAttacking &&
//       !enemy.isDead()
//     ) {
//       this.lastAttackTime = time;
//       this.isAttacking = true;
//       this.didHitThisAttack = false;

//       const attackAnim = this.anims.get("knight-attack");
//       const attackAnimDuration =
//         attackAnim.frames.length / attackAnim.frameRate;

//       let timeScale = 1;
//       if (attackAnimDuration > attackIntervalSec) {
//         timeScale = attackAnimDuration / attackIntervalSec;
//       }

//       this.playerSprite.anims.timeScale = timeScale;

//       if (attackAnimDuration > attackIntervalSec) {
//         this.playerSprite.play("knight-attack-loop", true);
//       } else {
//         this.playerSprite.play("knight-attack", true);
//       }
//     }

//     if (enemy.isDead()) {
//       this.enemySprite.setTint(0xff0000);
//       this.time.delayedCall(300, () => {
//         gameEvents.emit("END_RUN", undefined);
//       });
//     }
//   }

//   // ======================
//   // GRID HELPERS
//   // ======================
//   private generateDiamondGrid(radius: number): { row: number; col: number }[] {
//     const cells: { row: number; col: number }[] = [];

//     for (let row = -radius; row <= radius; row++) {
//       for (let col = -radius; col <= radius; col++) {
//         const manhattan = Math.abs(row) + Math.abs(col);

//         if (
//           manhattan <= radius + 1 &&
//           !(manhattan === radius + 1 && row !== 0 && col !== 0)
//         ) {
//           cells.push({ row, col });
//         }
//       }
//     }

//     return cells;
//   }

//   private getGridWorldPosition(row: number, col: number) {
//     const { originX, originY, cellWidth, cellHeight } = this.stageConfig.grid;

//     const halfW = cellWidth / 2;
//     const halfH = cellHeight / 2;

//     return {
//       x: originX + (col - row) * halfW,
//       y: originY + (col + row) * halfH,
//     };
//   }

//   private drawGridHud() {
//     const cells = this.generateDiamondGrid(3);

//     for (const { row, col } of cells) {
//       const pos = this.getGridWorldPosition(row, col);
//       this.drawGridCellCircle(pos.x, pos.y);
//     }
//   }

//   private drawGridCellCircle(x: number, y: number) {
//     const g = this.add.graphics();

//     g.lineStyle(
//       GRID_CELL_STROKE_WIDTH,
//       GRID_CELL_STROKE_COLOR,
//       GRID_CELL_STROKE_ALPHA,
//     );

//     g.strokeCircle(x, y, GRID_CELL_RADIUS);

//     g.setDepth(1);
//   }

//   // ======================
//   // PLAYER ANIMATION LOGIC
//   // ======================
//   private bindPlayerAttackAnimation() {
//     this.playerSprite.on(
//       Phaser.Animations.Events.ANIMATION_UPDATE,
//       (_anim, frame) => {
//         const currentAnim = this.playerSprite.anims.currentAnim?.key;

//         if (
//           currentAnim !== "knight-attack" &&
//           currentAnim !== "knight-attack-loop"
//         ) {
//           this.lastAnimFrameIndex = frame.index;
//           return;
//         }

//         if (frame.index < this.lastAnimFrameIndex) {
//           this.didHitThisAttack = false;
//         }

//         const anim = this.playerSprite.anims.currentAnim;
//         if (!anim) return;

//         const hitFrameIndex = anim.frames.length - 1;

//         if (!this.didHitThisAttack && frame.index === hitFrameIndex) {
//           this.didHitThisAttack = true;

//           this.combat.applyAttack();

//           this.enemySprite.setTint(0xffffff);
//           this.time.delayedCall(60, () => {
//             this.enemySprite.clearTint();
//           });

//           this.enemySprite.x = this.enemyBaseX;
//           this.tweens.killTweensOf(this.enemySprite);

//           this.tweens.add({
//             targets: this.enemySprite,
//             x: this.enemyBaseX - 4,
//             duration: 40,
//             yoyo: true,
//             ease: "Power1",
//           });
//         }

//         this.lastAnimFrameIndex = frame.index;
//       },
//     );

//     this.playerSprite.on(
//       Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + "knight-attack",
//       () => {
//         this.isAttacking = false;
//         this.didHitThisAttack = false;
//         this.playerSprite.anims.timeScale = 1;
//         this.playerSprite.play("knight-idle", true);
//       },
//     );
//   }

//   private updateEnemyText(enemy: Enemy) {
//     this.enemyText.setText(`Enemy HP: ${Math.max(enemy.hp, 0)}`);
//   }
// }
