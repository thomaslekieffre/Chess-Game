//@ts-nocheck

import {CasesList, Field, File, PgnGame, PgnReaderMove, PgnWriterConfiguration, PieceType, PieceTypeAbreg, Position, Rank, files, ranks, ranksOpo, tabCastlingRights} from "../types";

export const fromCoordToCase = (x:number,y:number) => {
    const xPos:File = fromXToRow(x)
    const yPos:Rank = fromYToCol(y)
    const res:Field = `${xPos}${yPos}`
    return res
}

export const fromCaseToCoord = (pos:CasesList) => {
    const x:number = files.indexOf(`${pos[0]}`)
    const y:number = ranksOpo.indexOf(`${pos[1]}`)
    const res:Position = {x,y}
    return res
}

export const fromXToRow = (x:number) => {
    // const tabLetter = ['a','b','c','d','e','f','g','h']
    return files[x]
}

export const fromYToCol = (y:number) => {
    // const tabNumber = ['8','7','6','5','4','3','2','1']
    return ranksOpo[y]
}

export const getFigByName = (name:PieceType):PieceTypeAbreg => {
    let ObjConv = {
        pawn:'P',
        king:'K',
        knight:'N',
        queen:'Q',
        rook:'R',
        bishop:'B',
    }
    return ObjConv[name]
}

export const getNameByFig = (fig:string):PieceType => {
    let ObjConv = {
        p:'pawn',
        k:'king',
        n:'knight',
        q:'queen',
        r:'rook',
        b:'bishop',
    }
    return ObjConv[fig]
}

