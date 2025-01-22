"use client";

import { ChessBoard } from "@/components/chess/board";
import { CustomBoard } from "@/components/chess/custom-board";
import { GameChat } from "@/components/chess/game-chat";
import { GameControls } from "@/components/chess/game-controls";
import { MovesHistory } from "@/components/chess/moves-history";
import { PlayerCard } from "@/components/chess/player-card";
import { useGameState } from "@/hooks/useGameState";
import { importFEN } from "@/lib/chess/pgn/pgn2";
import {
  ChessPiece,
  customBoardSquare,
  customBoardType,
  eventTypes,
  GameState,
  gameStatus,
  PieceColor,
  PlayerBanner,
  Position,
  roomType,
} from "@/types/chess";
import { getOppositeColor } from "@/lib/chess/utils";
import { supabaseClient } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:8080", {
  withCredentials: true,
  autoConnect: true,
  transports: ["websocket", "polling"],
});

const generateBoardWaiting = () => {
  const board: (ChessPiece | null)[][] = importFEN(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  ).board;
  const newBoard: customBoardType = [];
  console.log(board, newBoard);
  for (let i = 0; i < board.length; i++) {
    const row = board[i];
    const newRow: customBoardSquare[] = [];
    // console.log(row)
    for (let j = 0; j < board.length; j++) {
      const square = row[j];
      let newSquare: customBoardSquare = { style: [] };
      if (square?.color) {
        newSquare = {
          style: [],
          data: "",
          piece: {
            color: square.color,
            name: square.type,
          },
        };
      }
      newRow.push(newSquare);
    }
    newBoard.push(newRow);
  }
  return newBoard;
};

type PropsType = {
  roomId: string;
};

