import Phaser from "phaser";

import { Enemy } from "../entities/Enemy";
import type { EnemyStats } from "../entities/Enemy";
import { EnemyVisualController } from "../visual/EnemyVisualController";
import type { EnemyEntry } from "../types/EnemyEntry";

/**
 * Tipos básicos de inimigos
 * ID pode ser number ou string
 */
export type EnemyTypeId = number;

/**
 * Blueprint / Prototype de inimigo
 * Só dados, zero estado vivo
 */
type EnemyPrototype = {
  id: EnemyTypeId;
  stats: EnemyStats;
  textureKey: string;
  scale: number;
  flipX?: boolean;
};

/**
 * Registry de inimigos básicos
 * (isso é sua "base de dados")
 */
const ENEMY_PROTOTYPES: Record<EnemyTypeId, EnemyPrototype> = {
  1: {
    id: 1,
    stats: {
      maxHp: 250,
      damage: 5,
      attackSpeed: 0.8,
      archetype: "melee",
    },
    textureKey: "kobold-idle",
    scale: 1,
    flipX: true,
  },
};

export class EnemiesFactory {
  static create({
    scene,
    enemyTypeId,
  }: {
    scene: Phaser.Scene;
    enemyTypeId: EnemyTypeId;
  }): EnemyEntry {
    const proto = ENEMY_PROTOTYPES[enemyTypeId];

    if (!proto) {
      throw new Error(`Enemy prototype not found for id ${enemyTypeId}`);
    }

    // 1️⃣ Enemy lógico — sempre NOVO
    const enemy = new Enemy(proto.stats);

    // 2️⃣ Visual — sem posição
    const visual = new EnemyVisualController(
      scene,
      0,
      0,
      {
        textureKey: proto.textureKey,
        scale: proto.scale,
        flipX: proto.flipX ?? false,
        depth: 2,
      },
      enemy /* 👈 linka o visual com o inimigo para updates de vida */,
    );

    visual.playIdle(proto.textureKey);

    return {
      enemy,
      visual,
      typeId: proto.id,
      row: -1, // 👈 posição ainda não definida
      col: -1, // 👈 posição ainda não definida
    };
  }
}
