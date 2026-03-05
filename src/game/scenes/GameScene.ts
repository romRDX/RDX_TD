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
import type { WaveBlueprint } from "../types/WaveBlueprint";
import { HealthBar } from "../visual/HealthBar";

import { WAVES } from "../stage/WaveConfig";
// import type { CombatFlowController } from "../systems/CombatFlowController";
import { CombatFlowController } from "../systems/CombatFlowController";

const GROUND_Y = 360;
const KNIGHT_FOOT_OFFSET = 35;

export class GameScene extends Phaser.Scene {
  private enemyGrid!: EnemyGrid;
  private enemyManager!: EnemyManager;
  private combatPresenter: CombatPresenter | null = null;
  private combatFlow!: CombatFlowController;

  private character!: Character;
  private playerVisual!: PlayerVisualController;
  private gridHud!: GridHudRenderer;

  private lastAttackTime = 0;
  private attackSpeed = 1;

  private isGameOver = false;
  // private isCombatActive = false;

  // private currentWaveIndex = 0;
  private waveRenderer!: WaveRenderer;
  private waveController!: WaveController;
  private gridToWorld!: (row: number, col: number) => { x: number; y: number };

  // private spawnCurrentWave() {
  //   // const wave = WAVES[this.currentWaveIndex];

  //   if (!wave) {
  //     console.log("All waves completed");
  //     return;
  //   }

  //   this.waveRenderer.renderWave(wave);
  // }

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

    // const gridToWorld = (row: number, col: number) => {
    //   const baseX = stageConfig.grid.originX + col * stageConfig.grid.cellWidth;
    //   const baseY =
    //     stageConfig.grid.originY + row * stageConfig.grid.cellHeight;

    //   const isOddColumn = col % 2 === 1;

    //   const verticalOffset = isOddColumn ? -stageConfig.grid.cellHeight / 2 : 0;

    //   return {
    //     x: baseX,
    //     y: baseY + verticalOffset,
    //   };
    // };

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

    // this.spawnCurrentWave();

    // this.isCombatActive = true;

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
      attackSpeed: this.attackSpeed,
    });

    this.character.onHealthChange((hp, maxHp) => {
      playerHealthBar.update(hp / maxHp);
    });

    this.character.onHealthChange((hp, maxHp) => {
      if (hp <= 0 && !this.isGameOver) {
        this.isGameOver = true;

        console.log("Player died");

        // parar animação atual
        this.playerVisual.die();
      }
    });

    playerHealthBar.update(1);

    const firstTarget = this.enemyManager.getCurrentTarget();
    if (!firstTarget) throw new Error("No enemies available");

    const combat = new CombatSystem(this.character, firstTarget.enemy);

    if (this.combatPresenter) {
      this.combatPresenter.destroy(this.playerVisual);
    }

    this.combatPresenter = new CombatPresenter(
      combat,
      this.playerVisual,
      firstTarget.visual,
      (deadEnemy) => {
        console.log("GAME SCENE DEATH CALLBACK");

        if (this.combatPresenter) {
          this.combatPresenter.destroy(this.playerVisual);
        }

        const newPresenter = this.combatFlow.handleEnemyDeath(
          deadEnemy,
          this.character,
          this.playerVisual,
        );

        if (!newPresenter) {
          console.log("NO TARGET AVAILABLE");

          this.combatPresenter = null;
          this.playerVisual.stopAttack();

          return;
        }

        console.log("NEW PRESENTER:", newPresenter);

        this.combatPresenter = newPresenter;
      },
    );

    // 🔥 REGISTRA O PRIMEIRO INIMIGO
    this.combatPresenter.setEnemy(firstTarget.enemy, firstTarget.visual);
  }

  update(time: number, delta: number) {
    if (this.isGameOver) {
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

    const attackIntervalMs = 1000 / this.attackSpeed;
    const attackIntervalSec = attackIntervalMs / 1000;

    const ATTACK_ANIM_DURATION = 0.7;

    let animationSpeedMultiplier = 1;

    if (ATTACK_ANIM_DURATION > attackIntervalSec) {
      animationSpeedMultiplier = ATTACK_ANIM_DURATION / attackIntervalSec;
    }

    animationSpeedMultiplier = Math.max(animationSpeedMultiplier, 1);

    this.playerVisual.setAttackSpeed(animationSpeedMultiplier);

    const currentTarget = this.enemyManager.getCurrentTarget();

    if (!currentTarget) {
      this.playerVisual.stopAttack();
    }

    if (
      !this.character.isDead() &&
      currentTarget &&
      time - this.lastAttackTime >= attackIntervalMs
    ) {
      this.lastAttackTime = time;
      this.playerVisual.startAttack();
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
