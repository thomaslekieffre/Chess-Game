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
  ColoredSquare,
} from "@/lib/chess/types";
import Arrow from "@/components/chess/arrow";

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
  onColorSquare?: (square: ColoredSquare) => void;
}

interface MovePattern {
  type: "straight" | "diagonal" | "L" | "custom";
  maxDistance?: number;
  direction?: {
    x: number;
    y: number;
  };
}

function PieceComponent({
  piece,
  isPlaying,
  playerColor,
  onDragStart,
}: {
  piece: ChessPiece;
  isPlaying: boolean;
  playerColor: PieceColor;
  onDragStart: (e: React.DragEvent, x: number, y: number) => void;
}) {
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
    <img
      src={pieceImages[piece.type][piece.color]}
      alt={`${piece.color} ${piece.type}`}
      className="w-[80%] h-[80%] object-contain select-none m-auto"
      draggable={isPlaying && piece.color === playerColor}
      onDragStart={(e) => onDragStart(e, piece.x, piece.y)}
      style={{
        filter: piece.color === "white" ? "brightness(1)" : "brightness(0.2)",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    />
  );
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
  onColorSquare,
}: ChessBoardProps) {
  // const [engine] = useState(() => new ChessEngine());
  // const [board, setBoard] = useState<(ChessPiece | null)[][]>(
  //   engine.getBoard()
  // );
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [kingInCheck, setKingInCheck] = useState<Position | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [draggedPiece, setDraggedPiece] = useState<Position | null>(null);
  const [arrows, setArrows] = useState<
    { from: Position; to: Position; color: string }[]
  >([]);
  const [rightClickStart, setRightClickStart] = useState<Position | null>(null);
  const [arrowColor, setArrowColor] = useState<string>("red");
  const [coloredSquares, setColoredSquares] = useState<ColoredSquare[]>([]);
  const [sharedColor, setSharedColor] = useState<string>(
    "rgba(255, 0, 0, 0.6)"
  );
  const [isRightMouseDown, setIsRightMouseDown] = useState(false);

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
    // Supprimer toutes les flèches et les cases colorées lors d'un clic gauche
    setArrows([]);
    setColoredSquares([]);

    // Continuer avec la logique existante du clic
    if (!isPlaying) return;

    const piece = board[y][x];
    if (selectedPiece) {
      // ... reste du code existant
    } else if (piece && piece.color === playerColor) {
      // ... reste du code existant
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

  const handleRightMouseDown = (e: React.MouseEvent, x: number, y: number) => {
    e.preventDefault();
    setIsRightMouseDown(true);

    if (e.shiftKey) {
      setSharedColor((prevColor) => {
        const colors = [
          "rgba(255, 0, 0, 0.6)",
          "rgba(0, 0, 255, 0.6)",
          "rgba(0, 255, 0, 0.6)",
          "rgba(255, 255, 0, 0.6)",
        ];
        const currentIndex = colors.findIndex((color) => color === prevColor);
        return colors[(currentIndex + 1) % colors.length];
      });
      return;
    }

    if (e.altKey) {
      setColoredSquares([]);
      return;
    }

    if (e.button === 2) {
      setRightClickStart({ x, y });
    }
  };

  const handleRightMouseUp = (e: React.MouseEvent, x: number, y: number) => {
    e.preventDefault();

    if (e.button === 2) {
      if (
        rightClickStart &&
        rightClickStart.x === x &&
        rightClickStart.y === y
      ) {
        setColoredSquares((prev) => {
          const existingIndex = prev.findIndex(
            (square) => square.x === x && square.y === y
          );
          if (existingIndex !== -1) {
            return prev.filter((_, index) => index !== existingIndex);
          }
          return [...prev, { x, y, color: sharedColor }];
        });
      } else if (rightClickStart) {
        setArrows((prev) => [
          ...prev,
          {
            from: rightClickStart,
            to: { x, y },
            color: sharedColor.replace(
              /rgba\((\d+),\s*(\d+),\s*(\d+),[^)]+\)/,
              "rgb($1, $2, $3)"
            ),
          },
        ]);
      }
      setRightClickStart(null);
    }
    setIsRightMouseDown(false);
  };

  const renderSquare = (piece: ChessPiece | null, x: number, y: number) => {
    const isSelected = selectedPiece?.x === x && selectedPiece?.y === y;
    const isValidMove = validMoves.some((move) => move.x === x && move.y === y);
    const isKingInCheck = kingInCheck?.x === x && kingInCheck?.y === y;
    const coloredSquare = coloredSquares.find(
      (square) => square.x === x && square.y === y
    );

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
        onMouseDown={(e) => handleRightMouseDown(e, x, y)}
        onMouseUp={(e) => e.button === 2 && handleRightMouseUp(e, x, y)}
        onContextMenu={(e) => e.preventDefault()}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, x, y)}
        style={{
          ...(coloredSquare && {
            backgroundColor: coloredSquare.color,
          }),
        }}
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
            <PieceComponent
              piece={{ ...piece, x, y }}
              isPlaying={isPlaying}
              playerColor={playerColor}
              onDragStart={handleDragStart}
            />
          </motion.div>
        )}
      </motion.div>
    );
  };

  const handleDragStart = (e: React.DragEvent, x: number, y: number) => {
    const isOnLastMove = displayed == list.length - 1 || list.length < 1;
    const canPlay = isPlaying && isOnLastMove;

    if (canPlay) {
      const tabBlanc = [0, 1, 2, 3, 4, 5, 6, 7];
      const tabNoir = [0, 1, 2, 3, 4, 5, 6, 7];
      tabNoir.reverse();

      const newCoord = { x, y };
      if (playerColor === "black") {
        newCoord.x = tabNoir[tabBlanc.indexOf(x)];
      }

      if (board[newCoord.y][newCoord.x]?.color === playerColor) {
        e.dataTransfer.effectAllowed = "move";
        const moves = engine.getValidMoves(newCoord);
        if (moves.length > 0) {
          setDraggedPiece({ x, y });
          let newMoves = [];
          if (playerColor === "black") {
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
    }
  };

  const handleDrop = (e: React.DragEvent, dropX: number, dropY: number) => {
    e.preventDefault();
    if (draggedPiece && isPlaying) {
      const tabBlanc = [0, 1, 2, 3, 4, 5, 6, 7];
      const tabNoir = [0, 1, 2, 3, 4, 5, 6, 7];
      tabNoir.reverse();

      let newDraggedPiece = draggedPiece;
      let newDropCoord = { x: dropX, y: dropY };

      if (playerColor === "black") {
        newDraggedPiece = {
          x: tabNoir[tabBlanc.indexOf(draggedPiece.x)],
          y: draggedPiece.y,
        };
        newDropCoord = {
          x: tabNoir[tabBlanc.indexOf(dropX)],
          y: dropY,
        };
      }

      // Vérifier si le mouvement est valide
      const validMoves = engine.getValidMoves(newDraggedPiece);
      const isValidMove = validMoves.some(
        (move) => move.x === newDropCoord.x && move.y === newDropCoord.y
      );

      if (isValidMove) {
        const success = engine.makeMove(newDraggedPiece, newDropCoord);
        if (success) {
          setBoard(engine.getBoard());
          updateCheckStatus();
          onMove?.(newDraggedPiece, newDropCoord);
          setArrows([]);
        }
      }
      setDraggedPiece(null);
      setValidMoves([]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  return (
    <div
      className={cn("w-full max-w-4xl mx-auto", className)}
      onMouseDown={(e) => {
        if (e.button === 2) {
          e.preventDefault();
        }
      }}
    >
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
          <div className="grid grid-cols-8 grid-rows-8 h-full w-full rounded-lg overflow-hidden border-2 border-border relative">
            {(playerColor === "white" ? board : reverseBoard(board)).map(
              (row, y) =>
                row.map((piece, x) =>
                  renderSquare(piece, x, playerColor === "black" ? 7 - y : y)
                )
            )}

            {/* Rendu des flèches */}
            {arrows.map((arrow, index) => (
              <Arrow
                key={`arrow-${arrow.from.x}-${arrow.from.y}-${arrow.to.x}-${arrow.to.y}`}
                from={arrow.from}
                to={arrow.to}
                color={arrow.color}
              />
            ))}
          </div>

          <div className="absolute top-2 right-2 flex gap-2">
            <div
              className="w-4 h-4 rounded-full border border-white"
              style={{ backgroundColor: sharedColor }}
              title="Shift + clic droit pour changer la couleur"
            />
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

const generateArrow = (
  from: Position,
  pattern: MovePattern,
  color: string = "blue"
) => {
  const arrows: { from: Position; to: Position; color: string }[] = [];

  switch (pattern.type) {
    case "straight":
      // Mouvements horizontaux et verticaux
      const directions = [
        { x: 0, y: 1 }, // haut
        { x: 0, y: -1 }, // bas
        { x: 1, y: 0 }, // droite
        { x: -1, y: 0 }, // gauche
      ];

      directions.forEach((dir) => {
        const maxDist = pattern.maxDistance || 7;
        for (let i = 1; i <= maxDist; i++) {
          const to = {
            x: from.x + dir.x * i,
            y: from.y + dir.y * i,
          };
          if (isValidPosition(to)) {
            arrows.push({ from, to, color });
          }
        }
      });
      break;

    case "diagonal":
      // Mouvements diagonaux
      const diagonalDirs = [
        { x: 1, y: 1 }, // haut-droite
        { x: 1, y: -1 }, // bas-droite
        { x: -1, y: 1 }, // haut-gauche
        { x: -1, y: -1 }, // bas-gauche
      ];

      diagonalDirs.forEach((dir) => {
        const maxDist = pattern.maxDistance || 7;
        for (let i = 1; i <= maxDist; i++) {
          const to = {
            x: from.x + dir.x * i,
            y: from.y + dir.y * i,
          };
          if (isValidPosition(to)) {
            arrows.push({ from, to, color });
          }
        }
      });
      break;

    case "L":
      // Mouvements du cavalier
      const knightMoves = [
        { x: 2, y: 1 },
        { x: 2, y: -1 },
        { x: -2, y: 1 },
        { x: -2, y: -1 },
        { x: 1, y: 2 },
        { x: 1, y: -2 },
        { x: -1, y: 2 },
        { x: -1, y: -2 },
      ];

      knightMoves.forEach((move) => {
        const to = {
          x: from.x + move.x,
          y: from.y + move.y,
        };
        if (isValidPosition(to)) {
          arrows.push({ from, to, color });
        }
      });
      break;

    case "custom":
      if (pattern.direction) {
        const to = {
          x: from.x + pattern.direction.x,
          y: from.y + pattern.direction.y,
        };
        if (isValidPosition(to)) {
          arrows.push({ from, to, color });
        }
      }
      break;
  }

  return arrows;
};

const isValidPosition = (pos: Position): boolean => {
  return pos.x >= 0 && pos.x < 8 && pos.y >= 0 && pos.y < 8;
};
