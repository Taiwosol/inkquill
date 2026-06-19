import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Create a mock supabase client for development without credentials
let supabase;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  // Mock client that provides basic auth methods for testing
  supabase = {
    auth: {
      signUp: async () => ({
        data: { user: null, session: null },
        error: new Error("Please set your Supabase credentials in .env.local"),
      }),
      signInWithPassword: async () => ({
        data: { user: null, session: null },
        error: new Error("Please set your Supabase credentials in .env.local"),
      }),
      signOut: async () => {},
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
    from: () => ({
      select: () => ({ eq: () => ({ data: [], error: null }) }),
      upsert: () => ({ error: null }),
      delete: () => ({ eq: () => ({}) }),
    }),
  };
}

export { supabase };
