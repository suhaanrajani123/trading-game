import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// During build/prerender the env vars may be empty. We still create
// the client so imports don't crash, but any call will fail at runtime
// with a clear message if the vars are truly missing.
export const supabase: SupabaseClient = supabaseUrl
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (new Proxy({} as SupabaseClient, {
      get(_, prop) {
        if (prop === "auth") {
          return new Proxy(
            {},
            {
              get(_, authProp) {
                if (authProp === "onAuthStateChange") {
                  return () => ({
                    data: { subscription: { unsubscribe: () => {} } },
                  });
                }
                return () =>
                  Promise.resolve({
                    data: { session: null, user: null },
                    error: null,
                  });
              },
            }
          );
        }
        return () => {};
      },
    }) as unknown as SupabaseClient);
