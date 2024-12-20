import { PieceColor } from "@/lib/chess/types";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Flag, RotateCcw } from "lucide-react";

interface GameControlsProps {
  onResign: () => void;
  onOfferDraw: () => void;
  drawOffer?: PieceColor;
  onAcceptDraw: () => void;
  onDeclineDraw: () => void;
  playerColor: PieceColor;
  isGameOver: boolean;
}

export function GameControls({
  onResign,
  onOfferDraw,
  drawOffer,
  onAcceptDraw,
  onDeclineDraw,
  playerColor,
  isGameOver,
}: GameControlsProps) {
  if (isGameOver) return null;

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <Button variant="destructive" className="w-full" onClick={onResign}>
          <Flag className="mr-2" />
          Abandonner
        </Button>

        {drawOffer && drawOffer !== playerColor ? (
          <div className="space-y-2">
            <Button variant="outline" className="w-full" onClick={onAcceptDraw}>
              Accepter la nulle
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={onDeclineDraw}
            >
              Refuser la nulle
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={onOfferDraw}
            disabled={!!drawOffer}
          >
            <RotateCcw className="mr-2" />
            Proposer nulle
          </Button>
        )}
      </div>
    </Card>
  );
}
