import { useState } from "react";
import { supabase } from "@/lib/supabase";

const CreateReward = () => {
  const [rewardName, setRewardName] = useState("");
  const [levelRequired, setLevelRequired] = useState(0);

  const handleCreateReward = async () => {
    const { error } = await supabase.from("rewards").insert({
      reward_name: rewardName,
      level_required: levelRequired,
    });
    if (error) {
      console.error("Erreur lors de la création de la récompense:", error);
    } else {
      alert("Récompense créée avec succès");
      setRewardName("");
      setLevelRequired(0);
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-2">Créer une récompense</h3>
      <p className="text-gray-400 mb-2">
        Entrez le nom de la récompense et le niveau requis.
      </p>
      <input
        type="text"
        value={rewardName}
        onChange={(e) => setRewardName(e.target.value)}
        placeholder="Nom de la récompense"
        className="border border-gray-600 p-2 rounded mb-4 w-full"
      />
      <input
        type="number"
        value={levelRequired}
        onChange={(e) => setLevelRequired(Number(e.target.value))}
        placeholder="Niveau requis"
        className="border border-gray-600 p-2 rounded mb-4 w-full"
      />
      <button
        onClick={handleCreateReward}
        className="w-full p-2 bg-blue-600 rounded hover:bg-blue-500 transition"
      >
        Créer
      </button>
    </div>
  );
};

export default CreateReward;
