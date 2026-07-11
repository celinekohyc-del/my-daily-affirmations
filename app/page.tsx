import Link from "next/link";
import { getTodaysAffirmation, getThemes } from "@/lib/data";
import { getAccess } from "@/lib/access";
import { dayOfYear } from "@/lib/date";
import { EmailCapture } from "@/components/EmailCapture";
import { UpgradeButton } from "@/components/UpgradeButton";
import { ViewTracker } from "@/components/ViewTracker";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [{ data: today, error }, { data: themes }, access] = await Promise.all([
    getTodaysAffirmation(),
    getThemes(),
    getAccess(),
  ]);

  const { affirmation, theme } = today;
  const day = dayOfYear();

  return (
    <main className="max-w-4xl mx-auto px-6 py-12 sm:py-16">
      <ViewTracker event="page_view" metadata={{ path: "/" }} />

      {/* Hero — today's affirmation, no login required */}
      <section className="text-center space-y-6">
        <p className="uppercase tracking-widest text-xs text-muted">
          Day {day} · Today&apos;s affirmation
        </p>

        {affirmation ? (
          <>
            <ViewTracker
              event="affirmation_view"
              metadata={{
                affirmation_id: affirmation.id,
                theme_id: affirmation.theme_id,
                theme_slug: theme?.slug,
                day_number: affirmation.day_number,
                user_tier: access.isPaid ? "active" : "free",
              }}
            />
            <blockquote className="text-3xl sm:text-4xl leading-snug font-medium max-w-2xl mx-auto">
              “{affirmation.body}”
            </blockquote>
            {theme && (
              <Link
                href={`/themes/${theme.slug}`}
                className="inline-block text-sm text-accent hover:underline"
              >
                {theme.icon} {theme.name}
              </Link>
            )}
          </>
        ) : (
          <div className="py-8 text-muted">
            {error ? (
              <p>
                Today&apos;s affirmation is warming up. Please refresh in a
                moment.
              </p>
            ) : (
              <p>No affirmation is set for today yet — check back soon.</p>
            )}
          </div>
        )}
      </section>

      {/* Lead capture */}
      <section className="mt-14 rounded-2xl border border-border bg-card p-8 text-center space-y-4">
        <h2 className="text-xl font-semibold">
          Start each morning with intention
        </h2>
        <p className="text-muted max-w-md mx-auto">
          Drop your email and we&apos;ll save your place in the ritual.
        </p>
        <EmailCapture source="homepage" />
      </section>

      {/* Themes preview */}
      <section className="mt-16">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-xl font-semibold">Browse by theme</h2>
          <Link href="/themes" className="text-sm text-accent hover:underline">
            See all 7 →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {themes.slice(0, 6).map((t) => (
            <Link
              key={t.id}
              href={`/themes/${t.slug}`}
              className="rounded-xl border border-border bg-card p-5 hover:border-accent transition-colors"
            >
              <div className="text-2xl mb-2">{t.icon}</div>
              <div className="font-medium">{t.name}</div>
              <div className="text-sm text-muted line-clamp-2">
                {t.description}
              </div>
            </Link>
          ))}
        </div>
        {themes.length === 0 && (
          <p className="text-muted text-center py-8">
            Themes are loading — refresh in a moment.
          </p>
        )}
      </section>

      {/* Upgrade CTA */}
      {!access.isPaid && (
        <section className="mt-16 rounded-2xl bg-foreground text-background p-10 text-center space-y-4">
          <h2 className="text-2xl font-semibold">
            Unlock the full year of affirmations
          </h2>
          <p className="opacity-80 max-w-md mx-auto">
            Free gives you today&apos;s intention. Go premium for all 365 —
            every theme, every day.
          </p>
          <div className="pt-2 flex justify-center">
            <UpgradeButton />
          </div>
        </section>
      )}
    </main>
  );
}
