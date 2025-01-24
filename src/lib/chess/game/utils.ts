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

export interface Quest {
    id:string;
    type:string;
    xp_reward:number;
    condition:Record<string,string>;
    data:Record<string,string>;
    completion:number;
}

export const findQuest = async (type:string,condition:Record<string,string>,quest_data:Record<string,string>) => {
    const { data, error } = await supabase.rpc(`
SELECT quest.*, users.*
FROM quest
WHERE quest.type = ${type} AND quest.conditions = ${condition} AND data = ${quest_data};`);
    if (error) {
        console.error({});
        return null;
    }

    return data;
}

async function fetchQuestWithUser(quest_id: string,clerk_id:string) {
    const { data, error } = await supabase.rpc(`
SELECT quest.*, users.*
FROM user_quests
JOIN users AS u
    ON user_quests.user_id = users.clerk_id
WHERE user_quests.id = ${quest_id} AND u.clerk_id = ${clerk_id};`);
    if (error) {
        console.error({});
        return null;
    }

    return data;
}

export const findQuestForUser = async (type:string,condition:Record<string,string>,data:Record<string,string>,clerkId:string) => {
    const quest = await findQuest(type,condition,data)
    if(!quest?.id) return {code:404,message:"Quest not found"}
    const res = fetchQuestWithUser(clerkId,quest.id)
}