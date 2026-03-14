import Phaser from "phaser";

import { Enemy } from "../entities/Enemy";
import { EnemyVisualController } from "../visual/EnemyVisualController";
import type { EnemyEntry } from "../types/EnemyEntry";

import { ENEMY_PROTOTYPES } from "../data/enemies/enemyPrototypes";

/**
 * Tipos básicos de inimigos
 * ID pode ser number ou string
 */
export type EnemyTypeId = number;

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

    // 2️⃣ Visual — criado sem posição ainda
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
      enemy, // linka visual ↔ enemy para updates de vida
    );

    visual.playIdle(proto.textureKey);

    return {
      enemy,
      visual,
      typeId: proto.id,
      row: -1, // posição ainda não definida
      col: -1, // posição ainda não definida
    };
  }
}
