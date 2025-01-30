import { eventObjType, eventTypes, GameState, questEventsNames } from "@/types/chess";
import { getNameByFig } from "../pgn/pgn2";
import { incrementQuestes } from "./utils";

const anyMove = (event:eventTypes,states:GameState):eventObjType => {
    return {value:1,type:"make_any_move"} // Make any move
}

const pieceMove = (event:eventTypes,states:GameState):eventObjType => {
    return {value:1,type:"make_any_move",condition:{piece:getNameByFig(states.strMove[states.strMove.length-1].notation.fig)}} // Make piece move
    // {type:"make_piece_move",value:1,clerk_id:"user_2qtahPOGbIYf9zi5sgOsRvJkzV6",condition:{piece:"pawn"}}
}

const events:Record<string,((event:eventTypes,states:GameState)=>eventObjType)[]> = {
    move:[anyMove,pieceMove],
}

export const onAnyEventIsPlayed = async (event:eventTypes,states:GameState,clerk_id:string) => {
    console.log("aaaa")
    let finishedQuest = []
    for(let key of Object.keys(events)){
        console.log(key)
        let functions = events[key]
        for(let func of functions){
            const funcData = func(event,states)
            const res = await incrementQuestes({...funcData,clerk_id})
            console.log(res)
            finishedQuest.push(...res)
        }
    }
    return finishedQuest
}