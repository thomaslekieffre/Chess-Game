"use client";

import { useSearchParams } from "next/navigation";
import { ChessBoard } from "@/components/chess/board";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flag, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

export function GameContent() {
  const searchParams = useSearchParams();
  const timeInMinutes = parseInt(searchParams.get("time") || "3");
  const [whiteTime, setWhiteTime] = useState(timeInMinutes * 60);
  const [blackTime, setBlackTime] = useState(timeInMinutes * 60);
  const [currentTurn, setCurrentTurn] = useState<"white" | "black">("white");

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentTurn === "white") {
        setWhiteTime((prev) => Math.max(0, prev - 1));
      } else {
        setBlackTime((prev) => Math.max(0, prev - 1));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTurn]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <main className="min-h-screen pt-20 bg-background">
      <div className="container">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-8 items-start">
          {/* Joueur Noir */}
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold">Joueur Noir</h3>
                <p className="text-sm text-muted-foreground">850</p>
              </div>
              <div className="text-2xl font-mono">{formatTime(blackTime)}</div>
            </div>
          </Card>

          {/* Échiquier */}
          <div className="w-[800px]">
            <ChessBoard
              className="w-full"
              onMove={() =>
                setCurrentTurn((prev) => (prev === "white" ? "black" : "white"))
              }
            />
            <div className="flex justify-center gap-4 mt-4">
              <Button variant="outline" size="lg">
                <Flag className="mr-2" />
                Abandonner
              </Button>
              <Button variant="outline" size="lg">
                <RotateCcw className="mr-2" />
                Proposer nulle
              </Button>
            </div>
          </div>

          {/* Joueur Blanc */}
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
    </main>
  );
}
