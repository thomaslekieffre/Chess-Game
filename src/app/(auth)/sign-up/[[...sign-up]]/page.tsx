import { SignUp } from "@clerk/nextjs";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";

export default function SignUpPage() {
  const { user } = useUser(); // Hook pour obtenir l'utilisateur connecté

  useEffect(() => {
    const updateUserInDatabase = async () => {
      if (user) {
        const { id, username, firstName, lastName, publicMetadata } = user;

        const { error } = await supabase.from("users").upsert({
          clerk_id: id,
          username: username || `${firstName}_${lastName}`,
          real_name: `${firstName} ${lastName}`,
          country: publicMetadata?.country || "Unknown",
          emoji: publicMetadata?.emoji || "🙂",
          elo_stats: {
            classique: {
              bullet: 1200,
              blitz: 1200,
              rapide: 1200,
            },
            saisonnier: {
              bullet: 1150,
              blitz: 1150,
              rapide: 1150,
            },
          },
        });

        if (error) {
          console.error(
            "Erreur lors de la mise à jour de l'utilisateur",
            error
          );
        }
      }
    };

    updateUserInDatabase();
  }, [user]); // Exécute uniquement lorsque l'utilisateur change

  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-background border border-border",
          },
        }}
      />
    </div>
  );
}
