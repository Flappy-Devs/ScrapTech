import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY!;
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);