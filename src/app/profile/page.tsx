"use client";

import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { getFlagEmoji } from "@/utils/getFlagEmoji";
import UserStats from "@/components/profile/UserStats";
import { PlayerCard } from "@/components/chess/player-card";

const imageUrlRegex =
  /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|bmp|webp|svg|mp4|mov|avi))$/i;

export default function ProfilePage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    realName: "",
    country: "",
    emoji: "👋",
    avatarUrl: "",
  });
  const [eloStats, setEloStats] = useState({
    classique: {
      bullet: null,
      blitz: null,
      rapide: null,
    },
    saisonnier: {
      bullet: null,
      blitz: null,
      rapide: null,
    },
  });
  const [stats, setStats] = useState({
    totalAchievements: 0,
    unlockedAchievements: 0,
    // totalTimeSpent: 0,
    completedQuests: 0,
  });
  const [timeSpent, setTimeSpent] = useState(0);
  const [bannerUrl, setBannerUrl] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("clerk_id", user.id)
          .single();

        if (error) {
          console.error("Erreur lors de la récupération des données:", error);
        } else if (data) {
          setFormData({
            username: data.username || "",
            realName: data.real_name || "",
            country: data.country || "",
            emoji: data.emoji || "👋",
            avatarUrl: data.avatar_url || "",
          });
          setEloStats(
            data.elo_stats || {
              classique: { bullet: null, blitz: null, rapide: null },
              saisonnier: { bullet: null, blitz: null, rapide: null },
            }
          );
          // setTimeSpent(data.total_time_spent || 0);
        }
      }
    };

    fetchUserData();
  }, [user]);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (user) {
        const { data: achievementsData } = await supabase
          .from("achievements")
          .select("*");

        const totalAchievements = achievementsData?.length || 0;
        const { data: userAchievements } = await supabase
          .from("user_achievements")
          .select("achievement_id")
          .eq("clerk_id", user.id);

        const unlockedAchievements = userAchievements?.length || 0;

        // const totalTimeSpent = timeSpent;
        const { data: userQuests } = await supabase
          .from("user_quests")
          .select("quest_id")
          .eq("clerk_id", user.id)
          .eq("is_completed", true);

        const completedQuests = userQuests?.length || 0;

        setStats({
          totalAchievements,
          unlockedAchievements,
          // totalTimeSpent,
          completedQuests,
        });
      }
    };

    fetchUserStats();
  }, [user, timeSpent]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!user?.id) {
        throw new Error("Utilisateur non connecté");
      }

      if (formData.avatarUrl && !imageUrlRegex.test(formData.avatarUrl)) {
        alert("Veuillez entrer une URL d'image valide.");
        setIsLoading(false);
        return;
      }

      if (bannerUrl && !imageUrlRegex.test(bannerUrl)) {
        alert("Veuillez entrer une URL de bannière valide.");
        setIsLoading(false);
        return;
      }

      const response = await supabase
        .from("users")
        .update({
          username: formData.username,
          real_name: formData.realName,
          country: formData.country,
          emoji: formData.emoji,
          avatar_url: formData.avatarUrl,
          banner_url: bannerUrl,
          total_time_spent: timeSpent,
        })
        .eq("clerk_id", user.id);

      if (response.error) {
        console.error("Erreur de mise à jour:", response.error);
        alert("Erreur lors de la mise à jour du profil");
      } else {
        alert("Profil mis à jour avec succès");
      }
    } catch (error) {
      console.error("Erreur complète:", error);
      alert("Une erreur est survenue: " + error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut();
  };

  return (
    <main className="min-h-screen pt-32 bg-background">
      <div className="container max-w-2xl flex space-x-6">
        <Card className="p-6 w-1/2 border border-gray-400">
          <div className="flex items-center mb-4">
            <img
              src={
                formData.avatarUrl || "https://ui-avatars.com/api/?name=User"
              }
              alt="User Profile"
              className="w-16 h-16 rounded-full mr-4"
            />
            <div>
              <h2 className="text-xl font-semibold">{formData.username}</h2>
              <div className="flex items-center space-x-2">
                <p className="text-lg">{getFlagEmoji(formData.country)}</p>
                <p className="text-sm">{formData.emoji}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="avatarUrl">Lien de l&apos;image de profil</Label>
              <Input
                id="avatarUrl"
                value={formData.avatarUrl}
                onChange={(e) =>
                  setFormData({ ...formData, avatarUrl: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Nom d&apos;utilisateur</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="realName">Nom réel</Label>
              <Input
                id="realName"
                value={formData.realName}
                onChange={(e) =>
                  setFormData({ ...formData, realName: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Pays/Région</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Émoji</Label>
              <Input
                id="emoji"
                value={formData.emoji}
                onChange={(e) =>
                  setFormData({ ...formData, emoji: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bannerUrl">Lien de la bannière</Label>
              <Input
                id="bannerUrl"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Mise à jour..." : "Sauvegarder les modifications"}
            </Button>
          </form>
        </Card>

        <Card className="p-6 w-1/2 border border-gray-400">
          <h2 className="text-2xl font-bold mb-4">Classement Elo</h2>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Classique</h3>
            <div className="flex items-center">
              <span className="mr-2">🚀</span>
              <span>Bullet: {eloStats.classique.bullet || "N/A"}</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">⚡</span>
              <span>Blitz: {eloStats.classique.blitz || "N/A"}</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">⏱️</span>
              <span>Rapide: {eloStats.classique.rapide || "N/A"}</span>
            </div>

            <h3 className="text-xl font-semibold">Saisonnier</h3>
            <div className="flex items-center">
              <span className="mr-2">🔥</span>
              <span>Bullet: {eloStats.saisonnier.bullet || "N/A"}</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">✨</span>
              <span>Blitz: {eloStats.saisonnier.blitz || "N/A"}</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">⏳</span>
              <span>Rapide: {eloStats.saisonnier.rapide || "N/A"}</span>
            </div>
          </div>
        </Card>
      </div>

      <Button
        onClick={handleSignOut}
        variant="destructive"
        className="mt-10 mx-auto flex"
      >
        Se déconnecter
      </Button>

      <UserStats
        totalAchievements={stats.totalAchievements}
        unlockedAchievements={stats.unlockedAchievements}
        // totalTimeSpent={stats.totalTimeSpent}
        completedQuests={stats.completedQuests}
      />

      <PlayerCard
        name={formData.username}
        rating={eloStats.classique.bullet || "N/A"}
        time="10:00"
        color="white"
        isCurrentTurn={true}
        bannerUrl={bannerUrl}
      />
    </main>
  );
}
