"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/hooks/use-auth-store";
import { Sidebar } from "@/components/shared/sidebar";
import { Navbar } from "@/components/shared/navbar";
import { SessionGuard } from "@/components/shared/session-guard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="size-6 animate-spin rounded-full border-2 border-slate-300 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 @container">{children}</main>
      </div>
      <SessionGuard />
    </div>
  );
}
