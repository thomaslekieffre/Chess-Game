"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import KickUser from "@/components/admin/KickUser";
import CreateQuest from "@/components/admin/CreateQuest";
import CreateReward from "@/components/admin/CreateReward";
import CreateAchievement from "@/components/admin/CreateAchievement";
import { supabase } from "@/lib/supabase";

const AdminPage = () => {
  const { user } = useUser();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("users")
          .select("isModo")
          .eq("clerk_id", user.id)
          .single();

        if (error || !data.isModo) {
          router.push("/"); // Redirige vers la page d'accueil si l'utilisateur n'est pas administrateur
        } else {
          setIsAuthenticated(true); // L'utilisateur est administrateur
        }
      }
    };

    checkAdminStatus();
  }, [user, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      {isAuthenticated ? (
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-center">
            Bienvenue dans le tableau de bord administrateur
          </h1>

          <div className="flex flex-col gap-4">
            <KickUser />
            <CreateQuest />
            <CreateReward />
            <CreateAchievement />
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-center">Accès refusé</h1>
          <p className="text-center">
            Vous n&apos;avez pas les autorisations nécessaires pour accéder à
            cette page.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
