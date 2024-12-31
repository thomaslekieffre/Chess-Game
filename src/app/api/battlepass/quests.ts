import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { data, error } = await supabase.from("quests").select("*");

  if (error) {
    return res
      .status(500)
      .json({ error: "Erreur lors de la récupération des quêtes" });
  }

  return res.status(200).json(data);
}
