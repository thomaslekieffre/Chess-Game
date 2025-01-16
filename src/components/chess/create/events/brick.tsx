import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import type { BrickData, DragItem, fieldType } from "@/types/create";
import Hole from "./hole";

interface BrickProps {
  id: number;
  x: number;
  y: number;
  color: string;
  content: string;
  holes?:fieldType[];
  isPlaced?:boolean;
  moveBrick: (id: number, x: number, y: number) => void;
  insertBrickToContainer: (brickId: number, targetId: number, holeIndex: number) => void;
  bricks:BrickData[];
}

const Brick: FC<BrickProps> = ({
  id,
  x,
  y,
  color,
  content,
  isPlaced=false,
  moveBrick,
  insertBrickToContainer,
  holes=[],
  bricks,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const hasHole = holes.length>0



  // Drag logic
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "BRICK",
    item: { id, initialX: x, initialY: y },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const offset = monitor.getSourceClientOffset();
      console.log(item)
      if (offset) {
        const parent = ref.current?.offsetParent as HTMLElement;
        const parentRect = parent.getBoundingClientRect();
        const relativeX = offset.x - parentRect.left;
        const relativeY = offset.y - parentRect.top;
        moveBrick(item.id, relativeX, relativeY);
      }
    },
  }));

  // Drop logic
  // const [{ isOver }, drop] = useDrop(() => ({
  //   accept: "BRICK",
  //   drop: (item: DragItem) => {
  //     // if (hasHole && item.id !== id) {
  //     //   // if((contained&&contained.length>0)&&!acceptMany) return
  //     //   // insertBrickToContainer(item.id, id); // insert brick into the brick with hole
  //     // }
  //   },
  //   collect: (monitor) => ({
  //     isOver: !!monitor.isOver(),
  //   }),
  // }));

  // drag(drop(ref));

  drag(ref);

  return (
    <div
      ref={ref}
      style={isPlaced?{
        position: "relative",
        width: "90px",
        minHeight: hasHole?`${(true) ? "300" : "1500"}`:"100px", // WARNING HANDLE HEIGHT
        backgroundColor: color,
        border: "6px solid #000",
        borderRadius: "8px",
        opacity: isDragging ? 0.5 : 1,
        cursor: "move",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: isDragging ? 1000 : "auto",
      }:{
        position: "absolute",
        top: y,
        left: x,
        width: "100px",
        minHeight: hasHole?`${(true) ? "300" : "1500"}`:"100px", // WARNING HANDLE HEIGHT
        backgroundColor: color,
        border: "2px solid #000",
        borderRadius: "8px",
        opacity: isDragging ? 0.5 : 1,
        cursor: "move",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: isDragging ? 1000 : "auto",
      }}
    >
      <span>{content}</span>
      <span>Accepted: TODO</span>
      {
        

        holes.map((item,i)=>(
          <Hole bricks={bricks} index={i} item={item} insertBrickToContainer={insertBrickToContainer} moveBrick={moveBrick} id={id} key={i}></Hole>
        ))
        
      }
      
    </div>
  );
};

export default Brick;