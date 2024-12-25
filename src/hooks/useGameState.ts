import { useState } from "react";
import { ChessEngine } from "@/lib/chess/engine";
import { ChessPiece } from "@/lib/chess/types";

export function useGameState() {
  const [engine] = useState(() => new ChessEngine());
  const [currentTurn, setCurrentTurn] = useState<"white" | "black">(engine.getCurrentTurn());
  const [isCheck, setIsCheck] = useState(engine.isKingInCheck());
  const [isCheckmate, setIsCheckmate] = useState(engine.isKingInCheckmate());
  const [winner, setWinner] = useState<"white" | "black" | null>(engine.getWinner());
  const [isGameOver, setIsGameOver] = useState(engine.isGameOver());
  const [board, setBoard] = useState<(ChessPiece | null)[][]>(
    engine.getBoard()
  );
  const [isDraw, setIsDraw] = useState(false);
  const [drawReason, setDrawReason] = useState<
    | "stalemate"
    | "insufficient-material"
    | "threefold-repetition"
    | "fifty-moves"
    | "mutual-agreement"
  >();
  const [isStalemate, setIsStalemate] = useState(false);

  const updateGameState = () => {
    const engineState = engine.getGameState();

    setBoard(engine.getBoard())

    setIsCheck(engineState.isCheck);
    setIsCheckmate(engineState.isCheckmate);

    if (engineState.isCheckmate) {
      setWinner(currentTurn);
      setIsGameOver(true);
    } else {
      setCurrentTurn((prev) => (prev === "white" ? "black" : "white"));
    }
  };

  return {
    currentTurn,
    isCheck,
    isCheckmate,
    winner,
    isGameOver,
    engine,
    updateGameState,
    setWinner,
    setIsGameOver,
    setIsCheck,
    setIsCheckmate,
    setCurrentTurn,
    isDraw,
    drawReason,
    setIsDraw,
    setDrawReason,
    isStalemate,
    setIsStalemate,
    board,
    setBoard,
  };
}
