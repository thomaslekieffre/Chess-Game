"use client";

import { PieceType, Position, customBoardType } from "@/lib/chess/types";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface CustomBoardProps {
  className?: string;
  // selectedPiece: string;
  // onSquaresChange?: (squares: boolean[][]) => void;
  // readOnly?: boolean;
  // initialSquares?: boolean[][];
  board:customBoardType,
  onSquareClick: (pos:Position) => void;
  size:number;
}

export function CustomBoard({
  className,
  onSquareClick,
  board,
  size
}: CustomBoardProps) {

  // const toggleSquare = (x: number, y: number) => {
  //   if (readOnly) return;

  //   const newSquares = selectedSquares.map((row, i) =>
  //     row.map((square, j) => (i === y && j === x ? !square : square))
  //   );
  //   setSelectedSquares(newSquares);
  //   onSquaresChange?.(newSquares);
  // };

  // const getPieceSymbol = (piece:PieceType) => {
  //   switch (piece) {
  //     case "knight":
  //       return "♞";
  //     case "bishop":
  //       return "♝";
  //     case "queen":
  //       return "♛";
  //     default:
  //       return "";
  //   }
  // };

  const PIECE_SYMBOLS: Record<PieceType, { white: string; black: string }> = {
    king: { white: "♔", black: "♚" },
    queen: { white: "♕", black: "♛" },
    rook: { white: "♖", black: "♜" },
    bishop: { white: "♗", black: "♝" },
    knight: { white: "♘", black: "♞" },
    pawn: { white: "♙", black: "♟" },
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <div className="aspect-square w-full bg-background/50 p-8 rounded-xl">
        <div className={`h-full w-full rounded-lg overflow-hidden border-2 border-border`}
        style={{display:'grid',gridTemplateColumns:`repeat(${size},1fr)`,gridTemplateRows:`repeat(${size},1fr)`}}
        >
          {board.map((row, y) =>
            row.map((item, x) => {
              const squareColor =
                (x + y) % 2 === 0 ? "bg-gray/80" : "bg-muted";

              return (
                <div
                  key={`${x}-${y}`}
                  className={cn(
                    "relative aspect-square cursor-pointer transition-colors",
                    squareColor,
                    // "bg-blue-200 dark:bg-blue-900",
                    ...item.style,
                    "hover:bg-blue-100 dark:hover:bg-blue-800/50"
                  )}
                  style={{}}
                  onClick={() => {
                    onSquareClick({x,y})
                  }}
                >
                  {item?.piece?(
                    <div className="absolute inset-0 flex items-center justify-center text-4xl">
                      {PIECE_SYMBOLS[item.piece.name][item.piece.color]}
                    </div>
                  ):''}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
