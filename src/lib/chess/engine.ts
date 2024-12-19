import {
  ChessPiece,
  GameState,
  Move,
  PieceColor,
  Position,
  // PieceType,
} from "./types";

export class ChessEngine {
  private state: GameState;

  constructor() {
    this.state = this.getInitialState();
  }

  public getBoard(): (ChessPiece | null)[][] {
    return this.state.board.map((row) => [...row]);
  }

  private getInitialState(): GameState {
    const board = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    // Placement des pièces
    const setupPieces = () => {
      // Pièces blanches
      board[7][0] = { type: "rook", color: "white", hasMoved: false };
      board[7][1] = { type: "knight", color: "white", hasMoved: false };
      board[7][2] = { type: "bishop", color: "white", hasMoved: false };
      board[7][3] = { type: "queen", color: "white", hasMoved: false };
      board[7][4] = { type: "king", color: "white", hasMoved: false };
      board[7][5] = { type: "bishop", color: "white", hasMoved: false };
      board[7][6] = { type: "knight", color: "white", hasMoved: false };
      board[7][7] = { type: "rook", color: "white", hasMoved: false };

      // Pions blancs
      for (let i = 0; i < 8; i++) {
        board[6][i] = { type: "pawn", color: "white", hasMoved: false };
      }

      // Pièces noires
      board[0][0] = { type: "rook", color: "black", hasMoved: false };
      board[0][1] = { type: "knight", color: "black", hasMoved: false };
      board[0][2] = { type: "bishop", color: "black", hasMoved: false };
      board[0][3] = { type: "queen", color: "black", hasMoved: false };
      board[0][4] = { type: "king", color: "black", hasMoved: false };
      board[0][5] = { type: "bishop", color: "black", hasMoved: false };
      board[0][6] = { type: "knight", color: "black", hasMoved: false };
      board[0][7] = { type: "rook", color: "black", hasMoved: false };

      // Pions noirs
      for (let i = 0; i < 8; i++) {
        board[1][i] = { type: "pawn", color: "black", hasMoved: false };
      }
    };

    setupPieces();

    return {
      board,
      currentTurn: "white",
      moves: [],
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      isDraw: false,
    };
  }

  // Méthodes publiques
  public getValidMoves(from: Position): Position[] {
    const piece = this.state.board[from.y][from.x];
    if (!piece || piece.color !== this.state.currentTurn) return [];

    const potentialMoves = this.getPotentialMoves(from);
    return potentialMoves.filter((to) => !this.moveResultsInCheck(from, to));
  }

  public makeMove(from: Position, to: Position): boolean {
    const validMoves = this.getValidMoves(from);
    if (!validMoves.some((move) => move.x === to.x && move.y === to.y)) {
      return false;
    }

    const move = this.createMove(from, to);
    this.applyMove(move);
    this.updateGameState();
    return true;
  }

  // Méthodes privées pour les règles spécifiques
  private getPotentialMoves(from: Position): Position[] {
    const piece = this.state.board[from.y][from.x]!;

    switch (piece.type) {
      case "pawn":
        return this.getPawnMoves(from);
      case "rook":
        return this.getRookMoves(from);
      case "knight":
        return this.getKnightMoves(from);
      case "bishop":
        return this.getBishopMoves(from);
      case "queen":
        return [...this.getRookMoves(from), ...this.getBishopMoves(from)];
      case "king":
        return this.getKingMoves(from);
      default:
        return [];
    }
  }

  private getPawnMoves(from: Position): Position[] {
    const moves: Position[] = [];
    const piece = this.state.board[from.y][from.x]!;
    const direction = piece.color === "white" ? -1 : 1;

    // Mouvement simple
    if (!this.state.board[from.y + direction]?.[from.x]) {
      moves.push({ x: from.x, y: from.y + direction });

      // Double mouvement initial
      if (
        !piece.hasMoved &&
        !this.state.board[from.y + 2 * direction]?.[from.x]
      ) {
        moves.push({ x: from.x, y: from.y + 2 * direction });
      }
    }

    // Prises
    const captures = [
      { x: from.x - 1, y: from.y + direction },
      { x: from.x + 1, y: from.y + direction },
    ];

    for (const capture of captures) {
      if (this.isValidPosition(capture)) {
        const targetPiece = this.state.board[capture.y][capture.x];
        if (targetPiece && targetPiece.color !== piece.color) {
          moves.push(capture);
        }
        // Prise en passant
        if (
          this.state.enPassantTarget &&
          capture.x === this.state.enPassantTarget.x &&
          capture.y === this.state.enPassantTarget.y
        ) {
          moves.push(capture);
        }
      }
    }

    return moves;
  }

