"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

interface PublicPiece {
  id: string;
  name: string;
  piece_type: string;
  created_by: string;
  votes: number;
  creator_username: string;
  has_voted: boolean;
}

export default function PublicPiecesPage() {
  const [pieces, setPieces] = useState<PublicPiece[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    fetchPieces();
  }, []);

  const fetchPieces = async () => {
    try {
      const { data: piecesData, error } = await supabase
        .from("custom_pieces")
        .select(
          `
          id,
          name,
          piece_type,
          created_by,
          votes,
          users (username)
        `
        )
        .eq("is_public", true)
        .order("votes", { ascending: false });

      if (error) throw error;

      if (user) {
        const { data: votesData } = await supabase
          .from("piece_votes")
          .select("piece_id")
          .eq("user_id", user.id);

        const userVotes = new Set(votesData?.map((vote) => vote.piece_id));

        setPieces(
          piecesData.map((piece) => ({
            ...piece,
            creator_username:
              piece.users.length > 0 ? piece.users[0].username : "Inconnu",
            has_voted: userVotes.has(piece.id),
          }))
        );
      } else {
        setPieces(
          piecesData.map((piece) => ({
            ...piece,
            creator_username:
              piece.users.length > 0 ? piece.users[0].username : "Inconnu",
            has_voted: false,
          }))
        );
      }
    } catch (error) {
      console.error("Erreur lors du chargement des pièces:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (pieceId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("piece_votes")
        .insert([{ user_id: user.id, piece_id: pieceId }]);

      if (error) throw error;

      await supabase.rpc("increment_piece_votes", { piece_id: pieceId });

      setPieces((prevPieces) =>
        prevPieces.map((piece) =>
          piece.id === pieceId
            ? { ...piece, votes: piece.votes + 1, has_voted: true }
            : piece
        )
      );
    } catch (error) {
      console.error("Erreur lors du vote:", error);
    }
  };

  const getPieceTypeLabel = (type: string) => {
    switch (type) {
      case "knight":
        return "Cavalier";
      case "bishop":
        return "Fou";
      case "queen":
        return "Reine";
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen pt-20 bg-background">
        <div className="container">
          <h1 className="text-3xl font-bold mb-8">Chargement...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-20 bg-background">
      <div className="container">
        <h1 className="text-3xl font-bold mb-8">Pièces Publiques</h1>
        <div className="grid md:grid-cols-3 gap-6">
          {pieces.map((piece) => (
            <Link key={piece.id} href={`/public-pieces/${piece.id}`}>
              <Card className="p-6 hover:border-primary transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">{piece.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      Remplace: {getPieceTypeLabel(piece.piece_type)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={(e) => {
                      e.preventDefault();
                      if (!piece.has_voted) handleVote(piece.id);
                    }}
                    disabled={piece.has_voted || !user}
                  >
                    <ChevronUp
                      className={piece.has_voted ? "text-primary" : ""}
                    />
                    {piece.votes}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Créée par {piece.creator_username}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
