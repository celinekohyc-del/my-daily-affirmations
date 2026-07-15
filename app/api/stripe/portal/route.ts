import { createClient } from "@/lib/supabase/server";
import { createPortalSession } from "@/lib/stripe";
import { NextResponse } from "next/server";

/**
 * POST /api/stripe/portal
 *
 * Sends the signed-in user to the Stripe Billing Portal to manage or cancel
 * their subscription. Customer id comes from their `subscriptions` row.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .not("stripe_customer_id", "is", null)
      .limit(1)
      .maybeSingle();

    if (!sub?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No billing account found. Subscribe first." },
        { status: 404 },
      );
    }

    const origin =
      request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "";

    const portalSession = await createPortalSession({
      customerId: sub.stripe_customer_id,
      returnUrl: `${origin}/account`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    console.error("[stripe/portal]", err);
    return NextResponse.json(
      { error: "Could not open billing. Please try again." },
      { status: 500 },
    );
  }
}
