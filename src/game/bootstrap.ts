import Phaser from "phaser";
import { GameScene } from "./scenes/GameScene";
import type { Loadout } from "../shared/types";

export function startGame(loadout: Loadout) {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: "game-root",
    backgroundColor: "#1d1d1d",
    scene: [GameScene],
  });

  // inicia a scene passando dados corretamente
  game.scene.start("GameScene", { loadout });

  return game;
}
