import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env.local"),
});

import express from "express";
import http from "http";
import { Server } from "socket.io";
import { supabase } from "./lib/supabase";
import { convertToPGN } from "./lib/chess/pgn";

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
    socket.emit("connected-to-the-room ", data);
  });

  socket.on("move", async (data) => {
    await supabase
      .from("room")
      .update({ game: convertToPGN(data.moves) })
      .eq("id", data.roomId)
      .then((x) => {
        console.log(x);
        if (x.error) {
          alert("Erreur lors de la connexion a la partie");
        } else {
          io.to(`game_${data.roomId}`).emit(`move`, data);
          console.log("edited");
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
