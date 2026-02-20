import Phaser from "phaser";

import { Character } from "../entities/Character";
import { CombatSystem } from "../systems/CombatSystem";
import { EnemyGrid } from "../systems/EnemyGrid";

import { preloadAssets } from "../assets/preloadAssets";
import { createAnimations } from "../animations/createAnimations";

import { defaultStageConfig } from "../stage/StageConfig";
import { GridHudRenderer } from "../grid/GridHudRenderer";
import { generateDiamondGrid } from "../grid/DiamondGridGenerator";

import { PlayerVisualController } from "../visual/PlayerVisualController";
import { CombatPresenter } from "../presentation/CombatPresenter";
import { EnemiesFactory } from "../factories/EnemiesFactory";
import { EnemyManager } from "../systems/EnemyManager";
import type { EnemyEntry } from "../types/EnemyEntry";

const GROUND_Y = 360;
const KNIGHT_FOOT_OFFSET = 35;
const KOBOLD_FOOT_OFFSET = 0;

export class GameScene extends Phaser.Scene {
  private enemyGrid!: EnemyGrid;
  private enemyManager!: EnemyManager;
  private combatPresenter!: CombatPresenter;

  private playerVisual!: PlayerVisualController;
  private gridHud!: GridHudRenderer;

  private lastAttackTime = 0;
  private attackSpeed = 1;

  constructor() {
    super("GameScene");
  }

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

  create() {
    const stageConfig = defaultStageConfig;

    // BACKGROUND
    const castle = this.add.image(240, GROUND_Y, "castle");
    castle.setOrigin(1.0, 0.83).setScale(0.6).setFlipX(true).setDepth(0);

    // ANIMATIONS
    createAnimations(this.anims);

    // GRID HUD
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

    const gridToWorld = (row: number, col: number) => ({
      x: stageConfig.grid.originX + (col - row) * halfW,
      y: stageConfig.grid.originY + (col + row) * halfH,
    });

    for (const { row, col } of cells) {
      const { x, y } = gridToWorld(row, col);
      this.gridHud.drawCell(x, y);
    }

    // GRID LÓGICO
    this.enemyGrid = new EnemyGrid(
      stageConfig.grid.rows,
      stageConfig.grid.cols,
    );

    this.enemyManager = new EnemyManager();

    const enemies: EnemyEntry[] = [];

    for (let i = 0; i < 3; i++) {
      enemies.push(
        EnemiesFactory.create({
          scene: this,
          enemyTypeId: 1,
        }),
      );
    }

    const freeCells = this.enemyGrid.getEmptyPositions();

    enemies.forEach((entry, index) => {
      const cell = freeCells[index];
      if (!cell) return;

      const world = gridToWorld(cell.row, cell.col);

      // posiciona visual
      entry.visual.setPosition(world.x, world.y + KOBOLD_FOOT_OFFSET);

      // registra no grid
      this.enemyGrid.addEnemy(entry.enemy, cell.row, cell.col);

      // registra no manager
      this.enemyManager.addEnemy(entry);
    });

    // PLAYER VISUAL
    this.playerVisual = new PlayerVisualController(
      this,
      215,
      GROUND_Y + KNIGHT_FOOT_OFFSET,
      "knight-idle",
      {
        idleAnim: "knight-idle",
        attackAnim: "knight-attack",
        attackLoopAnim: "knight-attack-loop",
        scale: 1.8,
        depth: 2,
      },
    );

    // COMBATE
    const character = new Character({
      maxHp: 100,
      damage: 10,
      attackSpeed: this.attackSpeed,
    });

    const firstTarget = this.enemyManager.getCurrentTarget();
    if (!firstTarget) throw new Error("No enemies available");

    const combat = new CombatSystem(character, firstTarget.enemy);

    this.combatPresenter = new CombatPresenter(
      combat,
      this.playerVisual,
      firstTarget.visual,
      (deadEnemy) => {
        // encontra o entry correspondente
        const deadEntry = this.enemyManager.findByEnemy(deadEnemy);
        if (!deadEntry) return;

        // remove do manager
        this.enemyManager.removeEnemy(deadEntry);

        // remove do grid
        this.enemyGrid.removeEnemyByInstance(deadEnemy);

        // pega próximo alvo
        const nextTarget = this.enemyManager.getCurrentTarget();
        if (!nextTarget) {
          console.log("All enemies defeated");
          return;
        }

        // troca alvo no presenter
        this.combatPresenter.setEnemy(nextTarget.enemy, nextTarget.visual);
      },
    );
  }

  update(time: number, delta: number) {
    this.combatPresenter.update(delta);

    const attackIntervalMs = 1000 / this.attackSpeed;
    const attackIntervalSec = attackIntervalMs / 1000;

    const ATTACK_ANIM_DURATION = 0.7;

    let animationSpeedMultiplier = 1;

    if (ATTACK_ANIM_DURATION > attackIntervalSec) {
      animationSpeedMultiplier = ATTACK_ANIM_DURATION / attackIntervalSec;
    }

    animationSpeedMultiplier = Math.max(animationSpeedMultiplier, 1);

    this.playerVisual.setAttackSpeed(animationSpeedMultiplier);

    if (time - this.lastAttackTime >= attackIntervalMs) {
      this.lastAttackTime = time;
      this.playerVisual.startAttack();
    }
  }
}
