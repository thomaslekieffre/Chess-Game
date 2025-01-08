import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Achievement {
  id: string;
  title: string;
  description: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlocked: boolean;
  is_selected: boolean;
}

export function AchievementsList({ userId }: { userId: string }) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showUnlocked, setShowUnlocked] = useState<boolean | null>(null);

  useEffect(() => {
    fetchAchievements();
  }, [userId]);

  const fetchAchievements = async () => {
    const { data: userAchievements, error: userAchievementsError } =
      await supabase
        .from("user_achievements")
        .select("achievement_id, is_selected")
        .eq("clerk_id", userId);

    if (userAchievementsError) {
      console.error(
        "Erreur lors de la récupération des succès:",
        userAchievementsError
      );
      return;
    }

    const { data: allAchievements, error: achievementsError } = await supabase
      .from("achievements")
      .select("*");

    if (achievementsError) {
      console.error(
        "Erreur lors de la récupération des succès:",
        achievementsError
      );
      return;
    }

    const mergedAchievements = allAchievements.map((achievement) => {
      const userAchievement = userAchievements?.find(
        (ua) => ua.achievement_id === achievement.id
      );
      return {
        ...achievement,
        unlocked: !!userAchievement,
        is_selected: userAchievement?.is_selected || false,
      };
    });

    setAchievements(mergedAchievements);
  };

  const selectAchievement = async (achievementId: string) => {
    const { error: updateError } = await supabase
      .from("user_achievements")
      .update({ is_selected: false })
      .eq("clerk_id", userId);

    if (updateError) {
      console.error("Erreur lors de la mise à jour:", updateError);
      return;
    }

    const { error: selectError } = await supabase
      .from("user_achievements")
      .update({ is_selected: true })
      .eq("clerk_id", userId)
      .eq("achievement_id", achievementId);

    if (selectError) {
      console.error("Erreur lors de la sélection:", selectError);
      return;
    }

    await fetchAchievements();
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "text-gray-400";
      case "rare":
        return "text-blue-400";
      case "epic":
        return "text-purple-400";
      case "legendary":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  const filteredAchievements =
    showUnlocked === null
      ? [...achievements].sort((a, b) => a.title.localeCompare(b.title))
      : achievements.filter(
          (achievement) => achievement.unlocked === showUnlocked
        );

  return (
    <div>
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="filter-achievements"
            checked={showUnlocked !== null}
            onCheckedChange={(checked) => {
              if (!checked) {
                setShowUnlocked(null);
              } else {
                setShowUnlocked(true);
              }
            }}
            className="dark:bg-gray-700"
          />
          <Label htmlFor="filter-achievements" className="text-foreground">
            Filtrer les succès
          </Label>
        </div>
        {showUnlocked !== null && (
          <div className="flex space-x-2">
            <Button
              variant={showUnlocked ? "default" : "outline"}
              size="sm"
              onClick={() => setShowUnlocked(true)}
              className="dark:border-gray-700"
            >
              Débloqués
            </Button>
            <Button
              variant={!showUnlocked ? "default" : "outline"}
              size="sm"
              onClick={() => setShowUnlocked(false)}
              className="dark:border-gray-700"
            >
              Non débloqués
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => (
          <Card
            key={achievement.id}
            className={`p-4 ${
              showUnlocked === null && !achievement.unlocked ? "opacity-50" : ""
            }`}
          >
            <h3 className={`font-bold ${getRarityColor(achievement.rarity)}`}>
              {achievement.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {achievement.description}
            </p>
            {achievement.unlocked && (
              <Button
                variant={achievement.is_selected ? "default" : "outline"}
                size="sm"
                onClick={() => selectAchievement(achievement.id)}
                disabled={achievement.is_selected}
              >
                {achievement.is_selected ? "Sélectionné" : "Sélectionner"}
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
