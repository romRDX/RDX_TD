import { Action } from "./Action";
import { Enemy } from "../../game/entities/Enemy";
import { eventBus } from "../instanceEventBus";

export class DeathAction extends Action {
  constructor(private enemy: Enemy) {
    super();
  }

  async execute() {
    console.log("💀 DeathAction triggered");

    // 🔥 NOVO: emite evento de morte
    eventBus.emit("enemy:death", {
      enemy: this.enemy,
    });
  }
}
