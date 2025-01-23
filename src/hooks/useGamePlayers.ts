import { useState } from "react";
import { ChessEngine } from "@/lib/chess/engine";
import { ChessPiece, DrawResons, eventTypes, FenString, GameState, PgnMove, PlayerBanner, playerType } from "@/types/chess";
import { HandlePlayers } from "@/lib/chess/game-players";

interface player {
    username:string;
    elo:string;
    banner:PlayerBanner;
    title:string;
    time:number;
}

export function usePlayers(defaultWhitePlayer?:player,defaultBlackPlayer?:player) {
    
    const [players] = useState(() => new HandlePlayers(defaultWhitePlayer?defaultWhitePlayer:{banner:null,elo:null,time:null,title:null,username:null},defaultBlackPlayer?defaultBlackPlayer:{banner:null,elo:null,time:null,title:null,username:null}));

    const [whitePlayer,setWhitePlayer] = useState<player>(players.getPlayer('white'))
    const [blackPlayer,setBlackPlayer] = useState<player>(players.getPlayer('black'))

    const [whitePlayerTime, setWhitePlayerTime] = useState(whitePlayer.time);
    const [blackPlayerTime, setBlackPlayerTime] = useState(blackPlayer.time);
  
    const [whitePlayerUsername,setWhitePlayerUsername] = useState(whitePlayer.username)
    const [blackPlayerUsername,setBlackPlayerUsername] = useState(blackPlayer.username)

    const [whitePlayerElo,setWhitePlayerElo] = useState(whitePlayer.elo)
    const [blackPlayerElo,setBlackPlayerElo] = useState(blackPlayer.elo)
  
    const [whitePlayerTitle, setWhitePlayerTitle] = useState<string>(whitePlayer.title);
    const [blackPlayerTitle, setBlackPlayerTitle] = useState<string>(blackPlayer.title);
  
    const [whitePlayerBanner, setWhitePlayerBanner] = useState<PlayerBanner>(blackPlayer.banner);
    const [blackPlayerBanner, setBlackPlayerBanner] = useState<PlayerBanner>(blackPlayer.banner);

    const updateUserState = () => {
        setWhitePlayer(players.getPlayer('white'))
        setBlackPlayer(players.getPlayer('black'))
        const whiteUser = players.getPlayer('white')
        const blackUser = players.getPlayer('black')

        setWhitePlayerTime(whiteUser.time)
        setBlackPlayerTime(blackUser.time)

        setWhitePlayerUsername(whiteUser.username)
        setBlackPlayerUsername(blackUser.username)

        setWhitePlayerElo(whiteUser.elo)
        setBlackPlayerElo(blackUser.elo)

        setWhitePlayerTitle(whiteUser.title)
        setBlackPlayerTitle(blackUser.title)

        setWhitePlayerBanner(whiteUser.banner)
        setBlackPlayerBanner(blackUser.banner)
    };

  return {
    whitePlayerTime,
    blackPlayerTime,
    whitePlayerUsername,
    blackPlayerUsername,
    whitePlayerElo,
    blackPlayerElo,
    whitePlayerTitle,
    blackPlayerTitle,
    whitePlayerBanner,
    blackPlayerBanner,
    updateUserState,
    players,
  };
}
