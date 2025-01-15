import React, { FC, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import type { BrickData, fieldType } from "@/types/create";

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
}

interface DragItem {
  id: number;
  type: string;
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
}) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const holeRefs = useRef<HTMLDivElement[]>([]); // Références pour chaque trou

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
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "BRICK",
    drop: (item: DragItem) => {
      if (hasHole && item.id !== id) {
        // if((contained&&contained.length>0)&&!acceptMany) return
        // insertBrickToContainer(item.id, id); // insert brick into the brick with hole
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  drag(drop(ref));

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
        

        holes.map((item,i)=>{
          
          const [{ isOver: isHoleOver }, holeDrop] = useDrop(() => ({
            accept: "BRICK",
            drop: (item2: DragItem) => {
              if (item.id !== item2.id) {
                const holeIndex = holes.findIndex((h) => h.id === item.id);
                if (holeIndex === -1) return alert("Erreur hole index");
                insertBrickToContainer(item2.id, id, holeIndex);
              }
            },
            collect: (monitor) => ({
              isOver: !!monitor.isOver(),
            }),
          }));
          
          const holeRef = (el: HTMLDivElement) => {
            if (el) {
              holeRefs.current[i] = el;
              holeDrop(el);
            }
          };
          // drop(ref)
          
          return (
            <div key={i} ref={holeRef}>
              {hasHole && !(item.value) && (
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
        })
        
      }
      
    </div>
  );
};

export default Brick;