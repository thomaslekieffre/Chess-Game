"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Quest {
  quest_id: string;
  description: string;
  is_completed: boolean;
  xp_reward: number;
}

const Quests = ({ userId }: { userId: string }) => {
  const [quests, setQuests] = useState<Quest[]>([]);

  const fetchQuests = async () => {
    const { data, error } = await supabase.from("quests").select("*");

    if (error) {
      console.error("Erreur lors de la récupération des quêtes:", error);
    } else {
      const { data: userQuests } = await supabase
        .from("user_quests")
        .select("quest_id, is_completed")
        .eq("clerk_id", userId);

      const questsWithCompletion = data.map((quest) => {
        const userQuest = userQuests?.find(
          (uq) => uq.quest_id === quest.quest_id
        );
        return {
          ...quest,
          is_completed: userQuest ? userQuest.is_completed : false,
        };
      });

      const incompleteQuests = questsWithCompletion.filter(
        (quest) => !quest.is_completed
      );
      setQuests(incompleteQuests);
    }
  };

  useEffect(() => {
    fetchQuests();
  }, []);

  const completeQuest = async (questId: string) => {
    const { data: questData, error: questError } = await supabase
      .from("quests")
      .select("xp_reward")
      .eq("quest_id", questId)
      .single();

    if (questError || !questData) {
      console.error("Erreur lors de la récupération de la quête:", questError);
      return;
    }

    const xpReward = questData.xp_reward;

    const { error } = await supabase
      .from("user_quests")
      .upsert({ clerk_id: userId, quest_id: questId, is_completed: true });

    if (error) {
      console.error("Erreur lors de la complétion de la quête:", error);
    } else {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("xp, battle_pass_level")
        .eq("clerk_id", userId)
        .single();

      if (userError || !userData) {
        console.error(
          "Erreur lors de la récupération de l'utilisateur:",
          userError
        );
        return;
      }

      let newXp = userData.xp + xpReward;
      let newLevel = userData.battle_pass_level;

      if (newXp >= 500) {
        newLevel += Math.floor(newXp / 500);
        newXp = newXp % 500;
      }

      await supabase
        .from("users")
        .update({ xp: newXp, battle_pass_level: newLevel })
        .eq("clerk_id", userId);

      fetchQuests();
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Quêtes</h2>
      <ul className="space-y-4">
        {quests.map((quest) => (
          <li
            key={quest.quest_id}
            className="flex justify-between items-center"
          >
            <span className="flex-1">{quest.description}</span>
            <span className="flex gap-4 items-center">
              {quest.xp_reward} XP
              {!quest.is_completed && (
                <button onClick={() => completeQuest(quest.quest_id)}>
                  Compléter
                </button>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Quests;
