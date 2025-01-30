import { supabaseClient } from "@/lib/supabase";
import { incrementQuestProps } from "@/types/chess";
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

export interface UserquestsWithQuest { 
  id: string; 
  quest_id: string; 
  user_id: string; 
  completion: number;
  is_complet:boolean
  quest: { 
    type: string; 
    xp_reward: number; 
    conditions: any; 
    data: any; 
    completion_max: number; 
  }; // Notez que `quest` est un objet unique
}

export interface Userquests { 
  id: string; 
  quest_id: string; 
  user_id: string; 
  completion: number;
  is_complet:boolean
  quest: { 
    type: string; 
    xp_reward: number; 
    conditions: any; 
    data: any; 
    completion_max: number; 
  }; // Notez que `quest` est un objet unique
}

export interface Quest { 
  id:string;
  type: string; 
  xp_reward: number; 
  conditions: any; 
  data: any; 
  completion_max: number; 
  is_available:boolean;
}

export const findUserQuest = async (props:{
  type: string,
  condition?: Record<string, string>,
  quest_data?: Record<string, string>,
  clerk_id?: string
}): Promise<UserquestsWithQuest[]> => {

  const {type,clerk_id,condition,quest_data} = props

  let query = supabase
    .from('user_quests')
    .select(`
      id,
      quest_id,
      user_id,
      completion,
      is_complet,
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
  const questWithUser: UserquestsWithQuest[] = data?.map(item => ({
    ...item,
    quest: Array.isArray(item.quest) ? item.quest[0] : item.quest // S'assurer que `quest` est un objet unique
  })) as UserquestsWithQuest[];

  const filteredData = questWithUser?.filter(item => item.quest !== null) as UserquestsWithQuest[];

  return filteredData;
};



const completQuest = async (
  id:string,
) => {
  const {data,error} = await supabase
    .from('user_quests')
    .update({is_complet:true})
    .eq("id",id)
  if (error) {
    console.error('Supabase error:', error.message);
    return false
  }else {
    return true
  }
}


export const findQuest = async (props:{
  type?: string,
  condition?: Record<string, string>,
  quest_data?: Record<string, string>,
  completion_max?: number,
  xp_reward?: number,
  is_available?: boolean,
  excludedIds?:string[],
}): Promise<Quest[]> => {

  const {completion_max,condition,is_available,quest_data,type,xp_reward,excludedIds} = props

  let query = supabase
    .from('quest')
    .select(`*`);

  // Appliquer des filtres conditionnels

  if(type){
    query = query.eq('type',type)
  }
  if(condition){
    query = query.contains('conditions',condition)
  }
  if(quest_data){
    query = query.contains('data',quest_data)
  }
  if(completion_max){
    query = query.eq('completion_max',completion_max)
  }
  if(xp_reward){
    query = query.eq('xp_reward',xp_reward)
  }
  if(is_available){
    query = query.eq('is_available',is_available)
  }
  if(excludedIds){
    query = query.not('id', 'in', `(${excludedIds.join(',')})`); // Exclut les IDs spécifiés
  }

  const { data, error } = await query 

  if (error) {
    console.error('Supabase error:', error.message);
    throw error;
  }

  return data;
};

const createUserQuest = async (props:{
  quest_id: string, 
  user_id: string,  
  completion: number 
}[]) => {
  const { data, error } = await supabase
    .from('user_quests') 
    .insert(props);

  if (error) {
    console.error('Erreur lors de la création de user_quests:', error.message);
    return null;
  }

  console.log('Nouvel enregistrement ajouté:', data);
  return data;
};

export const incrementQuestes = async (props:incrementQuestProps) => {
  const {type,value,clerk_id,condition,quest_data} = props

  // Quête en cour pour la personne
  const questArray = await findUserQuest({type,condition,quest_data,clerk_id})

  // Quête disponible pour la personne
  const possibleQuest = await findQuest({type,condition,quest_data,is_available:true,excludedIds:questArray.map(item=>item.quest_id)})

  // Quête non complétée
  const notCompletedQuestArray = questArray.filter(item=>item.is_complet!==true)

  let incrementList:string[] = []

  let completedList = []

  // Démarée toutes les quête possible pour le joueur
  for(let quest of possibleQuest){
    const newQuest = createUserQuest([{user_id:clerk_id,completion:value,quest_id:quest.id}])
    // TODO AUTO FINISH SI VALUE >= max
    // if(value>=quest.completion_max){
    //   const res = await completQuest(newQuest.id)
    //   if(res){
    //     completedList.push(quest)
    //   }
    // }
  }

  for(let quest of notCompletedQuestArray){
    const completion = quest.completion
    const newCompletion = completion+value
    const maxCompletion = quest.quest.completion_max
    if(newCompletion>=maxCompletion){ // Quête venant d'être terminer
      const res = await completQuest(quest.id)
      if(res){
        completedList.push(quest)
      }
    }else { // Quête a avancer
      incrementList.push(quest.id)
    }
  }

  // Ajout de point dans toute les quêtes non terminer
  const { data, error } = await supabase
    .rpc('increment_user_quests', { value, quest_ids:incrementList })

  if (error) {
    console.error('Supabase error:', error.message);
    throw error
  }
  
  return completedList
}

export const findQuestForUser = async (type:string,condition:Record<string,string>|null,data:Record<string,string>|null,clerkId:string) => {
    // const quest = await findQuest(type,condition,data,clerkId)
    // return quest
    // if(!quest?.id) return {code:404,message:"Quest not found"}
    // const res = fetchQuestWithUser(clerkId,quest.id)
}