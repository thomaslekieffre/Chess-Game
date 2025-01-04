import { Position } from "@/lib/chess/types";
import React from "react";

interface ArrowProps {
  from: Position;
  to: Position;
  color?: string;
}

const Arrow: React.FC<ArrowProps> = ({ from, to, color = "red" }) => {
  const x1 = from.x * 100;
  const y1 = from.y * 100;
  const x2 = to.x * 100;
  const y2 = to.y * 100;

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
      <line
        x1={x1 + 50}
        y1={y1 + 50}
        x2={x2 + 50}
        y2={y2 + 50}
        stroke={color}
        strokeWidth="4"
        markerEnd={`url(#arrowhead-${color})`}
      />
      <defs>
        <marker
          id={`arrowhead-${color}`}
          markerWidth="10"
          markerHeight="7"
          refX="0"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill={color} />
        </marker>
      </defs>
    </svg>
  );
};

export default Arrow;
