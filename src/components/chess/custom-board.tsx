"use client";

import { PieceType, Position, customBoardType } from "@/lib/chess/types";
import { cn } from "@/lib/utils";
// import { useEffect, useState } from "react";

interface CustomBoardProps {
  className?: string;
  // selectedPiece: string;
  // onSquaresChange?: (squares: boolean[][]) => void;
  // readOnly?: boolean;
  // initialSquares?: boolean[][];
  board: customBoardType;
  onSquareClick: (pos: Position) => void;
  size: number;
}

export function CustomBoard({
  className,
  onSquareClick,
  board,
  size,
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

  const pieceImages: Record<PieceType, { white: string; black: string }> = {
    king: {
      white: "/chess-pieces/w-king.png",
      black: "/chess-pieces/b-king.png",
    },
    queen: {
      white: "/chess-pieces/w-queen.png",
      black: "/chess-pieces/b-queen.png",
    },
    rook: {
      white: "/chess-pieces/w-rook.png",
      black: "/chess-pieces/b-rook.png",
    },
    bishop: {
      white: "/chess-pieces/w-bishop.png",
      black: "/chess-pieces/b-bishop.png",
    },
    knight: {
      white: "/chess-pieces/w-knight.png",
      black: "/chess-pieces/b-knight.png",
    },
    pawn: {
      white: "/chess-pieces/w-pawn.png",
      black: "/chess-pieces/b-pawn.png",
    },
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <div className="aspect-square w-full bg-background/50 p-8 rounded-xl">
        <div
          className={`h-full w-full rounded-lg overflow-hidden border-2 border-border`}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${size},1fr)`,
            gridTemplateRows: `repeat(${size},1fr)`,
          }}
        >
          {board.map((row, y) =>
            row.map((item, x) => {
              const squareColor = (x + y) % 2 === 0 ? "bg-gray/80" : "bg-muted";

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
                    onSquareClick({ x, y });
                  }}
                >
                  {item?.piece ? (
                    <img
                      src={pieceImages[item.piece.name][item.piece.color]}
                      alt={`${item.piece.color} ${item.piece.name}`}
                      className="w-full h-full object-contain p-1"
                      draggable={false}
                    />
                  ) : (
                    ""
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
