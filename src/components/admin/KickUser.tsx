"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";

const KickUser = () => {
  const [userId, setUserId] = useState("");

  const handleKickUser = async () => {
    const { error } = await supabase.from("users").delete().eq("id", userId);
    if (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
    } else {
      alert("Utilisateur supprimé avec succès");
      setUserId("");
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-2">Kicker un utilisateur</h3>
      <p className="text-gray-400 mb-2">
        Entrez l&apos;ID de l&apos;utilisateur que vous souhaitez kicker.
      </p>
      <input
        type="text"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        placeholder="ID de l'utilisateur"
        className="border border-gray-600 p-2 rounded mb-4 w-full"
      />
      <button
        onClick={handleKickUser}
        className="w-full p-2 bg-red-600 rounded hover:bg-red-500 transition"
      >
        Kicker
      </button>
    </div>
  );
};

export default KickUser;
