import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flag, RotateCcw } from "lucide-react";
import { PieceColor } from "@/lib/chess/types";

interface GameStatusProps {
  whiteTime: number;
  blackTime: number;
  isCheckmate: boolean;
  isCheck: boolean;
  isStalemate: boolean;
  currentTurn: "white" | "black";
  onResign: () => void;
  winner: "white" | "black" | null;
  isGameOver: boolean;
  onOfferDraw: () => void;
  drawOffer?: PieceColor;
  onAcceptDraw: () => void;
  onDeclineDraw: () => void;
  playerColor: PieceColor;
}

export function GameStatus({
  whiteTime,
  blackTime,
  onResign,
  onOfferDraw,
  drawOffer,
  onAcceptDraw,
  onDeclineDraw,
  playerColor,
  isGameOver,
}: GameStatusProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="p-4">
      {/* Temps du joueur noir */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <h3 className="font-semibold">Joueur Noir</h3>
          <p className="text-sm text-muted-foreground">850</p>
        </div>
        <div className="text-2xl font-mono">{formatTime(blackTime)}</div>
      </div>

      {/* Boutons d'action */}
      {!isGameOver && (
        <div className="flex justify-center gap-4 mt-4">
          <Button variant="outline" size="lg" onClick={onResign}>
            <Flag className="mr-2" />
            Abandonner
          </Button>
          {drawOffer && drawOffer !== playerColor ? (
            <>
              <Button variant="outline" size="lg" onClick={onAcceptDraw}>
                Accepter la nulle
              </Button>
              <Button variant="outline" size="lg" onClick={onDeclineDraw}>
                Refuser la nulle
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="lg"
              onClick={onOfferDraw}
              disabled={!!drawOffer}
            >
              <RotateCcw className="mr-2" />
              Proposer nulle
            </Button>
          )}
        </div>
      )}

      {/* Temps du joueur blanc */}
      <div className="flex items-center gap-4 mt-4">
        <div className="flex-1">
          <h3 className="font-semibold">Joueur Blanc</h3>
          <p className="text-sm text-muted-foreground">922</p>
        </div>
        <div className="text-2xl font-mono">{formatTime(whiteTime)}</div>
      </div>
    </Card>
  );
}
