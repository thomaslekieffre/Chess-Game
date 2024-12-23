import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  console.log("Webhook reçu");
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "WEBHOOK_SECRET manquant dans les variables d'environnement"
    );
  }

  const headersList = req.headers;
  console.log("Headers reçus:", Object.fromEntries(headersList.entries()));

  const svix_id = headersList.get("svix-id");
  const svix_timestamp = headersList.get("svix-timestamp");
  const svix_signature = headersList.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("En-têtes Svix manquants", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const webhook = new Webhook(WEBHOOK_SECRET);

  try {
    const evt = webhook.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;

    const { type, data } = evt;

    if (type === "user.created" || type === "user.updated") {
      const { id, username, first_name, last_name, public_metadata } = data;

      const { error } = await supabase.from("users").upsert({
        clerk_id: id,
        username: username || `${first_name}_${last_name}`,
        real_name: `${first_name} ${last_name}`,
        country: public_metadata?.country || "Unknown",
        emoji: public_metadata?.emoji || "🙂",
      });

      if (error) {
        console.error("Erreur Supabase:", error);
        return new Response("Erreur lors de la mise à jour dans Supabase", {
          status: 500,
        });
      }
    }

    return new Response("Webhook traité avec succès", { status: 200 });
  } catch (err) {
    console.error("Erreur de vérification du webhook:", err);
    return new Response("Erreur de vérification", { status: 400 });
  }
}
