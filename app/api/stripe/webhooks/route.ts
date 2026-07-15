import { constructWebhookEvent } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { logTouchpoint } from "@/lib/touchpoints";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

/**
 * POST /api/stripe/webhooks
 *
 * Verifies the Stripe signature, then activates access. Signature verification
 * happens BEFORE any DB write (Security doc requirement). Uses the service-role
 * admin client so it can write regardless of RLS.
 *
 * Register in Stripe dashboard → Webhooks → add endpoint:
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

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      // ── Payment completed → activate subscription ─────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // Payment Links carry the user in client_reference_id; API-created
        // sessions carry it in metadata.userId. Accept either.
        const userId =
          session.client_reference_id ?? session.metadata?.userId ?? null;
        if (!userId) {
          console.warn(
            "[stripe/webhooks] completed session missing client_reference_id/userId",
          );
          break;
        }

        // activate_subscription: upsert an active row for this user.
        const { data: existing } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("user_id", userId)
          .limit(1)
          .maybeSingle();

        const row = {
          user_id: userId,
          stripe_customer_id: (session.customer as string) ?? null,
          stripe_session_id: session.id,
          status: "active" as const,
          started_at: new Date().toISOString(),
        };

        if (existing?.id) {
          await supabase
            .from("subscriptions")
            .update(row)
            .eq("id", existing.id);
        } else {
          await supabase.from("subscriptions").insert(row);
        }

        await logTouchpoint(
          "checkout_complete",
          { stripe_session_id: session.id },
          userId,
        );
        break;
      }

      // ── Subscription cancelled ────────────────────────────────────────────
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (userId) {
          await supabase
            .from("subscriptions")
            .update({ status: "cancelled" })
            .eq("user_id", userId);
        }
        break;
      }

      default:
        // Unhandled event — safe to ignore.
        break;
    }
  } catch (err) {
    console.error(`[stripe/webhooks] error handling ${event.type}:`, err);
    // Fall through to 200 so Stripe doesn't hammer retries on a handler bug.
  }

  return NextResponse.json({ received: true });
}
