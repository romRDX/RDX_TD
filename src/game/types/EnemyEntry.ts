import { Enemy } from "../entities/Enemy";
import { EnemyVisualController } from "../visual/EnemyVisualController";

export type EnemyEntry = {
  enemy: Enemy;
  visual: EnemyVisualController;
  typeId: number;
};
