import Phaser from "phaser";

import { Enemy } from "../entities/Enemy";
import { EnemyVisualController } from "../visual/EnemyVisualController";

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
  maxHp: number;
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
    maxHp: 250,
    textureKey: "kobold-idle",
    scale: 1,
    flipX: true,
  },
  // futuramente:
  // 2: { goblin... }
  // 3: { skeleton... }
};

export class EnemiesFactory {
  static create({
    scene,
    enemyTypeId,
  }: {
    scene: Phaser.Scene;
    enemyTypeId: EnemyTypeId;
  }) {
    const proto = ENEMY_PROTOTYPES[enemyTypeId];

    if (!proto) {
      throw new Error(`Enemy prototype not found for id ${enemyTypeId}`);
    }

    // 1️⃣ Enemy lógico — sempre NOVO
    const enemy = new Enemy(proto.maxHp);

    // 2️⃣ Visual — sem posição
    const visual = new EnemyVisualController(scene, 0, 0, {
      textureKey: proto.textureKey,
      scale: proto.scale,
      flipX: proto.flipX ?? false,
      depth: 2,
    });

    visual.playIdle(proto.textureKey);

    return {
      enemy,
      visual,
      typeId: proto.id,
    };
  }
}
