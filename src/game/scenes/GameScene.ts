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
import { WaveController } from "../systems/WaveController";
import { HealthBar } from "../visual/HealthBar";

import { WAVES } from "../stage/WaveConfig";
import { CombatFlowController } from "../systems/CombatFlowController";

import { GameStateController } from "../systems/GameStateController";

const GROUND_Y = 360;
const KNIGHT_FOOT_OFFSET = 35;

export class GameScene extends Phaser.Scene {
  private enemyGrid!: EnemyGrid;
  private enemyManager!: EnemyManager;

  private combatPresenter: CombatPresenter | null = null;
  private combatFlow!: CombatFlowController;
  private combatSystem!: CombatSystem;

  private character!: Character;
  private playerVisual!: PlayerVisualController;
  private gridHud!: GridHudRenderer;

  private isGameOver = false;
  private gameState!: GameStateController;

  private waveRenderer!: WaveRenderer;
  private waveController!: WaveController;
  private gridToWorld!: (row: number, col: number) => { x: number; y: number };

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

    this.gameState = new GameStateController();

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

    this.gridToWorld = (row: number, col: number) => {
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

        const { x, y } = this.gridToWorld(row, col);
        this.gridHud.drawCell(x, y);
      }
    }

    this.enemyGrid = new EnemyGrid(7, 7);

    this.enemyManager = new EnemyManager();

    this.waveRenderer = new WaveRenderer({
      scene: this,
      enemyGrid: this.enemyGrid,
      enemyManager: this.enemyManager,
      gridToWorld: this.gridToWorld,
      cellRadius: 26, // 👈 mesmo valor usado no GridHudRenderer
    });

    this.waveController = new WaveController(
      WAVES,
      this.waveRenderer,
      this.enemyManager,
    );

    this.waveController.start();

    this.combatFlow = new CombatFlowController(
      this.enemyGrid,
      this.enemyManager,
      this.waveController,
      this.gridToWorld,
      this,
    );

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

    const playerHealthBar = new HealthBar(this, {
      width: 80, // 👈 AJUSTE AQUI
      height: 12, // 👈 AJUSTE AQUI
      fillColor: 0x00cc66,
      orientation: "horizontal", // 👈 IMPORTANTE
    });

    playerHealthBar.setPosition(
      215, // centro do player
      GROUND_Y + KNIGHT_FOOT_OFFSET - 20, // 👈 AJUSTE DISTÂNCIA PARA BAIXO AQUI
    );

    // COMBATE
    this.character = new Character({
      maxHp: 10000,
      damage: 50,
      attackSpeed: 1, // ataques por segundo
    });

    this.character.onHealthChange((hp, maxHp) => {
      playerHealthBar.update(hp / maxHp);
    });

    this.character.onHealthChange((hp, maxHp) => {
      if (hp <= 0 && !this.gameState.isGameOver()) {
        this.gameState.setGameOver();

        console.log("Player died");

        // parar animação atual
        this.playerVisual.die();
      }
    });

    playerHealthBar.update(1);

    const firstTarget = this.enemyManager.getCurrentTarget();
    if (!firstTarget) throw new Error("No enemies available");

    // const combat = new CombatSystem(this.character, firstTarget.enemy);
    this.combatSystem = new CombatSystem(this.character);

    this.combatPresenter = new CombatPresenter(
      this.combatSystem,
      this.playerVisual,
      (deadEnemy) => {
        const newTarget = await this.combatFlow.handleEnemyDeath(
          deadEnemy,
          this.character,
          this.playerVisual,
        );

        if (!newTarget) {
          this.playerVisual.stopAttack();

          if (this.combatPresenter) {
            this.combatPresenter.clearEnemy();
          }

          return;
        }

        if (this.combatPresenter) {
          this.combatPresenter.setEnemy(newTarget.enemy, newTarget.visual);
        }
      },
    );

    this.combatPresenter.setEnemy(firstTarget.enemy, firstTarget.visual);
  }

  update(time: number, delta: number) {
    if (!this.gameState.isRunning()) {
      return;
    }

    console.log("Presenter:", this.combatPresenter);

    if (this.combatPresenter) {
      this.combatPresenter.update(delta);
    }

    if (this.character?.isDead?.()) {
      return;
    }

    // Inimigos atacam o player
    for (const entry of this.enemyManager.getAllEnemies()) {
      const enemy = entry.enemy;

      enemy.update(delta, this.character);

      if (enemy.stats.archetype === "melee") {
        // depois vamos validar se está na linha de frente
      }

      if (enemy.stats.archetype === "ranged") {
        // ranged sempre pode atacar (por enquanto)
      }
    }
  }
}
