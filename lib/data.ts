import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { dayOfYear } from "@/lib/date";
import type { Affirmation, Theme } from "@/lib/types";

/**
 * Data-access layer. Reads use the public anon client (themes + affirmations
 * are publicly readable). Every function degrades to an empty/null result on
 * error so pages can render loading / empty / error states instead of crashing
 * — important while the migration is being applied.
 */

export type DataResult<T> = { data: T; error: string | null };

export async function getThemes(): Promise<DataResult<Theme[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("themes")
      .select("*")
      .order("name");
    if (error) return { data: [], error: error.message };
    return { data: (data as Theme[]) ?? [], error: null };
  } catch (err) {
    return { data: [], error: (err as Error).message };
  }
}

export async function getThemeCounts(): Promise<Record<string, number>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("affirmations")
      .select("theme_id");
    if (error || !data) return {};
    const counts: Record<string, number> = {};
    for (const row of data as { theme_id: string }[]) {
      counts[row.theme_id] = (counts[row.theme_id] ?? 0) + 1;
    }
    return counts;
  } catch {
    return {};
  }
}

export async function getThemeBySlug(
  slug: string,
): Promise<DataResult<Theme | null>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("themes")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) return { data: null, error: error.message };
    return { data: (data as Theme) ?? null, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function getAffirmationsForTheme(
  themeId: string,
): Promise<DataResult<Affirmation[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("affirmations")
      .select("*")
      .eq("theme_id", themeId)
      .order("day_number");
    if (error) return { data: [], error: error.message };
    return { data: (data as Affirmation[]) ?? [], error: null };
  } catch (err) {
    return { data: [], error: (err as Error).message };
  }
}

/** Today's affirmation = the row whose day_number matches the day of year. */
export async function getTodaysAffirmation(): Promise<
  DataResult<{ affirmation: Affirmation | null; theme: Theme | null }>
> {
  const day = dayOfYear();
  try {
    const supabase = await createClient();
    const { data: aff, error } = await supabase
      .from("affirmations")
      .select("*")
      .eq("day_number", day)
      .maybeSingle();
    if (error)
      return { data: { affirmation: null, theme: null }, error: error.message };
    if (!aff)
      return { data: { affirmation: null, theme: null }, error: null };

    const { data: theme } = await supabase
      .from("themes")
      .select("*")
      .eq("id", (aff as Affirmation).theme_id)
      .maybeSingle();

    return {
      data: {
        affirmation: aff as Affirmation,
        theme: (theme as Theme) ?? null,
      },
      error: null,
    };
  } catch (err) {
    return {
      data: { affirmation: null, theme: null },
      error: (err as Error).message,
    };
  }
}

export async function getTotalAffirmationCount(): Promise<number> {
  try {
    const supabase = createAdminClient();
    const { count, error } = await supabase
      .from("affirmations")
      .select("*", { count: "exact", head: true });
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}
