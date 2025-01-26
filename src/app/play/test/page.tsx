"use client"

import { findQuest, findQuestForUser } from "@/lib/chess/game/utils";
import { useEffect } from "react";

export default function test() {

    const getQuest = async () => {
        // const quest = await findQuest("make_piece_move",{piece:"rook"},null,"user_2qtahPOGbIYf9zi5sgOsRvJkzV6")
        const quest = await findQuest("make_piece_move",null,null,"user_2qtahPOGbIYf9zi5sgOsRvJkzV6")
        console.log(quest)
    }

    useEffect(()=>{
        getQuest()
    },[])
  return (
    <main>
        a
        <p></p>
    </main>
  );
}

