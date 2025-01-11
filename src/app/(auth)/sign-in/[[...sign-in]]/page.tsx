"use client";

import { SignIn } from "@clerk/nextjs";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { supabaseClient } from "@/lib/supabase";

export default function SignInPage() {
  const supabase = supabaseClient();
  const { user } = useUser();

  useEffect(() => {
    const updateUserInDatabase = async () => {
      console.log("User data:", user);
      if (user) {
        const { id, username, firstName, lastName, publicMetadata } = user;

        console.log("User data:", {
          id,
          username,
          firstName,
          lastName,
          publicMetadata,
        });

        const { error } = await supabase.from("users").upsert({
          id,
          username: username || `${firstName}_${lastName}`,
          real_name: `${firstName} ${lastName}`,
          country: publicMetadata?.country || "Unknown",
          emoji: publicMetadata?.emoji || "🙂",
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
  }, [user]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
          },
        }}
      />
    </div>
  );
}
