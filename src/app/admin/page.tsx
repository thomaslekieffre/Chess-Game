"use client";

import { useState } from "react";
import KickUser from "@/components/admin/KickUser";
import CreateQuest from "@/components/admin/CreateQuest";
import CreateReward from "@/components/admin/CreateReward";

const AdminPage = () => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    const correctPassword = "Coucou";
    if (password === correctPassword) {
      setIsAuthenticated(true);
    } else {
      alert("Mot de passe incorrect");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      {!isAuthenticated ? (
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-center">
            Page d&apos;administration
          </h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Entrez le mot de passe"
            className="border border-gray-600 p-2 rounded mb-4 w-full"
          />
          <button
            onClick={handleLogin}
            className="w-full p-2 bg-blue-600 rounded hover:bg-blue-500 transition"
          >
            Se connecter
          </button>
        </div>
      ) : (
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-center">
            Bienvenue dans le tableau de bord administrateur
          </h1>

          <div className="flex flex-col gap-4">
            <KickUser />
            <CreateQuest />
            <CreateReward />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
