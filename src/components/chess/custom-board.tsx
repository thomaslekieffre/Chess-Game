"use client";

import {
  PieceColor,
  PieceType,
  Position,
  customBoardType,
} from "@/types/chess";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { MouseEvent, useState } from "react";
import Image from "next/image";

interface CustomBoardProps {
  className?: string;
  board:customBoardType,
  onSquareClick: (pos:Position) => void;
  size:number;//   className?: string;
  selectedPiece: PieceColor;
  onSquaresChange?: (squares: boolean[][]) => void;
  readOnly?: boolean;
  highlightSquares: string[];
  animatedPiece?: {
    from: Position;
    to: Position;
  } | null;
}

interface DraggedPiece {
  piece: {
    name: PieceType;
    color: PieceColor;
  };
  position: Position;
}

export function CustomBoard({
  className,
  board,
  onSquareClick,
  size,
  onSquaresChange,
  readOnly=false,
  highlightSquares,
  animatedPiece=null,
}: CustomBoardProps) {
  const [draggedPiece, setDraggedPiece] = useState<DraggedPiece | null>(null);
  
  const handleDragStart = (
    e: React.DragEvent,
    piece: { name: PieceType; color: PieceColor },
    x: number,
    y: number
  ) => {
    if (!readOnly) {
      const coord = `${String.fromCharCode(97 + x)}${8 - y}`;
      if (
        highlightSquaresArray.includes(coord) ||
        coord === highlightSquaresArray[0]
      ) {
        setDraggedPiece({ piece, position: { x, y } });
        onSquareClick({ x, y });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleAuxClick = (e: MouseEvent) => {
    e.preventDefault() //WARNING NOT WORKING
  };

  const handleDrop = (e: React.DragEvent, dropX: number, dropY: number) => {
    e.preventDefault();
    if (!readOnly && draggedPiece) {
      const coord = `${String.fromCharCode(97 + dropX)}${8 - dropY}`;
      if (highlightSquaresArray.includes(coord)) {
        onSquareClick({ x: dropX, y: dropY });
      }
      setDraggedPiece(null);
    }
  };

  const handleAnimationComplete = () => {
    if (animatedPiece) {
      const { from, to } = animatedPiece;
      board[to.y][to.x] = {
        piece: board[from.y][from.x]?.piece,
        style: [],
      };
      board[from.y][from.x] = {
        piece: undefined,
        style: [],
      };
    }
  };

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

  const highlightSquaresArray = Array.isArray(highlightSquares)
    ? highlightSquares
    : [];

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <div className="aspect-square w-full bg-background/50 p-8 rounded-xl">
        <div className="relative h-full">
          {/* Coordonnées verticales (1-8) */}
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

          <div
            className={`h-full w-full rounded-lg overflow-hidden border-2 border-border relative`}
          >
            {/* Grille de l'échiquier */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${size},1fr)`,
                gridTemplateRows: `repeat(${size},1fr)`,
              }}
              className="h-full w-full"
            >
              {board.map((row, y) =>
                row.map((item, x) => {
                  const squareColor = highlightSquaresArray.includes(
                    `${String.fromCharCode(97 + x)}${8 - y}`
                  )
                    ? "bg-blue-600"
                    : (x + y) % 2 === 0
                    ? "bg-gray/80"
                    : "bg-muted";

                  return (
                    
                    <div
                      key={`${x}-${y}`}
                      // className={cn(
                      //   "relative aspect-square cursor-pointer transition-colors border border-black",
                      //   squareColor,
                      //   "hover:bg-blue-100 dark:hover:bg-blue-800/50"
                      // )}
                      className={cn(
                        "relative aspect-square cursor-pointer transition-colors",
                        squareColor,
                        // "bg-blue-200 dark:bg-blue-900",
                        ...item.style,
                        "hover:bg-blue-100 dark:hover:bg-blue-800/50"
                      )}
                      onClick={() => {
                        onSquareClick({ x, y });
                        // if (!readOnly) {
                        // }
                        // WARNING ICI
                      }}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, x, y)}
                      onAuxClick={(e)=>{handleAuxClick(e)}}
                    >
                      {item?.piece && (
                        <Image
                          src={pieceImages[item.piece.name][item.piece.color]}
                          alt={`${item.piece.color} ${item.piece.name}`}
                          className="w-full h-full object-contain p-1"
                          draggable={!readOnly}
                          onDragStart={(e) =>
                            item.piece && handleDragStart(e, item.piece, x, y)
                          }
                          width={50}
                          height={50}
                        />
                      )}
                      
                    </div>
                  );
                })
              )}
            </div>

            {/* Pièce animée */}
            {animatedPiece &&
              board[animatedPiece.from.y][animatedPiece.from.x]?.piece && (
                <motion.img
                  initial={{
                    top: `${(animatedPiece.from.y * 100) / size}%`,
                    left: `${(animatedPiece.from.x * 100) / size}%`,
                  }}
                  animate={{
                    top: `${(animatedPiece.to.y * 100) / size}%`,
                    left: `${(animatedPiece.to.x * 100) / size}%`,
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  onAnimationComplete={handleAnimationComplete}
                  className="absolute w-[12.5%] h-[12.5%] object-contain p-1"
                  src={
                    board[animatedPiece.from.y][animatedPiece.from.x]?.piece
                      ?.name &&
                    pieceImages[
                      board[animatedPiece.from.y][animatedPiece.from.x]?.piece
                        ?.name as PieceType
                    ][
                      board[animatedPiece.from.y][animatedPiece.from.x]?.piece
                        ?.color as "white" | "black"
                    ]
                  }
                  style={{ pointerEvents: "none" }}
                />
              )}
          </div>
        </div>
      </div>
    </div>
  );

  // return (
  //   <div className={cn("w-full max-w-2xl mx-auto", className)}>
  //     <div className="aspect-square w-full bg-background/50 p-8 rounded-xl">
  //       <div className={`h-full w-full rounded-lg overflow-hidden border-2 border-border`}
  //       style={{display:'grid',gridTemplateColumns:`repeat(${size},1fr)`,gridTemplateRows:`repeat(${size},1fr)`}}
  //       >
  //         {board.map((row, y) => row.map((item, x) => {

  //             const squareColor =(x + y) % 2 === 0 ? "bg-gray/80" : "bg-muted";

  //             return (
  //               <div
  //                 key={`${x}-${y}`}
  //                 className={cn(
  //                   "relative aspect-square cursor-pointer transition-colors",
  //                   squareColor,
  //                   // "bg-blue-200 dark:bg-blue-900",
  //                   ...item.style,
  //                   "hover:bg-blue-100 dark:hover:bg-blue-800/50"
  //                 )}
  //                 style={{}}
  //                 onClick={() => {
  //                   onSquareClick({x,y})
  //                 }}
  //               >
  //                 {item?.piece?(
  //                   <div className="absolute inset-0 flex items-center justify-center text-4xl">
  //                     {PIECE_SYMBOLS[item.piece.name][item.piece.color]}
  //                   </div>
  //                 ):''}
  //               </div>
  //             );

  //           })
  //         )}
  //       </div>
  //     </div>
  //   </div>
  // )
}

            
// "use client";

// import {
//   PieceColor,
//   PieceType,
//   Position,
//   customBoardType,
// } from "@/lib/chess/types";
// import { cn } from "@/lib/utils";
// import { motion } from "framer-motion";
// import { useState } from "react";
// import Image from "next/image";

// interface CustomBoardProps {
//   className?: string;
//   // selectedPiece: string;
//   // onSquaresChange?: (squares: boolean[][]) => void;
//   // readOnly?: boolean;
//   // initialSquares?: boolean[][];
//   board: customBoardType;
//   onSquareClick: (pos: Position) => void;
//   size: number;
//   highlightSquares: string[];
//   readOnly: boolean;
//   animatedPiece?: {
//     from: Position;
//     to: Position;
//   } | null;
// }

// interface DraggedPiece {
//   piece: {
//     name: PieceType;
//     color: PieceColor;
//   };
//   position: Position;
// }

// export function CustomBoard({
//   className,
//   onSquareClick,
//   board,
//   size,
//   highlightSquares,
//   readOnly,
//   animatedPiece,
// }: CustomBoardProps) {
//   const updatedBoard = board.map((row) => row.map((piece) => ({ ...piece })));
//   const [draggedPiece, setDraggedPiece] = useState<DraggedPiece | null>(null);

//   const handleDragStart = (
//     e: React.DragEvent,
//     piece: { name: PieceType; color: PieceColor },
//     x: number,
//     y: number
//   ) => {
//     if (!readOnly) {
//       const coord = `${String.fromCharCode(97 + x)}${8 - y}`;
//       if (
//         highlightSquaresArray.includes(coord) ||
//         coord === highlightSquaresArray[0]
//       ) {
//         setDraggedPiece({ piece, position: { x, y } });
//         onSquareClick({ x, y });
//       }
//     }
//   };

//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault();
//   };

//   const handleDrop = (e: React.DragEvent, dropX: number, dropY: number) => {
//     e.preventDefault();
//     if (!readOnly && draggedPiece) {
//       const coord = `${String.fromCharCode(97 + dropX)}${8 - dropY}`;
//       if (highlightSquaresArray.includes(coord)) {
//         onSquareClick({ x: dropX, y: dropY });
//       }
//       setDraggedPiece(null);
//     }
//   };

//   const handleAnimationComplete = () => {
//     if (animatedPiece) {
//       const { from, to } = animatedPiece;
//       updatedBoard[to.y][to.x] = {
//         piece: board[from.y][from.x]?.piece,
//         style: [],
//       };
//       updatedBoard[from.y][from.x] = {
//         piece: undefined,
//         style: [],
//       };
//     }
//   };

//   const pieceImages: Record<PieceType, { white: string; black: string }> = {
//     king: {
//       white: "/chess-pieces/w-king.png",
//       black: "/chess-pieces/b-king.png",
//     },
//     queen: {
//       white: "/chess-pieces/w-queen.png",
//       black: "/chess-pieces/b-queen.png",
//     },
//     rook: {
//       white: "/chess-pieces/w-rook.png",
//       black: "/chess-pieces/b-rook.png",
//     },
//     bishop: {
//       white: "/chess-pieces/w-bishop.png",
//       black: "/chess-pieces/b-bishop.png",
//     },
//     knight: {
//       white: "/chess-pieces/w-knight.png",
//       black: "/chess-pieces/b-knight.png",
//     },
//     pawn: {
//       white: "/chess-pieces/w-pawn.png",
//       black: "/chess-pieces/b-pawn.png",
//     },
//   };

//   const highlightSquaresArray = Array.isArray(highlightSquares)
//     ? highlightSquares
//     : [];

//   return (
//     <div className={cn("w-full max-w-2xl mx-auto", className)}>
//       <div className="aspect-square w-full bg-background/50 p-8 rounded-xl">
//         <div className="relative h-full">
//           {/* Coordonnées verticales (1-8) */}
//           <div className="absolute -left-8 top-0 bottom-0 flex flex-col justify-around text-sm font-medium text-muted-foreground">
//             {["8", "7", "6", "5", "4", "3", "2", "1"].map((coord) => (
//               <div
//                 key={coord}
//                 className="flex items-center justify-center w-6 h-6"
//               >
//                 {coord}
//               </div>
//             ))}
//           </div>

//           {/* Coordonnées horizontales (a-h) */}
//           <div className="absolute -bottom-8 left-0 right-0 flex justify-around text-sm font-medium text-muted-foreground">
//             {["a", "b", "c", "d", "e", "f", "g", "h"].map((coord) => (
//               <div
//                 key={coord}
//                 className="flex items-center justify-center w-6 h-6"
//               >
//                 {coord}
//               </div>
//             ))}
//           </div>

//           <div
//             className={`h-full w-full rounded-lg overflow-hidden border-2 border-border relative`}
//           >
//             {/* Grille de l'échiquier */}
//             <div
//               style={{
//                 display: "grid",
//                 gridTemplateColumns: `repeat(${size},1fr)`,
//                 gridTemplateRows: `repeat(${size},1fr)`,
//               }}
//               className="h-full w-full"
//             >
//               {updatedBoard.map((row, y) =>
//                 row.map((item, x) => {
//                   const squareColor = highlightSquaresArray.includes(
//                     `${String.fromCharCode(97 + x)}${8 - y}`
//                   )
//                     ? "bg-blue-600"
//                     : (x + y) % 2 === 0
//                     ? "bg-gray/80"
//                     : "bg-muted";

//                   return (
//                     <div
//                       key={`${x}-${y}`}
//                       className={cn(
//                         "relative aspect-square cursor-pointer transition-colors border border-black",
//                         squareColor,
//                         "hover:bg-blue-100 dark:hover:bg-blue-800/50"
//                       )}
//                       onClick={() => {
//                         if (!readOnly) {
//                           onSquareClick({ x, y });
//                         }
//                       }}
//                       onDragOver={handleDragOver}
//                       onDrop={(e) => handleDrop(e, x, y)}
//                     >
//                       {item?.piece && (
//                         <Image
//                           src={pieceImages[item.piece.name][item.piece.color]}
//                           alt={`${item.piece.color} ${item.piece.name}`}
//                           className="w-full h-full object-contain p-1"
//                           draggable={!readOnly}
//                           onDragStart={(e) =>
//                             item.piece && handleDragStart(e, item.piece, x, y)
//                           }
//                           width={50}
//                           height={50}
//                         />
//                       )}
//                     </div>
//                   );
//                 })
//               )}
//             </div>

//             {/* Pièce animée */}
//             {animatedPiece &&
//               board[animatedPiece.from.y][animatedPiece.from.x]?.piece && (
//                 <motion.img
//                   initial={{
//                     top: `${(animatedPiece.from.y * 100) / size}%`,
//                     left: `${(animatedPiece.from.x * 100) / size}%`,
//                   }}
//                   animate={{
//                     top: `${(animatedPiece.to.y * 100) / size}%`,
//                     left: `${(animatedPiece.to.x * 100) / size}%`,
//                   }}
//                   transition={{ duration: 0.5, ease: "easeInOut" }}
//                   onAnimationComplete={handleAnimationComplete}
//                   className="absolute w-[12.5%] h-[12.5%] object-contain p-1"
//                   src={
//                     board[animatedPiece.from.y][animatedPiece.from.x]?.piece
//                       ?.name &&
//                     pieceImages[
//                       board[animatedPiece.from.y][animatedPiece.from.x]?.piece
//                         ?.name as PieceType
//                     ][
//                       board[animatedPiece.from.y][animatedPiece.from.x]?.piece
//                         ?.color as "white" | "black"
//                     ]
//                   }
//                   style={{ pointerEvents: "none" }}
//                 />
//               )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }