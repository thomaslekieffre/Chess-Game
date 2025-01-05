import { Position } from "@/lib/chess/types";
import React from "react";

interface ArrowProps {
  from: Position;
  to: Position;
  color?: string;
}

const Arrow: React.FC<ArrowProps> = ({ from, to, color = "red" }) => {
  // Calculer les coordonnées en pourcentage pour le centre de chaque case
  const x1 = from.x * 12.5 + 6.25;
  const y1 = from.y * 12.5 + 6.25;
  const x2 = to.x * 12.5 + 6.25;
  const y2 = to.y * 12.5 + 6.25;

  // Calculer l'angle de la flèche
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

  // Ajuster la longueur de la flèche pour qu'elle commence au centre de la case
  const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  const shortenedLength = length - 6; // Réduire la longueur pour que la flèche s'arrête avant le bord de la case

  const endX = x1 + shortenedLength * Math.cos((angle * Math.PI) / 180);
  const endY = y1 + shortenedLength * Math.sin((angle * Math.PI) / 180);

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      <defs>
        <marker
          id={`arrowhead-${color}`}
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill={color} fillOpacity="0.6" />
        </marker>
      </defs>

      <line
        x1={`${x1}%`}
        y1={`${y1}%`}
        x2={`${endX}%`}
        y2={`${endY}%`}
        stroke={color}
        strokeWidth="3"
        strokeOpacity="0.6"
        markerEnd={`url(#arrowhead-${color})`}
      />
    </svg>
  );
};

export default Arrow;
