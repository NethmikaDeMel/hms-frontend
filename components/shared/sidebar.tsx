"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Cookies from "js-cookie";
import { ChevronsLeftIcon, ChevronsRightIcon, LogOutIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItemsForRole } from "@/lib/nav-items";
import { useAuthStore } from "@/lib/hooks/use-auth-store";
import { LogoMark } from "@/components/shared/logo-mark";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const SIDEBAR_COLLAPSE_COOKIE = "hms_sidebar_collapsed";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function roleLabel(user: { roleName: string } | null) {
  if (!user) return "";
  if (user.roleName === "DOCTOR") return "Attending Physician";
  return user.roleName
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [collapsed, setCollapsed] = useState(() => Cookies.get(SIDEBAR_COLLAPSE_COOKIE) === "1");

  const items = navItemsForRole(user?.roleName);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      Cookies.set(SIDEBAR_COLLAPSE_COOKIE, next ? "1" : "0", { expires: 365 });
      return next;
    });
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-slate-200/80 bg-white transition-[width] duration-200 ease-in-out",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-200/80 px-4">
        <LogoMark className="size-8 shrink-0" />
        {!collapsed && (
          <span className="text-base font-semibold tracking-tight text-slate-900">HMS Portal</span>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-md border-l-2 border-transparent px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "border-l-primary bg-info-bg text-info-fg"
                  : "text-slate-600 hover:bg-secondary hover:text-slate-900"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="size-4.5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200/80 p-3">
        <button
          onClick={toggleCollapsed}
          className="mb-3 flex w-full items-center justify-center rounded-md py-1.5 text-slate-400 hover:bg-secondary hover:text-slate-700"
        >
          {collapsed ? <ChevronsRightIcon className="size-4" /> : <ChevronsLeftIcon className="size-4" />}
        </button>

        {user && (
          <div className={cn("rounded-lg border border-slate-200/80 bg-slate-50/60 p-3", collapsed && "px-2")}>
            <div className="flex items-center gap-2.5">
              <Avatar className="size-8 shrink-0">
                <AvatarFallback>{initials(user.fullName)}</AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{user.fullName}</p>
                  <p className="truncate text-xs text-muted-foreground">{roleLabel(user)}</p>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className={cn("mt-3 w-full justify-center gap-2 text-slate-600", collapsed && "px-0")}
            >
              <LogOutIcon className="size-3.5" />
              {!collapsed && "Logout"}
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
