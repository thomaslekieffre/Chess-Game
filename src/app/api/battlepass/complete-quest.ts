import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId, questId } = req.body;

  const { error } = await supabase
    .from("user_quests")
    .upsert({ user_id: userId, quest_id: questId, is_completed: true });

  if (error) {
    return res
      .status(500)
      .json({ error: "Erreur lors de la complétion de la quête" });
  }

  const { data: userData } = await supabase
    .from("users")
    .select("xp")
    .eq("user_id", userId)
    .single();

  if (!userData) {
    return res.status(404).json({ error: "Utilisateur non trouvé" });
  }

  const newXp = userData.xp + 100;
  await supabase.from("users").update({ xp: newXp }).eq("user_id", userId);

  return res.status(200).json({ message: "Quête complétée avec succès" });
}