export const importFEN = (fen: FenString|string): {
    board: (ChessPiece | null)[][];
    activeColor: FenActiveColor;
    castlingRights: FenCastlingRights;
    enPassant: Position;
    halfmoveClock: number;
    fullmoveNumber: number;
  } => {
    // Diviser le FEN en ses composants
    const [piecePlacement, activeColor, castlingRights, enPassantCoord, halfmoveClock, fullmoveNumber] = fen.split(" ");

    
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
  
    let enPassant:Position = {
      x:enPassantCoord[0].charCodeAt(0) - "a".charCodeAt(0),
      y: 7 - (parseInt(enPassantCoord[1]) - 1),
    }

    // Étape 1: Construire l'échiquier
    const board: (ChessPiece | null)[][] = Array.from({ length: 8 }, () => Array(8).fill(null));
    const rows = piecePlacement.split("/");
  
    rows.forEach((row, rowIndex) => {
      let colIndex = 0;
      for (const char of row) {
        if (!isNaN(parseInt(char))) {
          // Case vide (nombre)
          colIndex += parseInt(char);
        } else {
          // Case occupée (pièce)
          const color: PieceColor = char === char.toLowerCase() ? "black" : "white"; // Minuscule = noir, Majuscule = blanc
          const type = getNameByFig(char.toLowerCase()); // Type de la pièce (p, r, n, b, q, k)
          if (!type) {
            throw new Error(`Invalid piece character: ${char}`);
          }
          board[rowIndex][colIndex] = {
            color,
            type,
            hasMoved: false, // Par défaut, on suppose que toutes les pièces n'ont pas encore bougé
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

export const getPieceSymbol = (pieceType: PieceTypeAbreg): PieceTypeAbreg|'' => {
    switch (pieceType) {
        case "P":
          return ""; // Piont nont pas de lettre
        default:
          return pieceType; // Autre pieces
    }
}

export const writeGame = function(game:PgnGame, configuration:PgnWriterConfiguration = {}) {
    return writePgn(game, configuration)
}


/**
 * Writes the pgn (fully) of the current game. The algorithm goes like that:
 * * Start with the first move (there has to be only one in the main line)
 * * For each move (call that recursively)
 * * print-out the move itself
 * * then the variations (one by one)
 * * then the next move of the main line
 * @return the string of all moves
 */

const writePgn = function(game:PgnGame, configuration:PgnWriterConfiguration) {
    function getGameComment(game:PgnGame):string|undefined {
        return game.gameComment ? game.gameComment.comment : undefined
    }

    const startVariation = function(move:PgnReaderMove):boolean {
        return  move.variationLevel !== undefined && move.variationLevel > 0 &&
            ( (typeof move.prev != "number") || (game.moves[move.prev].next !== move.index));
    }

    const firstMove = function (move:any):boolean {
        return typeof move.prev != "number"
    }

    const getMove = function (index:number):PgnReaderMove {
        return game.moves[index]
    }

    // Prepend a space if necessary
    function prependSpace(sb) {
        if ( (!sb.isEmpty()) && (sb.lastChar() !== " ") && (sb.lastChar() !== "\n")) {
            sb.append(" ")
        }
    }

    const writeComment = function(comment:string|undefined|null, sb) {
        if (comment === undefined || comment === null) {
            return
        }
        prependSpace(sb)
        sb.append("{")
        sb.append(comment)
        sb.append("}")
    }

    const writeGameComment = function (game, sb) {
        writeComment(getGameComment(game), sb)
    }

    const writeCommentMove = function(move:PgnReaderMove, sb) {
        writeComment(move.commentMove, sb)
    }

    const writeCommentAfter = function(move:PgnReaderMove, sb) {
        writeComment(move.commentAfter, sb)
    }

    const writeCommentDiag = function(move:PgnReaderMove, sb) {
        let has_diags = (move) => {
            return move.commentDiag &&
                ( ( move.commentDiag.colorArrows && move.commentDiag.colorArrows.length > 0 ) ||
                    ( move.commentDiag.colorFields && move.commentDiag.colorFields.length > 0 )
                )
        }
        let arrows = (move) => { return move.commentDiag.colorArrows || [] }
        let fields = (move) => { return move.commentDiag.colorFields || [] }

        if (has_diags(move)) {
            let sbdiags = new StringBuilder()
            let first = true
            sbdiags.append("[%csl ")
            fields(move).forEach( (field) => {
                ! first ? sbdiags.append(",") : sbdiags.append("")
                first = false
                sbdiags.append(field)
            })
            sbdiags.append("]")
            first = true
            sbdiags.append("[%cal ")
            arrows(move).forEach( (arrow) => {
                ! first ? sbdiags.append(",") : sbdiags.append("")
                first = false
                sbdiags.append(arrow)
            })
            sbdiags.append("]")
            writeComment(sbdiags.toString(), sb)
        }
    }

    const writeMoveNumber = function (move:PgnReaderMove, sb) {
        prependSpace(sb)
        if (move.turn === "w") {
            sb.append("" + move.moveNumber)
            sb.append(".")
        } else if (firstMove(move) || startVariation(move)) {
            sb.append("" + move.moveNumber)
            sb.append("...")
        }
    }

    const writeNotation = function (move:PgnReaderMove, sb) {
        function san(move: PgnReaderMove): string {
            function getFig (fig: string) {
                if (fig === 'P') {
                    return ''
                }
                return fig
            }
            let notation = move.notation;
            if (notation.notation && configuration.notation != 'long') { // notation is filled, no need to try to compute it again
                return notation.notation; // move like O-O and O-O-O
            }
            const fig = notation.fig ? getFig(notation.fig) : ''
            let disc = notation.disc ? notation.disc : ''
            const strike = notation.strike ? notation.strike : ''
            // Pawn moves with capture need the col as "discriminator"
            if (strike && !fig) { // Pawn capture
                disc = move.from.substring(0,1)
            }
            const check = notation.check ? notation.check : ''
            const prom = notation.promotion ? '=' + getFig(notation.promotion.substring(1,2)) : ''
            if (configuration.notation === 'long') {
                return fig + move.from + (notation.strike ? strike : '-') + move.to + prom + check
            }
            return fig + disc + strike + notation.col + notation.row + prom + check
        }
        prependSpace(sb)
        sb.append(san(move))
    }

    const writeNAGs = function(move:PgnReaderMove, sb) {
        if (move.nag) {
            move.nag.forEach(function(ele) {
                sb.append(ele)
            })
        }
    }

    const writeVariation = function (move:PgnReaderMove, sb) {
        prependSpace(sb)
        sb.append("(")
        writeMove(move, sb)
        prependSpace(sb)
        sb.append(")")
    }

    const writeVariations = function (move:PgnReaderMove, sb) {
        for (let i = 0; i < move.variations.length; i++) {
            writeVariation(move.variations[i], sb)
        }
    }

    const getNextMove = function (move:PgnReaderMove) {
        return move.next ? getMove(move.next) : null
    }

    /**
     * Write the normalised notation: comment move, move number (if necessary),
     * comment before, move, NAGs, comment after, variations.
     * Then go into recursion for the next move.
     * @param move the move in the exploded format
     * @param sb the string builder to use
     */
    const writeMove = function(move:PgnReaderMove|undefined|null, sb) {
        if (move === null || move === undefined) {
            return
        }
        writeCommentMove(move, sb)
        writeMoveNumber(move, sb)
        writeNotation(move, sb)
        //write_check_or_mate(move, sb)    // not necessary if san from chess.src is used
        writeNAGs(move, sb)
        writeCommentAfter(move, sb)
        writeCommentDiag(move, sb)
        writeVariations(move, sb)
        const next = getNextMove(move)
        writeMove(next, sb)
    }

    const writeEndGame = function(game:PgnGame, sb) {
        if ( (game.tags !== undefined) && ('Result' in game.tags) ) {
            prependSpace(sb)
            sb.append(game.tags['Result'])
        }
    }

    function writeTags(game, sb) {
        function writeTag(key, value, _sb) {
            if (value) {
                let _v
                if (typeof value === "string") {
                    if (value.length > 0) {
                        _v = value
                    } else { return }
                } else if (typeof value === "object") {
                    _v = value.value
                } else {
                    _v = value
                }
                _sb.append('[').append(key).append(' ').append('"').append(_v).append('"').append("]\n")
            }
        }
        function consumeTag(key, tags, _sb) {
            writeTag(key, tags.get(key), _sb)
            tags.delete(key)
        }

        if (configuration.tags && (configuration.tags == "no")) {
            return
        }
        if ((game.tags) && (Object.keys(game.tags).length)) {
            let _tags:Map<string, any> = new Map(Object.entries(game.tags))
            _tags.delete("messages")    // workaround for internal working of pgn-parser
            "Event Site Date Round White Black Result".split(' ').forEach(
                value => consumeTag(value, _tags, sb))
            _tags.forEach(function (value, key) {
                writeTag(key, value, sb)
            })
            sb.append("\n")
        }
    }

    const writePgn2 = function(game:PgnGame, move:PgnReaderMove, sb) {
        writeTags(game, sb)
        writeGameComment(game, sb)
        writeMove(move, sb)
        writeEndGame(game, sb)
        return sb.toString()
    }

    const sb = new StringBuilder()
    let indexFirstMove = 0
    return writePgn2(game, getMove(indexFirstMove), sb)
}

// Initializes a new instance of the StringBuilder class
// and appends the given value if supplied
export class StringBuilder {
    strings: string[] = new Array("")
    constructor(value: string = "") {
        this.append(value)
    }
    // Appends the given value to the end of this instance.
    append(value: string|any):StringBuilder {
        if (! value) {
            return this
        }
        if (typeof value === "string") {
            this.strings.push(value)
        } else {
            this.strings.push(value.toString())
        }
        return this
    }

    // Return true if the receiver is empty. Don't compute length!!
    isEmpty():boolean {
        for (let i = 0; i < this.strings.length; i++) {
            if (this.strings[i].length > 0) {
                return false
            }
        }
        return true
    }

    // Return the last character (as string) of the receiver.
    // Return null if none is found
    lastChar():string|null {
        if (this.strings.length === 0) {
            return null
        }
        return this.strings[this.strings.length - 1].slice(-1)
    }

    // Converts this instance to a String.
    toString() {
        return this.strings.join("")
    }

}