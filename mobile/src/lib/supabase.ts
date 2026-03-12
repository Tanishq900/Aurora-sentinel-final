import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase configuration. Please ensure supabaseUrl and supabaseAnonKey are set in app.json → expo.extra"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
