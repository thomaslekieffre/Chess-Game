import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Banner {
  id: string;
  title: string;
  description: string;
  link: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlocked: boolean;
  is_selected: boolean;
}

export function BannersList({ userId }: { userId: string }) {
  const supabase = supabaseClient();
    
  const [banners, setBanners] = useState<Banner[]>([]);
  const [showUnlocked, setShowUnlocked] = useState<boolean | null>(null);

  useEffect(() => {
    fetchBanners();
  }, [userId]);

  const fetchBanners = async () => {
    const { data: userBanners, error: userBannersError } = await supabase
      .from("user_banners")
      .select("banner_id, is_selected")
      .eq("clerk_id", userId);

    if (userBannersError) {
      console.error(
        "Erreur lors de la récupération des bannières:",
        userBannersError
      );
      return;
    }

    const { data: allBanners, error: bannersError } = await supabase
      .from("banners")
      .select("*");

    if (bannersError) {
      console.error(
        "Erreur lors de la récupération des bannières:",
        bannersError
      );
      return;
    }

    const mergedBanners = allBanners.map((banner) => {
      const userBanner = userBanners?.find((ub) => ub.banner_id === banner.id);
      return {
        ...banner,
        unlocked: !!userBanner,
        is_selected: userBanner?.is_selected || false,
      };
    });

    setBanners(mergedBanners);
  };

  const selectBanner = async (bannerId: string) => {
    const { error: updateError } = await supabase
      .from("user_banners")
      .update({ is_selected: false })
      .eq("clerk_id", userId);

    if (updateError) {
      console.error("Erreur lors de la mise à jour:", updateError);
      return;
    }

    const { error: selectError } = await supabase
      .from("user_banners")
      .update({ is_selected: true })
      .eq("clerk_id", userId)
      .eq("banner_id", bannerId);

    if (selectError) {
      console.error("Erreur lors de la sélection:", selectError);
      return;
    }

    await fetchBanners();
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "text-gray-400";
      case "rare":
        return "text-blue-400";
      case "epic":
        return "text-purple-400";
      case "legendary":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  const filteredBanners =
    showUnlocked === null
      ? [...banners].sort((a, b) => a.title.localeCompare(b.title))
      : banners.filter((banner) => banner.unlocked === showUnlocked);

  return (
    <div>
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="filter-banners"
            checked={showUnlocked !== null}
            onCheckedChange={(checked) => {
              if (!checked) {
                setShowUnlocked(null);
              } else {
                setShowUnlocked(true);
              }
            }}
            className="dark:bg-gray-700"
          />
          <Label htmlFor="filter-banners" className="text-foreground">
            Filtrer les bannières
          </Label>
        </div>
        {showUnlocked !== null && (
          <div className="flex space-x-2">
            <Button
              variant={showUnlocked ? "default" : "outline"}
              size="sm"
              onClick={() => setShowUnlocked(true)}
              className="dark:border-gray-700"
            >
              Débloquées
            </Button>
            <Button
              variant={!showUnlocked ? "default" : "outline"}
              size="sm"
              onClick={() => setShowUnlocked(false)}
              className="dark:border-gray-700"
            >
              Non débloquées
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBanners.map((banner) => (
          <Card
            key={banner.id}
            className={`p-4 ${
              showUnlocked === null && !banner.unlocked ? "opacity-50" : ""
            }`}
          >
            <div className="aspect-[2/1] relative overflow-hidden rounded-md mb-4">
              <img
                src={banner.link}
                alt={banner.title}
                className={`w-full h-full object-cover ${
                  !banner.unlocked ? "filter grayscale blur-sm" : ""
                }`}
              />
            </div>
            <h3 className={`font-bold ${getRarityColor(banner.rarity)}`}>
              {banner.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {banner.description}
            </p>
            {banner.unlocked && (
              <Button
                variant={banner.is_selected ? "default" : "outline"}
                size="sm"
                onClick={() => selectBanner(banner.id)}
                disabled={banner.is_selected}
              >
                {banner.is_selected ? "Sélectionnée" : "Sélectionner"}
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
