"use client";

import BattlePassProgress from "@/components/battlePass/BattlePassProgress";
import Quests from "@/components/battlePass/Quests";
import Rewards from "@/components/battlePass/Rewards";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

const BattlePassPage = () => {
  const { user } = useUser();
  const [clerkId, setClerkId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        setClerkId(user.id);
      }
    };

    fetchUserData();
  }, [user]);

  if (!clerkId) {
    return <div>Utilisateur non connecté. Veuillez vous connecter.</div>;
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-6 pt-24">
      <h1 className="text-4xl font-bold text-center mb-6 text-gray-900 dark:text-white">
        Chess Pass
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <BattlePassProgress clerkId={clerkId} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <Rewards />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <Quests userId={clerkId} />
        </div>
      </div>
    </div>
  );
};

export default BattlePassPage;
