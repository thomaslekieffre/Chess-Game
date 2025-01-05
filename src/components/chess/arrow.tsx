import { Position } from "@/lib/chess/types";
import React from "react";

interface ArrowProps {
  from: Position;
  to: Position;
  color?: string;
}

const Arrow: React.FC<ArrowProps> = ({ from, to, color = "red" }) => {
  const arrowId = `arrowhead-${from.x}-${from.y}-${to.x}-${to.y}`;

  // Calculer les coordonnées en pourcentage pour le centre exact de chaque case
  const x1 = from.x * 12.5 + 6.25;
  const y1 = (7 - from.y) * 12.5 + 6.25;
  const x2 = to.x * 12.5 + 6.25;
  const y2 = (7 - to.y) * 12.5 + 6.25;

  // Calculer l'angle de la flèche
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

  // Ajuster la longueur de la flèche
  const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  const shortenedLength = length - 2; // Réduire légèrement pour que la flèche ne dépasse pas trop

  // Calculer le point d'arrivée ajusté
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
        transform: "scale(1, -1)",
        transformOrigin: "center",
      }}
    >
      <defs>
        <marker
          id={arrowId}
          markerWidth="15"
          markerHeight="10"
          refX="12"
          refY="5"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <polygon points="0 0, 15 5, 0 10" fill={color} />
        </marker>
      </defs>

      <line
        x1={`${x1}%`}
        y1={`${y1}%`}
        x2={`${endX}%`}
        y2={`${endY}%`}
        stroke={color}
        strokeWidth="3"
        markerEnd={`url(#${arrowId})`}
      />
    </svg>
  );
};

export default Arrow;
