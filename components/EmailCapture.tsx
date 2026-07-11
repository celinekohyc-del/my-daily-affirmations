"use client";

import { useActionState } from "react";
import { captureLead, type LeadState } from "@/app/actions";

const initial: LeadState = { ok: false, message: "" };

export function EmailCapture({ source = "homepage" }: { source?: string }) {
  const [state, formAction, pending] = useActionState(captureLead, initial);

  if (state.ok) {
    return (
      <p className="text-center text-accent font-medium py-3" role="status">
        {state.message}
      </p>
    );
  }

  return (
    <form
      action={formAction}
      className="flex flex-col sm:flex-row gap-3 w-full max-w-md mx-auto"
    >
      <input type="hidden" name="source" value={source} />
      <input
        type="email"
        name="email"
        required
        placeholder="you@example.com"
        aria-label="Email address"
        className="flex-1 rounded-full border border-border bg-card px-5 py-3 outline-none focus:border-accent"
      />
      <button
        type="submit"
        disabled={pending}
        className="btn-accent rounded-full px-6 py-3 font-medium disabled:opacity-60"
      >
        {pending ? "Sending…" : "Get my ritual"}
      </button>
      {!state.ok && state.message && (
        <p className="text-sm text-red-600 sm:absolute sm:mt-14" role="alert">
          {state.message}
        </p>
      )}
    </form>
  );
}
