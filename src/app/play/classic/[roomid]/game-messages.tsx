interface GameMessagesProps {
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  drawReason?:
    | "stalemate"
    | "insufficient-material"
    | "threefold-repetition"
    | "fifty-moves"
    | "mutual-agreement";
  currentTurn: "white" | "black";
  winner: "white" | "black" | null;
  isResigned: boolean;
  isTimeOut?: boolean;
}

export function GameMessages({
  isCheck,
  isCheckmate,
  isStalemate,
  isDraw,
  drawReason,
  currentTurn,
  winner,
  isResigned,
  isTimeOut,
}: GameMessagesProps) {
  if (
    !isCheck &&
    !isCheckmate &&
    !isResigned &&
    !isDraw &&
    !isStalemate &&
    !isTimeOut
  )
    return null;

  const getDrawMessage = () => {
    switch (drawReason) {
      case "stalemate":
        return "Pat ! La partie est nulle.";
      case "insufficient-material":
        return "Matériel insuffisant ! La partie est nulle.";
      case "threefold-repetition":
        return "Triple répétition ! La partie est nulle.";
      case "fifty-moves":
        return "Règle des 50 coups ! La partie est nulle.";
      case "mutual-agreement":
        return "Nulle par accord mutuel.";
      default:
        return "La partie est nulle.";
    }
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
      <div className="bg-background/90 border-2 rounded-lg p-4 shadow-lg">
        {isCheck && !isCheckmate && !isResigned && (
          <div className="text-xl text-yellow-500 font-bold animate-pulse">
            Le roi {currentTurn === "white" ? "blanc" : "noir"} est en échec !
          </div>
        )}
        {isCheckmate && !isResigned && (
          <div className="text-xl text-red-500 font-bold animate-pulse">
            Le roi {currentTurn === "white" ? "blanc" : "noir"} est mat !
            <br />
            Victoire des {currentTurn === "white" ? "noirs" : "blancs"} !
          </div>
        )}
        {isResigned && (
          <div className="text-xl text-red-500 font-bold animate-pulse">
            Victoire des {winner === "white" ? "blancs" : "noirs"} par abandon !
          </div>
        )}
        {(isDraw || isStalemate) && (
          <div className="text-xl text-blue-500 font-bold animate-pulse">
            {getDrawMessage()}
          </div>
        )}
        {isTimeOut && (
          <div className="text-xl text-red-500 font-bold animate-pulse">
            Victoire des {winner === "white" ? "blancs" : "noirs"} par le temps
            !
          </div>
        )}
      </div>
    </div>
  );
}
