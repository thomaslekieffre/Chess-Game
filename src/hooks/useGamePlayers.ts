import { useState } from "react";
import { HandlePlayers } from "@/lib/chess/game-players";
import { PlayerBanner } from "@/types/chess";

interface Player {
  username: string | null;
  elo: string | null;
  banner: PlayerBanner | null;
  title: string | null;
  time: number | null;
}

export function usePlayers(defaultWhitePlayer?: Player, defaultBlackPlayer?: Player) {
  // Initialisation des joueurs via HandlePlayers
  const playersHandler = new HandlePlayers(
    defaultWhitePlayer ?? { username: null, elo: null, banner: null, title: null, time: null },
    defaultBlackPlayer ?? { username: null, elo: null, banner: null, title: null, time: null }
  );

  // Utilisation d'un seul état pour les joueurs
  const [players, setPlayers] = useState({
    white: playersHandler.getPlayer("white"),
    black: playersHandler.getPlayer("black"),
  });

  // Mise à jour des états des joueurs
  const updateUserState = () => {
    setPlayers({
      white: playersHandler.getPlayer("white"),
      black: playersHandler.getPlayer("black"),
    });
  };

  return {
    updateUserState,
    playersHandler,
    players,
  };
}