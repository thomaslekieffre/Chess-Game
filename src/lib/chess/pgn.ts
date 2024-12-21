export function convertToPGN(moves: { from: { x: number; y: number }; to: { x: number; y: number }; captured?: boolean }[]): string {
    const pieceSymbols: Record<string, string> = {
        'pawn': '',
        'rook': 'R',
        'knight': 'N',
        'bishop': 'B',
        'queen': 'Q',
        'king': 'K',
    };

    let pgn = '';
    moves.forEach((move, index) => {
        const from = move.from;
        const to = move.to;

        // Convertir les coordonnées en notation échiquéenne
        const fromSquare = String.fromCharCode(97 + from.x) + (8 - from.y);
        const toSquare = String.fromCharCode(97 + to.x) + (8 - to.y);

        // Ajouter le coup à la notation PGN
        const piece = pieceSymbols['pawn'] || ''; // Pour les pions, on ne met rien
        const moveNotation = `${piece}${toSquare}`;

        // Ajouter un espace pour séparer les coups
        pgn += (index % 2 === 0 ? `${Math.floor(index / 2) + 1}. ` : '') + moveNotation + ' ';
    });

    return pgn.trim();
}

export function convertPGNToMoves(pgn: string): { from: { x: number; y: number }; to: { x: number; y: number } }[] {
    const moves: { from: { x: number; y: number }; to: { x: number; y: number } }[] = [];
    const moveStrings = pgn.split(' ').filter(move => move.length > 0);

    moveStrings.forEach(move => {
        const toSquare = move.slice(-2); // Les deux derniers caractères représentent la case de destination
        const fromSquare = move.length > 2 ? move.slice(0, -2) : ''; // Si le coup est un coup de pièce, on enlève la case de destination

        const toX = toSquare.charCodeAt(0) - 97; // Convertir 'a' à 'h' en 0 à 7
        const toY = 8 - parseInt(toSquare[1]); // Convertir '1' à '8' en 7 à 0

        // Pour les mouvements de pièces, vous pouvez ajouter une logique pour déterminer la case de départ
        // Ici, nous supposons que la case de départ est connue ou calculée d'une autre manière
        const fromX = 0; // Remplacez par la logique pour déterminer la case de départ
        const fromY = 0; // Remplacez par la logique pour déterminer la case de départ

        moves.push({
            from: { x: fromX, y: fromY },
            to: { x: toX, y: toY }
        });
    });

    return moves;
}