import type { Enemy } from "../entities/Enemy";

export type EnemyMovement = {
  enemy: Enemy;
  from: { row: number; col: number };
  to: { row: number; col: number };
};
