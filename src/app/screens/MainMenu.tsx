import { useState } from "react";
import type { Loadout } from "../../shared/types";
import { GameRoot } from "../components/GameRoot";

const defaultLoadout: Loadout = {
  towers: ["cannon", "slow"],
  relics: ["double_gold"],
  difficulty: 1,
};

export function MainMenu() {
  const [inGame, setInGame] = useState(false);

  if (inGame) {
    return (
      <GameRoot loadout={defaultLoadout} onExit={() => setInGame(false)} />
    );
  }

  return (
    <div>
      <h1>Tower Defense Roguelite</h1>
      <button onClick={() => setInGame(true)}>Start Game</button>
    </div>
  );
}
