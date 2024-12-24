"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomBoard } from "@/components/chess/custom-board";

export default function CreatePiecePage() {
  const { user } = useUser();
  const [selectedPiece, setSelectedPiece] = useState<string>("");
  const [pieceName, setPieceName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [selectedSquares, setSelectedSquares] = useState<boolean[][]>([]);

  const handlePieceSelect = (value: string) => {
    setSelectedPiece(value);
  };

  const handleSavePiece = async () => {
    if (!user) {
      alert("Vous devez être connecté pour sauvegarder une pièce");
      return;
    }

    if (!pieceName) {
      alert("Veuillez donner un nom à votre pièce");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.from("custom_pieces").insert({
        name: pieceName,
        piece_type: selectedPiece,
        moves: selectedSquares,
        created_by: user.id,
        is_public: isPublic,
      });

      if (error) {
        alert("Erreur lors de la sauvegarde de la pièce");
        console.error(error);
      } else {
        alert("Pièce sauvegardée avec succès");
        setPieceName("");
        setSelectedSquares([]);
        setSelectedPiece("");
        setIsPublic(false);
      }
    } catch (error) {
      console.error("Erreur complète:", error);
      alert("Une erreur est survenue lors de la sauvegarde");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-20 bg-background">
      <div className="container max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">
          Créer une pièce personnalisée
        </h1>

        <Card className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Choisissez une pièce à personnaliser</Label>
              <Select onValueChange={handlePieceSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une pièce" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="knight">Cavalier</SelectItem>
                  <SelectItem value="bishop">Fou</SelectItem>
                  <SelectItem value="queen">Reine</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedPiece && (
              <>
                <div className="space-y-2">
                  <Label>Nom de la pièce</Label>
                  <Input
                    value={pieceName}
                    onChange={(e) => setPieceName(e.target.value)}
                    placeholder="Ex: Super Cavalier"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="public"
                    checked={isPublic}
                    onCheckedChange={(checked) =>
                      setIsPublic(checked as boolean)
                    }
                  />
                  <Label htmlFor="public">
                    Rendre cette pièce publique (visible par tous les joueurs)
                  </Label>
                </div>

                <div className="mt-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Personnalisation du{" "}
                    {selectedPiece === "knight"
                      ? "Cavalier"
                      : selectedPiece === "bishop"
                      ? "Fou"
                      : "Reine"}
                  </h2>
                  <CustomBoard
                    selectedPiece={selectedPiece}
                    onSquaresChange={setSelectedSquares}
                  />

                  <Button
                    onClick={handleSavePiece}
                    className="w-full mt-4"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sauvegarde..." : "Sauvegarder la pièce"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}