export function GameContent(props: PropsType) {
  const supabase = supabaseClient();
  const { roomId } = props;
  const { isSignedIn, user } = useUser();

  const [whiteTime, setWhiteTime] = useState(10 * 60);
  const [blackTime, setBlackTime] = useState(10 * 60);

  const [isGameStarted, setIsGameStarted] = useState(false);

  const [whitePlayerInfo, setWhitePlayerInfo] = useState({
    username: "White",
    elo: "1200?",
  });

  const [blackPlayerInfo, setBlackPlayerInfo] = useState({
    username: "Black",
    elo: "1200?",
  });

  const [status, setStatus] = useState<gameStatus>("loading");

  const [whitePlayerTitle, setWhitePlayerTitle] = useState<string | null>(null);
  const [blackPlayerTitle, setBlackPlayerTitle] = useState<string | null>(null);
  const [whitePlayerBanner, setWhitePlayerBanner] = useState<PlayerBanner | null>(
    null
  );
  const [blackPlayerBanner, setBlackPlayerBanner] = useState<PlayerBanner | null>(
    null
  );

  const updatePlayersData = async (roomJson: roomType) => {
    const { player1, player2 } = roomJson.players;
    const cadence = roomJson.cadence.split("|")[0];

    if (player1.elo_stats && typeof player1.elo_stats === "object") {
      try {
        let elo;
        if (cadence === "1" || cadence === "0.5") {
          elo = player1.elo_stats.classique.bullet;
        } else if (cadence === "3" || cadence === "5") {
          elo = player1.elo_stats.classique.blitz;
        } else {
          elo = player1.elo_stats.classique.rapide;
        }

        setWhitePlayerInfo({
          username: player1.username,
          elo: elo?.toString() || "1200?",
        });
      } catch (error) {
        console.error("Erreur lors du calcul de l'Elo:", error);
      }
    }

    if (player2?.elo_stats) {
      let elo;
      if (cadence === "1" || cadence === "0.5") {
        elo = player2.elo_stats.classique.bullet;
      } else if (cadence === "3" || cadence === "5") {
        elo = player2.elo_stats.classique.blitz;
      } else {
        elo = player2.elo_stats.classique.rapide;
      }

      setBlackPlayerInfo({
        username: player2.username,
        elo: elo?.toString() || "1200?",
      });
    }

    const fetchPlayerTitle = async (clerkId: string) => {
      try {
        const { data: titleData, error: titleError } = await supabase
          .from("user_achievements")
          .select(
            `
            *,
            achievements!inner (
              title
            )
          `
          )
          .eq("clerk_id", clerkId)
          .eq("is_selected", true)
          .maybeSingle();

        if (titleError) {
          console.error("Erreur lors de la récupération du titre:", titleError);
          return null;
        }

        if (!titleData) {
          console.log("Aucun titre trouvé pour le joueur:", clerkId);
          return null;
        }

        return titleData.achievements?.title || null;
      } catch (error) {
        console.error("Erreur lors de la récupération du titre:", error);
        return null;
      }
    };

    const whiteTitle = await fetchPlayerTitle(player1.id);
    const blackTitle = player2?.id ? await fetchPlayerTitle(player2.id) : null;

    setWhitePlayerTitle(whiteTitle);
    setBlackPlayerTitle(blackTitle);

    const whiteBanner = await fetchPlayerBanner(player1.id);
    const blackBanner = player2?.id
      ? await fetchPlayerBanner(player2.id)
      : null;

    setWhitePlayerBanner(whiteBanner);
    setBlackPlayerBanner(blackBanner);
  };

  const fetchPlayerBanner = async (clerkId: string) => {
    try {
      const { data: bannerData, error: bannerError } = await supabase
        .from("user_banners")
        .select(
          `
          *,
          banners!inner (
            link
          )
        `
        )
        .eq("clerk_id", clerkId)
        .eq("is_selected", true)
        .maybeSingle();

      if (bannerError) {
        console.error(
          "Erreur lors de la récupération de la bannière:",
          bannerError
        );
        return null;
      }

      if (!bannerData) {
        console.log("Aucune bannière trouvée pour le joueur:", clerkId);
        return null;
      }

      return {
        bannerUrl: bannerData.banners?.link || null,
        textColors: {
          text: bannerData.text_color || "#FFFFFF",
          title: bannerData.title_color || "#FFFFFF",
          rating: bannerData.rating_color || "#9CA3AF",
        },
      };
    } catch (error) {
      console.error("Erreur lors de la récupération de la bannière:", error);
      return null;
    }
  };

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
      alert(error.message);
      return false;
    } else {
      const dataJson: roomType = data[0];

      setRoomInfo(dataJson);
      updatePlayersData(dataJson);

      if (dataJson?.game && dataJson.game[0]) {
        setGameByMovesArray(dataJson.game);
      } else {
        setGameByFen(dataJson.default_pos);
      }

      socket.emit("room_log", dataJson);
      return dataJson;
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
    movesList,
    setGameByMovesArray,
    setGameByFen,
    drawReason,
    displayedMove2,
    setDisplayedMove,
  } = useGameState();

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isResigned, setIsResigned] = useState(false);
  const [drawOffer, setDrawOffer] = useState<PieceColor>();
  const [playerColor, setPlayerColor] = useState<PieceColor>("white");
  const [isTimeOut, setIsTimeOut] = useState(false);
  const [isRoomLoaded, setIsRoomLoaded] = useState(false);

  useEffect(() => {
    if (!roomInfo) {
      fetchRoomInfo();
      setIsRoomLoaded(true);
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
    user,
  ]);

  useEffect(() => {
    if (user?.id && roomInfo) {
      socket.emit("room_log", roomInfo);
      updatePlayersData(roomInfo);
    }
  }, [user, roomInfo?.id]);

  useEffect(()=>{
    engine.addEventListener('move',(event:eventTypes,states:GameState)=>{
      // console.log('event move listen :',event,states)
      console.log('listened "Move" from addEventListener')
    })
  },[])

  const joinGame = useCallback(
    async (roomJson: roomType) => {
      if (user?.id && roomJson) {
        if (
          roomJson.status === "waiting_for_player" &&
          user.id !== roomJson.players.player1.id
        ) {
          setStatus("can-join");
          return;
        } else if (
          roomJson.status === "waiting_for_player" &&
          user.id == roomJson.players.player1.id
        ) {
          setStatus("waiting");
        } else if (roomJson.status == "in_progress") {
          if (user.id == roomJson.players.player1.id) {
            setGameInfos(
              roomJson.players.player1.color,
              parseInt(roomJson.cadence.split("|")[0])
            );
            setStatus("playing");
          } else if (user.id == roomJson.players.player2.id) {
            setGameInfos(
              roomJson.players.player2.color,
              parseInt(roomJson.cadence.split("|")[0])
            );
            setStatus("playing");
          }
        }
      }
    },
    [user]
  );

  useEffect(() => {
    socket.on("connected-to-the-room", (data: roomType) => {
      joinGame(data);
      console.log("joined");
    });

    socket.on("game_started", (data: roomType) => {
      if (status == "loading" || roomInfo?.status == "in_progress") return;
      setRoomInfo(data);
      if (user && user?.id == data.players.player1.id) {
        setGameInfos(
          data.players.player1.color,
          parseInt(data.cadence.split("|")[0])
        );
        setStatus("playing");
      }
    });

    socket.on("move", (data) => {
      if (data.by === user?.id) {
        return;
      }
      console.log("Mouvement reçu:", data, data.by, user?.id);

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
  }, [
    currentTurn,
    engine,
    joinGame,
    setCurrentTurn,
    setIsCheck,
    setIsCheckmate,
    setIsGameOver,
    setIsStalemate,
    setWinner,
    updateGameState,
    user,
  ]);

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
    const moves = engine.getStrMove();
    socket.emit("move", {
      from,
      to,
      roomId,
      moves: moves,
      by: user?.id,
    });
  };

  switch (status) {
    case "loading":
      return (
        <div className="flex h-[calc(100vh-4rem)] text-white">
          <h1>Loading</h1>
        </div>
      );

    case "waiting":
      return (
        <div className="flex h-[calc(100vh-4rem)] text-white">
          {/* Marge gauche (5%) */}
          <div className="w-[5%]" />

          {/* Panneau de contrôle (20%) */}
          <div className="w-[20%] flex flex-col gap-4 mt-64">
            <PlayerCard
              name={"White"}
              rating={"1200?"}
              time={"10:00"}
              color="white"
              isCurrentTurn={currentTurn === "white"}
            />
            <GameControls
              onResign={() => setIsGameOver(true)}
              onOfferDraw={handleOfferDraw}
              drawOffer={drawOffer}
              onAcceptDraw={handleAcceptDraw}
              onDeclineDraw={handleDeclineDraw}
              playerColor={playerColor}
              isGameOver={isGameOver}
            />
            <PlayerCard
              name={"Black"}
              rating={"1200?"}
              time={"10:00"}
              color="black"
              isCurrentTurn={currentTurn === "black"}
            />
          </div>

          {/* Échiquier (50%) */}
          <div className="w-[50%] flex items-center justify-center p-4">
            {/* {JSON.stringify(generateBoardWaiting())} */}

            <CustomBoard
              selectedPiece="white"
              size={8}
              board={generateBoardWaiting()}
              onSquareClick={() => {}}
              highlightSquares={[]}
              readOnly={true}
              animatedPiece={null}
            />
          </div>

          {/* Historique et chat (20%) */}
          <div className="w-[20%] h-[80%] py-4 px-2 flex flex-col">
            <MovesHistory
              moves={[]}
              className="flex-1 mb-4 rounded-lg p-4"
              displayedMove={0}
              setDisplayedMove={() => {}}
            />
            {/* <GameChat className="h-[30%]" /> */}
          </div>

          {/* Marge droite (5%) */}
          <div className="w-[5%]" />
        </div>
      );

    case "can-join":
      return (
        <div className="flex h-[calc(100vh-4rem)] text-white">
          <div style={{ margin: "0 auto" }} className="w-[50vw]">
            <h1>Invitation de : {roomInfo?.players.player1.username}</h1>

            <h2>Cadence : {roomInfo?.cadence}</h2>

            <button
              style={{ background: "green" }}
              onClick={async () => {
                if (!roomInfo)
                  return alert("Erreur lors de la recuperation des donnée");
                if (!user)
                  return alert(
                    "Vous devez être connecter pour pouvoir rejoindre la partie"
                  );

                const couleur: PieceColor =
                  roomInfo.players.player1.color == "white" ? "black" : "white";

                const newPlayers = roomInfo.players;

                // Récupérer l'Elo du joueur
                const { data: userData, error } = await supabase
                  .from("users")
                  .select("elo_stats")
                  .eq("clerk_id", user.id)
                  .single();

                if (error) {
                  console.error(
                    "Erreur lors de la récupération de l'Elo:",
                    error
                  );
                }

                const cadence = roomInfo.cadence.split("|")[0];
                let elo = "1200?";

                if (userData?.elo_stats) {
                  if (cadence === "1" || cadence === "0.5") {
                    elo = userData.elo_stats.classique.bullet || "1200?";
                  } else if (cadence === "3" || cadence === "5") {
                    elo = userData.elo_stats.classique.blitz || "1200?";
                  } else {
                    elo = userData.elo_stats.classique.rapide || "1200?";
                  }
                }

                let p2Banner = user?.externalId?await fetchPlayerBanner(user.externalId):null

                newPlayers.player2 = {
                  id: user.id,
                  color: couleur,
                  time: `${parseInt(roomInfo.cadence.split("|")[0]) * 60}`,
                  username: user.username ? user.username : "ERREUR",
                  elo_stats: {
                    classique: {
                      bullet: elo,
                      blitz: elo,
                      rapide: elo,
                    },
                  },
                  banner:p2Banner,
                };

                await supabase
                  .from("room")
                  .update({ players: newPlayers, status: `in_progress` })
                  .eq("id", roomId)
                  .then((x) => {
                    if (x.error) {
                      alert("Erreur lors de la connexion a la partie");
                    } else {
                      setGameInfos(
                        couleur,
                        parseInt(roomInfo.cadence.split("|")[0])
                      );
                      setStatus("playing");
                    }
                  });

                const newRoomInfo = {
                  cadence: roomInfo.cadence,
                  createdAt: roomInfo.createdAt,
                  default_pos: roomInfo.default_pos,
                  game: roomInfo.game,
                  game_mode: roomInfo.game_mode,
                  id: roomInfo.id,
                  players: newPlayers,
                  status: "in_progress",
                  rated: roomInfo.rated,
                  turn: roomInfo.turn,
                };

                setRoomInfo(newRoomInfo);

                socket.emit("game-joined", { newRoomInfo });
              }}
            >
              Rejoindre la partie
            </button>
          </div>
        </div>
      );

    case "playing":
      return (
        <div className="flex h-[calc(100vh-4rem)] text-white">
          {/* Marge gauche (5%) */}
          <div className="w-[5%]" />

          {/* Panneau de contrôle (20%) */}
          <div className="w-[20%] flex flex-col gap-4 mt-64">
            <PlayerCard
              name={whitePlayerInfo.username}
              rating={whitePlayerInfo.elo}
              time={formatTime(whiteTime)}
              color="white"
              isCurrentTurn={currentTurn === "white"}
              selectedBanner={whitePlayerBanner?.bannerUrl}
              textColors={whitePlayerBanner?.textColors}
              selectedTitle={whitePlayerTitle || undefined}
            />
            <GameControls
              onResign={() => setIsGameOver(true)}
              onOfferDraw={handleOfferDraw}
              drawOffer={drawOffer}
              onAcceptDraw={handleAcceptDraw}
              onDeclineDraw={handleDeclineDraw}
              playerColor={playerColor}
              isGameOver={isGameOver}
            />
            <PlayerCard
              // name={blackPlayerInfo.username}
              // rating={blackPlayerInfo.elo}
              // time={formatTime(blackTime)}
              // color="black"
              // isCurrentTurn={currentTurn === "black"}
              // materialAdvantage={engine.getGameState().materialAdvantage}
              // selectedTitle={blackPlayerTitle || undefined}
              // selectedBanner={blackPlayerBanner || undefined}
              name={blackPlayerInfo.username}
              rating={blackPlayerInfo.elo}
              time={formatTime(blackTime)}
              color="black"
              isCurrentTurn={currentTurn === "black"}
              selectedBanner={blackPlayerBanner?.bannerUrl}
              textColors={blackPlayerBanner?.textColors}
              selectedTitle={blackPlayerTitle || undefined}
            />
          </div>

          {/* Échiquier (50%) */}
          <div className="w-[50%] flex items-center justify-center p-4">
            <ChessBoard
              playerColor={playerColor}
              className="w-full aspect-square"
              board={board}
              setBoard={setBoard}
              engine={engine}
              onMove={handleMove}
              isPlaying={status == "playing"}
              displayed={displayedMove2}
              list={movesList}
            />
          </div>

          {/* Historique et chat (20%) */}
          <div className="w-[20%] py-4 px-2 flex flex-col">
            <MovesHistory
              moves={movesList}
              className="flex-1 mb-4 rounded-lg p-4"
              displayedMove={displayedMove2}
              setDisplayedMove={setDisplayedMove}
            />
            <GameChat className="h-[30%]" />
          </div>

          {/* Marge droite (5%) */}
          <div className="w-[5%]" />
        </div>
      );

    default:
      break;
  }
}
