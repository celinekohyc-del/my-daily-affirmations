import { createClient } from "@/lib/supabase/server";
import { logTouchpoint } from "@/lib/touchpoints";
import { NextResponse } from "next/server";

/**
 * POST /api/stripe/checkout
 *
 * Sends the signed-in user to the Stripe Payment Link to unlock the full
 * library. We append `client_reference_id=<userId>` (and prefill their email)
 * so the `checkout.session.completed` webhook can tie the payment back to this
 * account and activate their subscription. Access is only ever granted by the
 * webhook after Stripe confirms payment — never by the client.
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;
    if (!paymentLink) {
      return NextResponse.json(
        { error: "Payments aren't configured yet. Please try again later." },
        { status: 503 },
      );
    }

    const url = new URL(paymentLink);
    url.searchParams.set("client_reference_id", user.id);
    if (user.email) url.searchParams.set("prefilled_email", user.email);

    await logTouchpoint("checkout_start", {}, user.id);

    return NextResponse.json({ url: url.toString() });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 500 },
    );
  }
}
