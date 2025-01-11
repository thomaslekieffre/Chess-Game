"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase";

interface Progress {
  battle_pass_level: number;
  xp: number;
}

const BattlePassProgress = ({ clerkId }: { clerkId: string }) => {
  const supabase = supabaseClient();

  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    const fetchUserIdAndProgress = async () => {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", clerkId)
        .single();

      if (userError) {
        console.error(
          "Erreur lors de la récupération de l'utilisateur:",
          userError.message
        );
        return;
      }

      if (!userData) {
        console.error("Aucun utilisateur trouvé avec ce clerk_id.");
        return;
      }

      const userId = userData.id;

      if (userId) {
        const { data, error } = await supabase
          .from("users")
          .select("battle_pass_level, xp")
          .eq("id", userId)
          .single();

        if (error) {
          console.error(
            "Erreur lors de la récupération de la progression:",
            error.message
          );
        } else {
          setProgress(data);
        }
      }
    };

    fetchUserIdAndProgress();
  }, [clerkId]);

  const maxLevel = 60;
  const xpForNextLevel = 500;

  return (
    <div>
      {progress ? (
        <div className="flex flex-col items-center gap-6">
          <p>
            Niveau: {progress.battle_pass_level || 1} / {maxLevel}
          </p>
          <div className="relative w-full h-4 bg-gray-200 rounded">
            <div
              className="absolute h-full bg-blue-600 rounded"
              style={{
                width: `${
                  ((progress.battle_pass_level || 1) / maxLevel) * 100
                }%`,
              }}
            />
          </div>
          <p>
            XP: {progress.xp || 0} / {xpForNextLevel}
          </p>
          <div className="relative w-full h-4 bg-gray-200 rounded mt-2">
            <div
              className="absolute h-full bg-green-600 rounded"
              style={{
                width: `${((progress.xp || 0) / xpForNextLevel) * 100}%`,
              }}
            />
          </div>
        </div>
      ) : (
        <p>Chargement...</p>
      )}
    </div>
  );
};

export default BattlePassProgress;
