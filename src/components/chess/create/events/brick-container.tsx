import React, { useRef } from "react";
import Brick from "@/components/chess/create/events/brick";
import type { BrickData } from "@/types/create";

interface BrickContainerProps {
  bricks:BrickData[];
  moveBrick: (id: number, x: number, y: number) => void;
  insertBrickToContainer: (brickId: number, targetId: number, holeIndex: number) => void;
}

const BrickContainer: React.FC<BrickContainerProps> = ({
  bricks,
  moveBrick,
  insertBrickToContainer,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const moveBrickWithinBounds = (id: number, x: number, y: number) => {
    if (!containerRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const brickSize = 100;

    const boundedX = Math.max(0, Math.min(x, container.width - brickSize));
    const boundedY = Math.max(0, Math.min(y, container.height - brickSize));

    moveBrick(id, boundedX, boundedY);
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "800px",
        height: "600px",
        border: "2px solid #000",
        backgroundColor: "#f9f9f9",
        overflow: "hidden",
      }}
    >
      {bricks.map((brick,i) => {
        if(brick.parent!==null){
          return
        }
        return (
          <Brick
            bricks={bricks}
            key={i}
            {...brick}
            moveBrick={moveBrickWithinBounds}
            insertBrickToContainer={insertBrickToContainer} // Pass the insert function to handle drop
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
