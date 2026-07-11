"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logTouchpoint } from "@/lib/touchpoints";
import type { TouchpointEvent } from "@/lib/types";
import { revalidatePath } from "next/cache";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type LeadState = {
  ok: boolean;
  message: string;
};

/**
 * Lead capture (Sprint 2). Upserts into `leads` on the unique email so a repeat
 * submission is idempotent, then logs a `lead_capture` touchpoint.
 */
export async function captureLead(
  _prev: LeadState,
  formData: FormData,
): Promise<LeadState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const source = String(formData.get("source") ?? "homepage");

  if (!EMAIL_RE.test(email)) {
    return { ok: false, message: "Please enter a valid email address." };
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("leads")
      .upsert({ email, source }, { onConflict: "email" });

    if (error) {
      return { ok: false, message: "Something went wrong. Please try again." };
    }

    await logTouchpoint("lead_capture", { email, source });
    return { ok: true, message: "You're in. Your daily intention awaits." };
  } catch {
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}

/** Client-callable touchpoint logger for view/select events. */
export async function recordTouchpoint(
  eventType: TouchpointEvent,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  await logTouchpoint(eventType, metadata, user?.id ?? null);
}

export type AuthState = {
  ok: boolean;
  message: string;
};

/**
 * Signup (Sprint 3). Creates the Supabase Auth user, then links any existing
 * lead with the same email: sets `converted_at` + `user_id`.
 */
export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!EMAIL_RE.test(email)) {
    return { ok: false, message: "Please enter a valid email address." };
  }
  if (password.length < 6) {
    return { ok: false, message: "Password must be at least 6 characters." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { ok: false, message: error.message };
  }

  // Link the lead → user (best effort; also creates a lead row if none exists).
  try {
    const admin = createAdminClient();
    await admin.from("leads").upsert(
      {
        email,
        source: "signup",
        user_id: data.user?.id ?? null,
        converted_at: new Date().toISOString(),
      },
      { onConflict: "email" },
    );
  } catch {
    // Non-fatal — signup already succeeded.
  }

  revalidatePath("/", "layout");
  return {
    ok: true,
    message: data.session
      ? "Account created."
      : "Account created. Check your email to confirm, then log in.",
  };
}

export async function logIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false, message: "Incorrect email or password." };
  }

  revalidatePath("/", "layout");
  return { ok: true, message: "Welcome back." };
}

export async function logOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}
