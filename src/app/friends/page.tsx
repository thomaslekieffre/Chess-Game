"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import CustomImage from "@/components/CustomImage";

interface Friend {
  username: string;
  avatar_url: string;
  real_name: string;
  elo_stats: {
    classique: {
      bullet: number;
      blitz: number;
      rapide: number;
    };
    saisonnier: {
      bullet: number;
      blitz: number;
      rapide: number;
    };
  };
}

interface FriendInfo {
  username: string;
  avatar_url: string;
  real_name: string;
  elo_stats: {
    classique: {
      bullet: number;
      blitz: number;
      rapide: number;
    };
    saisonnier: {
      bullet: number;
      blitz: number;
      rapide: number;
    };
  };
}

export default function FriendsPage() {
  const { user } = useUser();
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    const fetchFriends = async () => {
      if (!user) return;

      const { data: friendRequests, error } = await supabase
        .from("friend_requests")
        .select(
          `
          from,
          to,
          from_user:users!friend_requests_from_fkey (
            username,
            avatar_url,
            real_name,
            elo_stats
          ),
          to_user:users!friend_requests_to_fkey (
            username,
            avatar_url,
            real_name,
            elo_stats
          )
        `
        )
        .eq("status", "accepted")
        .or(`from.eq.${user.id},to.eq.${user.id}`)
        .returns<
          Array<{
            from: string;
            to: string;
            from_user: FriendInfo;
            to_user: FriendInfo;
          }>
        >();

      if (error) {
        console.error("Erreur lors de la récupération des amis:", error);
        return;
      }

      if (friendRequests) {
        const friendsList: Friend[] = friendRequests.map((request) => {
          const friendInfo = (
            request.from === user.id ? request.to_user : request.from_user
          ) as FriendInfo;
          return {
            username: friendInfo.username,
            avatar_url: friendInfo.avatar_url,
            real_name: friendInfo.real_name,
            elo_stats: friendInfo.elo_stats,
          };
        });

        setFriends(friendsList);
      }
    };

    fetchFriends();
  }, [user]);

  return (
    <main className="min-h-screen pt-32 bg-background">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Mes Amis</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {friends.map((friend, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-lg p-6 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <CustomImage
                  src={friend.avatar_url}
                  alt={friend.username}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
                <div>
                  <h3 className="font-semibold text-lg">{friend.username}</h3>
                  <p className="text-muted-foreground">{friend.real_name}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <h4 className="font-medium">Classique</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>Bullet: {friend.elo_stats.classique.bullet}</div>
                  <div>Blitz: {friend.elo_stats.classique.blitz}</div>
                  <div>Rapide: {friend.elo_stats.classique.rapide}</div>
                </div>
                <h4 className="font-medium">Saisonnier</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>Bullet: {friend.elo_stats.saisonnier.bullet}</div>
                  <div>Blitz: {friend.elo_stats.saisonnier.blitz}</div>
                  <div>Rapide: {friend.elo_stats.saisonnier.rapide}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
