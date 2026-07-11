import { createAdminClient } from "@/lib/supabase/admin";
import type { TouchpointEvent } from "@/lib/types";

/**
 * log_touchpoint — append-only interaction log (doubles as the audit log).
 * Best-effort: analytics must never break a page render, so failures are
 * swallowed and logged to the server console.
 */
export async function logTouchpoint(
  eventType: TouchpointEvent,
  metadata: Record<string, unknown> = {},
  userId: string | null = null,
): Promise<void> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("touchpoints").insert({
      user_id: userId,
      event_type: eventType,
      metadata,
    });
    if (error) console.error("[logTouchpoint]", eventType, error.message);
  } catch (err) {
    console.error("[logTouchpoint] threw", err);
  }
}
