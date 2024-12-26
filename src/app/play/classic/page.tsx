"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Timer, Rocket, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";

const timeCategories = {
  bullet: {
    name: "Bullet",
    icon: <Rocket className="w-6 h-6" />,
    description: "Parties ultra rapides",
    modes: [
      {
        name: "Ultra Bullet",
        time: 0.5,
        incr: 0,
        description: "30 secondes par joueur",
      },
      {
        name: "Bullet",
        time: 1,
        incr: 0,
        description: "1 minute par joueur",
      },
      {
        name: "Bullet + 1s",
        time: 1,
        incr: 1,
        description: "1 minute par joueur + 1s de temps par coup",
      },
    ],
  },
  blitz: {
    name: "Blitz",
    icon: <Zap className="w-6 h-6" />,
    description: "Parties rapides",
    modes: [
      {
        name: "Super Blitz",
        time: 3,
        incr: 0,
        description: "3 minutes par joueur",
      },
      {
        name: "Super Blitz + 2s",
        time: 3,
        incr: 2,
        description: "3 minutes par joueur + 2s de temps par coup",
      },
      {
        name: "Blitz",
        time: 5,
        incr: 0,
        description: "5 minutes par joueur",
      },
    ],
  },
  rapid: {
    name: "Rapide",
    icon: <Timer className="w-6 h-6" />,
    description: "Parties classiques",
    modes: [
      {
        name: "Rapide",
        time: 10,
        incr: 0,
        description: "10 minutes par joueur",
      },
      {
        name: "Rapide + 5s",
        time: 10,
        incr: 5,
        description: "10 minutes par joueur + 5s de temps par coup",
      },
      {
        name: "Classique",
        time: 30,
        incr: 2,
        description: "30 minutes par joueur + 2s de temps par coup",
      },
    ],
  },
};

export default function ClassicModePage() {
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [eloStats, setEloStats] = useState({
    bullet: null,
    blitz: null,
    rapid: null,
  });

  const fetchUserStats = async () => {
    if (user) {
      const { data, error } = await supabase
        .from("users")
        .select("elo_stats")
        .eq("clerk_id", user.id)
        .single();

      if (error) {
        console.error(
          "Erreur lors de la récupération des statistiques:",
          error
        );
      } else {
        setEloStats({
          bullet: data.elo_stats.classique.bullet,
          blitz: data.elo_stats.classique.blitz,
          rapid: data.elo_stats.classique.rapide,
        });
      }
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, [user]);

  const handleTimeControlSelect = async (
    minutes: number,
    increment: number
  ) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      if (!isSignedIn) {
        alert("Vous devez vous connecter avant de pouvoir créer une partie");
        setIsLoading(false);
        return;
      }

      const currentDate = new Date();
      const timestamp = currentDate.getTime();

      const response = await supabase
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
              username: user.username,
              elo: "1200?",
            },
            player2: {},
            turn: "white",
          },
          default_pos:'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          game: "",
          createdAt: timestamp,
        })
        .select("id");

      if (response.error) {
        alert("Erreur lors de la création de la room");
        setIsLoading(false);
      } else {
        router.push(`/play/${response.data[0].id}`);
      }
    } catch (error) {
      alert("Une erreur est survenue: " + error);
      setIsLoading(false);
    }
  };

  return (
    <main className="h-screen bg-background flex pt-20">
      {/* Sidebar */}
      <div className="w-80 border-r">
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Image
              src={
                user?.imageUrl || "https://ui-avatars.com/api/?name=Chess+Game"
              }
              alt="User Profile"
              width={32}
              height={32}
              className="w-8 h-8 rounded-full"
            />
            <h2 className="font-semibold capitalize">{user?.username}</h2>
          </div>

          <nav className="flex flex-col space-y-2">
            <div className="mt-4">
              <h3 className="font-semibold">Classement Elo :</h3>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center">
                  <Rocket className="w-4 h-4 mr-2" />
                  <span className="text-center">
                    Bullet: {eloStats.bullet || "N/A"}
                  </span>
                </div>
                <div className="flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  <span className="text-center">
                    Blitz: {eloStats.blitz || "N/A"}
                  </span>
                </div>
                <div className="flex items-center">
                  <Timer className="w-4 h-4 mr-2" />
                  <span className="text-center">
                    Rapide: {eloStats.rapid || "N/A"}
                  </span>
                </div>
              </div>
            </div>
            <Link href="/my-games">
              <Button variant="outline" className="w-full mt-8">
                Mes Parties
              </Button>
            </Link>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => signOut()}
            >
              Déconnexion
            </Button>
          </nav>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold mb-8"
          >
            Choisissez votre cadence
          </motion.h1>

          {!selectedCategory ? (
            <div className="grid grid-cols-3 gap-6">
              {Object.entries(timeCategories).map(([key, category], index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className={`p-6 cursor-pointer transition-all hover:border-primary ${
                      selectedCategory === key ? "border-primary" : ""
                    }`}
                    onClick={() => setSelectedCategory(key)}
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        {category.icon}
                      </div>
                      <div className="text-center">
                        <h3 className="text-xl font-semibold">
                          {category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Button
                variant="ghost"
                className="mb-4"
                onClick={() => setSelectedCategory(null)}
              >
                ← Retour
              </Button>
              <div className="grid grid-cols-3 gap-6">
                {timeCategories[
                  selectedCategory as keyof typeof timeCategories
                ].modes.map((mode, index) => (
                  <motion.div
                    key={mode.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className="p-6 cursor-pointer hover:border-primary"
                      onClick={() =>
                        handleTimeControlSelect(mode.time, mode.incr)
                      }
                    >
                      <div className="text-center space-y-2">
                        <h3 className="text-xl font-semibold">{mode.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {mode.description}
                        </p>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
