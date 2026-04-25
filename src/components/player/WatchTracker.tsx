"use client";

import { useEffect, useRef } from "react";
import { useHistory } from "@/hooks/useHistory";
import type { RecordHistoryInput } from "@/lib/storage/history";

export interface WatchTrackerProps {
  payload: RecordHistoryInput;
}

export function WatchTracker({ payload }: WatchTrackerProps) {
  const { record } = useHistory();
  const recorded = useRef(false);

  useEffect(() => {
    if (recorded.current) return;
    recorded.current = true;
    record(payload);
    // Re-mounting for the same route shouldn't double-write. Navigating
    // to a different episode unmounts and remounts naturally.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
