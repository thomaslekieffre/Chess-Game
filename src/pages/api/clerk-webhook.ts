import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { type, data } = req.body;

  if (type === "user.created" || type === "user.updated") {
    const { id, username, real_name, country, emoji } = data;

    const { error } = await supabase.from("users").upsert({
      id,
      username,
      real_name,
      country,
      emoji,
    });

    if (error) {
      return res
        .status(500)
        .json({ error: "Erreur lors de la mise à jour de l'utilisateur" });
    }
  }

  res.status(200).json({ received: true });
}
