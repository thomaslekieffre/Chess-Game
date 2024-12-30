import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import CustomImage from "@/components/CustomImage";

interface FriendRequest {
  id: number;
  from: string;
  created_at: string;
  status: string;
  sender: {
    username: string;
    avatar_url: string;
  };
}

export function FriendRequests() {
  const { user } = useUser();
  const [requests, setRequests] = useState<FriendRequest[]>([]);

  useEffect(() => {
    if (user) {
      const fetchRequests = async () => {
        const { data, error } = await supabase
          .from("friend_requests")
          .select(
            `
            id,
            from,
            created_at,
            status,
            sender:users!friend_requests_from_fkey (
              username,
              avatar_url
            )
          `
          )
          .eq("to", user.id)
          .eq("status", "pending")
          .returns<FriendRequest[]>();

        if (error) {
          console.error("Erreur lors de la récupération des demandes:", error);
          return;
        }

        setRequests(data);
      };

      fetchRequests();

      // Souscription aux nouvelles demandes
      const subscription = supabase
        .channel("friend_requests")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "friend_requests",
            filter: `to=eq.${user.id}`,
          },
          (payload) => {
            setRequests((current) => [
              ...current,
              payload.new as FriendRequest,
            ]);
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const handleAccept = async (requestId: number) => {
    const { error } = await supabase
      .from("friend_requests")
      .update({ status: "accepted" })
      .eq("id", requestId);

    if (error) {
      alert("Erreur lors de l'acceptation de la demande");
      return;
    }

    setRequests((current) =>
      current.filter((request) => request.id !== requestId)
    );
  };

  const handleReject = async (requestId: number) => {
    const { error } = await supabase
      .from("friend_requests")
      .update({ status: "rejected" })
      .eq("id", requestId);

    if (error) {
      alert("Erreur lors du rejet de la demande");
      return;
    }

    setRequests((current) =>
      current.filter((request) => request.id !== requestId)
    );
  };

  if (requests.length === 0) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 bg-background border border-border rounded-lg shadow-lg p-4">
      <h3 className="font-semibold mb-4 text-foreground">
        Demandes d&apos;ami en attente
      </h3>
      <div className="space-y-4">
        {requests.map((request) => (
          <div
            key={request.id}
            className="flex items-center gap-4 bg-muted/50 p-3 rounded-lg"
          >
            <CustomImage
              src={request.sender.avatar_url}
              alt={request.sender.username}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="flex-1">
              <p className="font-medium text-foreground">
                {request.sender.username}
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleAccept(request.id)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                >
                  Accepter
                </button>
                <button
                  onClick={() => handleReject(request.id)}
                  className="bg-destructive/10 text-destructive hover:bg-destructive/20 px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                >
                  Refuser
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
