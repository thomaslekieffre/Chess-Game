"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface CustomBoardProps {
  className?: string;
  selectedPiece: string;
  onSquaresChange?: (squares: boolean[][]) => void;
  readOnly?: boolean;
  initialSquares?: boolean[][];
}

export function CustomBoard({
  className,
  selectedPiece,
  onSquaresChange,
  readOnly = false,
  initialSquares,
}: CustomBoardProps) {
  const [selectedSquares, setSelectedSquares] = useState<boolean[][]>(
    initialSquares || Array(8).fill(Array(8).fill(false))
  );

  const toggleSquare = (x: number, y: number) => {
    if (readOnly) return;

    const newSquares = selectedSquares.map((row, i) =>
      row.map((square, j) => (i === y && j === x ? !square : square))
    );
    setSelectedSquares(newSquares);
    onSquaresChange?.(newSquares);
  };

  const getPieceSymbol = () => {
    switch (selectedPiece) {
      case "knight":
        return "♞";
      case "bishop":
        return "♝";
      case "queen":
        return "♛";
      default:
        return "";
    }
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <div className="aspect-square w-full bg-background/50 p-8 rounded-xl">
        <div className="grid grid-cols-8 h-full w-full rounded-lg overflow-hidden border-2 border-border">
          {selectedSquares.map((row, y) =>
            row.map((isSelected, x) => {
              const isCenter = x === 3 && y === 3;
              const squareColor =
                (x + y) % 2 === 0 ? "bg-white/80" : "bg-muted";

              return (
                <div
                  key={`${x}-${y}`}
                  className={cn(
                    "relative aspect-square cursor-pointer transition-colors",
                    squareColor,
                    isSelected && "bg-blue-200 dark:bg-blue-900",
                    "hover:bg-blue-100 dark:hover:bg-blue-800/50"
                  )}
                  onClick={() => !isCenter && toggleSquare(x, y)}
                >
                  {isCenter && (
                    <div className="absolute inset-0 flex items-center justify-center text-4xl">
                      {getPieceSymbol()}
                    </div>
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