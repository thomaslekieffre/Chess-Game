import React from "react";

interface UserStatsProps {
  totalAchievements: number;
  unlockedAchievements: number;
  // totalTimeSpent: number; // en minutes
  completedQuests: number;
}

const UserStats: React.FC<UserStatsProps> = ({
  totalAchievements,
  unlockedAchievements,
  // totalTimeSpent,
  completedQuests,
}) => {
  const percentageUnlocked = (unlockedAchievements / totalAchievements) * 100;

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-2">
        Statistiques de l&apos;utilisateur
      </h2>
      <p>
        Succès débloqués : {unlockedAchievements} / {totalAchievements}
      </p>
      <p>Pourcentage débloqué : {percentageUnlocked.toFixed(2)}%</p>
      {/* <p>Temps total passé : {totalTimeSpent} minutes</p> */}
      <p>Quêtes complétées : {completedQuests}</p>
    </div>
  );
};

export default UserStats;
