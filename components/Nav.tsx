import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logOut } from "@/app/actions";

export async function Nav() {
  let email: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email ?? null;
  } catch {
    email = null;
  }

  return (
    <header className="border-b border-border bg-card/60 backdrop-blur">
      <nav className="max-w-4xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="font-bold text-lg tracking-tight">
          ☀️ Daily Affirmations
        </Link>
        <div className="flex items-center gap-5 text-sm">
          <Link href="/themes" className="hover:text-accent transition-colors">
            Themes
          </Link>
          {email ? (
            <>
              <Link
                href="/account"
                className="hover:text-accent transition-colors"
              >
                Account
              </Link>
              <form action={logOut}>
                <button
                  type="submit"
                  className="text-muted hover:text-foreground transition-colors"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hover:text-accent transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="btn-accent rounded-full px-4 py-1.5 font-medium"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
