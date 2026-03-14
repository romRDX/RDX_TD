import type { EnemyTypeId } from "../../factories/EnemiesFactory";
import type { EnemyStats } from "../../entities/Enemy";

export type EnemyPrototype = {
  id: EnemyTypeId;
  stats: EnemyStats;
  textureKey: string;
  scale: number;
  flipX?: boolean;
};

export const ENEMY_PROTOTYPES: Record<EnemyTypeId, EnemyPrototype> = {
  1: {
    id: 1,
    stats: {
      maxHp: 250,
      damage: 5,
      attackSpeed: 0.8,
      archetype: "melee",
      range: 1,
    },
    textureKey: "kobold-idle",
    scale: 1,
    flipX: true,
  },
};
