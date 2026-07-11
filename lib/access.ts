import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { User } from "@supabase/supabase-js";

/** How many affirmations a free user can see per theme before the paywall. */
export const FREE_PREVIEW_PER_THEME = 3;

export type Access = {
  user: User | null;
  isPaid: boolean;
};

/**
 * Server-side access gate. Never trust the client: paid status is derived from
 * a `subscriptions` row with status = 'active' for the signed-in user.
 */
export async function getAccess(): Promise<Access> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { user: null, isPaid: false };

    // Use the admin client so this check is unaffected by owner-scoped RLS.
    const admin = createAdminClient();
    const { data } = await admin
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1);

    return { user, isPaid: (data?.length ?? 0) > 0 };
  } catch {
    return { user: null, isPaid: false };
  }
}
