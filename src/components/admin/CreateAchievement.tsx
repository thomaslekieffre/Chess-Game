import { useState } from "react";
import { supabase } from "@/lib/supabase";

const CreateAchievement = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rarity, setRarity] = useState("common");
  const [condition, setCondition] = useState("");

  const handleCreateAchievement = async () => {
    const { error } = await supabase.from("achievements").insert({
      title,
      description,
      rarity,
      condition,
    });

    if (error) {
      console.error("Erreur lors de la création du succès:", error);
      alert("Erreur lors de la création du succès");
    } else {
      alert("Succès créé avec succès");
      setTitle("");
      setDescription("");
      setRarity("common");
      setCondition("");
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-2">Créer un succès</h3>
      <p className="text-gray-400 mb-2">
        Entrez les informations du nouveau succès.
      </p>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre du succès"
        className="border border-gray-600 p-2 rounded mb-4 w-full"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description du succès"
        className="border border-gray-600 p-2 rounded mb-4 w-full h-24"
      />
      <input
        type="text"
        value={condition}
        onChange={(e) => setCondition(e.target.value)}
        placeholder="Condition de déblocage (ex: win_games:10)"
        className="border border-gray-600 p-2 rounded mb-4 w-full"
      />
      <select
        value={rarity}
        onChange={(e) => setRarity(e.target.value)}
        className="border border-gray-600 p-2 rounded mb-4 w-full"
      >
        <option value="common">Commun</option>
        <option value="rare">Rare</option>
        <option value="epic">Épique</option>
        <option value="legendary">Légendaire</option>
      </select>
      <button
        onClick={handleCreateAchievement}
        className="w-full p-2 bg-blue-600 rounded hover:bg-blue-500 transition"
      >
        Créer
      </button>
    </div>
  );
};

export default CreateAchievement;
