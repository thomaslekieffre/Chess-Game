import {
  fromCoordToCase,
  fromXToRow,
  fromYToCol,
  getFigByName,
  getPieceSymbol,
} from "./pgn/pgn2";
import {
  CasesList,
  ChessPiece,
  GameState,
  Move,
  PgnMove,
  PieceColor,
  PieceTypeAbreg,
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
      drawReason: undefined,
      moveCount: 0,
      positions: [],
      lastPawnMoveOrCapture: 0,
      isGameOver: false,
      winner: null,
      drawnHasBeenOffered: false,
      strMove: [],
    };
  }

  // Méthodes publiques
  public getValidMoves(from: Position): Position[] {
    // console.log(this.state.board)
    // console.log(from)
    const piece = this.state.board[from.y][from.x];
    // console.log(piece)
    // console.log(this.state.board)
    // console.log(from)
    // console.log(this.state.currentTurn)
    if (!piece || piece.color !== this.state.currentTurn) return [];

    const potentialMoves = this.getPotentialMoves(from);
    // console.log(potentialMoves)
    return potentialMoves.filter((to) => !this.moveResultsInCheck(from, to));
  }

  public makeMove(from: Position, to: Position): boolean {
    console.log("aa");
    const validMoves = this.getValidMoves(from);

    console.log(validMoves);
    console.log(from, to);
    console.log("bb");

    if (!validMoves.some((move) => move.x === to.x && move.y === to.y)) {
      return false;
    } else {
      const move = this.createMove(from, to);

      let fromSquare = fromCoordToCase(move.from.x, move.from.y);
      let toSquare = fromCoordToCase(move.to.x, move.to.y);

      let target: PieceTypeAbreg | "" = "";
      let targetSquare = JSON.parse(
        JSON.stringify(this.state.board[to.y][to.x])
      );
      if (targetSquare) target = getFigByName(targetSquare.type);

      let piece = move.piece;

      this.applyMove(move);
      this.updateGameState();

      // Ajouter le coup à l'historique

      let notation = this.generateChessNotation(
        fromSquare,
        toSquare,
        from,
        to,
        getFigByName(piece.type),
        target,
        null, // TO MODIF WARNING
        this.state.isCheck,
        this.state.isCheckmate
      );

      let fig = getFigByName(piece.type);

      this.state.strMove.push({
        drawOffer: this.state.drawnHasBeenOffered,
        turn: this.state.currentTurn,
        from: fromSquare,
        to: toSquare,
        notation: {
          notation,
          col: fromYToCol(move.to.y),
          row: fromXToRow(move.to.x),
          fig,
        },
        fen: "",
        index: 0,
        nag: [],
        variations: [],
      });

      return true;
    }
  }

  // Méthodes privées pour les règles spécifiques
  private getPotentialMoves(
    from: Position,
    checkingKing: boolean = false
  ): Position[] {
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
        return checkingKing ? [] : this.getKingMoves(from);
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
            if (!this.isSquareAttacked({ x, y }, piece.color, true)) {
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
          !this.isSquareAttacked({ x: 5, y: from.y }, piece.color, true) &&
          !this.isSquareAttacked({ x: 6, y: from.y }, piece.color, true)
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
          !this.isSquareAttacked({ x: 2, y: from.y }, piece.color, true) &&
          !this.isSquareAttacked({ x: 3, y: from.y }, piece.color, true)
        ) {
          moves.push({ x: 2, y: from.y });
        }
      }
    }

    return moves;
  }

  private isSquareAttacked(
    pos: Position,
    defendingColor: PieceColor,
    checkingKing: boolean = false
  ): boolean {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = this.state.board[y][x];
        if (piece && piece.color !== defendingColor) {
          if (checkingKing && piece.type === "king") continue;

          const moves = this.getPotentialMoves({ x, y }, checkingKing);
          if (moves.some((move) => move.x === pos.x && move.y === pos.y)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private moveResultsInCheck(from: Position, to: Position): boolean {
    const piece = this.state.board[from.y][from.x];
    const copiedBoard = JSON.parse(JSON.stringify(this.state.board));

    console.log(copiedBoard, this.state.board);

    // // Simuler le mouvement sur la copie
    // copiedBoard[to.y][to.x] = piece;
    // copiedBoard[from.y][from.x] = null;

    // console.log(copiedBoard,this.state.board)

    // // Trouver le roi
    // let kingPos: Position | null = null;
    // for (let y = 0; y < 8; y++) {
    //   for (let x = 0; x < 8; x++) {
    //     const p = copiedBoard[y][x];
    //     if (p?.type === "king" && p.color === piece.color) {
    //       kingPos = { x, y };
    //       break;
    //     }
    //   }
    //   if (kingPos) break;
    // }

    // // Vérifier si le roi est en échec
    // const isCheck = kingPos
    // ? this.isSquareAttacked(kingPos, piece.color)
    // : false;

    // console.log(this.isSquareAttacked(kingPos, piece.color)&&isCheck)

    // return isCheck; // Retourner le résultat sans modifier l'état original
    return false;
  }

  private moveResultsInCheckmate(
    from: Position,
    to: Position,
    currentColor: PieceColor
  ): boolean {
    let moveResultsInCheck = this.moveResultsInCheck(from, to);
    console.log(moveResultsInCheck);
    if (!moveResultsInCheck) return false;

    let hasLegalMoves = false;

    for (let y = 0; y < 8 && !hasLegalMoves; y++) {
      for (let x = 0; x < 8 && !hasLegalMoves; x++) {
        const piece = this.state.board[y][x];
        if (piece?.color === currentColor) {
          const moves = this.getValidMoves({ x, y });
          if (moves.length > 0) {
            hasLegalMoves = true;
            break;
          }
        }
      }
    }

    console.log(hasLegalMoves);

    if (hasLegalMoves) {
      return false;
    } else {
      return true;
    }
    // const piece = this.state.board[from.y][from.x]!;
    // const copiedBoard = JSON.parse(JSON.stringify(this.state.board));

    // // Simuler le mouvement sur la copie
    // copiedBoard[to.y][to.x] = piece;
    // copiedBoard[from.y][from.x] = null;

    // // Trouver le roi
    // let kingPos: Position | null = null;
    // for (let y = 0; y < 8; y++) {
    //   for (let x = 0; x < 8; x++) {
    //     const p = copiedBoard[y][x];
    //     if (p?.type === "king" && p.color === piece.color) {
    //       kingPos = { x, y };
    //       break;
    //     }
    //   }
    //   if (kingPos) break;
    // }

    // // Vérifier si le roi est en échec
    // const isCheck = kingPos
    //   ? this.isSquareAttacked(kingPos, piece.color)
    //   : false;

    // return isCheck; // Retourner le résultat sans modifier l'état original
  }

  private isValidPosition(pos: Position): boolean {
    return pos.x >= 0 && pos.x < 8 && pos.y >= 0 && pos.y < 8;
  }

  private updateGameState(): void {
    const currentColor = this.state.currentTurn;

    // Vérifier la défaite au temps
    if (this.state.timeLeft && this.state.timeLeft[currentColor] <= 0) {
      this.state.isGameOver = true;
      this.state.winner = currentColor === "white" ? "black" : "white";
      return;
    }

    // Vérifier le pat
    let hasLegalMoves = false;
    for (let y = 0; y < 8 && !hasLegalMoves; y++) {
      for (let x = 0; x < 8 && !hasLegalMoves; x++) {
        const piece = this.state.board[y][x];
        if (piece?.color === currentColor) {
          const moves = this.getValidMoves({ x, y });
          if (moves.length > 0) {
            hasLegalMoves = true;
            break;
          }
        }
      }
    }

    // Si pas de mouvements légaux et pas en échec = pat
    if (!hasLegalMoves && !this.state.isCheck) {
      this.state.isStalemate = true;
      this.state.isDraw = true;
      this.state.drawReason = "stalemate";
    }

    // Trouver le roi de l'adversaire
    let kingPos: Position | null = null;
    const opponentColor = currentColor === "white" ? "black" : "white";
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

    // Vérifier si le roi est en échec
    this.state.isCheck = kingPos
      ? this.isSquareAttacked(kingPos, opponentColor)
      : false;
    this.state.isCheckmate = false;

    // Vérifier l'échec et mat seulement si le roi est en échec
    // if (this.state.isCheck && kingPos) {
    //   let canEscapeCheck = false;

    //   for (let y = 0; y < 8; y++) {
    //     for (let x = 0; x < 8; x++) {
    //       const piece = this.state.board[y][x];
    //       if (piece?.color === opponentColor) {
    //         const from = { x, y };
    //         const moves = this.getPotentialMoves(from);

    //         for (const to of moves) {
    //           if (!this.moveResultsInCheck(from, to)) {
    //             canEscapeCheck = true;
    //             break;
    //           }
    //         }
    //       }
    //       if (canEscapeCheck) break;
    //     }
    //     if (canEscapeCheck) break;
    //   }

    //   this.state.isCheckmate = !canEscapeCheck;
    // }

    // Vérifier le matériel insuffisant
    if (this.hasInsufficientMaterial()) {
      this.state.isDraw = true;
      this.state.drawReason = "insufficient-material";
      return;
    }

    // Vérifier la règle des 50 coups
    if (this.state.lastPawnMoveOrCapture >= 100) {
      // 50 coups = 100 demi-coups
      this.state.isDraw = true;
      this.state.drawReason = "fifty-moves";
      return;
    }

    // Vérifier la triple répétition
    if (this.checkThreefoldRepetition()) {
      this.state.isDraw = true;
      this.state.drawReason = "threefold-repetition";
      return;
    }

    // Changer le tour
    this.state.currentTurn =
      this.state.currentTurn === "white" ? "black" : "white";
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

  // Fonction pour vérifier si une pièce peut se déplacer vers une cible
  private canMove(
    from: { x: number; y: number },
    to: { x: number; y: number }
  ): boolean {
    // Implémentez les règles spécifiques pour chaque type de pièce
    // Exemple simplifié : mouvement direct sans vérification d'obstacles
    const piece = this.state.board[from.y][from.x];
    if (!piece) return false;

    const pieceMoves = this.getPotentialMoves(from);

    for (let move of pieceMoves) {
      if (move.x == to.x && move.y == to.y) {
        return true;
      }
    }

    return false;

    // switch (getFigByName(piece.type)) {
    //   case "N": // Cavalier
    //   const KnightMoves = this.getKnightMoves
    //     return isKnightMove(from, to);
    //   case "B": // Fou
    //     return isBishopMove(from, to, board);
    //   case "R": // Tour
    //     return isRookMove(from, to, board);
    //   case "Q": // Reine
    //     return isQueenMove(from, to, board);
    //   case "K": // Roi
    //     return isKingMove(from, to);
    //   case "P": // Pion
    //     return isPawnMove(from, to, board, piece);
    //   default:
    //     return false;
    // }
  }

  private checkAmbiguity(
    from: Position,
    to: Position,
    pieceType: PieceTypeAbreg
  ): boolean {
    // const fromRow = parseInt(from[1], 10) - 1;
    // const fromCol = from.charCodeAt(0) - 'a'.charCodeAt(0);
    // const toRow = parseInt(to[1], 10) - 1;
    // const toCol = to.charCodeAt(0) - 'a'.charCodeAt(0);

    // Parcourir tout l'échiquier pour vérifier les autres pièces du même type
    for (let tmpY = 0; tmpY < this.state.board.length; tmpY++) {
      for (let tmpX = 0; tmpX < this.state.board[tmpY].length; tmpX++) {
        const otherPiece = this.state.board[tmpY][tmpX];
        const otherPieceAbrg: PieceTypeAbreg | false = otherPiece?.type
          ? getFigByName(otherPiece?.type)
          : false;

        // Vérifiez si une autre pièce du même type peut atteindre "to"
        if (
          otherPieceAbrg &&
          otherPieceAbrg === pieceType && // Même type de pièce
          (tmpY !== from.y || tmpX !== from.x) && // Pas la pièce d'origine
          this.canMove({ y: tmpY, x: tmpX }, { y: to.y, x: to.x }) // Peut se déplacer vers la cible
        ) {
          return true;
        }
      }
    }

    return false;
  }

  private generateChessNotation(
    from: CasesList,
    to: CasesList,
    fromPos: Position,
    toPos: Position,
    pieceType: PieceTypeAbreg,
    target: PieceTypeAbreg | "" | null | undefined,
    promotion: PieceTypeAbreg | null = null,
    isCheck: boolean,
    isCheckmate: boolean
  ): string {
    // const target = this.state.board[toRow][toCol];

    let notation = "";

    // Déterminer le type de pièce
    // const pieceType = piece.toUpperCase();
    if (pieceType === "P") {
      // Notation pour un pion
      if (target !== "" && target !== null && target !== undefined) {
        // Capture par un pion
        notation = `${from[0]}x${to}`;
      } else {
        notation = to;
      }
      if (promotion) {
        notation += `=${promotion}`;
      }
    } else {
      // Notation pour les autres pièces
      const pieceSymbol = getPieceSymbol(pieceType); // "N" pour cavalier, "Q" pour reine, etc.
      notation = pieceSymbol;

      // Ajouter désambiguïsation si nécessaire
      const isAmbiguous = this.checkAmbiguity(fromPos, toPos, pieceType);
      if (isAmbiguous) {
        notation += from[0]; // Exemple simplifié
      }

      if (target !== "") {
        // Capture
        notation += `x`;
      }
      notation += to;
    }

    // Vérifier les échecs ou mat
    if (isCheck) {
      notation += "+";
    } else if (isCheckmate) {
      notation += "#";
    }

    return notation;
  }

  // function getPieceSymbol(pieceType: string): string {
  //   switch (pieceType) {
  //     case "N":
  //       return "N"; // Cavalier
  //     case "B":
  //       return "B"; // Fou
  //     case "R":
  //       return "R"; // Tour
  //     case "Q":
  //       return "Q"; // Reine
  //     case "K":
  //       return "K"; // Roi
  //     default:
  //       return ""; // Pions n'ont pas de lettre
  //   }
  // }

  // function checkAmbiguity(board: string[][], from: string, to: string, pieceType: string): boolean {
  //   // Implémentez une vérification pour déterminer si une autre pièce du même type peut atteindre "to"
  //   return false; // Simplifié pour cet exemple
  // }

  // function isCheck(board: string[][], position: string): boolean {
  //   // Implémentez une logique pour vérifier si le roi adverse est en échec
  //   return false;
  // }

  // function isCheckmate(board: string[][], position: string): boolean {
  //   // Implémentez une logique pour vérifier si le roi adverse est en échec et mat
  //   return false;
  // }

  private applyMove(move: Move): void {
    const { from, to, piece } = move;
    // console.log('WARNING',from,to,piece,this.state.board,'WARNINGNGNNGNGNGNGGGG')

    this.state.moves.push(move);

    // Mettre à jour hasMoved
    piece.hasMoved = true;

    console.log("aplly");
    // Appliquer le mouvement principal
    this.state.board[to.y][to.x] = piece;
    this.state.board[from.y][from.x] = null;

    // console.log('WARNING2',from,to,piece,this.state.board,'WARNINGNGNNGNGNGNGGGG2')
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

    // Mettre à jour le compteur de coups sans prise ni mouvement de pion
    if (move.piece.type === "pawn" || move.captured) {
      this.state.lastPawnMoveOrCapture = 0;
    } else {
      this.state.lastPawnMoveOrCapture++;
    }

    // Sauvegarder la position pour la triple répétition
    this.state.positions.push(this.getBoardHash());
  }

  public getCurrentTurn(): PieceColor {
    return this.state.currentTurn;
  }

  public isKingInCheck(): boolean {
    return this.state.isCheck;
  }

  public getGameState(): GameState {
    return {
      ...this.state,
      board: this.state.board.map((row) => [...row]),
    };
  }

  public move(from: Position, to: Position): void {
    // Utiliser makeMove qui contient toute la logique de validation
    const success = this.makeMove(from, to);

    // Si le mouvement n'est pas valide, ne rien faire
    if (!success) return;
  }

  private checkStalemate(): boolean {
    const currentColor = this.state.currentTurn;

    // Vérifier si le joueur a des mouvements légaux
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = this.state.board[y][x];
        if (piece?.color === currentColor) {
          const moves = this.getValidMoves({ x, y });
          if (moves.length > 0) {
            return false;
          }
        }
      }
    }

    // Si aucun mouvement légal n'est trouvé et le roi n'est pas en échec
    return !this.state.isCheck;
  }

  private hasInsufficientMaterial(): boolean {
    const pieces = {
      white: { bishops: [] as Position[], knights: 0, others: 0 },
      black: { bishops: [] as Position[], knights: 0, others: 0 },
    };

    // Compter les pièces
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = this.state.board[y][x];
        if (piece && piece.type !== "king") {
          if (piece.type === "bishop") {
            pieces[piece.color].bishops.push({ x, y });
          } else if (piece.type === "knight") {
            pieces[piece.color].knights++;
          } else {
            pieces[piece.color].others++;
          }
        }
      }
    }

    // Cas de matériel insuffisant
    const isInsufficient =
      // Roi contre roi
      (pieces.white.bishops.length === 0 &&
        pieces.white.knights === 0 &&
        pieces.white.others === 0 &&
        pieces.black.bishops.length === 0 &&
        pieces.black.knights === 0 &&
        pieces.black.others === 0) ||
      // Roi et fou contre roi
      (pieces.white.bishops.length <= 1 &&
        pieces.white.knights === 0 &&
        pieces.white.others === 0 &&
        pieces.black.bishops.length === 0 &&
        pieces.black.knights === 0 &&
        pieces.black.others === 0) ||
      (pieces.black.bishops.length <= 1 &&
        pieces.black.knights === 0 &&
        pieces.black.others === 0 &&
        pieces.white.bishops.length === 0 &&
        pieces.white.knights === 0 &&
        pieces.white.others === 0) ||
      // Roi et cavalier contre roi
      (pieces.white.bishops.length === 0 &&
        pieces.white.knights <= 1 &&
        pieces.white.others === 0 &&
        pieces.black.bishops.length === 0 &&
        pieces.black.knights === 0 &&
        pieces.black.others === 0) ||
      (pieces.black.bishops.length === 0 &&
        pieces.black.knights <= 1 &&
        pieces.black.others === 0 &&
        pieces.white.bishops.length === 0 &&
        pieces.white.knights === 0 &&
        pieces.white.others === 0);

    return isInsufficient;
  }

  private getBoardHash(): string {
    return this.state.board
      .map((row) =>
        row
          .map((piece) =>
            piece ? `${piece.type}${piece.color}${piece.hasMoved}` : "empty"
          )
          .join(",")
      )
      .join("|");
  }

  private checkThreefoldRepetition(): boolean {
    const currentPosition = this.getBoardHash();
    const occurrences = this.state.positions.filter(
      (pos) => pos === currentPosition
    ).length;
    return occurrences >= 3;
  }

  public offerDraw(color: PieceColor): void {
    if (color === this.state.currentTurn) {
      this.state.drawOffer = color;
    }
  }

  public acceptDraw(): void {
    if (this.state.drawOffer) {
      this.state.isDraw = true;
      this.state.drawReason = "mutual-agreement";
      this.state.drawOffer = undefined;
    }
  }

  public declineDraw(): void {
    this.state.drawOffer = undefined;
  }

  getMoves(): Move[] {
    return this.state.moves;
  }

  getStrMove(): PgnMove[] {
    return this.state.strMove;
  }
}
