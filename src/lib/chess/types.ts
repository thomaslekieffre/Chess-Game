export type Position = { x: number; y: number };
export type PieceColor = "white" | "black";
export type PieceType =
  | "pawn"
  | "rook"
  | "knight"
  | "bishop"
  | "queen"
  | "king";

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
  hasMoved: boolean;
}

export interface Move {
  from: Position;
  to: Position;
  piece: ChessPiece;
  captured?: ChessPiece;
  isEnPassant?: boolean;
  isCastling?: "kingside" | "queenside";
  isPromotion?: boolean;
  promotedTo?: PieceType;
}

export interface GameState {
  board: (ChessPiece | null)[][];
  currentTurn: PieceColor;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  drawReason?:
    | "stalemate"
    | "insufficient-material"
    | "threefold-repetition"
    | "fifty-moves"
    | "mutual-agreement";
  moves: Move[];
  enPassantTarget?: Position;
  moveCount: number;
  positions: string[];
  lastPawnMoveOrCapture: number;
  drawOffer?: PieceColor;
  timeLeft?: {
    white: number;
    black: number;
  };
  isGameOver: boolean;
  winner: PieceColor | null;
}
