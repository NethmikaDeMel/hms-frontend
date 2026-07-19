"use client";

import { useState } from "react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { CreditCardIcon, PrinterIcon, XCircleIcon } from "lucide-react";
import { useInvoice, useInvoiceCharges, useInvoicePayments, useCancelInvoice } from "@/lib/hooks/use-billing";
import { notifyError } from "@/lib/error-utils";
import { currencyFormatter } from "@/lib/constants";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { RecordPaymentDialog } from "@/components/billing/record-payment-dialog";
import { PrintReceiptDialog } from "@/components/billing/print-receipt-dialog";

export function InvoiceDetailSheet({
  invoiceId,
  open,
  onOpenChange,
}: {
  invoiceId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const invoice = useInvoice(invoiceId ?? undefined);
  const charges = useInvoiceCharges(invoiceId ?? undefined);
  const payments = useInvoicePayments(invoiceId ?? undefined);
  const cancelInvoice = useCancelInvoice();

  const canPay = invoice.data && invoice.data.status !== "PAID" && invoice.data.status !== "CANCELLED";
  const canCancel = invoice.data && invoice.data.status !== "PAID" && invoice.data.status !== "CANCELLED";

  const handleCancel = async () => {
    if (!invoiceId || !confirm("Cancel this invoice? This cannot be undone.")) return;
    try {
      await cancelInvoice.mutateAsync(invoiceId);
      toast.success("Invoice cancelled");
    } catch (error) {
      notifyError(error);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {invoice.isLoading && (
            <div className="space-y-3 p-6">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-32 w-full" />
            </div>
          )}

          {invoice.data && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {invoice.data.invoiceNumber}
                  <StatusBadge status={invoice.data.status} domain="invoice" />
                </SheetTitle>
                <SheetDescription>{invoice.data.patientName} · {invoice.data.description}</SheetDescription>
              </SheetHeader>

              <div className="flex-1 space-y-5 overflow-y-auto px-6 py-4">
                <div className="grid grid-cols-3 gap-3 rounded-lg border border-slate-200/80 p-3 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-sm font-semibold tabular-nums">{currencyFormatter.format(invoice.data.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Paid</p>
                    <p className="text-sm font-semibold tabular-nums text-success-fg">{currencyFormatter.format(invoice.data.paidAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Balance Due</p>
                    <p className="text-sm font-semibold tabular-nums text-critical-fg">{currencyFormatter.format(invoice.data.balanceDue)}</p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Line Items</p>
                  <ul className="space-y-1.5">
                    {(charges.data ?? []).map((charge) => (
                      <li key={charge.id} className="flex items-center justify-between gap-2 rounded-md border border-slate-200/80 px-3 py-2 text-sm">
                        <div className="min-w-0">
                          <span className="font-medium text-slate-900">{charge.chargeType}</span>
                          <span className="ml-2 truncate text-muted-foreground">{charge.description}</span>
                        </div>
                        <span className="shrink-0 tabular-nums">{currencyFormatter.format(charge.amount)}</span>
                      </li>
                    ))}
                    {(charges.data?.length ?? 0) === 0 && <p className="text-sm text-muted-foreground">No charges recorded.</p>}
                  </ul>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payment History</p>
                  {(payments.data?.length ?? 0) === 0 ? (
                    <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {payments.data!.map((p) => (
                        <li key={p.id} className="flex items-center justify-between gap-2 rounded-md border border-slate-200/80 px-3 py-2 text-sm">
                          <div>
                            <span className="font-medium text-slate-900">{p.method}</span>
                            <span className="ml-2 text-xs text-muted-foreground">{format(parseISO(p.paidAt), "MMM d, yyyy h:mm a")}</span>
                            {p.insuranceProvider && <span className="ml-2 text-xs text-muted-foreground">· {p.insuranceProvider}</span>}
                          </div>
                          <span className="tabular-nums">{currencyFormatter.format(p.amount)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-slate-200/80 p-4">
                {canPay && (
                  <Button size="sm" onClick={() => setPaymentOpen(true)}>
                    <CreditCardIcon className="size-3.5" /> Record Payment
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => setReceiptOpen(true)}>
                  <PrinterIcon className="size-3.5" /> Print Receipt
                </Button>
                {canCancel && (
                  <Button size="sm" variant="outline" onClick={handleCancel} disabled={cancelInvoice.isPending}>
                    <XCircleIcon className="size-3.5" /> Cancel Invoice
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <RecordPaymentDialog invoice={invoice.data ?? null} open={paymentOpen} onOpenChange={setPaymentOpen} />
      <PrintReceiptDialog invoice={invoice.data ?? null} open={receiptOpen} onOpenChange={setReceiptOpen} />
    </>
  );
}
