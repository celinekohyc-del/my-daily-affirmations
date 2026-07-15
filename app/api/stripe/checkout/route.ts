import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession } from "@/lib/stripe";
import { logTouchpoint } from "@/lib/touchpoints";
import { NextResponse } from "next/server";

/**
 * POST /api/stripe/checkout
 *
 * Creates a Stripe Checkout Session for the signed-in user so they can unlock
 * the full affirmation library. Price comes from NEXT_PUBLIC_STRIPE_PRICE_MONTHLY.
 * Logs a `checkout_start` touchpoint. The `subscriptions` row is written by the
 * webhook once payment completes — never trust the client for access.
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

    const priceId =
      process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY ||
      process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY;

    if (!priceId || !process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Payments aren't configured yet. Please try again later." },
        { status: 503 },
      );
    }

    const origin =
      request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "";

    // Reuse an existing Stripe customer if we've seen this user pay before.
    // Read through the user's own session (owner RLS permits it).
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .not("stripe_customer_id", "is", null)
      .limit(1)
      .maybeSingle();

    const session = await createCheckoutSession({
      priceId,
      customerId: existing?.stripe_customer_id ?? undefined,
      userId: user.id,
      successUrl: `${origin}/account?checkout=success`,
      cancelUrl: `${origin}/account?checkout=canceled`,
    });

    await logTouchpoint("checkout_start", { price_id: priceId }, user.id);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 500 },
    );
  }
}
