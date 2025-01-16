"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useUser } from "@clerk/nextjs";
import { supabaseClient } from "@/lib/supabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomBoard } from "@/components/chess/custom-board";
import { PieceType, Position, customBoardSquare, customBoardType } from "@/lib/chess/types";
import Compass from "@/components/ui/compass";
import BrickContainer from "@/components/chess/create/events/brick-container";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import type {BrickData, fieldType} from '@/types/create'

const isSelectedStyle = (isSelected:string[]) => {
  const includesJump = isSelected.includes('jump')
  const includesLine = isSelected.includes('line')
  if(includesJump&&includesLine){
    return  'bg-purple-200 dark:bg-purple-900'
  }else if(includesJump&&!includesLine){
    return  'bg-blue-200 dark:bg-blue-900'
  }else if(includesLine&&!includesJump){
    return  'bg-red-200 dark:bg-red-900'
  }else if(isSelected==null||isSelected.length==0){
    return ''
  }else{
    return 'bg-green-200 dark:bg-green-900'
  }
}

export default function CreatePiecePage() {
  const { user } = useUser();
  const [selectedPiece, setSelectedPiece] = useState<string>("");
  const [pieceName, setPieceName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [selectedSquares, setSelectedSquares] = useState<boolean[][]>([]);
  const [straightLineMove,setStraightLineMove] = useState<{
    direction:Position,
    length:number,
  }[]>([])
  const [selectedDirection, setSelectedDirection] = useState<Position>({x:1,y:0});
  const [selectedDistance, setSelectedDistance] = useState('8')

  const [bricks, setBricks] = useState<BrickData[]>([
    { id: 1, x: 50, y: 50, color: "#ff6347", type:"b1", content: "Brick 1",parent:null,parenthole:null },

    { id: 2, x: 50, y: 300, color: "#ff6367", type:"b2", content: "Brick 2",parent:null,parenthole:null },

    { id: 3, x: 200, y: 50, color: "#4682b4", type:"b3", content: "Brick 3",parent:null,parenthole:null },
    
    { id: 4, x: 350, y: 50, color: "#32cd32", type:"b4", content: "Brick 4",parent:null,parenthole:null },

    { id: 7, x: 350, y: 150, color: "#32cd32", type:"b7", content: "Brick 7",parent:6,parenthole:1 },

    { id: 5, x: 500, y: 50, color: "#37ca13", content: "Brick 5", type:'bhole1', holes:[{type:'drop',accept:['b1','b2'],id:1,child:[],acceptMany:false},{type:'drop',accept:['b3'],id:2,child:[],acceptMany:true}],parent:null,parenthole:null},

    { id: 6, x: 500, y: 400, color: "#56db13", content: "Brick 6", type:'bhole2', holes:[{type:'drop',child:[7],accept:['b7','b3','b4'],id:1,acceptMany:false}],parent:null,parenthole:null},
  ]);

  // Mettre à jour la position d'une brique
  const moveBrick = (id: number, x: number, y: number) => {
    setBricks((prevBricks) =>
      prevBricks.map((brick) =>
        brick.id === id ? { ...brick, x, y } : brick
      )
    );
  };


  const insertBrickToContainer = (brickId: number, targetId: number,holeIndex:number) => {

    // console.log(brickId,targetId,holeIndex)

    // return

    const tmpBrick:BrickData[] = JSON.parse(JSON.stringify(bricks))

    const movedBrick = tmpBrick.find((brick) => brick.id === brickId);
    const targetBrick = tmpBrick.find((brick) => brick.id === targetId); 
    const holes = targetBrick?.holes

    if(!holes) return alert('mhmhmh')
    
    const holeData = holes[holeIndex]

    if(!movedBrick||!targetBrick||!holeData) return alert('mhmh')

    if(!holeData.accept.includes(movedBrick.type)) return alert ('Not accepted')
    
    const updatedtmpBrick = tmpBrick.map((brick) => {
      if (brick.id === targetId) {

        if(!brick.holes) return
        let holeChild = brick.holes[holeIndex].child
        let newChild:number[] = [movedBrick.id]
        if(holeChild.length>0&&holeData.acceptMany){
          newChild = JSON.parse(JSON.stringify(holeChild))
          newChild.push(movedBrick.id)
        }

        brick.holes[holeIndex] = {
          id:brick.holes[holeIndex].id,
          type:'drop',
          // value:movedBrick,
          child:newChild,
          accept:brick.holes[holeIndex].accept,
          acceptMany:holeData.acceptMany,
        }

        return {
          ...brick
        };


      }
      if (brick.id === brickId) {
        return {
          ...brick,
          parent:targetId,
          parenthole:holeIndex,
        }
        // return null;
      }
      if(holeData.child.includes(brick.id)){
        // let lenght = holeData.child.length
        if(!holeData.acceptMany){
          let newBrick = {...brick}
          newBrick.parent=null
          newBrick.parenthole=null
          return newBrick
        }
      }
      return brick;
    }).filter((brick) => brick !== null);
    // return 
    setBricks(updatedtmpBrick);
  };

  const generateBoard = () => {
    let res:customBoardType = []
    for (let i = 0; i < 15; i++) {
      let tmp:customBoardSquare[] = []
      for (let j = 0; j < 15; j++) {
        tmp.push({
          style:[]
        })
      }
      res.push(tmp)
    }
    return res
  }

  const [board,setBoard] = useState<customBoardType>(generateBoard())

  const [selectedTools,setSelectedTools] = useState('click-jump')

  const handleData = (array:customBoardType):{jump:Array<Position>,other:any} => {
    const pieceCoordX = parseInt(`${array.length/2}`) 
    const pieceCoordY = parseInt(`${array.length/2}`)

    let res:{jump:Array<Position>,other:any} = {jump:[],other:''}

    for (let i = 0; i < array.length; i++) {
      let row = array[i]
      for (let j = 0; j < array.length; j++) {
        const square = row[j]
        const squareCoord = {x:j,y:i}
        const diffX = pieceCoordX-squareCoord.x 
        const diffY = pieceCoordY-squareCoord.y
        const dif = {x:diffX,y:diffY}
        if(square?.data&&square?.data.isSelected.includes('jump')){
          res.jump.push(dif)
        }
      }
    }

    return res
  }

  const editSquare = (newValue:customBoardSquare,pos:Position) => {
    let newBoard = JSON.parse(JSON.stringify(board));
    newBoard[pos.y][pos.x] = newValue
    setBoard(board => [...newBoard])
  }

  const displayLine = (line:Position,start:Position,length:number) => {
    let newBoard = JSON.parse(JSON.stringify(board));
    for (let i = 1; i < length+1; i++) {
      if(start.y+line.y>=newBoard.length||start.x+line.x>=newBoard[0].length) return
      const pieceDir = {x:1,y:-1}
      let square:customBoardSquare = newBoard[start.y+(line.y*pieceDir.y)*i][start.x+(line.x*pieceDir.x)*i] 
      console.log('a')
      if(square?.data?.isSelected){
        square.data.isSelected.push('line')
      }else{
        square.data = {
          ...square.data,
          isSelected:['line']
        }
      }
      console.log('b')
      console.log(square)
      square.style=[isSelectedStyle(square.data.isSelected)]
    }
    // newBoard[pos.y][pos.x] = newValue
    setBoard(board => [...newBoard])
  }

  const handleSquareClick = async (pos:Position) => {
    console.log(board,handleData(board))
    let square = board[pos.y][pos.x]
    let res:customBoardSquare = JSON.parse(JSON.stringify(square))
    console.log(square)
    if(selectedTools=="click-jump"){
      if(res?.piece) return
      if(res?.data?.isSelected){
        if(res.data.isSelected.includes('jump')){
          console.log('a')
          let index = res.data.isSelected.indexOf('jump')
          console.log(index,res.data.isSelected)
          res.data.isSelected.splice(index,1)
          console.log(res.data.isSelected)
        }else{
          res.data.isSelected.push('jump')
        }
      }else{
        if(res.data){
          res.data.isSelected = ['jump']
        }else{
          res.data = {
            isSelected:['jump']
          }
        }
      }
      res.style=[isSelectedStyle(res.data.isSelected)]
      editSquare(res,pos)
      // if(square?.data?.isSelected&&square.data.isSelected.includes('jump')){
      //   let res:customBoardSquare = {
      //     style:[]
      //   }
      //   editSquare(res,pos)
      // }
      // if(!square?.data){
      //   let res:customBoardSquare = {
      //     style:[
      //       'bg-blue-200 dark:bg-blue-900'
      //     ],
      //     data:{
      //       isSelected:['jump']
      //     }
      //   }
      //   editSquare(res,pos)
      // }
    }
  }

  const handlePieceSelect = (value: PieceType) => {
    console.log(value);
    setSelectedPiece(value);
    editSquare({style:[],piece:{
      name:value,
      color:'black',
    }},{x:parseInt(`${board.length/2}`),y:parseInt(`${board.length/2}`)})
  };

  const handleSavePiece = async () => {
    if (!user) {
      alert("Vous devez être connecté pour sauvegarder une pièce");
      return;
    }

    if (!pieceName) {
      alert("Veuillez donner un nom à votre pièce");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = supabaseClient();
      const { error } = await supabase.from("custom_pieces").insert({
        name: pieceName,
        piece_type: selectedPiece,
        moves: selectedSquares,
        created_by: user.id,
        is_public: isPublic,
      });

      if (error) {
        alert("Erreur lors de la sauvegarde de la pièce");
        console.error(error);
      } else {
        alert("Pièce sauvegardée avec succès");
        setPieceName("");
        setSelectedSquares([]);
        setSelectedPiece("");
        setIsPublic(false);
      }
    } catch (error) {
      console.error("Erreur complète:", error);
      alert("Une erreur est survenue lors de la sauvegarde");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-20 bg-background">
      <div className="container max-w-5xl">
        <h1 className="text-3xl font-bold mb-8">
          Créer une pièce personnalisée
        </h1>

        <Card className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Choisissez une pièce à personnaliser</Label>
              <Select onValueChange={handlePieceSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez; une pièce" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="knight">Cavalier</SelectItem>
                  <SelectItem value="bishop">Fou</SelectItem>
                  <SelectItem value="queen">Reine</SelectItem>
                  <SelectItem value="king">Roi</SelectItem>
                  <SelectItem value="rook">Tour</SelectItem>
                  <SelectItem value="pawn">Pions</SelectItem>
                  <SelectItem value="custom">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedPiece && (
              <>
                <div className="space-y-2">
                  <Label>Nom de la pièce</Label>
                  <Input
                    value={pieceName}
                    onChange={(e) => setPieceName(e.target.value)}
                    placeholder="Ex: Super Cavalier"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="public"
                    checked={isPublic}
                    onCheckedChange={(checked) =>
                      setIsPublic(checked as boolean)
                    }
                  />
                  <Label htmlFor="public">
                    Rendre cette pièce publique (visible par tous les joueurs)
                  </Label>
                </div>

                <div className="mt-6">
                  <header>
                    <h2 className="text-xl font-semibold mb-4">
                      Personnalisation {pieceName?`du ${pieceName}.`:'de votre piece.'}
                    </h2>
                    <h3>
                      Ps : La piece est orienter ver le haut
                    </h3>
                  </header>


                  <div>
                    <CustomBoard
                      // selectedPiece={selectedPiece}
                      // onSquaresChange={setSelectedSquares}
                      size={15}
                      onSquareClick={handleSquareClick}
                      board={board}
                      selectedPiece="white"
                      highlightSquares={[]}
                      readOnly={true}
                      // animatedPiece={true}
                    />
                    
                    <div style={{display:'flex',flexDirection:'column',gap:'2rem'}}>
                      <div style={{display:'flex',flexDirection:'row',alignItems:"center",gap:'2rem'}}>
                        <button onClick={()=>{
                          let newMove = {direction:selectedDirection,length:parseInt(selectedDistance)}

                          for (let i = 0; i < straightLineMove.length; i++) {
                            const line = straightLineMove[i];
                            
                            if(line.direction==selectedDirection){
                              if(line.length>parseInt(selectedDistance)){
                                console.log('return')
                                return
                              }else{
                                let newArray = JSON.parse(JSON.stringify(straightLineMove))
                                newArray.pop(i)
                                setStraightLineMove(straightLineMove => [...newArray])
                                console.log('pop')
                              }
                            }
                          }

                          setStraightLineMove(straightLineMove => [...straightLineMove,newMove])
                          displayLine(newMove.direction,{x:parseInt(`${board.length/2}`),y:parseInt(`${board.length/2}`)},newMove.length)
                        }}>
                          Crée
                        </button>
                        <input min={1} max={7} type="number" style={{height:"2rem"}} onChange={(e)=>{setSelectedDistance(e.target.value)}}></input>
                        <Compass selectedDirection={selectedDirection} setSelectedDirection={setSelectedDirection}></Compass>
                      </div>
                      {straightLineMove.map((item,i)=>{
                        // const dir = 0
                        const angleInRadians = Math.atan2(item.direction.y, item.direction.x);
                        const angleInDegrees = (angleInRadians * 180) / Math.PI;

                        let positiveAngle = (angleInDegrees+270)%360

                        if(positiveAngle==360) positiveAngle=0

                        return (
                          <div key={i} style={{display:'flex',flexDirection:'row'}}>
                            angle : {positiveAngle}
                            <div style={{transform:`rotate(${positiveAngle-90}deg)`}}>{`--->`}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="events">
                    <h2>Events :</h2>

                    <div style={{ padding: "20px", textAlign: "center" }}>
                      <h1>Brick Builder</h1>
                      <button onClick={()=>{
                        console.log(bricks)
                      }}>log</button>
                      <DndProvider backend={HTML5Backend}>
                        <BrickContainer bricks={bricks} insertBrickToContainer={insertBrickToContainer} moveBrick={moveBrick}/>
                      </DndProvider>  
                    </div>
                    {/* <div className="bricks-container">

                    </div> */}

                  </div>

                  <Button
                    onClick={handleSavePiece}
                    className="w-full mt-4"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sauvegarde..." : "Sauvegarder la pièce"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}
