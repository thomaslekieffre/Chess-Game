import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import type { BrickData, DragItem, fieldType } from "@/types/create";
import Brick from "./brick";


type props = {
  item:fieldType;
  index:number;
  moveBrick: (id: number, x: number, y: number) => void;
  insertBrickToContainer: (brickId: number, targetId: number, holeIndex: number) => void;
  id:number;
  bricks:BrickData[];
} 

const Hole: FC<props> = ({
  item,
  index,
  moveBrick,
  insertBrickToContainer,
  id,
  bricks,
}) => {

  const ref = useRef<HTMLDivElement>(null);


  // Initialiser le Hook `useDrop`
  const [{ isOver }, holeDrop] = useDrop(() => ({
    accept: "BRICK",
    drop: (item2: DragItem) => {
      // if (item.id !== item2.id) {
      const holeIndex = index
      if (holeIndex === -1) return alert("Erreur hole index");
      // console.log(id)
      // console.log(item,item2)
      insertBrickToContainer(item2.id, id, holeIndex);
      // }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

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
          // position:"absolute",
          // height: "50px",
          // width: "80px",
          border: isOver ? "2px dashed #00f" : "2px dashed #ccc",
          backgroundColor: isOver ? "#f0f8ff" : "transparent",
          borderRadius: "5px",
          display: "flex",
          flexDirection:"column",
          alignItems: "center",
          justifyContent: "center",
        }}
        // key={i}
        >
          <Brick bricks={bricks} isPlaced={true} key={value.id} color={value.color} content={value.content} id={value.id} insertBrickToContainer={insertBrickToContainer} moveBrick={moveBrick} x={value.x} y={value.y} holes={value.holes}></Brick>
            {
                // item.value.map((item,i)=>(
                // ))
            }
        </div>
      ):''}
    </div>
  )
};

export default Hole;