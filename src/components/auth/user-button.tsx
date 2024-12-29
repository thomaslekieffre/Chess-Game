"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function UserButton() {
  const router = useRouter();
  const { user } = useUser();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAvatar = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("users")
          .select("avatar_url")
          .eq("clerk_id", user.id)
          .single();

        if (error) {
          console.error("Erreur lors de la récupération de l'avatar:", error);
        } else {
          setAvatarUrl(data?.avatar_url || null);
        }
      }
    };

    fetchUserAvatar();
  }, [user]);

  const handleManageAccount = () => {
    router.push("/profile");
  };

  return (
    <div className="relative">
      <button
        onClick={handleManageAccount}
        className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
      >
        <img
          src={avatarUrl || "https://ui-avatars.com/api/?name=User"}
          alt="User Profile"
          className="w-8 h-8 rounded-full"
        />
      </button>
    </div>
  );
}
