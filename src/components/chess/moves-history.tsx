import { cn } from "@/lib/utils";
import { Card } from "../ui/card";
import { Move } from "@/lib/chess/types";

interface MovesHistoryProps {
  moves: Move[];
  className?: string;
  maxMoves?: number;
}

function formatMove(move: Move): string {
  const notation = `${move.from.x},${move.from.y} → ${move.to.x},${move.to.y}`;
  if (move.captured) return `${notation} (capture)`;
  if (move.isCastling) return move.isCastling === "kingside" ? "O-O" : "O-O-O";
  return notation;
}

export function MovesHistory({
  moves,
  className,
  maxMoves = 10,
}: MovesHistoryProps) {
  const displayedMoves = moves.slice(-maxMoves);

  return (
    <Card className={cn("p-4", className)}>
      <h3 className="font-semibold mb-4">
        Historique des coups ({moves.length})
      </h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        {displayedMoves.map((move, index) => (
          <div
            key={index}
            className={cn(
              "p-2 rounded",
              index % 2 === 0 ? "bg-muted" : "bg-background"
            )}
          >
            {moves.length - maxMoves + index + 1}. {formatMove(move)}
          </div>
        ))}
      </div>
    </Card>
  );
}