  private getRookMoves(from: Position): Position[] {
    const moves: Position[] = [];
    const directions = [
      { x: 0, y: 1 },
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: -1, y: 0 },
    ];

    for (const dir of directions) {
      let x = from.x + dir.x;
      let y = from.y + dir.y;

      while (this.isValidPosition({ x, y })) {
        const targetPiece = this.state.board[y][x];
        if (!targetPiece) {
          moves.push({ x, y });
        } else {
          if (targetPiece.color !== this.state.board[from.y][from.x]!.color) {
            moves.push({ x, y });
          }
          break;
        }
        x += dir.x;
        y += dir.y;
      }
    }
    return moves;
  }

  private getKnightMoves(from: Position): Position[] {
    const moves: Position[] = [];
    const offsets = [
      { x: 2, y: 1 },
      { x: 2, y: -1 },
      { x: -2, y: 1 },
      { x: -2, y: -1 },
      { x: 1, y: 2 },
      { x: 1, y: -2 },
      { x: -1, y: 2 },
      { x: -1, y: -2 },
    ];

    for (const offset of offsets) {
      const x = from.x + offset.x;
      const y = from.y + offset.y;

      if (this.isValidPosition({ x, y })) {
        const targetPiece = this.state.board[y][x];
        if (
          !targetPiece ||
          targetPiece.color !== this.state.board[from.y][from.x]!.color
        ) {
          moves.push({ x, y });
        }
      }
    }
    return moves;
  }

  private getBishopMoves(from: Position): Position[] {
    const moves: Position[] = [];
    const directions = [
      { x: 1, y: 1 },
      { x: 1, y: -1 },
      { x: -1, y: 1 },
      { x: -1, y: -1 },
    ];

    for (const dir of directions) {
      let x = from.x + dir.x;
      let y = from.y + dir.y;

      while (this.isValidPosition({ x, y })) {
        const targetPiece = this.state.board[y][x];
        if (!targetPiece) {
          moves.push({ x, y });
        } else {
          if (targetPiece.color !== this.state.board[from.y][from.x]!.color) {
            moves.push({ x, y });
          }
          break;
        }
        x += dir.x;
        y += dir.y;
      }
    }
    return moves;
  }

  private getKingMoves(from: Position): Position[] {
    const moves: Position[] = [];
    const piece = this.state.board[from.y][from.x]!;

    // Mouvements normaux
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;

        const x = from.x + dx;
        const y = from.y + dy;

        if (this.isValidPosition({ x, y })) {
          const targetPiece = this.state.board[y][x];
          if (!targetPiece || targetPiece.color !== piece.color) {
            if (!this.isSquareAttacked({ x, y }, piece.color)) {
              moves.push({ x, y });
            }
          }
        }
      }
    }

    // Roque
    if (!piece.hasMoved && !this.state.isCheck) {
      // Petit roque
      const kingsideRook = this.state.board[from.y][7];
      if (kingsideRook?.type === "rook" && !kingsideRook.hasMoved) {
        if (
          !this.state.board[from.y][5] &&
          !this.state.board[from.y][6] &&
          !this.isSquareAttacked({ x: 5, y: from.y }, piece.color) &&
          !this.isSquareAttacked({ x: 6, y: from.y }, piece.color)
        ) {
          moves.push({ x: 6, y: from.y });
        }
      }

      // Grand roque
      const queensideRook = this.state.board[from.y][0];
      if (queensideRook?.type === "rook" && !queensideRook.hasMoved) {
        if (
          !this.state.board[from.y][1] &&
          !this.state.board[from.y][2] &&
          !this.state.board[from.y][3] &&
          !this.isSquareAttacked({ x: 2, y: from.y }, piece.color) &&
          !this.isSquareAttacked({ x: 3, y: from.y }, piece.color)
        ) {
          moves.push({ x: 2, y: from.y });
        }
      }
    }

    return moves;
  }

  private isSquareAttacked(pos: Position, defendingColor: PieceColor): boolean {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = this.state.board[y][x];
        if (piece && piece.color !== defendingColor) {
          const moves = this.getPotentialMoves({ x, y });
          if (moves.some((move) => move.x === pos.x && move.y === pos.y)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private moveResultsInCheck(from: Position, to: Position): boolean {
    const piece = this.state.board[from.y][from.x]!;
    const originalBoard = this.state.board.map((row) => [...row]);

    // Simuler le mouvement
    this.state.board[to.y][to.x] = piece;
    this.state.board[from.y][from.x] = null;

    // Trouver le roi
    let kingPos: Position | null = null;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const p = this.state.board[y][x];
        if (p?.type === "king" && p.color === piece.color) {
          kingPos = { x, y };
          break;
        }
      }
      if (kingPos) break;
    }

    const isCheck = kingPos
      ? this.isSquareAttacked(kingPos, piece.color)
      : false;

    // Restaurer le plateau
    this.state.board = originalBoard;

    return isCheck;
  }

  private isValidPosition(pos: Position): boolean {
    return pos.x >= 0 && pos.x < 8 && pos.y >= 0 && pos.y < 8;
  }

  private updateGameState(): void {
    const currentColor = this.state.currentTurn;
    const opponentColor = currentColor === "white" ? "black" : "white";

    // Vérifier l'échec
    let kingPos: Position | null = null;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = this.state.board[y][x];
        if (piece?.type === "king" && piece.color === opponentColor) {
          kingPos = { x, y };
          break;
        }
      }
      if (kingPos) break;
    }

    this.state.isCheck = kingPos
      ? this.isSquareAttacked(kingPos, opponentColor)
      : false;

    // Vérifier l'échec et mat ou le pat
    let hasLegalMoves = false;
    outerLoop: for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = this.state.board[y][x];
        if (piece?.color === opponentColor) {
          const moves = this.getValidMoves({ x, y });
          if (moves.length > 0) {
            hasLegalMoves = true;
            break outerLoop;
          }
        }
      }
    }

    this.state.isCheckmate = this.state.isCheck && !hasLegalMoves;
    this.state.isStalemate = !this.state.isCheck && !hasLegalMoves;

    // Changer le tour
    this.state.currentTurn = opponentColor;
  }

  private createMove(from: Position, to: Position): Move {
    const piece = this.state.board[from.y][from.x]!;
    const targetPiece = this.state.board[to.y][to.x];

    const move: Move = {
      from,
      to,
      piece,
      captured: targetPiece || undefined,
    };

    // Vérifier le roque
    if (piece.type === "king" && Math.abs(to.x - from.x) === 2) {
      move.isCastling = to.x > from.x ? "kingside" : "queenside";
    }

    // Vérifier la prise en passant
    if (
      piece.type === "pawn" &&
      to.x !== from.x &&
      !targetPiece &&
      to.y === this.state.enPassantTarget?.y &&
      to.x === this.state.enPassantTarget?.x
    ) {
      move.isEnPassant = true;
      move.captured = this.state.board[from.y][to.x] || undefined;
    }

    // Vérifier la promotion
    if (piece.type === "pawn" && (to.y === 0 || to.y === 7)) {
      move.isPromotion = true;
      move.promotedTo = "queen"; // Promotion automatique en dame pour l'instant
    }

    return move;
  }

  private applyMove(move: Move): void {
    const { from, to, piece } = move;

    // Mettre à jour hasMoved
    piece.hasMoved = true;

    // Appliquer le mouvement principal
    this.state.board[to.y][to.x] = piece;
    this.state.board[from.y][from.x] = null;

    // Gérer le roque
    if (move.isCastling) {
      const rookFromX = move.isCastling === "kingside" ? 7 : 0;
      const rookToX = move.isCastling === "kingside" ? 5 : 3;
      const rook = this.state.board[from.y][rookFromX]!;
      this.state.board[from.y][rookToX] = rook;
      this.state.board[from.y][rookFromX] = null;
      rook.hasMoved = true;
    }

    // Gérer la prise en passant
    if (move.isEnPassant) {
      this.state.board[from.y][to.x] = null;
    }

    // Gérer la promotion
    if (move.isPromotion && move.promotedTo) {
      this.state.board[to.y][to.x] = {
        ...piece,
        type: move.promotedTo,
      };
    }

    // Mettre à jour la cible de prise en passant
    this.state.enPassantTarget = undefined;
    if (piece.type === "pawn" && Math.abs(to.y - from.y) === 2) {
      this.state.enPassantTarget = {
        x: to.x,
        y: (from.y + to.y) / 2,
      };
    }

    // Ajouter le coup à l'historique
    this.state.moves.push(move);
  }
}
