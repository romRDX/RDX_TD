import Phaser from "phaser";
import { GameScene } from "./scenes/GameScene";
import type { Loadout } from "../shared/types";

export function startGame(loadout: Loadout) {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: 1000,
    height: 650,
    parent: "game-root",
    backgroundColor: "#1d1d1d",
    scene: [GameScene],
  });

  // inicia a scene passando dados corretamente
  game.scene.start("GameScene", { loadout });

  return game;
}
