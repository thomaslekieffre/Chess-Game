import { PieceColor, PlayerBanner } from "@/types/chess";

interface player {
    username:string|null;
    elo:string|null;
    banner:PlayerBanner|null;
    title:string|null;
    time:number|null;
}

interface returnPlayer {
    username:string;
    elo:string;
    banner:PlayerBanner;
    title:string;
    time:number;
}

interface PlayersState {
  white:player,
  black:player
}

const defaultValues:Record<PieceColor,returnPlayer> = {
    white:{
        username:'White',
        banner:{
            bannerUrl:null,
            textColors:{
                rating:"red",
                text:"green",
                title:"blue"
            }
        },
        elo:"1200?",
        time:10*60,
        title:""
    },
    black:{
        username:'Black',
        banner:{
            bannerUrl:null,
            textColors:{
                rating:"blue",
                text:"green",
                title:"blue"
            }
        },
        elo:"1200?",
        time:10*60,
        title:""
    }
}

export class HandlePlayers {

    private state: PlayersState;

    constructor(white:player,black:player) {
        this.state = {
            white,black
        }
    }

    public getPlayer (color:PieceColor):returnPlayer {
        let myPlayer = this.state[color]

        let newPlayer:returnPlayer = {
            banner:myPlayer.banner===null?defaultValues[color].banner:myPlayer.banner,
            elo:myPlayer.elo===null?defaultValues[color].elo:myPlayer.elo,
            time:myPlayer.time===null?defaultValues[color].time:myPlayer.time,
            title:myPlayer.title===null?defaultValues[color].title:myPlayer.title,
            username:myPlayer.username===null?defaultValues[color].username:myPlayer.username,
        }

        return newPlayer
    }
    
    public setUsername (color:PieceColor,value:string) {
        return this.state[color].username = value
    }

    public setElo (color:PieceColor,value:string) {
        return this.state[color].elo = value
    }

    public setBanner (color:PieceColor,value:PlayerBanner) {
        return this.state[color].banner = value
    }

    public setTitle (color:PieceColor,value:string) {
        return this.state[color].title = value
    }

    public setTime (color:PieceColor,value:number) {
        return this.state[color].time = value
    }

}