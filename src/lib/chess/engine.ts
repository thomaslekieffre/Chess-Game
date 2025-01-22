import { PIECE_VALUES } from "./constants";
import {
  fromCoordToCase,
  fromXToRow,
  fromYToCol,
  getFigByName,
  getNameByFig,
  getPieceSymbol,
} from "./pgn/pgn2";
import {
  CasesList,
  ChessPiece,
  FenActiveColor,
  FenCastlingRights,
  FenEnPassant,
  FenFullmoveNumber,
  FenHalfmoveClock,
  FenString,
  GameState,
  Move,
  PgnMove,
  PieceColor,
  PieceTypeAbreg,
  Position,
  drawReason,
  eventTypes,
  tabCastlingRights,
} from "../../types/chess";

export class ChessEngine {
  private state: GameState;

  constructor(fen: FenString,private onAnyEventPlay?:(event:eventTypes,states:GameState)=>void) {
    const initialState = this.getInitialState(fen);
    this.state = initialState;
    this.state.materialAdvantage = this.calculateMaterialAdvantage();
  }

  private playEvent(event:eventTypes) {
    if(this.onAnyEventPlay){
      this.onAnyEventPlay(event,this.state)
    }
    const eventList = this.state.eventsListened.map((e,i)=>{
      if(e.event==event){
        e.f(event,this.state)
      }
    })
  }

  public addEventListener(event:eventTypes,f:(event:eventTypes,states:GameState)=>any) {
    console.log('event added :',event,f)
    this.state.eventsListened.push({
      event:event,
      f:f,
    })
  }

  public getBoard(): (ChessPiece | null)[][] {
    return this.state.board.map((row) => [...row]);
  }

