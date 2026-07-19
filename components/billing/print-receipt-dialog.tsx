"use client";

import { format, parseISO } from "date-fns";
import { PrinterIcon } from "lucide-react";
import { useInvoiceCharges, useInvoicePayments } from "@/lib/hooks/use-billing";
import { currencyFormatter } from "@/lib/constants";
import type { BillingInvoiceResponse } from "@/lib/types/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/shared/status-badge";

export function PrintReceiptDialog({
  invoice,
  open,
  onOpenChange,
}: {
  invoice: BillingInvoiceResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const charges = useInvoiceCharges(invoice?.id);
  const payments = useInvoicePayments(invoice?.id);

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md print:shadow-none">
        <DialogHeader>
          <DialogTitle>Receipt</DialogTitle>
        </DialogHeader>

        <div id="invoice-receipt-print" className="space-y-4 rounded-lg border border-slate-200/80 p-5 font-mono text-sm">
          <div className="text-center">
            <p className="font-semibold text-slate-900">HMS Portal</p>
            <p className="text-xs text-muted-foreground">Official Payment Receipt</p>
          </div>
          <Separator />
          <div className="space-y-1 text-xs">
            <div className="flex justify-between"><span>Invoice #</span><span>{invoice.invoiceNumber}</span></div>
            <div className="flex justify-between"><span>Patient</span><span>{invoice.patientName}</span></div>
            <div className="flex justify-between"><span>Issue Date</span><span>{format(parseISO(invoice.issueDate), "MMM d, yyyy")}</span></div>
            <div className="flex justify-between"><span>Due Date</span><span>{format(parseISO(invoice.dueDate), "MMM d, yyyy")}</span></div>
            <div className="flex justify-between items-center"><span>Status</span><StatusBadge status={invoice.status} domain="invoice" /></div>
          </div>
          <Separator />
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Charges</p>
            <ul className="space-y-1 text-xs">
              {(charges.data ?? []).map((c) => (
                <li key={c.id} className="flex justify-between">
                  <span className="truncate pr-2">{c.description}</span>
                  <span className="shrink-0 tabular-nums">{currencyFormatter.format(c.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
          <Separator />
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payments</p>
            {(payments.data?.length ?? 0) === 0 ? (
              <p className="text-xs text-muted-foreground">No payments recorded yet.</p>
            ) : (
              <ul className="space-y-1 text-xs">
                {(payments.data ?? []).map((p) => (
                  <li key={p.id} className="flex justify-between">
                    <span>{p.method} — {format(parseISO(p.paidAt), "MMM d, h:mm a")}</span>
                    <span className="tabular-nums">{currencyFormatter.format(p.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Separator />
          <div className="space-y-1 text-sm font-semibold">
            <div className="flex justify-between"><span>Total</span><span className="tabular-nums">{currencyFormatter.format(invoice.totalAmount)}</span></div>
            <div className="flex justify-between text-success-fg"><span>Paid</span><span className="tabular-nums">{currencyFormatter.format(invoice.paidAmount)}</span></div>
            <div className="flex justify-between text-critical-fg"><span>Balance Due</span><span className="tabular-nums">{currencyFormatter.format(invoice.balanceDue)}</span></div>
          </div>
        </div>

        <DialogFooter className="print:hidden">
          <Button variant="outline" onClick={() => window.print()}>
            <PrinterIcon className="size-4" /> Print / Save PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
