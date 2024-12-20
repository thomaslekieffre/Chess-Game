"use client";

import { useSearchParams } from "next/navigation";
import { ChessBoard } from "@/components/chess/board";
import { useEffect, useState, useRef } from "react";
import { GameMessages } from "./game-messages";
import { useGameState } from "@/hooks/useGameState";
import { PieceColor, Position } from "@/lib/chess/types";
import { getOppositeColor } from "@/lib/chess/utils";
import { PlayerCard } from "@/components/chess/player-card";
import { GameControls } from "@/components/chess/game-controls";
import { MovesHistory } from "@/components/chess/moves-history";
import { GameChat } from "@/components/chess/game-chat";
import { Button } from "@/components/ui/button";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

export function GameContent() {
  const searchParams = useSearchParams();
  const timeInMinutes = parseInt(searchParams.get("time") || "3");
  const [whiteTime, setWhiteTime] = useState(timeInMinutes * 60);
  const [blackTime, setBlackTime] = useState(timeInMinutes * 60);
  const {
    currentTurn,
    isCheck,
    isCheckmate,
    winner,
    isGameOver,
    engine,
    setWinner,
    setIsGameOver,
    setIsCheck,
    setIsCheckmate,
    setCurrentTurn,
    isDraw,
    setIsDraw,
    setDrawReason,
    isStalemate,
    setIsStalemate,
  } = useGameState();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isResigned, setIsResigned] = useState(false);
  const [drawOffer, setDrawOffer] = useState<PieceColor>();
  const playerColor: PieceColor = "white";
  const [isTimeOut, setIsTimeOut] = useState(false);

  useEffect(() => {
    if (isGameOver) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      return;
    }

    const interval = setInterval(() => {
      if (currentTurn === "white") {
        setWhiteTime((prev) => {
          if (prev <= 0) {
            setIsGameOver(true);
            setIsTimeOut(true);
            setWinner(getOppositeColor(currentTurn));
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 0) {
            setIsGameOver(true);
            setIsTimeOut(true);
            setWinner(getOppositeColor(currentTurn));
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    timerRef.current = interval;

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentTurn, isGameOver, setIsGameOver, setWinner]);

  useEffect(() => {
    socket.on("move", (data) => {
      console.log("Mouvement reçu:", data);

      // Appliquer le mouvement reçu
      const { from, to } = data;
      const success = engine.makeMove(from, to);

      if (success) {
        const engineState = engine.getGameState();
        setIsCheck(engineState.isCheck);
        setIsCheckmate(engineState.isCheckmate);
        setIsStalemate(engineState.isStalemate);
        setCurrentTurn(engineState.currentTurn);

        if (engineState.isCheckmate || engineState.isStalemate) {
          setIsGameOver(true);
          if (engineState.isCheckmate) {
            setWinner(getOppositeColor(currentTurn));
          }
        }
      } else {
        console.error("Le mouvement n'est pas valide.");
      }
    });

    return () => {
      socket.off("move");
    };
  }, [
    currentTurn,
    engine,
    setIsCheck,
    setIsCheckmate,
    setIsStalemate,
    setCurrentTurn,
    setIsGameOver,
    setWinner,
  ]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleOfferDraw = () => {
    engine.offerDraw(currentTurn);
    setDrawOffer(currentTurn);
  };

  const handleAcceptDraw = () => {
    engine.acceptDraw();
    setIsGameOver(true);
    setIsDraw(true);
    setDrawReason("mutual-agreement");
  };

  const handleDeclineDraw = () => {
    engine.declineDraw();
    setDrawOffer(undefined);
  };

  const handleMove = (from: Position, to: Position) => {
    socket.emit("move", { from, to });
    // Gérer le mouvement localement
  };

  return (
    <main className="min-h-screen bg-background overflow-hidden">
      <div className="container max-w-[1600px] mx-auto px-4 h-full">
        {/* Header de la partie */}
        <div className="py-6 mb-8 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Partie Classique</h1>
              <p className="text-muted-foreground">
                {timeInMinutes} minutes par joueur
              </p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" size="sm">
                Copier le lien
              </Button>
              <Button variant="outline" size="sm">
                Quitter la partie
              </Button>
            </div>
          </div>
        </div>

        {/* Layout principal */}
        <div className="grid grid-cols-[250px_1fr_250px] gap-4">
          {/* Panneau gauche */}
          <div className="space-y-4">
            <PlayerCard
              name="Joueur Noir"
              rating={850}
              time={formatTime(blackTime)}
              color="black"
              isCurrentTurn={currentTurn === "black"}
            />
            <GameControls
              onResign={() => {
                setIsGameOver(true);
                setIsResigned(true);
                setWinner(getOppositeColor(currentTurn));
              }}
              onOfferDraw={handleOfferDraw}
              drawOffer={drawOffer}
              onAcceptDraw={handleAcceptDraw}
              onDeclineDraw={handleDeclineDraw}
              playerColor={playerColor}
              isGameOver={isGameOver}
            />
          </div>

          {/* Zone centrale avec l'échiquier */}
          <div className="flex flex-col items-center">
            <ChessBoard
              className="w-full max-w-[1000px]"
              onMove={(from, to) => {
                handleMove(from, to);
                const engineState = engine.getGameState();
                setIsCheck(engineState.isCheck);
                setIsCheckmate(engineState.isCheckmate);
                setIsStalemate(engineState.isStalemate);
                setCurrentTurn(engineState.currentTurn);

                if (engineState.isCheckmate || engineState.isStalemate) {
                  setIsGameOver(true);
                  if (engineState.isCheckmate) {
                    setWinner(getOppositeColor(currentTurn));
                  }
                }
              }}
            />
          </div>

          {/* Panneau droit */}
          <div className="space-y-4">
            <PlayerCard
              name="Joueur Blanc"
              rating={922}
              time={formatTime(whiteTime)}
              color="white"
              isCurrentTurn={currentTurn === "white"}
            />
            <MovesHistory
              moves={engine.getMoves()}
              className="h-[calc(100vh-400px)]"
            />
            <GameChat className="h-[200px]" />
          </div>
        </div>
      </div>

      <GameMessages
        isCheck={isCheck}
        isCheckmate={isCheckmate}
        isStalemate={isStalemate}
        isDraw={isDraw}
        currentTurn={currentTurn}
        winner={winner}
        isResigned={isResigned}
        isTimeOut={isTimeOut}
      />
    </main>
  );
}
