import { Action } from "./Action";
import { Enemy } from "../../game/entities/Enemy";
import { DeathAction } from "./DeathAction";

export class DeathCheckAction extends Action {
  constructor(private enemy: Enemy) {
    super();
  }

  async execute() {
    if (!this.enemy.isDead()) return;

    const deathAction = new DeathAction(this.enemy);
    await deathAction.execute();
  }
}
