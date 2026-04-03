import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Browser-safe client — uses anon key, respects RLS.
// Lazily instantiated so build-time collection doesn't fail without env vars.
let _supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error("Supabase env vars not set");
    _supabase = createClient(url, key);
  }
  return _supabase;
}

// Convenience export for client components (kept as getter-style to avoid
// module-level instantiation at build time)
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseClient() as unknown as Record<string, unknown>)[prop as string];
  },
});

// Server-only service role client — NEVER import in client components.
// Only used inside /app/api/ routes.
export function createServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Supabase service role env vars not set");
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
