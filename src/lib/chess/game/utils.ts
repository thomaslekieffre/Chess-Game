import { supabaseClient } from "@/lib/supabase";

const supabase = supabaseClient();

export const fetchPlayerTitle = async (clerkId: string) => {
    try {
      const { data: titleData, error: titleError } = await supabase
        .from("user_achievements")
        .select(
          `
          *,
          achievements!inner (
            title
          )
        `
        )
        .eq("clerk_id", clerkId)
        .eq("is_selected", true)
        .maybeSingle();

      if (titleError) {
        console.error("Erreur lors de la récupération du titre:", titleError);
        return null;
      }

      if (!titleData) {
        console.log("Aucun titre trouvé pour le joueur:", clerkId);
        return null;
      }

      return titleData.achievements?.title || null;
    } catch (error) {
      console.error("Erreur lors de la récupération du titre:", error);
      return null;
    }
};

export const fetchPlayerBanner = async (clerkId: string) => {
    try {
      const { data: bannerData, error: bannerError } = await supabase
        .from("user_banners")
        .select(
          `
          *,
          banners!inner (
            link
          )
        `
        )
        .eq("clerk_id", clerkId)
        .eq("is_selected", true)
        .maybeSingle();

      if (bannerError) {
        console.error(
          "Erreur lors de la récupération de la bannière:",
          bannerError
        );
        return null;
      }

      if (!bannerData) {
        console.log("Aucune bannière trouvée pour le joueur:", clerkId);
        return null;
      }

      return {
        bannerUrl: bannerData.banners?.link || null,
        textColors: {
          text: bannerData.text_color || "#FFFFFF",
          title: bannerData.title_color || "#FFFFFF",
          rating: bannerData.rating_color || "#9CA3AF",
        },
      };
    } catch (error) {
      console.error("Erreur lors de la récupération de la bannière:", error);
      return null;
    }
};