import { useState } from "react";
import { supabaseClient } from "@/lib/supabase";

const CreateQuest = () => {
  const supabase = supabaseClient();

  const [description, setDescription] = useState("");
  const [xpReward, setXpReward] = useState(0);

  const handleCreateQuest = async () => {
    const { error } = await supabase.from("quests").insert({
      description,
      xp_reward: xpReward,
    });
    if (error) {
      console.error("Erreur lors de la création de la quête:", error);
    } else {
      alert("Quête créée avec succès");
      setDescription("");
      setXpReward(0);
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-2">Créer une quête</h3>
      <p className="text-gray-400 mb-2">
        Entrez la description de la quête et la récompense en XP.
      </p>
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description de la quête"
        className="border border-gray-600 p-2 rounded mb-4 w-full"
      />
      <input
        type="number"
        value={xpReward}
        onChange={(e) => setXpReward(Number(e.target.value))}
        placeholder="Récompense XP"
        className="border border-gray-600 p-2 rounded mb-4 w-full"
      />
      <button
        onClick={handleCreateQuest}
        className="w-full p-2 bg-blue-600 rounded hover:bg-blue-500 transition"
      >
        Créer
      </button>
    </div>
  );
};

export default CreateQuest;
