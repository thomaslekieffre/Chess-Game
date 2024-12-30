import { cn } from "@/lib/utils";
import { Card } from "../ui/card";
import { Move, PgnMove } from "@/lib/chess/types";

interface MovesHistoryProps {
  moves: PgnMove[];
  className?: string;
  maxMoves?: number;
  setDisplayedMove:Function;
  displayedMove:number
}


export function MovesHistory({
  moves,
  className,
  maxMoves = 10,
  setDisplayedMove,
  displayedMove,
}: MovesHistoryProps) {
  // const movesOnScreen = moves.slice(-maxMoves);

  return (
    <Card className={cn("p-4", className)}>
      <h3 className="font-semibold mb-4">
        Historique des coups 
        {/* ({moves.length}) */}
        {/* a : {displayedMove} */}
      </h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        {moves.map((move, index) => (
          <button
            key={index}
            style={{background:displayedMove==index?'red':''}}
            className={cn(
              "p-2 rounded",
              index % 2 === 0 ? "bg-muted" : "bg-background"
            )}
            onClick={()=>{
              setDisplayedMove(index)
            }}
          >
            {move.turnNumber}. {move.notation.notation}
          </button>
        ))}
      </div>
    </Card>
  );
}
