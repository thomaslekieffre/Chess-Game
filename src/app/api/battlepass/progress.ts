import { NextApiRequest, NextApiResponse } from "next";
import { supabaseClient } from "@/lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId } = req.body;
  const supabase = supabaseClient();

  const { data, error } = await supabase
    .from("users")
    .select("battle_pass_level, xp")
    .eq("user_id", userId)
    .single();

  if (error) {
    return res
      .status(500)
      .json({ error: "Erreur lors de la récupération des données" });
  }

  return res.status(200).json(data);
}
