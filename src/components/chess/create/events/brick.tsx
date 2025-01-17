import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import type { BrickData, DragItem, fieldType } from "@/types/create";
import Hole from "./hole";

interface BrickProps {
  moveBrick: (id: number, x: number, y: number) => void;
  insertBrickToContainer: (brickId: number, targetBrick: BrickData, holeIndex: number) => void;
  bricks:BrickData[];
  brickItem:BrickData;
}

const Brick: FC<BrickProps> = ({
  moveBrick,
  insertBrickToContainer,
  bricks,
  brickItem,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const {color,content,id,parent,parenthole,type,x,y} = brickItem
  
  const hasHole = content.length>0

  const isPlaced = parent!==null

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
      {/* <span>{content}</span> */}
      {/* <span>Accepted: TODO</span> */}
      {
        

        content.map((item,i)=>{
          switch (item.type) {
            case "drop":
              return (
                <Hole currentBrick={brickItem} bricks={bricks} index={i} item={item} insertBrickToContainer={insertBrickToContainer} moveBrick={moveBrick} id={id} key={i}></Hole>
              )
            case "text":
              return (
                <span key={i}>{item.value}</span>
              )
          
            default:
              break;
          }
        })
        
      }
      
    </div>
  );
};

export default Brick;