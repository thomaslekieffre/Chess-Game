"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { getFlagEmoji } from "@/utils/getFlagEmoji";

interface UserData {
  username: string;
  real_name: string;
  country: string;
  emoji: string;
  avatar_url: string;
  elo_stats: {
    classique: {
      bullet: number | null;
      blitz: number | null;
      rapide: number | null;
    };
    saisonnier: {
      bullet: number | null;
      blitz: number | null;
      rapide: number | null;
    };
  };
}

const ProfilePage = () => {
  const { username } = useParams();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (username) {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("username", username)
          .single();

        if (error) {
          console.error("Erreur lors de la récupération des données:", error);
        } else {
          setUserData(data);
        }
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!userData) {
    return <div>Utilisateur non trouvé.</div>;
  }

  return (
    <main className="min-h-screen pt-32 bg-background">
      <div className="container max-w-2xl flex space-x-6">
        <Card className="p-6 w-1/2 border border-gray-400">
          <div className="flex items-center mb-4">
            <img
              src={
                userData.avatar_url || "https://ui-avatars.com/api/?name=User"
              }
              alt="User Profile"
              className="w-16 h-16 rounded-full mr-4"
            />
            <div>
              <h2 className="text-xl font-semibold">{userData.username}</h2>
              <div className="flex items-center space-x-2">
                <p className="text-lg">{getFlagEmoji(userData.country)}</p>
                <p className="text-sm">{userData.emoji}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold">Nom d&apos;utilisateur</h3>
              <p>{userData.username}</p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Nom réel</h3>
              <p>{userData.real_name}</p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Pays/Région</h3>
              <p>{userData.country}</p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Émoji</h3>
              <p>{userData.emoji}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 w-1/2 border border-gray-400">
          <h2 className="text-2xl font-bold mb-4">Classement Elo</h2>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Classique</h3>
            <div className="flex items-center">
              <span className="mr-2">🚀</span>
              <span>
                Bullet: {userData.elo_stats.classique.bullet || "N/A"}
              </span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">⚡</span>
              <span>Blitz: {userData.elo_stats.classique.blitz || "N/A"}</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">⏱️</span>
              <span>
                Rapide: {userData.elo_stats.classique.rapide || "N/A"}
              </span>
            </div>

            <h3 className="text-xl font-semibold">Saisonnier</h3>
            <div className="flex items-center">
              <span className="mr-2">🔥</span>
              <span>
                Bullet: {userData.elo_stats.saisonnier.bullet || "N/A"}
              </span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">✨</span>
              <span>Blitz: {userData.elo_stats.saisonnier.blitz || "N/A"}</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">⏳</span>
              <span>
                Rapide: {userData.elo_stats.saisonnier.rapide || "N/A"}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
};

export default ProfilePage;
