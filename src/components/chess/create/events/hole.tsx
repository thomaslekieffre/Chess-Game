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
} 

const Hole: FC<props> = ({
  item,
  index,
  moveBrick,
  insertBrickToContainer,
  id,
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

  return (
    <div key={index} ref={ref}>
      id:{id}
      {!(item.value) && (
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
      {(item.value!==null)?(
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
          <Brick isPlaced={true} key={item.value.id} color={item.value.color} content={item.value.content} id={item.value.id} insertBrickToContainer={insertBrickToContainer} moveBrick={moveBrick} x={item.value.x} y={item.value.y} holes={item.value.holes}></Brick>
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