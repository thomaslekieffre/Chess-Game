"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChessEngine } from "@/lib/chess/engine";
import { ChessPiece, Position, PieceType } from "@/lib/chess/types";

interface ChessBoardProps {
  animated?: boolean;
  className?: string;
  onMove?: (from: Position, to: Position) => void;
  autoPlay?: boolean;
  darkSquareColor?: string;
  lightSquareColor?: string;
  onCheck?: (isCheck: boolean) => void;
  engine:ChessEngine;
  board:(ChessPiece | null)[][]
  setBoard:Function;
}

const PIECE_SYMBOLS: Record<PieceType, { white: string; black: string }> = {
  king: { white: "♔", black: "♚" },
  queen: { white: "♕", black: "♛" },
  rook: { white: "♖", black: "♜" },
  bishop: { white: "♗", black: "♝" },
  knight: { white: "♘", black: "♞" },
  pawn: { white: "♙", black: "♟" },
};

function PieceComponent({ piece }: { piece: ChessPiece }) {
  return <span>{PIECE_SYMBOLS[piece.type][piece.color]}</span>;
}

export function ChessBoard({
  animated = false,
  className,
  onMove,
  autoPlay = false,
  darkSquareColor = "bg-muted dark:bg-muted hover:bg-black/10 dark:hover:bg-muted/80",
  lightSquareColor = "bg-white/80 dark:bg-muted/50 hover:bg-black/10 dark:hover:bg-muted/60",
  onCheck,
  engine,
  board,
  setBoard,
}: ChessBoardProps) {
  // const [engine] = useState(() => new ChessEngine());
  // const [board, setBoard] = useState<(ChessPiece | null)[][]>(
  //   engine.getBoard()
  // );
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [kingInCheck, setKingInCheck] = useState<Position | null>(null);

  const findKing = (color: "white" | "black"): Position | null => {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = board[y][x];
        if (piece?.type === "king" && piece.color === color) {
          return { x, y };
        }
      }
    }
    return null;
  };

  const updateCheckStatus = () => {
    const currentKingPos = findKing(engine.getCurrentTurn());
    if (currentKingPos && engine.isKingInCheck()) {
      setKingInCheck(currentKingPos);
      onCheck?.(true);
    } else {
      setKingInCheck(null);
      onCheck?.(false);
    }
  };

  useEffect(() => {
    if (autoPlay) {
      const interval = setInterval(() => {
        const moves = getAllPossibleMoves(engine);
        if (moves.length > 0) {
          const randomMove = moves[Math.floor(Math.random() * moves.length)];
          const success = engine.makeMove(randomMove.from, randomMove.to);
          if (success) {
            setBoard(engine.getBoard());
          }
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [autoPlay, engine]);

  const handleSquareClick = (x: number, y: number) => {
    if (!selectedPiece) {
      const moves = engine.getValidMoves({ x, y });
      if (moves.length > 0) {
        setSelectedPiece({ x, y });
        setValidMoves(moves);
      }
    } else {
      const success = engine.makeMove(selectedPiece, { x, y });
      if (success) {
        setBoard(engine.getBoard());
        updateCheckStatus();
        onMove?.(selectedPiece, { x, y });
      }
      setSelectedPiece(null);
      setValidMoves([]);
    }
  };

  const renderSquare = (piece: ChessPiece | null, x: number, y: number) => {
    const isSelected = selectedPiece?.x === x && selectedPiece?.y === y;
    const isValidMove = validMoves.some((move) => move.x === x && move.y === y);
    const isKingInCheck = kingInCheck?.x === x && kingInCheck?.y === y;

    return (
      <motion.div
        key={`${x}-${y}`}
        className={cn(
          "flex items-center justify-center text-4xl transition-colors relative",
          (x + y) % 2 === 0 ? darkSquareColor : lightSquareColor,
          isSelected && "ring-2 ring-primary",
          isValidMove && "after:absolute after:inset-0 after:bg-primary/20",
          isKingInCheck && "ring-4 ring-red-500 animate-pulse bg-red-500/20"
        )}
        onClick={() => !autoPlay && handleSquareClick(x, y)}
      >
        {piece && (
          <motion.div
            initial={animated ? { scale: 0 } : false}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={cn(
              isKingInCheck &&
                piece.type === "king" &&
                "text-red-500 animate-bounce"
            )}
          >
            <PieceComponent piece={piece} />
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      <div className="aspect-square w-full bg-background/50 dark:bg-card/50 backdrop-blur-sm p-8 rounded-xl">
        <div className="relative h-full">
          {/* Coordonnées verticales (8-1) */}
          <div className="absolute -left-8 top-0 bottom-0 flex flex-col justify-around text-sm font-medium text-muted-foreground">
            {["8", "7", "6", "5", "4", "3", "2", "1"].map((coord) => (
              <div
                key={coord}
                className="flex items-center justify-center w-6 h-6"
              >
                {coord}
              </div>
            ))}
          </div>

          {/* Coordonnées horizontales (a-h) */}
          <div className="absolute -bottom-8 left-0 right-0 flex justify-around text-sm font-medium text-muted-foreground">
            {["a", "b", "c", "d", "e", "f", "g", "h"].map((coord) => (
              <div
                key={coord}
                className="flex items-center justify-center w-6 h-6"
              >
                {coord}
              </div>
            ))}
          </div>

          {/* Échiquier */}
          <div className="grid grid-cols-8 grid-rows-8 h-full w-full rounded-lg overflow-hidden border-2 border-border">
            {board.map((row, y) =>
              row.map((piece, x) => renderSquare(piece, x, y))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getAllPossibleMoves(engine: ChessEngine) {
  const moves: { from: Position; to: Position }[] = [];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const validMoves = engine.getValidMoves({ x, y });
      validMoves.forEach((to) => {
        moves.push({ from: { x, y }, to });
      });
    }
  }
  return moves;
}
