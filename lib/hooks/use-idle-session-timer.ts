"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IDLE_WARNING_MS, IDLE_LOGOUT_MS } from "@/lib/constants";

const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
];

interface UseIdleSessionTimerOptions {
  onWarn: () => void;
  onExpire: () => void;
  /** Set false to pause tracking (e.g. while the warning dialog itself is open, per-event resets are still allowed via resetTimer). */
  enabled?: boolean;
}

/**
 * Tracks user inactivity against the 30-minute idle budget:
 * - at 25 minutes idle -> onWarn() (caller shows the countdown modal)
 * - at 30 minutes idle -> onExpire() (caller logs out + redirects)
 * Resets automatically on mouse/keyboard/scroll/touch activity, or manually
 * via resetTimer() (call this after every successful API call too).
 */
export function useIdleSessionTimer({ onWarn, onExpire, enabled = true }: UseIdleSessionTimerOptions) {
  const warnTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expireTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [warningActive, setWarningActive] = useState(false);

  const clearTimers = useCallback(() => {
    if (warnTimeout.current) clearTimeout(warnTimeout.current);
    if (expireTimeout.current) clearTimeout(expireTimeout.current);
  }, []);

  // Pure scheduling — no setState — safe to call directly from an effect body.
  const scheduleTimers = useCallback(() => {
    clearTimers();
    warnTimeout.current = setTimeout(() => {
      setWarningActive(true);
      onWarn();
    }, IDLE_WARNING_MS);
    expireTimeout.current = setTimeout(() => {
      onExpire();
    }, IDLE_LOGOUT_MS);
  }, [clearTimers, onExpire, onWarn]);

  // Full reset for external callers (activity handler, "Stay signed in" button)
  // — also clears an active warning state.
  const resetTimer = useCallback(() => {
    if (!enabled) return;
    setWarningActive(false);
    scheduleTimers();
  }, [enabled, scheduleTimers]);

  useEffect(() => {
    if (!enabled) {
      clearTimers();
      return;
    }

    scheduleTimers();

    const handleActivity = () => {
      // Once the warning modal is showing, casual background activity
      // shouldn't silently dismiss it — only the explicit "Stay signed in"
      // action (which calls resetTimer directly) should do that.
      if (warningActive) return;
      resetTimer();
    };

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, handleActivity, { passive: true }));
    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, handleActivity));
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, warningActive]);

  return { resetTimer, warningActive };
}
