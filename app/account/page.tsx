import { redirect } from "next/navigation";
import Link from "next/link";
import { getAccess } from "@/lib/access";
import { UpgradeButton } from "@/components/UpgradeButton";
import { ManageBillingButton } from "@/components/ManageBillingButton";
import { ViewTracker } from "@/components/ViewTracker";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const access = await getAccess();

  // The only login-gated route. Everything else stays browsable logged-out.
  if (!access.user) {
    redirect("/login");
  }

  return (
    <main className="max-w-lg mx-auto px-6 py-16">
      <ViewTracker event="page_view" metadata={{ path: "/account" }} />
      <h1 className="text-3xl font-bold mb-8">Your account</h1>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted">
            Signed in as
          </div>
          <div className="font-medium">{access.user.email}</div>
        </div>

        <div className="border-t border-border pt-4">
          <div className="text-xs uppercase tracking-wide text-muted">
            Plan
          </div>
          <div className="font-medium flex items-center gap-2">
            {access.isPaid ? (
              <>
                <span className="text-accent">Premium</span>
                <span className="text-xs rounded-full bg-accent/10 text-accent px-2 py-0.5">
                  all 365 unlocked
                </span>
              </>
            ) : (
              <span>Free — today&apos;s affirmation only</span>
            )}
          </div>
        </div>

        <div className="border-t border-border pt-5">
          {access.isPaid ? (
            <ManageBillingButton />
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted">
                Upgrade to unlock every affirmation, every day of the year.
              </p>
              <UpgradeButton />
            </div>
          )}
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/themes" className="text-accent hover:underline">
          Browse themes →
        </Link>
      </p>
    </main>
  );
}
