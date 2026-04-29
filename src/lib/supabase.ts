import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function joinWaitlist(email: string): Promise<"success" | "duplicate" | "error"> {
  try {
    const { error } = await supabase
      .from('waitlist')
      .insert([{ email }]);
      
    if (error) {
      if (error.code === '23505') { // unique violation
        return "duplicate";
      }
      console.error('Supabase insert error:', error);
      return "error";
    }
    
    return "success";
  } catch (err) {
    console.error('Unexpected error joining waitlist:', err);
    return "error";
  }
}
