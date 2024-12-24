"use client";

import { useEffect, useState } from "react";
import { CustomBoard } from "@/components/chess/custom-board";
import { Button } from "@/components/ui/button";
import { ChevronUp, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useParams } from "next/navigation";

interface PieceDetails {
  id: string;
  name: string;
  piece_type: string;
  moves: boolean[][];
  created_by: string;
  votes: number;
  creator_username: string;
  has_voted: boolean;
}

export default function PieceDetailsPage() {
  const { id } = useParams();
  const [piece, setPiece] = useState<PieceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    fetchPieceDetails();
  }, [user, id]); // Ajouter les dépendances user et id

  const fetchPieceDetails = async () => {
    try {
      if (!id) {
        console.error("ID de pièce manquant");
        return;
      }

      let hasVoted = false;
      const { data: pieceData, error: pieceError } = await supabase
        .from("custom_pieces")
        .select("*")
        .eq("id", id)
        .single();

      if (pieceError) {
        console.error("Erreur lors de la requête de la pièce:", pieceError);
        return;
      }

      if (!pieceData) {
        console.error("Aucune pièce trouvée avec cet ID");
        return;
      }

      if (user) {
        const { data: voteData, error: voteError } = await supabase
          .from("piece_votes")
          .select("piece_id")
          .eq("user_id", user.id)
          .eq("piece_id", id)
          .single();

        if (!voteError || voteError.code === "PGRST116") {
          hasVoted = !!voteData;
        }
      }

      setPiece({
        ...pieceData,
        creator_username: pieceData.users?.[0]?.username || "Inconnu",
        has_voted: hasVoted,
      });
    } catch (error) {
      console.error("Erreur lors du chargement de la pièce:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async () => {
    if (!user || !piece) return;

    try {
      const { error } = await supabase
        .from("piece_votes")
        .insert([{ user_id: user.id, piece_id: piece.id }]);

      if (error) throw error;

      await supabase.rpc("increment_piece_votes", { piece_id: piece.id });

      setPiece((prev) =>
        prev ? { ...prev, votes: prev.votes + 1, has_voted: true } : null
      );
    } catch (error) {
      console.error("Erreur lors du vote:", error); // Affichez l'erreur complète ici
    }
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (!piece) {
    return <div>Pièce non trouvée</div>;
  }

  return (
    <main className="min-h-screen pt-20 bg-background">
      <div className="container max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/public-pieces">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2" />
              Retour
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{piece.name}</h1>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 ml-auto"
            onClick={() => {
              if (!piece.has_voted) handleVote();
            }}
            disabled={piece.has_voted || !user}
          >
            <ChevronUp className={piece.has_voted ? "text-primary" : ""} />
            {piece.votes}
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <CustomBoard
              selectedPiece={piece.piece_type}
              initialSquares={piece.moves}
              readOnly
            />
          </div>
          <div className="space-y-4">
            <p>
              <span className="font-semibold">Créée par:</span>{" "}
              {piece.creator_username}
            </p>
            <p>
              <span className="font-semibold">Type de pièce:</span>{" "}
              {piece.piece_type === "knight"
                ? "Cavalier"
                : piece.piece_type === "bishop"
                ? "Fou"
                : "Reine"}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
