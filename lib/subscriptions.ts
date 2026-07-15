import { Client } from "pg";

/**
 * Privileged subscription writes (activate_subscription / cancel).
 *
 * `subscriptions` is deliberately system-write-only: owner-scoped RLS lets a
 * user read their own row, but nothing client-side can write one — otherwise
 * anyone could grant themselves premium. These writes therefore run over a
 * direct Postgres connection (DATABASE_URL, server-only) rather than the anon
 * key, and are only ever called from the Stripe webhook AFTER the event
 * signature has been verified.
 */

async function withDb<T>(fn: (client: Client) => Promise<T>): Promise<T> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL not configured");

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10_000,
  });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end().catch(() => {});
  }
}

/** Marks the user's subscription active. Idempotent per user. */
export async function activateSubscription({
  userId,
  stripeCustomerId,
  stripeSessionId,
}: {
  userId: string;
  stripeCustomerId: string | null;
  stripeSessionId: string;
}): Promise<void> {
  await withDb(async (client) => {
    // One row per user: update in place if we've seen them, else insert.
    const existing = await client.query(
      "select id from subscriptions where user_id = $1 limit 1",
      [userId],
    );

    if (existing.rowCount && existing.rowCount > 0) {
      await client.query(
        `update subscriptions
            set stripe_customer_id = coalesce($2, stripe_customer_id),
                stripe_session_id  = $3,
                status             = 'active',
                started_at         = now()
          where id = $1`,
        [existing.rows[0].id, stripeCustomerId, stripeSessionId],
      );
    } else {
      await client.query(
        `insert into subscriptions
           (user_id, stripe_customer_id, stripe_session_id, status, started_at)
         values ($1, $2, $3, 'active', now())`,
        [userId, stripeCustomerId, stripeSessionId],
      );
    }
  });
}

/** Marks every subscription row for this user cancelled. */
export async function cancelSubscription(userId: string): Promise<void> {
  await withDb(async (client) => {
    await client.query(
      "update subscriptions set status = 'cancelled' where user_id = $1",
      [userId],
    );
  });
}

