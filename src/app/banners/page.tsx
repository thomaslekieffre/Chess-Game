"use client";

import { useUser } from "@clerk/nextjs";
import { BannersList } from "@/components/banners/BannerList";

export default function BannersPage() {
  const { user } = useUser();

  if (!user) {
    return (
      <div className="min-h-screen pt-20 bg-background">
        <div className="container">
          <h1 className="text-3xl font-bold mb-8">
            Connectez-vous pour voir vos bannières
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-background">
      <div className="container">
        <h1 className="text-3xl font-bold mb-8">Liste des Bannières</h1>
        <BannersList userId={user.id} />
      </div>
    </div>
  );
}
