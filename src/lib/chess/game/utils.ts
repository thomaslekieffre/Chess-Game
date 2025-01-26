import { supabaseClient } from "@/lib/supabase";
import { QueryData } from "@supabase/supabase-js";

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

// export interface Quest {
//     id:string;
//     type:string;
//     xp_reward:number;
//     condition:Record<string,string>;
//     data:Record<string,string>;
//     completion:number;
// }

// export const findQuest = async (type:string,condition:Record<string,string>|null,quest_data:Record<string,string>|null,clerk_id:string|null) => {
//   let where = `\nWHERE quest.type = '${type}'`
//   if(condition!==null) where+= ` AND quest.conditions = ${JSON.stringify(condition)}`
//   if(quest_data!==null) where+= ` AND quest.data = ${JSON.stringify(quest_data)}`
//   let request = `
// SELECT quest.*, users.*
// FROM quest
// ${where};`

//   if(clerk_id!==null) request =`
// SELECT quest.*, user_quests.*
// FROM quest
// JOIN user_quests ON quest.id = user_quests.quest_id ${where};`

//   console.log(request)


//   const { data, error } = await supabase.rpc(request);
//     if (error) {
//       console.log(request)
//       console.error({error,data});
//       return null;
//     }

//     return data;
// }

export interface Quest { 
  id: any; 
  quest_id: any; 
  user_id: any; 
  completion: any; 
  quest: { 
    type: any; 
    xp_reward: any; 
    conditions: any; 
    data: any; 
    completion_max: any; 
  }; // Notez que `quest` est un objet unique
}

export const findQuest = async (
  type: string,
  condition: Record<string, string> | null,
  quest_data: Record<string, string> | null,
  clerk_id: string | null
): Promise<Quest[]> => {

  let query = supabase
    .from('user_quests')
    .select(`
      id,
      quest_id,
      user_id,
      completion,
      quest:quest_id (
        type,
        xp_reward,
        conditions,
        data,
        completion_max
      )
    `);


  // Appliquer des filtres conditionnels
  query = query.eq('quest.type', type); // Filtrer par type

  if (condition) {
    query = query.contains('quest.conditions', condition); // Filtrer par condition
  }

  if (quest_data) {
    query = query.contains('quest.data', quest_data); // Filtrer par données
  }

  if (clerk_id) {
    query = query.eq('user_id', clerk_id); // Filtrer par user_id
  }

  const { data, error } = await query 

  if (error) {
    console.error('Supabase error:', error.message);
    throw error;
  }

  // Valider la structure pour s'assurer que `quest` est un objet
  const questWithUser: Quest[] = data?.map(item => ({
    ...item,
    quest: Array.isArray(item.quest) ? item.quest[0] : item.quest // S'assurer que `quest` est un objet unique
  })) as Quest[];

  const filteredData = questWithUser?.filter(item => item.quest !== null) as Quest[];

  return filteredData;
};

const completQuest = async (
  id:string,
) => {

}

// export const incrementQuestes = async (
//   type: string,
//   condition: Record<string, string> | null,
//   quest_data: Record<string, string> | null,
//   clerk_id: string | null,
//   value:number,
// ) => {
//   const questArray = await findQuest(type,condition,quest_data,clerk_id)

//   let incrementList:string[] = []

//   let completedList = []

//   for(let quest of questArray){
//     const completion = quest.completion
//     const newCompletion = completion+value
//     const maxCompletion = quest.quest.completion_max
//     if(newCompletion>=maxCompletion){
//       completQuest(quest.id)
//       completedList.push(quest)
//     }else {
//       incrementList.push(quest.id)
//     }
//   }

//   console.log(incrementList)

//   const { data, error } = await supabase
//     .rpc('increment_user_quests', { value, quest_ids:incrementList })

//   console.log(data,error)

//   if (error) {
//     console.error('Supabase error:', error.message);
//     throw error;
//   }
  
//   return completedList
// }

export const incrementQuestes = async (
  type: string,
  condition: Record<string, string> | null,
  quest_data: Record<string, string> | null,
  clerk_id: string | null,
  value:number,
) => {
  const questArray = await findQuest(type,condition,quest_data,clerk_id)

  let incrementList:string[] = []

  let completedList = []

  for(let quest of questArray){
    const completion = quest.completion
    const newCompletion = completion+value
    const maxCompletion = quest.quest.completion_max
    if(newCompletion>=maxCompletion){
      completQuest(quest.id)
      completedList.push(quest)
    }else {
      incrementList.push(quest.id)
      console.log(newCompletion,quest.id)
      const { data, error } = await supabase
        .from('user_quests')
        .update({ completion: newCompletion })
        .eq('id', quest.id);
      console.log(data)
    }
  }
  
  return completedList
}

export const findQuestForUser = async (type:string,condition:Record<string,string>|null,data:Record<string,string>|null,clerkId:string) => {
    // const quest = await findQuest(type,condition,data,clerkId)
    // return quest
    // if(!quest?.id) return {code:404,message:"Quest not found"}
    // const res = fetchQuestWithUser(clerkId,quest.id)
}