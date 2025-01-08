"use client";

import { useUser } from "@clerk/nextjs";
import { AchievementsList } from "@/components/achievements/AchievementsList";

export default function AchievementsPage() {
  const { user } = useUser();

  if (!user) {
    return (
      <div className="min-h-screen pt-20 bg-background">
        <div className="container">
          <h1 className="text-3xl font-bold mb-8">
            Connectez-vous pour voir vos succès
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-background">
      <div className="container">
        <h1 className="text-3xl font-bold mb-8">Liste des Succès</h1>
        <AchievementsList userId={user.id} />
      </div>
    </div>
  );
}
