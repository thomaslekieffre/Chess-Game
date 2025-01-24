import { eventTypes, GameState, questEventsNames } from "@/types/chess";
import { getNameByFig } from "../pgn/pgn2";

interface eventObjType {
    event:string,
    condition:((event:eventTypes,states:GameState)=>boolean)[],
    value:number,
    name:questEventsNames,
    more_value?:Record<string,string>,
} 

const anyMove = (event:eventTypes,states:GameState):eventObjType => {
    return {event:"move",condition:[],value:1,name:"make_any_move"} // Make any move
}

const pieceMove = (event:eventTypes,states:GameState):eventObjType => {
    return {event:"move",condition:[],value:1,name:"make_any_move",more_value:{piece:getNameByFig(states.strMove[states.strMove.length-1].notation.fig)}} // Make piece move
}

const events:((event:eventTypes,states:GameState)=>eventObjType)[] = [
    anyMove,
    pieceMove,
]

export const onAnyEventIsPlayed = (event:eventTypes,states:GameState) => {
    
    // // console.log(event,states)
    // if(event==="move"){
    //     // console.log(states.strMove,states.strMove[states.strMove.length-1],states.strMove[states.strMove.length-1].notation.fig)
    // }
}