"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { BellIcon, PackageXIcon, ReceiptTextIcon, ClipboardListIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { pharmacyApi } from "@/lib/api/pharmacy";
import { billingApi } from "@/lib/api/billing";
import { leaveApi } from "@/lib/api/staff";
import { useAuthStore } from "@/lib/hooks/use-auth-store";
import { ROLES } from "@/lib/constants";

export function NotificationsPopover() {
  const role = useAuthStore((s) => s.user?.roleName);

  const canSeePharmacy = role === ROLES.ADMIN || role === ROLES.PHARMACIST;
  const canSeeBilling = role === ROLES.ADMIN || role === ROLES.ACCOUNTANT || role === ROLES.RECEPTIONIST;
  const canSeeLeave = role === ROLES.ADMIN;

  const lowStock = useQuery({
    queryKey: ["notifications", "low-stock"],
    queryFn: () => pharmacyApi.lowStock(),
    enabled: canSeePharmacy,
  });
  const overdueInvoices = useQuery({
    queryKey: ["notifications", "overdue-invoices"],
    queryFn: () => billingApi.byStatus("OVERDUE"),
    enabled: canSeeBilling,
  });
  const pendingLeave = useQuery({
    queryKey: ["notifications", "pending-leave"],
    queryFn: () => leaveApi.byStatus("PENDING"),
    enabled: canSeeLeave,
  });

  const totalCount =
    (lowStock.data?.length ?? 0) + (overdueInvoices.data?.length ?? 0) + (pendingLeave.data?.length ?? 0);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <BellIcon className="size-4" />
          {totalCount > 0 && (
            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-semibold text-white">
              {totalCount > 9 ? "9+" : totalCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b border-slate-200/80 px-4 py-3">
          <p className="text-sm font-semibold text-slate-900">Notifications</p>
        </div>
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
          {totalCount === 0 && (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>
          )}

          {(lowStock.data?.length ?? 0) > 0 && (
            <Link href="/pharmacy" className="flex items-start gap-3 px-4 py-3 hover:bg-secondary/50">
              <PackageXIcon className="mt-0.5 size-4 shrink-0 text-warning-fg" />
              <div className="min-w-0">
                <p className="text-sm text-slate-900">{lowStock.data!.length} medicine(s) low on stock</p>
                <Badge variant="warning" className="mt-1">Action needed</Badge>
              </div>
            </Link>
          )}

          {(overdueInvoices.data?.length ?? 0) > 0 && (
            <Link href="/billing" className="flex items-start gap-3 px-4 py-3 hover:bg-secondary/50">
              <ReceiptTextIcon className="mt-0.5 size-4 shrink-0 text-critical-fg" />
              <div className="min-w-0">
                <p className="text-sm text-slate-900">{overdueInvoices.data!.length} invoice(s) overdue</p>
                <Badge variant="critical" className="mt-1">Overdue</Badge>
              </div>
            </Link>
          )}

          {(pendingLeave.data?.length ?? 0) > 0 && (
            <Link href="/staff" className="flex items-start gap-3 px-4 py-3 hover:bg-secondary/50">
              <ClipboardListIcon className="mt-0.5 size-4 shrink-0 text-info-fg" />
              <div className="min-w-0">
                <p className="text-sm text-slate-900">{pendingLeave.data!.length} leave request(s) pending approval</p>
                <Badge variant="info" className="mt-1">Pending</Badge>
              </div>
            </Link>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
