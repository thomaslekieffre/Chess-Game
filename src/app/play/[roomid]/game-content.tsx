"use client";

import { ChessBoard } from "@/components/chess/board";
import { useEffect, useState, useRef, useCallback } from "react";
import { GameMessages } from "./game-messages";
import { useGameState } from "@/hooks/useGameState";
import { PieceColor, Position, roomType } from "@/lib/chess/types";
import { getOppositeColor } from "@/lib/chess/utils";
import { PlayerCard } from "@/components/chess/player-card";
import { GameControls } from "@/components/chess/game-controls";
import { MovesHistory } from "@/components/chess/moves-history";
import { GameChat } from "@/components/chess/game-chat";
import { Button } from "@/components/ui/button";
import { io } from "socket.io-client";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";

const socket = io("http://localhost:3001");

type PropsType = {
  roomId: string;
};

export function GameContent(props: PropsType) {
  const { roomId } = props;
  const { isSignedIn, user } = useUser();

  const [whiteTime, setWhiteTime] = useState(10 * 60);
  const [blackTime, setBlackTime] = useState(10 * 60);

  const [isGameStarted,setIsGameStarted] = useState(false)
  const [isPlaying,setIsPlaying] = useState(false)

  const [roomInfo, setRoomInfo] = useState<roomType>();

  const setGameInfos = async (color: PieceColor, temp: number) => {
    setPlayerColor(color);
    setBlackTime(temp * 60);
    setWhiteTime(temp * 60);
  };

  const fetchRoomInfo = useCallback(async () => {
    const { data, error } = await supabase
      .from("room")
      .select("*")
      .eq("id", roomId);

    if (error) {
      console.log("err");
      console.log(error);
      alert(error.message);
      return false;
    } else {
      const dataJson: roomType = data[0];

      console.log(dataJson);

      setRoomInfo(dataJson);

      socket.emit("room_log", dataJson);
      return dataJson;
      console.log(roomInfo);
    }
  }, [roomId]);

  const {
    currentTurn,
    isCheck,
    isCheckmate,
    winner,
    isGameOver,
    engine,
    setWinner,
    setIsGameOver,
    setIsCheck,
    setIsCheckmate,
    setCurrentTurn,
    isDraw,
    setIsDraw,
    setDrawReason,
    isStalemate,
    setIsStalemate,
    board,
    setBoard,
    updateGameState,
  } = useGameState();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isResigned, setIsResigned] = useState(false);
  const [drawOffer, setDrawOffer] = useState<PieceColor>();
  const [playerColor, setPlayerColor] = useState<PieceColor>("white");
  const [isTimeOut, setIsTimeOut] = useState(false);

  useEffect(() => {
    if (!roomInfo) {
      fetchRoomInfo();
    }else if(isSignedIn&&!isPlaying){
      socket.emit("room_log", roomInfo);
    }

    if (isGameOver) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      return;
    }

    const interval = setInterval(() => {
      if (!isGameStarted) return;
      if (currentTurn === "white") {
        setWhiteTime((prev) => {
          if (prev <= 0) {
            setIsGameOver(true);
            setIsTimeOut(true);
            setWinner(getOppositeColor(currentTurn));
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 0) {
            setIsGameOver(true);
            setIsTimeOut(true);
            setWinner(getOppositeColor(currentTurn));
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    timerRef.current = interval;

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [
    currentTurn,
    isGameOver,
    setIsGameOver,
    setWinner,
    isGameStarted,
    fetchRoomInfo,
    roomInfo,
    isSignedIn
  ]);

  const joinGame = async (roomJson: roomType) => {
    console.log('join gammeeee')
    console.log(isSignedIn);
    console.log(roomJson);
    console.log(isSignedIn)
    if (isSignedIn && roomJson) {
      console.log("FF");
      if (
        roomJson.status == "waiting_for_player" &&
        user.id !== roomJson.players.player1.id
      ) {
        //Rejoin la partie en temp que player2

        console.log("tentative");

        const couleur: PieceColor =
          roomJson.players.player1.color == "white" ? "black" : "white";

        const newPlayers = roomJson.players;
        newPlayers.player2 = {
          id: user.id,
          color: couleur,
          temp: `${parseInt(roomJson.cadence.split("|")[0]) * 60}`,
        };

        await supabase
          .from("room")
          .update({ players: newPlayers, status: `in_progress` })
          .eq("id", roomId)
          .then((x) => {
            console.log(x);
            if (x.error) {
              alert("Erreur lors de la connexion a la partie");
            } else {
              setGameInfos(couleur, parseInt(roomJson.cadence.split("|")[0]));
              console.log("edited");
            }
          });
      } else if (roomJson.status == "in_progress") {
        if (user.id == roomJson.players.player1.id) {
          console.log(roomJson.players.player2);
          console.log("df");
          setGameInfos(
            roomJson.players.player1.color,
            parseInt(roomJson.cadence.split("|")[0])
          );
        } else if (user.id == roomJson.players.player2.id) {
          console.log(roomJson.players.player2);
          console.log("z");
          setGameInfos(
            roomJson.players.player2.color,
            parseInt(roomJson.cadence.split("|")[0])
          );
        }
        console.log(user.id, roomJson.players);
      }
    }
  };

  useEffect(() => {
    socket.on("connected-to-the-room", (data: roomType) => {
      console.log(roomInfo);
      joinGame(data);
      console.log("joined");
    });

    socket.on("move", (data) => {
      console.log("Mouvement reçu:", data);

      // Appliquer le mouvement reçu
      const { from, to } = data;

      const success = engine.makeMove(from, to);
      updateGameState();

      if (success) {
        const engineState = engine.getGameState();
        setIsCheck(engineState.isCheck);
        setIsCheckmate(engineState.isCheckmate);
        setIsStalemate(engineState.isStalemate);
        setCurrentTurn(engineState.currentTurn);

        if (engineState.isCheckmate || engineState.isStalemate) {
          setIsGameOver(true);
          if (engineState.isCheckmate) {
            setWinner(getOppositeColor(currentTurn));
          }
        }
      } else {
        console.error("Le mouvement n'est pas valide.");
      }
    });

    return () => {
      socket.off("move");
    };
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleOfferDraw = () => {
    engine.offerDraw(currentTurn);
    setDrawOffer(currentTurn);
  };

  const handleAcceptDraw = () => {
    engine.acceptDraw();
    setIsGameOver(true);
    setIsDraw(true);
    setDrawReason("mutual-agreement");
  };

  const handleDeclineDraw = () => {
    engine.declineDraw();
    setDrawOffer(undefined);
  };

  const handleMove = (from: Position, to: Position) => {
    socket.emit("move", { from, to, roomId, moves: engine.getMoves() });
  };

  return (
    <main className="min-h-screen bg-background overflow-hidden">
      <div>
        <p>{roomId}</p>
        <p>{JSON.stringify(roomInfo)}</p>
        <p>joueur : {playerColor}</p>
        <p>id : {user?.id}</p>
        <div className="container max-w-[1600px] mx-auto px-4 h-full">
          {/* Header de la partie */}
          <div className="py-6 mb-8 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Partie Classique</h1>
                <p className="text-muted-foreground">
                  {/* {roomInfo.cadence.split('|')[0]} minutes par joueur {roomInfo.cadence.split('|')[1]>0?`avec ${roomInfo.cadence.split('|')[1]} seconde d'increment`:''}  */}
                </p>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" size="sm">
                  Copier le lien
                </Button>
                <Button variant="outline" size="sm">
                  Quitter la partie
                </Button>
              </div>
            </div>
          </div>

          {/* Layout principal */}
          <div className="grid grid-cols-[250px_1fr_250px] gap-4">
            {/* Panneau gauche */}
            <div className="space-y-4">
              {playerColor == "white" ? (
                <PlayerCard
                  name="Joueur Noir"
                  rating={850}
                  time={formatTime(blackTime)}
                  color="black"
                  isCurrentTurn={currentTurn === "black"}
                />
              ) : (
                <PlayerCard
                  name="Joueur Blanc"
                  rating={922}
                  time={formatTime(whiteTime)}
                  color="white"
                  isCurrentTurn={currentTurn === "white"}
                />
              )}

              <GameControls
                onResign={() => {
                  setIsGameOver(true);
                  setIsResigned(true);
                  setWinner(getOppositeColor(currentTurn));
                }}
                onOfferDraw={handleOfferDraw}
                drawOffer={drawOffer}
                onAcceptDraw={handleAcceptDraw}
                onDeclineDraw={handleDeclineDraw}
                playerColor={playerColor}
                isGameOver={isGameOver}
              />

              {playerColor == "white" ? (
                <PlayerCard
                  name="Joueur Blanc"
                  rating={922}
                  time={formatTime(whiteTime)}
                  color="white"
                  isCurrentTurn={currentTurn === "white"}
                />
              ) : (
                <PlayerCard
                  name="Joueur Noir"
                  rating={850}
                  time={formatTime(blackTime)}
                  color="black"
                  isCurrentTurn={currentTurn === "black"}
                />
              )}
            </div>

            {/* Zone centrale avec l'échiquier */}
            <div className="flex flex-col items-center">
              <ChessBoard
                playerColor={playerColor}
                className="w-full max-w-[1000px]"
                board={board}
                setBoard={setBoard}
                engine={engine}
                onMove={(from, to) => {
                  handleMove(from, to);
                  const engineState = engine.getGameState();
                  setIsCheck(engineState.isCheck);
                  setIsCheckmate(engineState.isCheckmate);
                  setIsStalemate(engineState.isStalemate);
                  setCurrentTurn(engineState.currentTurn);

                  if (engineState.isCheckmate || engineState.isStalemate) {
                    setIsGameOver(true);
                    if (engineState.isCheckmate) {
                      setWinner(getOppositeColor(currentTurn));
                    }
                  }
                }}
              />
            </div>

            {/* Panneau droit */}
            <div className="space-y-4">
              <MovesHistory
                moves={engine.getMoves()}
                className="h-[calc(100vh-400px)]"
              />
              <GameChat className="h-[200px]" />
            </div>
          </div>
        </div>

        <GameMessages
          isCheck={isCheck}
          isCheckmate={isCheckmate}
          isStalemate={isStalemate}
          isDraw={isDraw}
          currentTurn={currentTurn}
          winner={winner}
          isResigned={isResigned}
          isTimeOut={isTimeOut}
        />
      </div>
    </main>
  );
}
