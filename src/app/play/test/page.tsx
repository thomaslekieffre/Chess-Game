"use client";

import { PgnMove } from '@/types/chess';
import {fromCoordToCase,writeGame} from '../../../lib/chess/pgn/pgn2'
import { parse } from '@mliebelt/pgn-parser';

const listMove:PgnMove[] = [
    {
        "drawOffer": false,
        "turn": "white",
        "from": "e2",
        "to": "e4",
        "notation":{notation:'e4',col:'4',row:'e',fig:'P'},
        "fen": "",
        "index": 0,
        "nag": [],
        "variations": []
    },
    {
        "drawOffer": false,
        "turn": "black",
        "from": "c7",
        "to": "c5",
        "notation":{notation:'c5',col:'5',row:'c',fig:'P'},
        "fen": "",
        "index": 0,
        "nag": [],
        "variations": []
    },
    // {
    //     "drawOffer": false,
    //     "turn": "white",
    //     "from": "g1",
    //     "to": "f3",
    //     "notation":{},
    //     "fen": "",
    //     "index": 0,
    //     "nag": [],
    //     "variations": []
    // },
    // {
    //     "drawOffer": false,
    //     "turn": "black",
    //     "from": "b8",
    //     "to": "c6",
    //     "notation":{},
    //     "fen": "",
    //     "index": 0,
    //     "nag": [],
    //     "variations": []
    // },
    // {
    //     "drawOffer": false,
    //     "turn": "white",
    //     "from": "f1",
    //     "to": "b5",
    //     "notation":{},
    //     "fen": "",
    //     "index": 0,
    //     "nag": [],
    //     "variations": []
    // },
    // {
    //     "drawOffer": false,
    //     "turn": "black",
    //     "from": "e7",
    //     "to": "e6",
    //     "notation":{},
    //     "fen": "",
    //     "index": 0,
    //     "nag": [],
    //     "variations": []
    // },
    // {
    //     "drawOffer": false,
    //     "turn": "white",
    //     "from": "e1",
    //     "to": "g1",
    //     "notation":{},
    //     "fen": "",
    //     "index": 0,
    //     "nag": [],
    //     "variations": []
    // }
]

const testPgn = '[Event "ChessDojo Open Classical - 2023-04"]\n' +
'  [Site "Chess.com"]\n' +
'  [Date "2023.04.27"]\n' +
'  [Round "15"]\n' +
'  [White "jenesuispasdave"]\n' +
'  [Black "factoryfreak"]\n' +
'  [Result "1-0"]\n' +
'  [WhiteElo "790"]\n' +
'  [BlackElo "873"]\n' +
'  [TimeControl "5400+30"]\n' +
'  [Termination "jenesuispasdave won by checkmate"]\n' +
'  [Annotator "jenesuispasdave"]\n' +
'  [UTCDate "2023.05.02"]\n' +
'  [UTCTime "02:06:08"]\n' +
'  [Variant "Standard"]\n' +
'  [ECO "C50"]\n' +
'  [Opening "Italian Game: Anti-Fried Liver Defense"]\n' +
'  [Source "https://lichess.org/study/tUmAdyQJ/80CyeGO8"]\n' +
'  [PlyCount "83"]\n' +
'e4 e5 Nf3 Nc6'


export default function test() {

    // const parsed = parse(testPgn,{startRule:"game"})
    // const pgn = writeGame(parsed)
    // const [result] = parse(testPgn);

    // console.log(pgn)


  return (
    <main>
        a
        <p></p>
    </main>
  );
}

