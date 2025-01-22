export const PROMOTIONS = {
  q: "queen",
  r: "rook",
  b: "bishop",
  n: "knight",
};

export const prom_short = ["q", "r", "b", "n"];
export type PROMOTIONS_SHORT = (typeof prom_short)[number];

export const colors = ["white", "black"] as const;
export const files = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
export const ranks = ["1", "2", "3", "4", "5", "6", "7", "8"] as const;
export const ranksOpo = ["8", "7", "6", "5", "4", "3", "2", "1"] as const;
export type MoveExeptType = ["O-O", "O-O-O", "a0"];

export type File = (typeof files)[number];
export type Rank = (typeof ranks)[number];
export type CasesList = `${File}${Rank}`;
export type Field = CasesList | MoveExeptType;

export type GameComment = {
  comment?: string;
  colorArrows?: string[];
  colorFields?: string[];
  clk?: string;
  eval?: string;
};
export type Color = "w" | "b";

export type ConfigurationTagsValues = "no" | "7r" | "known" | "all";
export type PgnWriterConfiguration = {
  tags?: ConfigurationTagsValues;
  notation?: string;
};

export const fenAbrListe = [
  "p",
  "k",
  "q",
  "n",
  "b",
  "r",
  "P",
  "K",
  "Q",
  "N",
  "B",
  "R",
] as const;
export type fenAbrListeType = (typeof fenAbrListe)[number];
export type FenEmptyChar = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8";
export type FenRowChar = `${fenAbrListeType | FenEmptyChar}`;
export type FenPiecePlacement = string; // Exemple: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
export type FenActiveColor = "w" | "b"; // Blanc ou noir
export const tabCastlingRights = [
  "KQkq",
  "KQk",
  "KQ",
  "KQq",
  "Kkq",
  "Kk",
  "Kq",
  "Qkq",
  "Qk",
  "Qq",
  "K",
  "Q",
  "k",
  "q",
  "-",
] as const; // Exemple: "KQkq", "KQ", "kq", ou "-"
export type FenCastlingRights =
  | "KQkq"
  | "KQk"
  | "KQ"
  | "KQq"
  | "Kkq"
  | "Kk"
  | "Kq"
  | "Qkq"
  | "Qk"
  | "Qq"
  | "K"
  | "Q"
  | "k"
  | "q"
  | "-";
export type FenEnPassant =
  | "-"
  | `${"a" | "b" | "c" | "d" | "e" | "f" | "g" | "h"}${"3" | "6"}`; // Exemple: "e3", "d6", ou "-"
export type FenHalfmoveClock = number; // Demi-coups depuis capture/pion
export type FenFullmoveNumber = number; // Numéro de tour
export type FenString =
  `${string} ${FenActiveColor} ${FenCastlingRights} ${FenEnPassant} ${FenHalfmoveClock} ${FenFullmoveNumber}`;

export type PgnMove = {
  drawOffer?: boolean;
  // moveNumber?: number,
  notation: {
    fig?: string | null;
    strike?: "x" | null;
    col?: string;
    row?: string;
    check?: string;
    ep?: boolean;
    promotion?: string | null;
    notation: string;
    disc?: string;
    drop?: boolean;
  };
  variations: PgnMove[];
  nag: string[];
  commentDiag?: GameComment;
  commentMove?: string;
  commentAfter?: string;
  turn: PieceColor;
  from: CasesList;
  to: CasesList;
  fen: FenString | string;
  fenRes: FenString | string;
  index?: number;
  turnNumber: number;
  prev?: number;
  next?: number;
  variationLevel?: number;
};

export type SevenRoosterTagKeys =
  | "Event"
  | "Site"
  | "Round"
  | "White"
  | "Black"
  | "Result|Date";
export type Tags = { string: string };

export type PgnGame = {
  tags?: Tags;
  gameComment?: GameComment;
  moves: PgnMove[];
};

export interface Position {
  x: number;
  y: number;
}

export interface Arrow {
  from: Position;
  to: Position;
}

export type PieceColor = "white" | "black";
export type PieceType =
  | "pawn"
  | "rook"
  | "knight"
  | "bishop"
  | "queen"
  | "king";

export type PieceTypeAbreg = "P" | "R" | "N" | "B" | "Q" | "K";

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
  x: number;
  y: number;
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

export type drawReason =
  | "stalemate"
  | "insufficient-material"
  | "threefold-repetition"
  | "fifty-moves"
  | "mutual-agreement";

export interface GameState {
  board: (ChessPiece | null)[][];
  currentTurn: PieceColor;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  drawReason?: drawReason;
  moves: Move[];
  enPassantTarget?: Position;
  moveCount: number;
  halfMoveCount: number;
  positions: string[];
  lastPawnMoveOrCapture: number;
  drawOffer?: PieceColor;
  timeLeft?: {
    white: number;
    black: number;
  };
  isGameOver: boolean;
  drawnHasBeenOffered: boolean;
  winner: PieceColor | null;
  strMove: PgnMove[];
  castlingRights: FenCastlingRights;
  displayedMove: number;
  materialAdvantage: number;
  eventsListened:Array<{
    event:eventTypes,
    f:(event:eventTypes,states:GameState)=>any,
  }>
}

export type eventTypes = 
  'caste'| // ✅
  'move'| // ✅
  'checkmate'| // ✅
  'steelmate'| // ✅
  '50_moves_rules'|
  'check'| // ✅
  'game_end'| // ✅
  'loaded' | // ✅
  'draw' // ✅

export type DrawResons =     
  "stalemate" |
  "insufficient-material" |
  "threefold-repetition" |
  "fifty-moves" |
  "mutual-agreement"

export type PlayerBanner = {
  bannerUrl: any;
  textColors: {
      text: any;
      title: any;
      rating: any;
  };
} | null

export type playerType = {
  id: string;
  color: PieceColor;
  time: string;
  username: string;
  elo_stats?: {
    classique: {
      bullet?: string;
      blitz?: string;
      rapide?: string;
    };
    saisonnier?: {
      bullet?: string;
      blitz?: string;
      rapide?: string;
    };
  };
  banner:PlayerBanner;
  // bannerUrl?: string;
};

export type roomType = {
  id: string;
  cadence: string;
  game_mode: string;
  status: string;
  rated: boolean;
  players: {
    player1: playerType;
    player2: playerType;
    lastmove: string;
  };
  game: PgnMove[];
  default_pos: string | FenString;
  createdAt: string;
  turn: string;
};

export type customBoardSquare = {
  piece?: {
    name: PieceType;
    color: PieceColor;
  };
  style: Array<string>;
  data?: any;
};

export type gameStatus =
  | "loading"
  | "can-join"
  | "playing"
  | "watching"
  | "waiting";

export type customBoardType = customBoardSquare[][];

export type ColoredSquare = {
  x: number;
  y: number;
  color: string;
};
