"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Reward {
  reward_id: string;
  reward_name: string;
  level_required: number;
}

const Rewards = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);

  useEffect(() => {
    const fetchRewards = async () => {
      const { data, error } = await supabase.from("rewards").select("*");

      if (error) {
        console.error("Erreur lors de la récupération des récompenses:", error);
      } else {
        setRewards(data);
      }
    };

    fetchRewards();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Récompenses</h2>
      <ul className="space-y-4">
        {rewards.length > 0 ? (
          rewards.map((reward) => (
            <li
              key={reward.reward_id}
              className="bg-gray-200 dark:bg-gray-800 p-4 rounded-lg"
            >
              <span>
                {reward.reward_name} - Niveau requis: {reward.level_required}
              </span>
            </li>
          ))
        ) : (
          <li className="bg-gray-200 dark:bg-gray-800 p-4 rounded-lg">
            <span>Placeholder pour récompense - Niveau requis: 1</span>
          </li>
        )}
      </ul>
    </div>
  );
};

export default Rewards;
