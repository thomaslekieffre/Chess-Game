"use client";

import { useSearchParams } from "next/navigation";
import { ChessBoard } from "@/components/chess/board";
import { Card } from "@/components/ui/card";
import { useEffect, useState, useRef } from "react";
import { GameStatus } from "./game-status";
import { GameMessages } from "./game-messages";
import { useGameState } from "@/hooks/useGameState";
import { PieceColor } from "@/lib/chess/types";
import { getOppositeColor } from "@/lib/chess/utils";

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

  return (
    <main className="min-h-screen pt-20 bg-background">
      <div className="container">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-8 items-start">
          <GameStatus
            whiteTime={whiteTime}
            blackTime={blackTime}
            isCheckmate={isCheckmate}
            isCheck={isCheck}
            isStalemate={isStalemate}
            currentTurn={currentTurn}
            onResign={() => {
              setIsGameOver(true);
              setIsResigned(true);
              setWinner(getOppositeColor(currentTurn));
            }}
            winner={winner}
            isGameOver={isGameOver}
            onOfferDraw={handleOfferDraw}
            drawOffer={drawOffer}
            onAcceptDraw={handleAcceptDraw}
            onDeclineDraw={handleDeclineDraw}
            playerColor={playerColor}
          />

          <div className="w-[800px]">
            <ChessBoard
              className="w-full"
              onMove={(from, to) => {
                engine.move(from, to);
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

          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold">Joueur Blanc</h3>
                <p className="text-sm text-muted-foreground">922</p>
              </div>
              <div className="text-2xl font-mono">{formatTime(whiteTime)}</div>
            </div>
          </Card>
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
