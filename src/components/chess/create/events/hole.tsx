import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import type { BrickData, DragItem, fieldType } from "@/types/create";
import Brick from "./brick";


type props = {
  item:fieldType;
  index:number;
  moveBrick: (id: number, x: number, y: number) => void;
  insertBrickToContainer: (brickId: number, targetBrick: BrickData, holeIndex: number) => void;
  id:number;
  bricks:BrickData[];
  currentBrick:BrickData;
} 

const Hole: FC<props> = ({
  item,
  index,
  moveBrick,
  insertBrickToContainer,
  id,
  bricks,
  currentBrick,
}) => {

  const ref = useRef<HTMLDivElement>(null);


  useEffect(()=>{
    console.log(bricks)
  },[bricks])

  // Initialiser le Hook `useDrop`
  const [{ isOver }, holeDrop] = useDrop(() => ({
    accept: "BRICK",
    drop: (item2: DragItem) => {
      const holeIndex = index
      if (holeIndex === -1) return alert("Erreur hole index");
      // return console.log(bricks)
      insertBrickToContainer(item2.id, currentBrick, holeIndex);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }),[bricks]);

  holeDrop(ref)

  let value = null

  if(item.child!==null){
    value = bricks.find(
      // (b) => b.id===item.child
      (b) => item.child?.includes(b.id)
    );
  }

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
          style={{
            marginTop: "10px",
            height: "50px",
            width: "80px",
            border: isOver ? "2px dashed #00f" : "2px dashed #ccc",
            backgroundColor: isOver ? "#f0f8ff" : "transparent",
            borderRadius: "5px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          // key={i}
        >
          Drop Brick here
        </div>
      )}
      {(value!==null&&value!==undefined)?(
        <div
        style={{
          marginTop: "10px",
          border: isOver ? "2px dashed #00f" : "2px dashed #ccc",
          backgroundColor: isOver ? "#f0f8ff" : "transparent",
          borderRadius: "5px",
          display: "flex",
          flexDirection:"column",
          alignItems: "center",
          justifyContent: "center",
        }}
        >
          <Brick brickItem={currentBrick} bricks={bricks} insertBrickToContainer={insertBrickToContainer} moveBrick={moveBrick}></Brick>
        </div>
      ):''}
    </div>
  )
};

export default Hole;