import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

/** How many affirmations a free user can see per theme before the paywall. */
export const FREE_PREVIEW_PER_THEME = 3;

export type Access = {
  user: User | null;
  isPaid: boolean;
};

/**
 * Server-side access gate. Never trust the client: paid status is derived from
 * an `active` subscriptions row owned by the signed-in user.
 *
 * The read runs through the user's own authenticated session, so the
 * owner-scoped RLS policy (auth.uid() = user_id) permits it without needing the
 * service-role key. The webhook is the only writer of this table.
 */
export async function getAccess(): Promise<Access> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { user: null, isPaid: false };

    const { data } = await supabase
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
