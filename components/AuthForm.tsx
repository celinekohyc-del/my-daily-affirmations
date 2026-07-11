"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp, logIn, type AuthState } from "@/app/actions";

const initial: AuthState = { ok: false, message: "" };

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const action = mode === "signup" ? signUp : logIn;
  const [state, formAction, pending] = useActionState(action, initial);

  useEffect(() => {
    // On login (session created immediately) redirect home. On signup that
    // required email confirmation we stay and show the message.
    if (state.ok && (mode === "login" || state.message === "Account created.")) {
      router.push("/");
      router.refresh();
    }
  }, [state, mode, router]);

  return (
    <div className="max-w-sm mx-auto w-full">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {mode === "signup" ? "Create your account" : "Welcome back"}
      </h1>
      <form action={formAction} className="space-y-4">
        <input
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          aria-label="Email"
          className="w-full rounded-lg border border-border bg-card px-4 py-3 outline-none focus:border-accent"
        />
        <input
          type="password"
          name="password"
          required
          minLength={6}
          placeholder="Password (min 6 characters)"
          aria-label="Password"
          className="w-full rounded-lg border border-border bg-card px-4 py-3 outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={pending}
          className="btn-accent w-full rounded-lg px-4 py-3 font-medium disabled:opacity-60"
        >
          {pending
            ? "Please wait…"
            : mode === "signup"
              ? "Sign up"
              : "Log in"}
        </button>
      </form>

      {state.message && (
        <p
          className={`mt-4 text-sm text-center ${
            state.ok ? "text-accent" : "text-red-600"
          }`}
          role={state.ok ? "status" : "alert"}
        >
          {state.message}
        </p>
      )}

      <p className="mt-6 text-sm text-center text-muted">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-accent hover:underline">
              Log in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/signup" className="text-accent hover:underline">
              Create an account
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
