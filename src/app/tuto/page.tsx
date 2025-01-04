"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomBoard } from "@/components/chess/custom-board";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { importFEN } from "@/lib/chess/pgn/pgn2";
import { Position } from "@/lib/chess/types";

interface Tutorial {
  title: string;
  description: string;
  position: string;
  highlightSquares: string[];
  task?: string;
  validMoves?: string[];
  startingSquare?: string;
  animatedPiece?: {
    from: string;
    to: string;
  };
}

const tutorials: Tutorial[] = [
  {
    title: "Le Pion",
    description:
      "Le pion se déplace d'une case vers l'avant. Lors de son premier coup, il peut avancer de deux cases.",
    position: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    highlightSquares: ["e2", "e3", "e4"],
    task: "Déplacez le pion en e2 vers e4",
    validMoves: ["e2e4"],
    startingSquare: "e2",
  },
  {
    title: "La Tour",
    description:
      "La tour se déplace horizontalement ou verticalement, d'autant de cases qu'elle veut.",
    position: "8/8/8/8/8/8/8/R7 w - - 0 1",
    highlightSquares: [
      "a2",
      "a3",
      "a4",
      "a5",
      "a6",
      "a7",
      "a8",
      "b1",
      "c1",
      "d1",
      "e1",
      "f1",
      "g1",
      "h1",
    ],
    task: "Déplacez la tour en a1 vers a8",
    validMoves: ["a1a8"],
    startingSquare: "a1",
  },
  {
    title: "Le Fou",
    description:
      "Le fou se déplace en diagonale, d'autant de cases qu'il veut.",
    position: "8/8/8/8/8/8/8/B7 w - - 0 1",
    highlightSquares: ["b2", "c3", "d4", "e5", "f6", "g7", "h8"],
    task: "Déplacez le fou en a1 vers h8",
    validMoves: ["a1h8"],
    startingSquare: "a1",
  },
  {
    title: "Le Cavalier",
    description:
      "Le cavalier se déplace en forme de L : 2 cases dans une direction puis 1 case perpendiculairement.",
    position: "8/8/8/8/8/8/8/N7 w - - 0 1",
    highlightSquares: ["b3", "c2"],
    task: "Déplacez le cavalier en a1 vers c2",
    validMoves: ["a1c2"],
    startingSquare: "a1",
  },
  {
    title: "La Dame",
    description:
      "La dame combine les mouvements de la tour et du fou. Elle peut se déplacer horizontalement, verticalement et en diagonale.",
    position: "8/8/8/8/8/8/8/Q7 w - - 0 1",
    highlightSquares: [
      "a1",
      "a2",
      "a3",
      "a4",
      "a5",
      "a6",
      "a7",
      "a8",
      "b1",
      "c1",
      "d1",
      "e1",
      "f1",
      "g1",
      "h1",
      "b2",
      "c3",
      "d4",
      "e5",
      "f6",
      "g7",
      "h8",
    ],
    task: "Déplacez la dame en a1 vers h8",
    validMoves: ["a1h8"],
    startingSquare: "a1",
  },
  {
    title: "Le Roi",
    description:
      "Le roi se déplace d'une seule case dans toutes les directions. Il doit toujours être protégé car s'il est en échec et mat, la partie est perdue.",
    position: "8/8/8/8/8/8/8/K7 w - - 0 1",
    highlightSquares: ["a2", "b2", "b1"],
    task: "Déplacez le roi en a1 vers a2",
    validMoves: ["a1a2"],
    startingSquare: "a1",
  },
];

