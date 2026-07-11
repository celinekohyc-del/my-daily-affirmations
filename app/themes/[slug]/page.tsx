import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getThemeBySlug,
  getAffirmationsForTheme,
} from "@/lib/data";
import { getAccess, FREE_PREVIEW_PER_THEME } from "@/lib/access";
import { UpgradeButton } from "@/components/UpgradeButton";
import { ViewTracker } from "@/components/ViewTracker";

export const dynamic = "force-dynamic";

export default async function ThemePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data: theme } = await getThemeBySlug(slug);

  if (!theme) {
    // Distinguish "not found" from "db not ready": if the slug is one of the
    // known theme slugs the data layer just couldn't load, show a soft state.
    notFound();
  }

  const [{ data: affirmations, error }, access] = await Promise.all([
    getAffirmationsForTheme(theme.id),
    getAccess(),
  ]);

  const unlocked = access.isPaid;

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <ViewTracker
        event="theme_select"
        metadata={{ theme_id: theme.id, theme_slug: theme.slug }}
      />

      <Link href="/themes" className="text-sm text-accent hover:underline">
        ← All themes
      </Link>

      <header className="text-center my-8">
        <div className="text-4xl mb-3">{theme.icon}</div>
        <h1 className="text-3xl font-bold">{theme.name}</h1>
        <p className="text-muted mt-2">{theme.description}</p>
      </header>

      {error && affirmations.length === 0 ? (
        <p className="text-center text-muted py-12">
          These affirmations are warming up. Please refresh in a moment.
        </p>
      ) : affirmations.length === 0 ? (
        <p className="text-center text-muted py-12">
          No affirmations here yet.
        </p>
      ) : (
        <ol className="space-y-3">
          {affirmations.map((a, i) => {
            const locked = !unlocked && i >= FREE_PREVIEW_PER_THEME;
            return (
              <li
                key={a.id}
                className={`rounded-xl border border-border bg-card px-5 py-4 flex gap-4 items-start ${
                  locked ? "select-none" : ""
                }`}
              >
                <span className="text-xs text-muted mt-1 w-10 shrink-0">
                  Day {a.day_number}
                </span>
                <p
                  className={
                    locked ? "blur-sm pointer-events-none flex-1" : "flex-1"
                  }
                  aria-hidden={locked}
                >
                  {locked
                    ? "Unlock this affirmation with premium access to your full year."
                    : a.body}
                </p>
              </li>
            );
          })}
        </ol>
      )}

      {!unlocked && affirmations.length > FREE_PREVIEW_PER_THEME && (
        <section className="mt-10 rounded-2xl bg-foreground text-background p-8 text-center space-y-4">
          <h2 className="text-xl font-semibold">
            {affirmations.length - FREE_PREVIEW_PER_THEME} more in this theme
          </h2>
          <p className="opacity-80">
            Unlock every affirmation across all seven themes.
          </p>
          <div className="flex justify-center pt-1">
            <UpgradeButton label="Unlock all 365" />
          </div>
        </section>
      )}
    </main>
  );
}
