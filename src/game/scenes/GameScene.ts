import Phaser from "phaser";

import { Character } from "../entities/Character";
import { CombatSystem } from "../systems/CombatSystem";
import { EnemyGrid } from "../systems/EnemyGrid";

import { preloadAssets } from "../assets/preloadAssets";
import { createAnimations } from "../animations/createAnimations";

import { defaultStageConfig } from "../stage/StageConfig";
import { GridHudRenderer } from "../grid/GridHudRenderer";

import { PlayerVisualController } from "../visual/PlayerVisualController";
import { CombatPresenter } from "../presentation/CombatPresenter";
import { EnemyManager } from "../systems/EnemyManager";

import { WaveRenderer } from "../systems/WaveRenderer";
import type { WaveBlueprint } from "../types/WaveBlueprint";

const GROUND_Y = 360;
const KNIGHT_FOOT_OFFSET = 35;

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

    const gridSize = 7;

    // const gridToWorld = (row: number, col: number) => {
    //   return {
    //     x: stageConfig.grid.originX + col * stageConfig.grid.cellWidth,
    //     y: stageConfig.grid.originY + row * stageConfig.grid.cellHeight,
    //   };
    // };

    // for (let row = 0; row < gridSize; row++) {
    //   for (let col = 0; col < gridSize; col++) {
    //     const { x, y } = gridToWorld(row, col);
    //     this.gridHud.drawCell(x, y);
    //   }
    // }

    const gridToWorld = (row: number, col: number) => {
      const baseX = stageConfig.grid.originX + col * stageConfig.grid.cellWidth;
      const baseY =
        stageConfig.grid.originY + row * stageConfig.grid.cellHeight;

      const isOddColumn = col % 2 === 1;

      const verticalOffset = isOddColumn ? -stageConfig.grid.cellHeight / 2 : 0;

      return {
        x: baseX,
        y: baseY + verticalOffset,
      };
    };

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const isOddColumn = col % 2 === 1;

        // colunas ímpares têm uma célula a menos
        if (isOddColumn && row === 0) {
          continue; // pula a primeira célula
        }

        const { x, y } = gridToWorld(row, col);
        this.gridHud.drawCell(x, y);
      }
    }

    this.enemyGrid = new EnemyGrid(7, 7);

    this.enemyManager = new EnemyManager();

    const waveRenderer = new WaveRenderer({
      scene: this,
      enemyGrid: this.enemyGrid,
      enemyManager: this.enemyManager,
      gridToWorld,
      cellRadius: 26, // 👈 mesmo valor usado no GridHudRenderer
    });

    const bluePrintData = [
      // { enemyTypeId: 1, position: { col: 0, row: 0 } },
      // { enemyTypeId: 1, position: { col: 2, row: 2 } },
      // { enemyTypeId: 1, position: { col: 3, row: 3 } },
      // { enemyTypeId: 1, position: { col: 4, row: 4 } },
      // { enemyTypeId: 1, position: { col: 5, row: 5 } },
      // { enemyTypeId: 1, position: { col: 6, row: 6 } },

      { enemyTypeId: 1, position: { col: 0, row: 3 } },
      { enemyTypeId: 1, position: { col: 1, row: 3 } },
      { enemyTypeId: 1, position: { col: 2, row: 3 } },
    ];

    // const bluePrintData = [
    //   { enemyTypeId: 1, position: { row: 0, col: 2 } },
    //   { enemyTypeId: 1, position: { row: 1, col: 2 } },
    //   { enemyTypeId: 1, position: { row: 2, col: 2 } },
    // ];

    const wave: WaveBlueprint = {
      units: bluePrintData,
    };

    waveRenderer.renderWave(wave);

    console.log(
      "Enemies in manager:",
      this.enemyManager.getAllEnemies().length,
    );
    console.log("Enemies in grid:", this.enemyGrid.getAllEnemies().length);

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
        depth: 3,
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
        const deadEntry = this.enemyManager.findByEnemy(deadEnemy);
        if (!deadEntry) return;

        // 🔹 1) guardar posição antes de qualquer alteração
        const deadRow = deadEntry.row;
        const deadCol = deadEntry.col;

        console.log("Dead position:", deadRow, deadCol);
        console.log("Grid state:", this.enemyGrid);

        // 🔹 2) remover do grid lógico
        this.enemyGrid.removeEnemyByInstance(deadEnemy);

        // 🔹 3) resolver formação antes de remover do manager

        this.enemyGrid.debugPrint();

        const movements = this.enemyGrid.resolveRowShift(deadRow, deadCol);

        console.log("Movements:", movements);

        // 🔹 4) aplicar movimentos visuais e atualizar posição lógica
        for (const move of movements) {
          const entry = this.enemyManager.findByEnemy(move.enemy);
          if (!entry) continue;

          const { x, y } = gridToWorld(move.to.row, move.to.col);

          entry.visual.moveTo(x, y, this);

          entry.row = move.to.row;
          entry.col = move.to.col;
        }

        // 🔹 5) agora sim remover do manager
        this.enemyManager.removeEnemy(deadEntry);

        // 🔹 6) destruir visual do morto
        deadEntry.visual.destroy();

        // 🔹 7) trocar alvo
        const nextTarget = this.enemyManager.getCurrentTarget();
        if (!nextTarget) {
          console.log("All enemies defeated");
          return;
        }

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
