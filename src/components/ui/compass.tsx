import { Position } from "@/lib/chess/types";
import React, { useState } from "react";


const directions = [
  { angle: 0, direction: { x: 1, y: 0 }, label: "Est (0°)" },
  { angle: 45, direction: { x: 1, y: -1 }, label: "Nord-Est (45°)" },
  { angle: 90, direction: { x: 0, y: -1 }, label: "Nord (90°)" },
  { angle: 135, direction: { x: -1, y: -1 }, label: "Nord-Ouest (135°)" },
  { angle: 180, direction: { x: -1, y: 0 }, label: "Ouest (180°)" },
  { angle: 225, direction: { x: -1, y: 1 }, label: "Sud-Ouest (225°)" },
  { angle: 270, direction: { x: 0, y: 1 }, label: "Sud (270°)" },
  { angle: 315, direction: { x: 1, y: 1 }, label: "Sud-Est (315°)" },
];

type Props = {
  selectedDirection:Position;
  setSelectedDirection:(dir:Position)=>void;
}

export default function Compass({
  selectedDirection,
  setSelectedDirection,
}:Props) {
  // const [selectedDirection, setSelectedDirection] = useState<Direction>(directions[0].direction);

  const handleArrowClick = (angle: number) => {
    const direction = directions.find((d) => d.angle === angle)?.direction || directions[0].direction;
    setSelectedDirection(direction);
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Boussole Interactive</h3>
      <div style={styles.compassContainer}>
        <svg width="300" height="300" viewBox="-150 -150 300 300" style={styles.svg}>
          {directions.map((d, index) => {
            const angleRad = (d.angle * Math.PI) / 180;
            const arrowX = 100 * Math.cos(angleRad);
            const arrowY = 100 * Math.sin(angleRad);

            return (
              <g
                key={index}
                transform={`translate(${arrowX}, ${arrowY}) rotate(${d.angle})`}
                onClick={() => handleArrowClick(d.angle)}
                style={{ cursor: "pointer" }}
              >
                <polygon
                  points="-45,-20 40,0 -45,20"
                  fill={d.direction === selectedDirection ? "#74b9ff" : "#b2bec3"}
                  stroke="black"
                  strokeWidth="1"
                  style={styles.arrow}
                />
                <text
                  x="50"
                  y="4"
                  fontSize="12"
                  fill="black"
                  style={{ fontFamily: "Arial, sans-serif", pointerEvents: "none" }}
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <p style={styles.info}>
        Direction sélectionnée : <b>{directions.find((d) => d.direction === selectedDirection)?.label}</b>
      </p>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    fontSize: "24px",
    marginBottom: "20px",
    color: "#2d3436",
  },
  compassContainer: {
    position: "relative" as const,
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    overflow: "hidden",
  },
  svg: {
    cursor: "pointer",
  },
  arrow: {
    transition: "fill 0.3s ease",
  },
  info: {
    marginTop: "20px",
    fontSize: "16px",
    color: "#2d3436",
  },
};
