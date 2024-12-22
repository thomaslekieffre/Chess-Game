"use server"

import { supabase } from "@/lib/supabase";

const updateData = async (from:string,update:Record<string,any>,queryKey:string,queryValue:any,thenFunc:Function) => {
    await supabase
      .from(from)
      .update(update)
      .eq(queryKey, queryValue)
      .then((x) => {
        thenFunc(x)
      });
}

export {updateData}