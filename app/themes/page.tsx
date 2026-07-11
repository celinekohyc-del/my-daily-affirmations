import Link from "next/link";
import { getThemes, getThemeCounts } from "@/lib/data";
import { ViewTracker } from "@/components/ViewTracker";

export const dynamic = "force-dynamic";

export default async function ThemesPage() {
  const [{ data: themes, error }, counts] = await Promise.all([
    getThemes(),
    getThemeCounts(),
  ]);

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <ViewTracker event="page_view" metadata={{ path: "/themes" }} />

      <header className="text-center mb-10">
        <h1 className="text-3xl font-bold">Seven themes</h1>
        <p className="text-muted mt-2">
          Choose the intention that meets you where you are today.
        </p>
      </header>

      {error && themes.length === 0 ? (
        <p className="text-center text-muted py-12">
          Themes are warming up. Please refresh in a moment.
        </p>
      ) : themes.length === 0 ? (
        <p className="text-center text-muted py-12">No themes yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {themes.map((t) => (
            <Link
              key={t.id}
              href={`/themes/${t.slug}`}
              className="rounded-2xl border border-border bg-card p-6 hover:border-accent transition-colors flex gap-4"
            >
              <div className="text-3xl">{t.icon}</div>
              <div>
                <div className="font-semibold text-lg">{t.name}</div>
                <p className="text-sm text-muted">{t.description}</p>
                <p className="text-xs text-muted mt-2">
                  {counts[t.id] ?? 0} affirmations
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
