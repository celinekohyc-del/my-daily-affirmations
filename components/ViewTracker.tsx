"use client";

import { useEffect, useRef } from "react";
import { recordTouchpoint } from "@/app/actions";
import type { TouchpointEvent } from "@/lib/types";

/**
 * Fires a single touchpoint on mount (page_view, affirmation_view,
 * theme_select). Renders nothing. Guarded so React Strict Mode's double-mount
 * doesn't log twice.
 */
export function ViewTracker({
  event,
  metadata = {},
}: {
  event: TouchpointEvent;
  metadata?: Record<string, unknown>;
}) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    void recordTouchpoint(event, metadata);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
