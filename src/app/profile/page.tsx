"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    realName: "",
    country: "",
    emoji: "👋",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        console.log("Fetching data for user:", user.id);
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Erreur complète:", error);
        } else if (data) {
          console.log("Données récupérées:", data);
          setFormData({
            username: data.username || "",
            realName: data.real_name || "",
            country: data.country || "",
            emoji: data.emoji || "👋",
          });
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!user?.id) {
        throw new Error("Utilisateur non connecté");
      }

      const response = await supabase.from("users").upsert({
        id: user.id,
        username: formData.username,
        real_name: formData.realName,
        country: formData.country,
        emoji: formData.emoji,
      });

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

  return (
    <main className="min-h-screen pt-20 bg-background">
      <div className="container max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Profil</h1>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Mise à jour..." : "Sauvegarder les modifications"}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
