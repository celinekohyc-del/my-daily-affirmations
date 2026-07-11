"use client";

import { useState } from "react";

/**
 * Starts Stripe Checkout. Posts to /api/stripe/checkout, which returns a hosted
 * checkout URL. If the user isn't signed in (401) we send them to signup first.
 */
export function UpgradeButton({
  label = "Unlock all 365 affirmations",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upgrade() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      if (res.status === 401) {
        window.location.href = "/signup?next=upgrade";
        return;
      }
      const json = await res.json();
      if (!res.ok || !json.url) {
        setError(json.error ?? "Could not start checkout. Please try again.");
        setLoading(false);
        return;
      }
      window.location.href = json.url;
    } catch {
      setError("Could not start checkout. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={upgrade}
        disabled={loading}
        className={`btn-accent rounded-full px-7 py-3 font-medium disabled:opacity-60 ${className}`}
      >
        {loading ? "Starting checkout…" : label}
      </button>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
