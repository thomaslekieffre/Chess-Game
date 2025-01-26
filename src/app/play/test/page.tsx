"use client"

import { findQuest, findQuestForUser, incrementQuestes } from "@/lib/chess/game/utils";
import { useEffect } from "react";

export default function test() {

    const getQuest = async () => {
      // const quest = await findQuest("make_piece_move",{piece:"rook"},null,"user_2qtahPOGbIYf9zi5sgOsRvJkzV6")
      const quest = await findQuest("make_piece_move",{piece:"rook"},null,"user_2qtahPOGbIYf9zi5sgOsRvJkzV6")
      console.log(quest)
    }

    const increment = async () => {
      const finished = await incrementQuestes("make_piece_move",{piece:"rook"},null,"user_2qtahPOGbIYf9zi5sgOsRvJkzV6",1)
      console.log(finished)
    }
    useEffect(()=>{
        getQuest()
    },[])
  return (
    <main style={{marginTop:'20rem'}}>
        a
        <p>bb</p>
        <button onClick={()=>{
          increment()
        }}>
          Increment
        </button>
    </main>
  );
}

