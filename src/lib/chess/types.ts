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
  moves: Move[];
  enPassantTarget?: Position;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
}
