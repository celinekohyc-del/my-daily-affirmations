import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client for privileged writes (lead capture, touchpoint
 * logging, subscription activation from the Stripe webhook).
 *
 * Prefers SUPABASE_SERVICE_ROLE_KEY so these writes keep working once the
 * lock-down migration (Sprint 5) replaces permissive RLS with owner-scoped
 * policies. Falls back to the anon key when the service role key isn't
 * configured — fine under v1 permissive RLS. Never import this into a client
 * component.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
