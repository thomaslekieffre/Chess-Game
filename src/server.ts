import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env.local"),
});

import express from "express";
import http from "http";
import { Server } from "socket.io";
import { convertToPGN } from "./lib/chess/pgn";
import { supabase } from "./lib/supabase";

// import {PgnReader} from '@mliebelt/pgn-reader'

// let game = new PgnReader({ pgn: '1. e4 *', ... }).getGame(0)
// let resultPGN = writeGame({
//   "from": {
//       "x": 2,
//       "y": 2
//   },
//   "to": {
//       "x": 3,
//       "y": 4
//   },
//   "roomId": "e30c3c97-8f7b-4b4d-a903-f5b81340978b",
//   "moves": [
//       {
//           "from": {
//               "x": 4,
//               "y": 6
//           },
//           "to": {
//               "x": 4,
//               "y": 4
//           },
//           "piece": {
//               "type": "pawn",
//               "color": "white",
//               "hasMoved": true
//           }
//       },
//       {
//           "from": {
//               "x": 2,
//               "y": 1
//           },
//           "to": {
//               "x": 2,
//               "y": 3
//           },
//           "piece": {
//               "type": "pawn",
//               "color": "black",
//               "hasMoved": true
//           }
//       },
//       {
//           "from": {
//               "x": 6,
//               "y": 7
//           },
//           "to": {
//               "x": 5,
//               "y": 5
//           },
//           "piece": {
//               "type": "knight",
//               "color": "white",
//               "hasMoved": true
//           }
//       },
//       {
//           "from": {
//               "x": 1,
//               "y": 0
//           },
//           "to": {
//               "x": 2,
//               "y": 2
//           },
//           "piece": {
//               "type": "knight",
//               "color": "black",
//               "hasMoved": true
//           }
//       },
//       {
//           "from": {
//               "x": 3,
//               "y": 6
//           },
//           "to": {
//               "x": 3,
//               "y": 4
//           },
//           "piece": {
//               "type": "pawn",
//               "color": "white",
//               "hasMoved": true
//           }
//       },
//       {
//           "from": {
//               "x": 2,
//               "y": 3
//           },
//           "to": {
//               "x": 3,
//               "y": 4
//           },
//           "piece": {
//               "type": "pawn",
//               "color": "black",
//               "hasMoved": true
//           },
//           "captured": {
//               "type": "pawn",
//               "color": "white",
//               "hasMoved": true
//           }
//       },
//       {
//           "from": {
//               "x": 5,
//               "y": 5
//           },
//           "to": {
//               "x": 3,
//               "y": 4
//           },
//           "piece": {
//               "type": "knight",
//               "color": "white",
//               "hasMoved": true
//           },
//           "captured": {
//               "type": "pawn",
//               "color": "black",
//               "hasMoved": true
//           }
//       },
//       {
//           "from": {
//               "x": 2,
//               "y": 2
//           },
//           "to": {
//               "x": 3,
//               "y": 4
//           },
//           "piece": {
//               "type": "knight",
//               "color": "black",
//               "hasMoved": true
//           },
//           "captured": {
//               "type": "knight",
//               "color": "white",
//               "hasMoved": true
//           }
//       }
//   ],
//   "by": "user_2qWlkgBS0LIWoJQjNba1nyzFrKg"
// })

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Un joueur est connecté " + socket.id);

  socket.on("room_log", (data) => {
    console.log(data);
    socket.join(`game_${data.id}`);
    console.log("Utilisateur connecter a la room " + data.id);
    socket.emit("connected-to-the-room", data);
  });

  socket.on("move", async (data) => {
    await supabase
      .from("room")
      .update({ game: convertToPGN(data.moves) })
      .eq("id", data.roomId)
      .then((x) => {
        // console.log(x);
        if (x.error) {
          alert("Erreur lors de la connexion a la partie");
        } else {
          io.to(`game_${data.roomId}`).emit(`move`, data);
          // console.log("edited");
        }
      });
  });

  socket.on("disconnect", () => {
    console.log("Un joueur s'est déconnecté");
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Serveur Socket.IO en cours d'exécution sur le port ${PORT}`);
});
