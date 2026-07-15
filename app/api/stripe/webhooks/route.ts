import { constructWebhookEvent } from "@/lib/stripe";
import { activateSubscription, cancelSubscription } from "@/lib/subscriptions";
import { logTouchpoint } from "@/lib/touchpoints";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

// pg needs the Node runtime (not edge).
export const runtime = "nodejs";

/**
 * POST /api/stripe/webhooks
 *
 * The only thing that grants paid access. The Stripe signature is verified
 * BEFORE any DB write (Security doc requirement) — access is never granted from
 * a client redirect.
 *
 * Register in Stripe dashboard → Developers → Webhooks → Add endpoint:
 *   <app-url>/api/stripe/webhooks
 * Events: checkout.session.completed, customer.subscription.deleted
 */
export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature" },
      { status: 400 },
    );
  }
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("[stripe/webhooks] STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(payload, signature);
  } catch (err) {
    console.error("[stripe/webhooks] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      // ── Payment completed → activate access ───────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // Payment Links carry the user in client_reference_id; API-created
        // sessions carry it in metadata.userId. Accept either.
        const userId =
          session.client_reference_id ?? session.metadata?.userId ?? null;

        if (!userId) {
          console.warn(
            "[stripe/webhooks] completed session missing client_reference_id/userId",
            session.id,
          );
          break;
        }

        await activateSubscription({
          userId,
          stripeCustomerId: (session.customer as string) ?? null,
          stripeSessionId: session.id,
        });

        await logTouchpoint(
          "checkout_complete",
          { stripe_session_id: session.id },
          userId,
        );
        console.log("[stripe/webhooks] activated subscription for", userId);
        break;
      }

      // ── Subscription cancelled ────────────────────────────────────────────
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (userId) await cancelSubscription(userId);
        break;
      }

      default:
        // Unhandled event — safe to ignore.
        break;
    }
  } catch (err) {
    console.error(`[stripe/webhooks] error handling ${event.type}:`, err);
    // 500 so Stripe retries — activation is important enough to retry.
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
