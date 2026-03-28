import { Action } from "./Action";
import { Enemy } from "../../game/entities/Enemy";
import { DeathCheckAction } from "./DeathCheckAction";

export class DamageAction extends Action {
  constructor(
    private enemy: Enemy,
    private damage: number,
  ) {
    super();
  }

  async execute() {
    this.enemy.takeDamage(this.damage);

    // 👇 NOVO: encadeia verificação de morte
    const deathCheck = new DeathCheckAction(this.enemy);
    await deathCheck.execute();
  }
}
