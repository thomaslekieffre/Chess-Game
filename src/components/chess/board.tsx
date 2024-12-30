"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChessEngine } from "@/lib/chess/engine";
import {
  ChessPiece,
  Position,
  PieceType,
  PieceColor,
  PgnMove,
} from "@/lib/chess/types";

interface ChessBoardProps {
  animated?: boolean;
  className?: string;
  onMove?: (from: Position, to: Position) => void;
  autoPlay?: boolean;
  darkSquareColor?: string;
  lightSquareColor?: string;
  onCheck?: (isCheck: boolean) => void;
  engine: ChessEngine;
  board: (ChessPiece | null)[][];
  setBoard: (board: (ChessPiece | null)[][]) => void;
  playerColor: PieceColor;
  isPlaying: boolean;
  displayed: number;
  list: PgnMove[];
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
  playerColor,
  displayed,
  isPlaying,
  list,
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
  }, [autoPlay, engine, board, setBoard, playerColor]);

  const handleSquareClick = (x: number, y: number) => {
    const isOnLastMove = displayed == list.length - 1 || list.length < 1;
    const canPlay = isPlaying && isOnLastMove;

    if (!canPlay) return;

    const tabBlanc = [0, 1, 2, 3, 4, 5, 6, 7];
    const tabNoir = [0, 1, 2, 3, 4, 5, 6, 7];
    tabNoir.reverse();
    const newCord: Position = { x, y };

    if (playerColor == "black") {
      newCord.x = tabNoir[tabBlanc.indexOf(x)];
    }
    // console.log(playerColor)
    console.log(newCord);

    // return

    if (!selectedPiece) {
      if (board[newCord.y][newCord.x]?.color == playerColor) {
        const moves = engine.getValidMoves(newCord);
        console.log(moves);
        if (moves.length > 0) {
          setSelectedPiece({ x, y });
          let newMoves = [];
          if (playerColor == "black") {
            for (const move of moves) {
              newMoves.push({
                x: tabNoir[tabBlanc.indexOf(move.x)],
                y: move.y,
              });
            }
          } else {
            newMoves = moves;
          }
          setValidMoves(newMoves);
        }
      }
    } else {
      // console.log(x,y)

      // return

      // console.log(selectedPiece)
      let newSelectedPiece;
      if (playerColor == "white") {
        newSelectedPiece = selectedPiece;
      } else {
        newSelectedPiece = {
          x: tabNoir[tabBlanc.indexOf(selectedPiece.x)],
          y: selectedPiece.y,
        };
      }
      const success = engine.makeMove(newSelectedPiece, newCord);
      console.log(success);
      if (success) {
        setBoard(engine.getBoard());
        updateCheckStatus();
        onMove?.(newSelectedPiece, newCord);
      }
      setSelectedPiece(null);
      setValidMoves([]);
    }
  };

  const reverseBoard = (b: Array<Array<ChessPiece | null>>) => {
    const newBoard = [];
    // console.log(b)
    for (let i = b.length - 1; i > -1; i--) {
      const ele = b[i];
      const newRow = [];

      if (ele) {
        for (let j = ele.length - 1; j > -1; j--) {
          const ele2 = ele[j];
          newRow.push(ele2);
        }
        newBoard.push(newRow);
      } else {
        newBoard.push(ele);
      }
    }
    // console.log(newBoard)
    return newBoard;
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
          {/* Coordonnées verticales (1-8) */}
          <div className="absolute -left-8 top-0 bottom-0 flex flex-col justify-around text-sm font-medium text-muted-foreground">
            {(playerColor == "black"
              ? ["1", "2", "3", "4", "5", "6", "7", "8"]
              : ["8", "7", "6", "5", "4", "3", "2", "1"]
            ).map((coord) => (
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
            {(playerColor == "white"
              ? ["a", "b", "c", "d", "e", "f", "g", "h"]
              : ["h", "g", "f", "e", "d", "c", "b", "a"]
            ).map((coord) => (
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
            {(playerColor == "white" && board && board[0] !== undefined
              ? board
              : reverseBoard(board)
            ).map((row, y) =>
              row.map((piece, x) =>
                renderSquare(piece, x, playerColor === "black" ? 7 - y : y)
              )
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
