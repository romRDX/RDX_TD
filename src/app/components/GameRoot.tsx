import { useEffect, useRef } from "react";
import type { Loadout } from "../../shared/types";
import { startGame } from "../../game/bootstrap";
import { gameEvents } from "../../shared/events";

type Props = {
  loadout: Loadout;
  onExit: () => void;
};

export function GameRoot({ loadout, onExit }: Props) {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    // inicia o jogo ao montar o componente
    gameRef.current = startGame(loadout);

    const handleEndRun = () => {
      onExit();
    };

    // escuta evento de fim da run vindo do Phaser
    gameEvents.on("END_RUN", handleEndRun);

    return () => {
      // cleanup completo ao desmontar
      gameEvents.off("END_RUN", handleEndRun);
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [loadout, onExit]);

  return <div id="game-root" />;
}
