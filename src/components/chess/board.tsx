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
}: ChessBoardProps) {
  const [engine] = useState(() => new ChessEngine());
  const [board, setBoard] = useState<(ChessPiece | null)[][]>(
    engine.getBoard()
  );
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);

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
        onMove?.(selectedPiece, { x, y });
      }
      setSelectedPiece(null);
      setValidMoves([]);
    }
  };

  const renderSquare = (piece: ChessPiece | null, x: number, y: number) => {
    const isSelected = selectedPiece?.x === x && selectedPiece?.y === y;
    const isValidMove = validMoves.some((move) => move.x === x && move.y === y);

    return (
      <motion.div
        key={`${x}-${y}`}
        className={cn(
          "flex items-center justify-center text-4xl transition-colors relative",
          (x + y) % 2 === 0 ? darkSquareColor : lightSquareColor,
          isSelected && "ring-2 ring-primary",
          isValidMove && "after:absolute after:inset-0 after:bg-primary/20"
        )}
        onClick={() => !autoPlay && handleSquareClick(x, y)}
        whileHover={{ scale: autoPlay ? 1 : 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {piece && (
          <motion.div
            initial={animated ? { scale: 0 } : false}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <PieceComponent piece={piece} />
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div className={cn("w-full max-w-3xl mx-auto", className)}>
      <div className="aspect-square w-full bg-background/50 dark:bg-card/50 backdrop-blur-sm p-6 rounded-xl">
        <div className="grid grid-cols-8 grid-rows-8 h-full w-full rounded-lg overflow-hidden border border-border">
          {board.map((row, y) =>
            row.map((piece, x) => renderSquare(piece, x, y))
          )}
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
