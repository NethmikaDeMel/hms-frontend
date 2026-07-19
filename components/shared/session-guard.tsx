"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/hooks/use-auth-store";
import { useIdleSessionTimer } from "@/lib/hooks/use-idle-session-timer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IDLE_LOGOUT_MS, IDLE_WARNING_MS } from "@/lib/constants";

const GRACE_PERIOD_SECONDS = Math.round((IDLE_LOGOUT_MS - IDLE_WARNING_MS) / 1000);

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Mounted once in the authenticated layout. Implements the idle-session
 * policy: 25 minutes of inactivity shows a 5-minute countdown warning;
 * no response logs the user out and redirects to /login?reason=timeout.
 */
export function SessionGuard() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(GRACE_PERIOD_SECONDS);
  const countdownInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleExpire = useCallback(async () => {
    setDialogOpen(false);
    await logout();
    router.push("/login?reason=timeout");
  }, [logout, router]);

  const { resetTimer } = useIdleSessionTimer({
    enabled: isAuthenticated,
    onWarn: () => {
      setSecondsLeft(GRACE_PERIOD_SECONDS);
      setDialogOpen(true);
    },
    onExpire: handleExpire,
  });

  useEffect(() => {
    if (dialogOpen) {
      countdownInterval.current = setInterval(() => {
        setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
    }
    return () => {
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, [dialogOpen]);

  const handleStaySignedIn = () => {
    setDialogOpen(false);
    resetTimer();
  };

  if (!isAuthenticated) return null;

  return (
    <AlertDialog open={dialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Your session is about to expire</AlertDialogTitle>
          <AlertDialogDescription>
            You&apos;ve been inactive for a while. For your security, we&apos;ll sign
            you out automatically in{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {formatCountdown(secondsLeft)}
            </span>{" "}
            unless you&apos;d like to stay signed in.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleStaySignedIn}>Stay signed in</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
