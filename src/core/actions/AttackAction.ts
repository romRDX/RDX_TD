import { Action } from "./Action";
import { Enemy } from "../../game/entities/Enemy";
import { PlayerVisualController } from "../../game/visual/PlayerVisualController";
import { DamageAction } from "./DamageAction";
import { actionQueue } from "./instanceActionQueue";

export class AttackAction extends Action {
  constructor(
    private enemy: Enemy,
    private damage: number,
    private playerVisual: PlayerVisualController,
    private scene: Phaser.Scene,
  ) {
    super();
  }

  async execute(): Promise<void> {
    if (!this.enemy || this.enemy.isDead()) {
      console.log("❌ AttackAction: enemy inválido");
      return;
    }

    console.log("⚔️ AttackAction START");

    // 🎬 animação
    this.playerVisual.playAttackOnce();

    const attackDuration = 1000 / this.playerVisual.getAttackSpeed();
    // const HIT_DELAY = attackDuration * 0.3; // 30% da animação

    const HIT_RATIO = 0.35; // tweak fino
    const HIT_DELAY = attackDuration * HIT_RATIO;

    await new Promise((resolve) => {
      this.scene.time.delayedCall(HIT_DELAY, () => {
        console.log("💥 HIT MOMENT");

        // 🔥 usar DamageAction (e não takeDamage direto)
        actionQueue.enqueue(async () => {
          console.log("🔥 Executing DamageAction");

          const damageAction = new DamageAction(this.enemy, this.damage);

          await damageAction.execute();
        });

        resolve(null);
      });
    });

    console.log("✅ AttackAction END");
  }
}