  private getInitialState(fen: FenString): GameState {
    const {
      board,
      activeColor,
      castlingRights,
      enPassant,
      halfmoveClock,
      fullmoveNumber,
    } = this.importFEN(fen);

    const currentTurn = activeColor == "b" ? "black" : "white";

    let isCheck = false;
    let isCheckmate = false;
    let isStalemate = false;
    let isDraw = false;
    let drawReason: drawReason | undefined = undefined;

    // Trouver le roi du joueur
    let kingPos: Position | null = null;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = board[y][x];
        if (piece?.type === "king" && piece.color === currentTurn) {
          kingPos = { x, y };
          break;
        }
      }
      if (kingPos) break;
    }

    // Vérifier si le roi est en échec
    isCheck = kingPos
      ? this.isSquareAttacked(kingPos, currentTurn, true, board, enPassant)
      : false;

    // Vérifier l'échec et mat seulement si le roi est en échec
    if (isCheck && kingPos) {
      let canEscapeCheck = false;

      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const piece = board[y][x];
          if (piece?.color === currentTurn) {
            const from = { x, y };
            const moves = this.getPotentialMoves(from, false, board, enPassant);

            for (const to of moves) {
              if (!this.moveResultsInCheck(from, to, board, enPassant)) {
                canEscapeCheck = true;
                break;
              }
            }
          }
          if (canEscapeCheck) break;
        }
        if (canEscapeCheck) break;
      }

      isCheckmate = !canEscapeCheck;
    }

    // Vérifier le matériel insuffisant
    if (this.hasInsufficientMaterial(board)) {
      isDraw = true;
      drawReason = "insufficient-material";
    }

    // Vérifier le pat
    let hasLegalMoves = false;
    for (let y = 0; y < 8 && !hasLegalMoves; y++) {
      for (let x = 0; x < 8 && !hasLegalMoves; x++) {
        const piece = board[y][x];
        if (piece?.color === currentTurn) {
          const moves = this.getValidMoves(
            { x, y },
            board,
            enPassant,
            currentTurn
          );
          if (moves.length > 0) {
            hasLegalMoves = true;
            break;
          }
        }
      }
    }

    // Si pas de mouvements légaux et pas en échec = pat
    if (!hasLegalMoves && !isCheck) {
      isStalemate = true;
      isDraw = true;
      drawReason = "stalemate";
    }

    // Vérifier la règle des 50 coups
    if (halfmoveClock >= 100) {
      // 50 coups = 100 demi-coups
      isDraw = true;
      drawReason = "fifty-moves";
    }

    let isGameOver = false;
    if (isCheckmate || isDraw) isGameOver = true;

    return {
      board,
      currentTurn,
      moves: [],
      isCheck,
      isCheckmate,
      isStalemate,
      isDraw,
      drawReason,
      moveCount: fullmoveNumber,
      halfMoveCount: fullmoveNumber * 2,
      positions: [],
      lastPawnMoveOrCapture: halfmoveClock,
      isGameOver,
      winner: null,
      drawnHasBeenOffered: false,
      strMove: [],
      enPassantTarget: enPassant,
      castlingRights: castlingRights,
      displayedMove: 0,
      materialAdvantage: 0,
      eventsListened:[],
    };
  }

  private calculateMaterialAdvantage(): number {
    let advantage = 0;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = this.state.board[y][x];
        if (piece && piece.type !== "king") {
          const value = PIECE_VALUES[piece.type];
          advantage += piece.color === "white" ? value : -value;
        }
      }
    }
    return advantage;
  }

  // Méthodes publiques
  public getValidMoves(
    from: Position,
    board: (ChessPiece | null)[][] = this.state.board,
    enPassant = this.state.enPassantTarget,
    turn = this.state.currentTurn
  ): Position[] {
    const piece = board[from.y][from.x];
    console.log(piece);
    if (!piece || piece.color !== turn) return [];

    const potentialMoves = this.getPotentialMoves(
      from,
      false,
      board,
      enPassant
    );
    console.log(potentialMoves);
    return potentialMoves.filter(
      (to) => !this.moveResultsInCheck(from, to, board, enPassant)
    );
  }

  private getCastlingRight(): string {
    const rights = [];
    const WhiteKing = this.state.board[7][4];
    const QueenSideWhiteRook = this.state.board[0][7];
    const KingSideWhiteRook = this.state.board[7][7];
    const BlackKing = this.state.board[0][4];
    const QueenSideBlackRook = this.state.board[0][0];
    const KingSideBlackRook = this.state.board[7][0];
    const WhiteKingSideCastle =
      WhiteKing &&
      !WhiteKing.hasMoved &&
      KingSideWhiteRook &&
      !KingSideWhiteRook.hasMoved;
    const WhiteQueenSideCastle =
      WhiteKing &&
      !WhiteKing.hasMoved &&
      QueenSideWhiteRook &&
      !QueenSideWhiteRook.hasMoved;
    const BlackKingSideCastle =
      BlackKing &&
      !BlackKing.hasMoved &&
      KingSideBlackRook &&
      !KingSideBlackRook.hasMoved;
    const BlackQueenSideCastle =
      BlackKing &&
      !BlackKing.hasMoved &&
      QueenSideBlackRook &&
      !QueenSideBlackRook.hasMoved;
    if (WhiteKingSideCastle) rights.push("K");
    if (WhiteQueenSideCastle) rights.push("Q");
    if (BlackKingSideCastle) rights.push("k");
    if (BlackQueenSideCastle) rights.push("q");
    return rights.length > 0 ? rights.join("") : "-";
  }

  public makeMove(from: Position, to: Position): boolean {
    const validMoves = this.getValidMoves(from);

    if (!validMoves.some((move) => move.x === to.x && move.y === to.y)) {
      return false;
    } else {
      const copyBoard = JSON.parse(JSON.stringify(this.state.board));
      const move = this.createMove(from, to);

      const fromSquare = fromCoordToCase(move.from.x, move.from.y);
      const toSquare = fromCoordToCase(move.to.x, move.to.y);

      let target: PieceTypeAbreg | "" = "";
      const targetSquare = JSON.parse(
        JSON.stringify(this.state.board[to.y][to.x])
      );
      if (targetSquare) target = getFigByName(targetSquare.type);

      const piece = move.piece;

      const notationCurrentTurn: PieceColor = `${this.state.currentTurn}`;
      const castlingRight = `${this.getCastlingRight()}`;
      const enPassant = "-"; // TODO
      const moveCount = parseInt(`${this.state.moveCount}`);
      const lastMoveCap = parseInt(`${this.state.lastPawnMoveOrCapture}`);

      this.applyMove(move);
      console.log("move apply");
      console.log(this.state.strMove);

      this.state.displayedMove = this.state.strMove.length;
      this.playEvent('move')
      this.updateGameState();

      // Ajouter le coup à l'historique

      const fen = this.generateFEN(
        copyBoard,
        notationCurrentTurn,
        castlingRight,
        enPassant,
        lastMoveCap,
        moveCount
      );
      const fenRes = this.generateFEN(
        this.state.board,
        this.state.currentTurn,
        this.getCastlingRight(),
        enPassant,
        this.state.lastPawnMoveOrCapture,
        this.state.moveCount
      );

      const notation = this.generateChessNotation(
        fromSquare,
        toSquare,
        from,
        to,
        getFigByName(piece.type),
        target,
        null,
        this.state.isCheck,
        this.state.isCheckmate
      );

      const fig = getFigByName(piece.type);

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
        fen,
        fenRes,
        index: this.state.strMove.length + 1,
        turnNumber: this.state.moveCount,
        nag: [],
        variations: [],
      });

      return true;
    }
  }

  // Méthodes privées pour les règles spécifiques
  private getPotentialMoves(
    from: Position,
    checkingKing: boolean = false,
    board = this.state.board,
    enPassantTarget = this.state.enPassantTarget
  ): Position[] {
    const piece = board[from.y][from.x]!;

    switch (piece.type) {
      case "pawn":
        return this.getPawnMoves(from, board, enPassantTarget);
      case "rook":
        return this.getRookMoves(from, board);
      case "knight":
        return this.getKnightMoves(from, board);
      case "bishop":
        return this.getBishopMoves(from, board);
      case "queen":
        return [
          ...this.getRookMoves(from, board),
          ...this.getBishopMoves(from, board),
        ];
      case "king":
        return checkingKing ? [] : this.getKingMoves(from, board);
      default:
        return [];
    }
  }

  private getPawnMoves(
    from: Position,
    board = this.state.board,
    enPassantTarget = this.state.enPassantTarget
  ): Position[] {
    const moves: Position[] = [];
    const piece = board[from.y][from.x]!;
    const direction = piece.color === "white" ? -1 : 1;

    // Mouvement simple
    if (!board[from.y + direction]?.[from.x]) {
      moves.push({ x: from.x, y: from.y + direction });

      // Double mouvement initial
      if (
        ((piece.color == "black" && from.y == 1) ||
          (piece.color == "white" && from.y == 6)) &&
        !board[from.y + 2 * direction]?.[from.x]
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
        const targetPiece = board[capture.y][capture.x];
        if (targetPiece && targetPiece.color !== piece.color) {
          moves.push(capture);
        }
        // Prise en passant
        if (
          enPassantTarget &&
          capture.x === enPassantTarget.x &&
          capture.y === enPassantTarget.y
        ) {
          moves.push(capture);
        }
      }
    }

    return moves;
  }

  private getRookMoves(from: Position, board = this.state.board): Position[] {
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
        const targetPiece = board[y][x];
        if (!targetPiece) {
          moves.push({ x, y });
        } else {
          if (targetPiece.color !== board[from.y][from.x]!.color) {
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

  private getKnightMoves(from: Position, board = this.state.board): Position[] {
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
        const targetPiece = board[y][x];
        if (
          !targetPiece ||
          targetPiece.color !== board[from.y][from.x]!.color
        ) {
          moves.push({ x, y });
        }
      }
    }
    return moves;
  }

  private getBishopMoves(from: Position, board = this.state.board): Position[] {
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
        const targetPiece = board[y][x];
        if (!targetPiece) {
          moves.push({ x, y });
        } else {
          if (targetPiece.color !== board[from.y][from.x]!.color) {
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

  private getKingMoves(from: Position, board = this.state.board): Position[] {
    const moves: Position[] = [];
    const piece = board[from.y][from.x]!;

    // Mouvements normaux
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;

        const x = from.x + dx;
        const y = from.y + dy;

        if (this.isValidPosition({ x, y })) {
          const targetPiece = board[y][x];
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
      const kingsideRook = board[from.y][7];
      if (kingsideRook?.type === "rook" && !kingsideRook.hasMoved) {
        if (
          !board[from.y][5] &&
          !board[from.y][6] &&
          !this.isSquareAttacked({ x: 5, y: from.y }, piece.color, true) &&
          !this.isSquareAttacked({ x: 6, y: from.y }, piece.color, true)
        ) {
          moves.push({ x: 6, y: from.y });
        }
      }

      // Grand roque
      const queensideRook = board[from.y][0];
      if (queensideRook?.type === "rook" && !queensideRook.hasMoved) {
        if (
          !board[from.y][1] &&
          !board[from.y][2] &&
          !board[from.y][3] &&
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
    checkingKing: boolean = false,
    board: (ChessPiece | null)[][] = this.state.board,
    enPassantTarget = this.state.enPassantTarget
  ): boolean {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = board[y][x];
        if (piece && piece.color !== defendingColor) {
          if (checkingKing && piece.type === "king") continue;

          const moves = this.getPotentialMoves(
            { x, y },
            checkingKing,
            board,
            enPassantTarget
          );
          if (moves.some((move) => move.x === pos.x && move.y === pos.y)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private generateFEN(
    board: (ChessPiece | null)[][],
    activeColor: PieceColor, // Le joueur actif : "w" pour blanc, "b" pour noir
    castlingRights: string, // Droits de roque : exemple "KQkq" ou "-"
    enPassant: FenEnPassant, // Case en passant, ex: "e3", "-" s'il n'y en a pas
    halfmoveClock: FenHalfmoveClock, // Nombre de demi-coups depuis la dernière prise ou poussée de pion
    fullmoveNumber: FenFullmoveNumber // Nombre de tours complets (1 au début)
  ): FenString | string {
    // Étape 1: Générer la disposition des pièces
    const rows: string[] = [];
    for (let y = 0; y < 8; y++) {
      let emptyCount = 0;
      let feny = "";

      for (let x = 0; x < 8; x++) {
        const piece = board[y][x];
        const notationPiece = piece?.type
          ? piece.color === "black"
            ? getFigByName(piece.type).toLocaleLowerCase()
            : getFigByName(piece.type)
          : null;
        if (notationPiece === null) {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            feny += emptyCount.toString();
            emptyCount = 0;
          }
          feny += notationPiece;
        }
      }

      if (emptyCount > 0) {
        feny += emptyCount.toString();
      }

      rows.push(feny);
    }
    const boardFEN = rows.join("/");

    // Étape 2: Ajouter les autres composants du FEN
    const fen = `${boardFEN} ${
      activeColor == "white" ? "w" : "b"
    } ${castlingRights} ${enPassant} ${halfmoveClock} ${fullmoveNumber}`;

    return fen;
  }

  private moveResultsInCheck(
    from: Position,
    to: Position,
    board: (ChessPiece | null)[][] = this.state.board,
    enPassant = this.state.enPassantTarget
  ): boolean {
    const copiedBoard = JSON.parse(JSON.stringify(board));
    const piece: ChessPiece | null = copiedBoard[from.y][from.x];

    if (!piece) return false;

    // console.log(copiedBoard, this.state.board);

    // Simuler le mouvement sur la copie
    copiedBoard[to.y][to.x] = piece;
    copiedBoard[from.y][from.x] = null;

    // Trouver le roi
    let kingPos: Position | null = null;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const p = copiedBoard[y][x];
        if (p?.type === "king" && p.color === piece.color) {
          kingPos = { x, y };
          break;
        }
      }
      if (kingPos) break;
    }

    if (kingPos) {
      const isKingAttacked = this.isSquareAttacked(
        kingPos,
        piece.color,
        true,
        copiedBoard,
        enPassant
      );
      return isKingAttacked;
    } else {
      console.log("paspos");
      return false;
    }
  }

  private importFEN(fen: FenString | string): {
    board: (ChessPiece | null)[][];
    activeColor: FenActiveColor;
    castlingRights: FenCastlingRights;
    enPassant: Position;
    halfmoveClock: number;
    fullmoveNumber: number;
  } {
    // Diviser le FEN en ses composants
    const [
      piecePlacement,
      activeColor,
      castlingRights,
      enPassantCoord,
      halfmoveClock,
      fullmoveNumber,
    ] = fen.split(" ");

    // Valider les composants
    if (!["w", "b"].includes(activeColor)) {
      throw new Error(`Invalid active color: ${activeColor}`);
    }

    if (!tabCastlingRights.includes(castlingRights as FenCastlingRights)) {
      throw new Error(`Invalid castling rights: ${castlingRights}`);
    }

    if (!/^([a-h][36]|-)$/.test(enPassantCoord)) {
      throw new Error(`Invalid en passant target: ${enPassantCoord}`);
    }

    if (isNaN(parseInt(halfmoveClock, 10))) {
      throw new Error(`Invalid halfmove clock: ${halfmoveClock}`);
    }

    if (isNaN(parseInt(fullmoveNumber, 10))) {
      throw new Error(`Invalid fullmove number: ${fullmoveNumber}`);
    }

    const enPassant: Position = {
      x: enPassantCoord[0].charCodeAt(0) - "a".charCodeAt(0),
      y: 7 - (parseInt(enPassantCoord[1]) - 1),
    };

    // Étape 1: Construire l'échiquier
    const board: (ChessPiece | null)[][] = Array.from({ length: 8 }, () =>
      Array(8).fill(null)
    );
    const rows = piecePlacement.split("/");

    rows.forEach((row, rowIndex) => {
      let colIndex = 0;
      for (const char of row) {
        if (!isNaN(parseInt(char))) {
          // Case vide (nombre)
          colIndex += parseInt(char);
        } else {
          // Case occupée (pièce)
          const color: PieceColor =
            char === char.toLowerCase() ? "black" : "white"; // Minuscule = noir, Majuscule = blanc
          const type = getNameByFig(char.toLowerCase()); // Type de la pièce (p, r, n, b, q, k)
          if (!type) {
            throw new Error(`Invalid piece character: ${char}`);
          }
          board[rowIndex][colIndex] = {
            color,
            type,
            hasMoved: false,
            x: colIndex,
            y: rowIndex,
          };
          colIndex++;
        }
      }
    });

    // Étape 2: Retourner toutes les informations extraites
    return {
      board,
      activeColor: activeColor as FenActiveColor,
      castlingRights: castlingRights as FenCastlingRights,
      enPassant: enPassant,
      halfmoveClock: parseInt(halfmoveClock, 10),
      fullmoveNumber: parseInt(fullmoveNumber, 10),
    };
  }

  private isValidPosition(pos: Position): boolean {
    return pos.x >= 0 && pos.x < 8 && pos.y >= 0 && pos.y < 8;
  }

  private updateGameState(nextToor = true): void {
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
    if (this.state.isCheck && kingPos) {
      let canEscapeCheck = false;

      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const piece = this.state.board[y][x];
          if (piece?.color === opponentColor) {
            const from = { x, y };
            const moves = this.getPotentialMoves(from);

            for (const to of moves) {
              if (!this.moveResultsInCheck(from, to)) {
                canEscapeCheck = true;
                break;
              }
            }
          }
          if (canEscapeCheck) break;
        }
        if (canEscapeCheck) break;
      }

      this.state.isCheckmate = !canEscapeCheck;
    }

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

    if (nextToor) {
      // Changer le tour
      this.state.currentTurn =
        this.state.currentTurn === "white" ? "black" : "white";

      if (this.state.currentTurn == "black") {
        this.state.moveCount++;
      }
      this.state.halfMoveCount++;
    }
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

    for (const move of pieceMoves) {
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

  public setGameUsingFen(fen: FenString | string) {
    const {
      board,
      activeColor,
      castlingRights,
      enPassant,
      halfmoveClock,
      fullmoveNumber,
    } = this.importFEN(fen);

    this.state.board = board;
    this.state.currentTurn = activeColor == "b" ? "black" : "white";
    this.state.castlingRights = castlingRights;
    this.state.enPassantTarget = enPassant;
    this.state.halfMoveCount = fullmoveNumber / 2;
    this.state.lastPawnMoveOrCapture = halfmoveClock;
    this.state.moveCount = fullmoveNumber;
    this.state.strMove = [];
    this.state.displayedMove = 0;

    this.updateGameState(false);
  }

  public setGameUsingMoves(moves: PgnMove[]) {
    const displayed = moves.length - 1;

    console.log(moves);

    const lastMove = moves[moves.length - 1];

    if (!lastMove) throw new Error("ERREUR AUCUN COUPS DANS MOVES");

    const fen = lastMove.fenRes;

    const {
      board,
      activeColor,
      castlingRights,
      enPassant,
      halfmoveClock,
      fullmoveNumber,
    } = this.importFEN(fen);

    // console.log(activeColor)

    this.state.board = board;
    this.state.currentTurn = activeColor == "b" ? "black" : "white";
    this.state.castlingRights = castlingRights;
    this.state.enPassantTarget = enPassant;
    this.state.halfMoveCount = fullmoveNumber / 2;
    this.state.lastPawnMoveOrCapture = halfmoveClock;
    this.state.moveCount = fullmoveNumber;
    this.state.strMove = moves;
    this.state.displayedMove = moves.length;
    this.state.displayedMove = displayed;

    // console.log(moves,lastMove)

    this.updateGameState(false);

    // console.log(fromCaseToCoord(lastMove.from),fromCaseToCoord(lastMove.to))

    // this.makeMove(fromCaseToCoord(lastMove.from),fromCaseToCoord(lastMove.to))

    // this.state.currentTurn=lastMove.turn
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

    if (
      this.state.displayedMove != this.state.moves.length - 1 &&
      this.state.moves.length !== 0
    )
      this.setDisplayedMove(this.state.moves.length - 1);

    this.state.moves.push(move);

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

    // Mettre à jour le compteur de coups sans prise ni mouvement de pion
    if (move.piece.type === "pawn" || move.captured) {
      this.state.lastPawnMoveOrCapture = 0;
    } else {
      this.state.lastPawnMoveOrCapture++;
    }

    // Sauvegarder la position pour la triple répétition
    this.state.positions.push(this.getBoardHash());

    // Mettre à jour l'avantage matériel
    this.state.materialAdvantage = this.calculateMaterialAdvantage();
  }

  public getCurrentTurn(): PieceColor {
    return this.state.currentTurn;
  }

  public isKingInCheck(): boolean {
    return this.state.isCheck;
  }

  public getGameState(): GameState {
    const materialAdvantage = this.calculateMaterialAdvantage();
    return {
      ...this.state,
      board: this.state.board.map((row) => [...row]),
      materialAdvantage,
    };
  }

  public move(from: Position, to: Position): void {
    // Utiliser makeMove qui contient toute la logique de validation
    const success = this.makeMove(from, to);

    console.log(success);

    // Si le mouvement n'est pas valide, ne rien faire
    if (!success) return;
  }

  public setDisplayedMove(index: number, moves = this.state.strMove) {
    console.log(
      index,
      moves,
      moves.length,
      moves.length - 1,
      index > moves.length - 1
    );

    if (index > moves.length - 1) return console.log("INDEX NON DISPONIBLE");

    const move = moves[index];

    const { board } = this.importFEN(move.fenRes);

    //SET

    this.state.board = board;

    this.state.displayedMove = index;
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

  private hasInsufficientMaterial(
    board: (ChessPiece | null)[][] = this.state.board
  ): boolean {
    const pieces = {
      white: { bishops: [] as Position[], knights: 0, others: 0 },
      black: { bishops: [] as Position[], knights: 0, others: 0 },
    };

    // Compter les pièces
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = board[y][x];
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

  public getDisplayedMove(): number {
    return this.state.displayedMove;
  }

  public declineDraw(): void {
    this.state.drawOffer = undefined;
  }

  public getMoves(): Move[] {
    return this.state.moves;
  }

  public getStrMove(): PgnMove[] {
    return this.state.strMove;
  }

  public isKingInCheckmate(): boolean {
    return this.state.isCheckmate;
  }
  public getWinner(): PieceColor | null {
    return this.state.winner;
  }
  public isGameOver(): boolean {
    return this.state.isGameOver;
  }

  public getMaterialAdvantage(): number {
    return this.state.materialAdvantage;
  }
}


const b = {
  beforemove:[],
  move:[],
  aftermove:[],
}

const c =  {
  update:()=>{
  },
  selectMove:[],
  move:[],
  afterMove:[],
}