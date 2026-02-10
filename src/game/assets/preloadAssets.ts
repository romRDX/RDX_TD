import Phaser from "phaser";

/**
 * Definição de um spritesheet de inimigo
 */
export type EnemyAsset = {
  key: string;
  path: string;
  frameWidth: number;
  frameHeight: number;
};

/**
 * Configuração do preload
 */
export type PreloadConfig = {
  enemies: EnemyAsset[];
};

/**
 * Carrega todos os assets necessários para a cena
 * - Player é sempre carregado
 * - Inimigos são definidos dinamicamente
 * - Cenário é carregado aqui também
 */
export function preloadAssets(scene: Phaser.Scene, config: PreloadConfig) {
  // ======================
  // PLAYER (sempre presente)
  // ======================
  scene.load.spritesheet(
    "knight-idle",
    "src/assets/characters/Knight 2D Pixel Art/Sprites/without_outline/IDLE.png",
    {
      frameWidth: 96,
      frameHeight: 84,
    },
  );

  scene.load.spritesheet(
    "knight-attack",
    "src/assets/characters/Knight 2D Pixel Art/Sprites/without_outline/ATTACK 1.png",
    {
      frameWidth: 96,
      frameHeight: 84,
    },
  );

  // ======================
  // INIMIGOS (dinâmico)
  // ======================
  config.enemies.forEach((enemy) => {
    scene.load.spritesheet(enemy.key, enemy.path, {
      frameWidth: enemy.frameWidth,
      frameHeight: enemy.frameHeight,
    });
  });

  // ======================
  // CENÁRIO
  // ======================
  scene.load.image("castle", "src/assets/tiles/png/Asset 24.png");
}
