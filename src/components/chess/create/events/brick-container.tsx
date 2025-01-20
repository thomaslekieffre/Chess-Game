import React, { useRef } from "react";
import Brick from "@/components/chess/create/events/brick";
import type { BrickData } from "@/types/create";
import { Bricks } from "@/lib/create/bricksHandle";

interface BrickContainerProps {
  bricks:BrickData[];
  BricksEngine:Bricks;
  // moveBrick: (id: number, x: number, y: number) => void;
  // insertBrickToContainer: (brickId: number, targetBrick: BrickData, holeIndex: number) => void;
}

const BrickContainer: React.FC<BrickContainerProps> = ({
  bricks,
  BricksEngine,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const moveBrickWithinBounds = (id: number, x: number, y: number) => {
    if (!containerRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const brickSize = 100;

    const boundedX = Math.max(0, Math.min(x, container.width - brickSize));
    const boundedY = Math.max(0, Math.min(y, container.height - brickSize));

    BricksEngine.moveBrick(id, boundedX, boundedY);
  };

  const rootBricks = bricks.filter((brick) => brick.parent === null);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "900px",
        height: "700px",
        border: "2px solid #000",
        backgroundColor: "#f9f9f9",
        overflow: "hidden",
      }}
    >
      {rootBricks.map((brick,i) => {
        return (
          <Brick
            bricks={bricks}
            key={i}
            brickItem={brick}
            BricksEngine={BricksEngine}
            moveBrick={moveBrickWithinBounds}
          />
        )
      })}
    </div>
  );
};

export default BrickContainer;

// "use client";

// type props={
//     bricks:any[];
//     setBricks:(bricks:any[])=>void;
// }

// export default function BrickContainer({
//     bricks,
//     setBricks,
// }:props) {
    

//   return (
//     <main>
//         <div className="bricks-handle">

//         </div>

//         <div className="brick-container">

//         </div>
//     </main>
//   );
// }
