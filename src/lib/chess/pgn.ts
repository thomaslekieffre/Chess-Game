import { PieceType } from "../../types/chess";

export function convertToPGN(
  moves: {
    from: { x: number; y: number };
    to: { x: number; y: number };
    piece?: { type: string; color: string };
    captured?: PieceType | undefined;
  }[]
): string {
  const pieceSymbols: Record<string, string> = {
    pawn: "",
    rook: "R",
    knight: "N",
    bishop: "B",
    queen: "Q",
    king: "K",
  };

  console.log(moves);

  let pgn = "";
  moves.forEach((move, index) => {
    const from = move.from;
    const to = move.to;
    const piece = move.piece;

    // Convertir les coordonnées en notation échiquéenne
    const fromSquare = String.fromCharCode(97 + from.x) + (8 - from.y);
    const toSquare = String.fromCharCode(97 + to.x) + (8 - to.y);

    // Construire la notation du coup
    let moveNotation = "";

    // Ajouter le symbole de la pièce
    if (piece && piece.type !== "pawn") {
      moveNotation += pieceSymbols[piece.type];
    }

    // Ajouter la case de départ si nécessaire (pour les ambiguïtés)
    if (
      piece &&
      piece.type !== "pawn" &&
      moves.some(
        (otherMove) =>
          otherMove !== move &&
          otherMove.piece?.type === piece.type &&
          otherMove.piece?.color === piece.color &&
          otherMove.to.x === to.x &&
          otherMove.to.y === to.y
      )
    ) {
      moveNotation += fromSquare;
    }

    // Ajouter le 'x' pour les captures
    console.log(move, move.captured);
    if (move.captured) {
      // Pour les pions, on ajoute la colonne de départ
      if (!piece || piece.type === "pawn") {
        moveNotation += String.fromCharCode(97 + from.x);
      }
      moveNotation += "x";
    }

    // Ajouter la case d'arrivée
    moveNotation += toSquare;

    // Ajouter le numéro du coup et l'espace
    pgn +=
      (index % 2 === 0 ? `${Math.floor(index / 2) + 1}. ` : "") +
      moveNotation +
      " ";
  });

  return pgn.trim();
}
