import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import type { BrickData, DragItem, dropFieldType, fieldType } from "@/types/create";
import Brick from "./brick";
import { Bricks } from "@/lib/create/bricksHandle";


type props = {
  item:dropFieldType;
  index:number;
  moveBrick: (id: number, x: number, y: number) => void;
  id:number;
  bricks:BrickData[];
  currentBrick:BrickData;
  value:BrickData|undefined;
  BricksEngine:Bricks;
} 

const Hole: FC<props> = ({
  item,
  index,
  moveBrick,
  id,
  bricks,
  currentBrick,
  value,
  BricksEngine,
}) => {

  const ref = useRef<HTMLDivElement>(null);
  const [{ isOver }, holeDrop] = useDrop(() => ({
    accept: "BRICK",
    drop: (item2: DragItem) => {
      console.log('drop')
      const holeIndex = index
      if (holeIndex === -1) return alert("Erreur hole index");
      BricksEngine.insertBrickToContainer(item2.id, currentBrick, holeIndex);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }),[bricks, index]);

  holeDrop(ref)

  const dropAreaStyle = useMemo(() => ({
    marginTop: "10px",
    height: "50px",
    width: "80px",
    border: isOver ? "2px dashed #00f" : "2px dashed #ccc",
    backgroundColor: isOver ? "#f0f8ff" : "transparent",
    borderRadius: "5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }), [isOver]);

  return (
    <div key={index} ref={ref}>
      id:{id}
      <button onClick={()=>{
        console.log(bricks)
      }}>
        aa
      </button>
      {!(value) && (
        <div
          style={dropAreaStyle}
          // key={i}
        >
          Drop Brick here
        </div>
      )}
      {(value!==undefined)?(
        <div
        style={dropAreaStyle}
        >
          <Brick brickItem={currentBrick} bricks={bricks} BricksEngine={BricksEngine} moveBrick={moveBrick}></Brick>
        </div>
      ):''}
    </div>
  )
};

export default Hole;