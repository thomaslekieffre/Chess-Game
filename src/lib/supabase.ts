import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabase : SupabaseClient<any, "public", any>;

export function supabaseClient() : SupabaseClient<any, "public", any> {
  if(supabase) {
    return supabase;
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key must be provided");
  }

  supabase = createClient(supabaseUrl, supabaseAnonKey);
  return supabase;
}

