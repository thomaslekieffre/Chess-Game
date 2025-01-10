import { ChessBoard } from "./board";
import { ChessEngine } from "@/lib/chess/engine";
import { useState, useEffect } from "react";
import { PgnMove, Position } from "@/lib/chess/types";
import { MovesHistory } from "./moves-history";

interface AnalysisBoardProps {
  initialFen?: string;
  className?: string;
}

export function AnalysisBoard({
  initialFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  className,
}: AnalysisBoardProps) {
  const [engine] = useState(() => new ChessEngine(initialFen));
  const [board, setBoard] = useState(engine.getBoard());
  const [currentVariation, setCurrentVariation] = useState<PgnMove[]>([]);
  const [variations, setVariations] = useState<PgnMove[][]>([]);
  const [displayedMove, setDisplayedMove] = useState(0);
  const [movesList, setMovesList] = useState<PgnMove[]>([]);
  const [flipped, setFlipped] = useState(false);

  // Synchroniser displayedMove avec la liste des coups
  useEffect(() => {
    if (movesList.length > 0) {
      const newIndex = movesList.length - 1;
      engine.setDisplayedMove(newIndex);
      setDisplayedMove(newIndex);
    }
  }, [movesList, engine]);

  useEffect(() => {
    updateGameState();
  }, []);

  const updateGameState = () => {
    const moves = engine.getStrMove();
    setBoard(engine.getBoard());
    setMovesList(moves);
    engine.setDisplayedMove(moves.length - 1);
    setDisplayedMove(moves.length - 1);
  };

  const handleMove = (from: Position, to: Position) => {
    // Si nous sommes en train de regarder un coup précédent
    if (displayedMove < movesList.length - 1) {
      // Créer une nouvelle variante
      const currentPosition = displayedMove;
      const success = engine.makeMove(from, to);

      if (success) {
        const moves = engine.getStrMove();
        const newMove = moves[moves.length - 1];
        const baseVariation = movesList.slice(0, currentPosition + 1);
        const newVariation = [...baseVariation, newMove];

        setVariations([...variations, newVariation]);
        setCurrentVariation(newVariation);
        setBoard(engine.getBoard());
        setMovesList(moves);
      }
    } else {
      // Continuer la ligne principale
      const success = engine.makeMove(from, to);

      if (success) {
        const moves = engine.getStrMove();
        setBoard(engine.getBoard());
        setMovesList(moves);
      }
    }
  };

  const handleMoveClick = (index: number) => {
    engine.setDisplayedMove(index);
    setDisplayedMove(index);
    setBoard(engine.getBoard());
  };

  const handleVariationClick = (variation: PgnMove[]) => {
    // Réinitialiser le moteur
    engine.resetToPosition(initialFen);

    // Rejouer tous les coups de la variante
    for (const move of variation) {
      const from = { x: parseInt(move.from[0]), y: parseInt(move.from[1]) };
      const to = { x: parseInt(move.to[0]), y: parseInt(move.to[1]) };
      engine.makeMove(from, to);
    }

    setCurrentVariation(variation);
    setMovesList(variation);
    setBoard(engine.getBoard());
    setDisplayedMove(variation.length - 1);
  };

  const exportPGN = () => {
    return engine.exportPGN();
  };

  const exportFEN = () => {
    return engine.getFEN();
  };

  return (
    <div className={`flex flex-col md:flex-row gap-4 ${className}`}>
      <div className="flex-1">
        <div className="flex justify-between mb-2">
          <button
            onClick={() => {
              engine.resetToPosition(initialFen);
              setCurrentVariation([]);
              setVariations([]);
              setMovesList([]);
              setDisplayedMove(0);
              updateGameState();
            }}
            className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            Réinitialiser
          </button>
          <button
            onClick={() => setFlipped(!flipped)}
            className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            Retourner l&apos;échiquier
          </button>
        </div>
        <ChessBoard
          board={board}
          setBoard={setBoard}
          engine={engine}
          onMove={handleMove}
          isPlaying={true}
          playerColor={flipped ? "black" : "white"}
          displayed={displayedMove}
          list={movesList}
          allowAllMoves={true}
        />
      </div>

      <div className="w-64 flex flex-col gap-4">
        <MovesHistory
          moves={movesList}
          displayedMove={displayedMove}
          setDisplayedMove={handleMoveClick}
          variations={variations}
          onVariationClick={handleVariationClick}
          currentVariation={currentVariation}
        />

        <div className="flex gap-2">
          <button
            onClick={() => console.log(exportPGN())}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Exporter PGN
          </button>
          <button
            onClick={() => console.log(exportFEN())}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Exporter FEN
          </button>
        </div>
      </div>
    </div>
  );
}
