"use client";

import { Button } from "@/components/ui/button";
import { Timer, Zap, Gauge } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
// import { User, currentUser } from "@clerk/nextjs/server";
// import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";

const timeControls = [
  {
    name: "Bullet",
    time: 1,
    incr: 0,
    icon: <Zap className="w-6 h-6" />,
    description: "1 minute par joueur",
  },
  {
    name: "Blitz",
    time: 3,
    incr: 0,
    icon: <Timer className="w-6 h-6" />,
    description: "3 minutes par joueur",
  },
  {
    name: "Rapide",
    time: 10,
    incr: 0,
    icon: <Gauge className="w-6 h-6" />,
    description: "10 minutes par joueur",
  },
];

export default function ClassicModePage() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();

  const handleTimeControlSelect = async (
    minutes: number,
    increment: number
  ) => {
    if (isSignedIn) {
      const currentDate = new Date();
      const timestamp = currentDate.getTime();
      console.log(timestamp);
      console.log(user);
      await supabase
        .from("room")
        .insert({
          cadence: `${minutes}|${increment}`,
          game_mode: "classic",
          status: "waiting_for_player",
          rated: false,
          players: {
            player1: {
              id: user.id,
              color: "white",
              time: minutes * 60,
              username:user.username,
              elo:'1200?'
            },
            player2: {},
            turn: "white",
          },
          game: "",
          createdAt: timestamp,
        })
        .select("id")
        .then((x) => {
          // console.log("Réponse de Supabase:", x);
          if (x.error) {
            alert("Erreur lors de la création de la room");
          } else {
            router.push(`/play/${x.data[0].id}`);
          }
        });
    } else {
      alert("Vous devez vous connecter avant de pouvoir crée un compte");
    }
  };

  return (
    <main className="min-h-screen pt-20 bg-background">
      <div className="container max-w-4xl">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-8 text-center"
        >
          Choisissez votre cadence
        </motion.h1>

        <div className="grid md:grid-cols-3 gap-6">
          {timeControls.map((control, index) => (
            <motion.div
              key={control.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant="outline"
                className="w-full h-auto p-6 hover:border-primary"
                onClick={() =>
                  handleTimeControlSelect(control.time, control.incr)
                }
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {control.icon}
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">{control.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {control.description}
                    </p>
                  </div>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
