"use client";

import { useState } from "react";

/** Opens the Stripe billing portal via /api/stripe/portal. */
export function ManageBillingButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function manage() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.url) {
        setError(json.error ?? "Could not open billing. Please try again.");
        setLoading(false);
        return;
      }
      window.location.href = json.url;
    } catch {
      setError("Could not open billing. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={manage}
        disabled={loading}
        className="rounded-full border border-border px-6 py-2.5 font-medium hover:border-accent disabled:opacity-60"
      >
        {loading ? "Opening…" : "Manage billing"}
      </button>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
