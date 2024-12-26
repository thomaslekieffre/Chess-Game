import { useState } from "react";
import { ChessEngine } from "@/lib/chess/engine";
import { ChessPiece, FenString, PgnMove } from "@/lib/chess/types";

export function useGameState() {
  const [engine] = useState(() => new ChessEngine("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"));
  const [currentTurn, setCurrentTurn] = useState<"white" | "black">(engine.getCurrentTurn());
  const [isCheck, setIsCheck] = useState(engine.isKingInCheck());
  const [isCheckmate, setIsCheckmate] = useState(engine.isKingInCheckmate());
  const [winner, setWinner] = useState<"white" | "black" | null>(engine.getWinner());
  const [isGameOver, setIsGameOver] = useState(engine.isGameOver());
  const [board, setBoard] = useState<(ChessPiece | null)[][]>(
    engine.getBoard()
  );
  const [movesList,setMovesList] = useState<PgnMove[]>([])
  const [isDraw, setIsDraw] = useState(false);
  const [drawReason, setDrawReason] = useState<
    | "stalemate"
    | "insufficient-material"
    | "threefold-repetition"
    | "fifty-moves"
    | "mutual-agreement"
  >();
  const [isStalemate, setIsStalemate] = useState(false);

  const updateGameState = (nextToor?:boolean) => {
    const engineState = engine.getGameState();

    setBoard(engine.getBoard())

    setMovesList(engine.getStrMove())

    setIsCheck(engineState.isCheck);
    setIsCheckmate(engineState.isCheckmate);

    if (engineState.isCheckmate) {
      setWinner(currentTurn);
      setIsGameOver(true);
    } else {
      if(nextToor){
        setCurrentTurn((prev) => (prev === "white" ? "black" : "white"));
      }
    }
  };

  const setGameByMovesArray = async (moves:PgnMove[]) => {
    engine.setGameUsingMoves(moves)
    updateGameState(false)
  }

  const setGameByFen = async (fen:FenString|string) => {
    engine.setGameUsingFen(fen)
    updateGameState(false)
  }

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
    movesList,
    setGameByMovesArray,
    setGameByFen
  };
}
