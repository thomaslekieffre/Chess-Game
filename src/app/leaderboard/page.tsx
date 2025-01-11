"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { supabaseClient } from "@/lib/supabase";
import { Rocket, Zap, Timer } from "lucide-react";

type LeaderboardEntry = {
  username: string;
  elo_stats: {
    classique: {
      bullet: number;
      blitz: number;
      rapide: number;
    };
    saisonnier?: {
      bullet: number;
      blitz: number;
      rapide: number;
    };
  };
};

export default function LeaderboardPage() {
  const supabase = supabaseClient();
  const [mode, setMode] = useState<"classique" | "saisonnier">("classique");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    fetchLeaderboard();
  }, [mode]);

  const fetchLeaderboard = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("username, elo_stats")
      .order(`elo_stats->${mode}->bullet`, { ascending: false })
      .limit(10);

    if (error) {
      console.error("Erreur lors de la récupération du classement:", error);
      return;
    }

    setLeaderboard(data);
  };

  return (
    <div className="container mx-auto py-8 mt-16">
      <Tabs defaultValue="classique" className="w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            Classement {mode === "classique" ? "Classique" : "Saisonnier"}
          </h1>
          <TabsList>
            <TabsTrigger value="classique" onClick={() => setMode("classique")}>
              Classique
            </TabsTrigger>
            <TabsTrigger
              value="saisonnier"
              onClick={() => setMode("saisonnier")}
            >
              Saisonnier
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="classique">
          <div className="grid grid-cols-3 gap-8">
            {/* Bullet Leaderboard */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Rocket className="w-6 h-6" />
                <h2 className="text-xl font-semibold">Bullet</h2>
              </div>
              <div className="space-y-2">
                {leaderboard.map((player, index) => (
                  <div
                    key={player.username + "-bullet"}
                    className="flex justify-between items-center p-2 bg-secondary rounded"
                  >
                    <span>
                      {index === 0
                        ? "🏆"
                        : index === 1
                        ? "🥈"
                        : index === 2
                        ? "🥉"
                        : `#${index + 1}`}{" "}
                      {player.username}
                    </span>
                    <span className="font-mono">
                      {player.elo_stats.classique.bullet}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Blitz Leaderboard */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-6 h-6" />
                <h2 className="text-xl font-semibold">Blitz</h2>
              </div>
              <div className="space-y-2">
                {leaderboard.map((player, index) => (
                  <div
                    key={player.username + "-blitz"}
                    className="flex justify-between items-center p-2 bg-secondary rounded"
                  >
                    <span>
                      {index === 0
                        ? "🏆"
                        : index === 1
                        ? "🥈"
                        : index === 2
                        ? "🥉"
                        : `#${index + 1}`}{" "}
                      {player.username}
                    </span>
                    <span className="font-mono">
                      {player.elo_stats.classique.blitz}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Rapide Leaderboard */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Timer className="w-6 h-6" />
                <h2 className="text-xl font-semibold">Rapide</h2>
              </div>
              <div className="space-y-2">
                {leaderboard.map((player, index) => (
                  <div
                    key={player.username + "-rapide"}
                    className="flex justify-between items-center p-2 bg-secondary rounded"
                  >
                    <span>
                      {index === 0
                        ? "🏆"
                        : index === 1
                        ? "🥈"
                        : index === 2
                        ? "🥉"
                        : `#${index + 1}`}{" "}
                      {player.username}
                    </span>
                    <span className="font-mono">
                      {player.elo_stats.classique.rapide}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="saisonnier">
          <div className="grid grid-cols-3 gap-8">
            {/* Bullet Leaderboard */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Rocket className="w-6 h-6" />
                <h2 className="text-xl font-semibold">Bullet</h2>
              </div>
              <div className="space-y-2">
                {leaderboard.map((player, index) => (
                  <div
                    key={player.username + "-bullet"}
                    className="flex justify-between items-center p-2 bg-secondary rounded"
                  >
                    <span>
                      {index === 0
                        ? "🏆"
                        : index === 1
                        ? "🥈"
                        : index === 2
                        ? "🥉"
                        : `#${index + 1}`}{" "}
                      {player.username}
                    </span>
                    <span className="font-mono">
                      {player.elo_stats.saisonnier?.bullet}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Blitz Leaderboard */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-6 h-6" />
                <h2 className="text-xl font-semibold">Blitz</h2>
              </div>
              <div className="space-y-2">
                {leaderboard.map((player, index) => (
                  <div
                    key={player.username + "-blitz"}
                    className="flex justify-between items-center p-2 bg-secondary rounded"
                  >
                    <span>
                      {index === 0
                        ? "🏆"
                        : index === 1
                        ? "🥈"
                        : index === 2
                        ? "🥉"
                        : `#${index + 1}`}{" "}
                      {player.username}
                    </span>
                    <span className="font-mono">
                      {player.elo_stats.saisonnier?.blitz}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Rapide Leaderboard */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Timer className="w-6 h-6" />
                <h2 className="text-xl font-semibold">Rapide</h2>
              </div>
              <div className="space-y-2">
                {leaderboard.map((player, index) => (
                  <div
                    key={player.username + "-rapide"}
                    className="flex justify-between items-center p-2 bg-secondary rounded"
                  >
                    <span>
                      {index === 0
                        ? "🏆"
                        : index === 1
                        ? "🥈"
                        : index === 2
                        ? "🥉"
                        : `#${index + 1}`}{" "}
                      {player.username}
                    </span>
                    <span className="font-mono">
                      {player.elo_stats.saisonnier?.rapide}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>{" "}
        </TabsContent>
      </Tabs>
    </div>
  );
}
