"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DemoBoardProps {
  animated?: boolean;
  className?: string;
}

type Piece = {
  symbol: string;
  color: "red" | "blue";
};

const openingMoves = [
  { from: [6, 4], to: [4, 4] }, // 1. e4
  { from: [1, 4], to: [3, 4] }, // 1... e5
  { from: [7, 5], to: [4, 2] }, // 2. Bc4
  { from: [0, 6], to: [2, 5] }, // 2... Nc6
  { from: [7, 3], to: [3, 7] }, // 3. Qh5
  { from: [0, 1], to: [2, 2] }, // 3... Nf6
  { from: [3, 7], to: [1, 5] }, // 4. Qxf7#
];

export function DemoBoard({ animated = true, className }: DemoBoardProps) {
  const [pieces, setPieces] = useState<(Piece | null)[][]>([]);

  useEffect(() => {
    const createPiece = (symbol: string, color: "red" | "blue"): Piece => ({
      symbol,
      color,
    });

    const initialBoard = [
      [
        createPiece("♜", "red"),
        createPiece("♞", "red"),
        createPiece("♝", "red"),
        createPiece("♛", "red"),
        createPiece("♚", "red"),
        createPiece("♝", "red"),
        createPiece("♞", "red"),
        createPiece("♜", "red"),
      ],
      Array(8)
        .fill(null)
        .map(() => createPiece("♙", "red")),
      Array(8).fill(null),
      Array(8).fill(null),
      Array(8).fill(null),
      Array(8).fill(null),
      Array(8)
        .fill(null)
        .map(() => createPiece("♙", "blue")),
      [
        createPiece("♖", "blue"),
        createPiece("♘", "blue"),
        createPiece("♗", "blue"),
        createPiece("♕", "blue"),
        createPiece("♔", "blue"),
        createPiece("♗", "blue"),
        createPiece("♘", "blue"),
        createPiece("♖", "blue"),
      ],
    ];
    setPieces(initialBoard);

    if (animated) {
      const timeout = setTimeout(() => {
        let moveIndex = 0;
        const interval = setInterval(() => {
          if (moveIndex >= openingMoves.length) {
            clearInterval(interval);
            setTimeout(() => {
              setPieces(initialBoard);
              moveIndex = 0;
              const newInterval = setInterval(() => {
                if (moveIndex >= openingMoves.length) {
                  clearInterval(newInterval);
                  return;
                }
                makeMove(openingMoves[moveIndex]);
                moveIndex++;
              }, 1500);
            }, 3000);
            return;
          }
          makeMove(openingMoves[moveIndex]);
          moveIndex++;
        }, 1500);

        return () => {
          clearInterval(interval);
          clearTimeout(timeout);
        };
      }, 500);
    }
  }, [animated]);

  const makeMove = (move: { from: number[]; to: number[] }) => {
    setPieces((current) => {
      const newBoard = current.map((row) => [...row]);
      const [fromY, fromX] = move.from;
      const [toY, toX] = move.to;

      if (newBoard[fromY][fromX]) {
        newBoard[toY][toX] = newBoard[fromY][fromX];
        newBoard[fromY][fromX] = null;
      }

      return newBoard;
    });
  };

  return (
    <div className={cn("w-full max-w-3xl mx-auto", className)}>
      <div className="aspect-square w-full bg-background/50 dark:bg-card/50 backdrop-blur-sm p-6 rounded-xl">
        <div className="grid grid-cols-8 grid-rows-8 h-full w-full rounded-lg overflow-hidden border border-border">
          {pieces.map((row, y) =>
            row.map((piece, x) => (
              <div
                key={`${x}-${y}`}
                className={cn(
                  "flex items-center justify-center text-4xl transition-colors",
                  (x + y) % 2 === 0
                    ? "bg-muted dark:bg-muted hover:bg-black/10 dark:hover:bg-muted/80"
                    : "bg-white/80 dark:bg-muted/50 hover:bg-black/10 dark:hover:bg-muted/60"
                )}
              >
                {piece && (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className={cn(
                      "transition-colors",
                      piece.color === "red"
                        ? "text-red-600 dark:text-red-500"
                        : "text-blue-600 dark:text-blue-500"
                    )}
                  >
                    {piece.symbol}
                  </motion.span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
