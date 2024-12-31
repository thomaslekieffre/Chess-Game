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

      setQuests(questsWithCompletion);
    }
  };

  useEffect(() => {
    fetchQuests();
  }, []);

  const completeQuest = async (questId: string) => {
    // Récupérer les détails de la quête pour obtenir l'XP
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

    // Mettre à jour la table user_quests
    const { error } = await supabase
      .from("user_quests")
      .upsert({ clerk_id: userId, quest_id: questId, is_completed: true });

    if (error) {
      console.error("Erreur lors de la complétion de la quête:", error);
    } else {
      // Mettre à jour l'XP de l'utilisateur
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

      // Vérifier si l'XP dépasse 500
      if (newXp >= 500) {
        newLevel += Math.floor(newXp / 500); // Augmenter le niveau
        newXp = newXp % 500; // Remettre l'XP à 0 ou à la valeur restante
      }

      await supabase
        .from("users")
        .update({ xp: newXp, battle_pass_level: newLevel })
        .eq("clerk_id", userId);

      // Recharger les quêtes après la complétion
      fetchQuests();
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Quêtes</h2>
      <ul className="space-y-4">
        {quests.map((quest) => (
          <li key={quest.quest_id} className="flex justify-between">
            <span>{quest.description}</span>
            <span>{quest.xp_reward} XP</span>
            {!quest.is_completed && (
              <button onClick={() => completeQuest(quest.quest_id)}>
                Compléter
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Quests;