export default function TutorialPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [board, setBoard] = useState(() => {
    const fenBoard = importFEN(tutorials[currentStep].position).board;
    return fenBoard.map((row) =>
      row.map((piece) => ({
        style: [],
        piece: piece
          ? {
              color: piece.color,
              name: piece.type,
            }
          : undefined,
      }))
    );
  });
  const [animatedPiece, setAnimatedPiece] = useState<{
    from: Position;
    to: Position;
  } | null>(null);

  const nextStep = () => {
    if (success) {
      if (currentStep < tutorials.length - 1) {
        setCurrentStep(currentStep + 1);
        const fenBoard = importFEN(tutorials[currentStep + 1].position).board;
        setBoard(
          fenBoard.map((row) =>
            row.map((piece) => ({
              style: [],
              piece: piece
                ? {
                    color: piece.color,
                    name: piece.type,
                  }
                : undefined,
            }))
          )
        );
        setSuccess(false);
        setErrorMessage(null);
      }
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      const fenBoard = importFEN(tutorials[currentStep - 1].position).board;
      setBoard(
        fenBoard.map((row) =>
          row.map((piece) => ({
            style: [],
            piece: piece
              ? {
                  color: piece.color,
                  name: piece.type,
                }
              : undefined,
          }))
        )
      );
    }
  };

  const handleSquareClick = (pos: Position) => {
    const coord = `${String.fromCharCode(97 + pos.x)}${8 - pos.y}`;

    if (!selectedSquare) {
      if (coord === tutorials[currentStep].startingSquare) {
        setSelectedSquare(coord);
      }
      return;
    }

    const move = `${selectedSquare}${coord}`;
    if (tutorials[currentStep].validMoves?.includes(move)) {
      const fromPosition = {
        x: selectedSquare.charCodeAt(0) - 97,
        y: 8 - parseInt(selectedSquare[1]),
      };

      const piece = board[fromPosition.y][fromPosition.x]?.piece;
      if (!piece) return;

      const movingPiece = { ...piece };

      setAnimatedPiece({
        from: fromPosition,
        to: pos,
      });

      const newBoard = [...board];
      newBoard[fromPosition.y][fromPosition.x] = {
        ...newBoard[fromPosition.y][fromPosition.x],
        piece: undefined,
      };
      newBoard[pos.y][pos.x] = {
        ...newBoard[pos.y][pos.x],
        piece: movingPiece,
      };

      setBoard(newBoard);

      setTimeout(() => {
        setAnimatedPiece(null);
        setSuccess(true);
        setErrorMessage(null);
      }, 500);
    } else {
      setErrorMessage("Mouvement invalide !, Réessayez l'objectif.");
    }
    setSelectedSquare(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/50">
      <div className="container max-w-7xl pt-20 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Panneau de gauche */}
            <Card className="flex-1 p-8 bg-background/80 backdrop-blur">
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">
                  Tutoriel d&apos;échecs
                </h1>
                <div className="h-1 w-20 bg-primary rounded"></div>
              </div>

              <h2 className="text-2xl font-semibold mb-4">
                {tutorials[currentStep].title}
              </h2>

              <p className="text-muted-foreground text-lg mb-6">
                {tutorials[currentStep].description}
              </p>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-lg mb-2">Objectif :</h3>
                <p className="text-primary/80">{tutorials[currentStep].task}</p>
              </div>

              {success && currentStep < tutorials.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-500/20 border border-green-500/30 text-green-600 p-6 rounded-lg"
                >
                  <h3 className="font-bold text-xl mb-2">Bravo !</h3>
                  <p>Vous avez réussi cet exercice.</p>
                </motion.div>
              )}

              {success && currentStep === tutorials.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-700/20 border border-green-700/30 text-green-600 p-6 rounded-lg"
                >
                  <h3 className="font-bold text-3xl mb-2 text-center">
                    🎉 Félicitations ! 🎉
                  </h3>
                  <p className="text-lg text-center">
                    Vous avez terminé le tutoriel avec brio ! 🌟
                  </p>
                  <p className="text-center mt-4">
                    Préparez-vous à conquérir le monde des échecs ! ♟️
                  </p>
                </motion.div>
              )}

              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-500/20 border border-red-500/30 text-red-600 p-6 rounded-lg"
                >
                  <h3 className="font-bold text-xl mb-2">Erreur !</h3>
                  <p>{errorMessage}</p>
                </motion.div>
              )}
            </Card>

            {/* Panneau de droite */}
            <Card className="lg:w-[600px] p-8 bg-background/80 backdrop-blur">
              <div className="mb-6">
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={previousStep}
                    disabled={currentStep === 0}
                    className="w-32"
                  >
                    <ChevronLeft className="mr-2" />
                    Précédent
                  </Button>
                  <span className="text-muted-foreground">
                    {currentStep + 1} / {tutorials.length}
                  </span>
                  <Button
                    variant="outline"
                    onClick={nextStep}
                    disabled={currentStep === tutorials.length - 1 || !success}
                    className="w-32"
                  >
                    Suivant
                    <ChevronRight className="ml-2" />
                  </Button>
                </div>
              </div>

              <CustomBoard
                size={8}
                board={board}
                highlightSquares={
                  selectedSquare
                    ? tutorials[currentStep].highlightSquares
                    : [tutorials[currentStep].startingSquare || ""]
                }
                readOnly={false}
                onSquareClick={handleSquareClick}
                className="w-full"
                animatedPiece={animatedPiece}
              />
            </Card>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
