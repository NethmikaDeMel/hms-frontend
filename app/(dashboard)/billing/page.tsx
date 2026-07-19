"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { PlusIcon, ReceiptTextIcon } from "lucide-react";
import { useInvoices } from "@/lib/hooks/use-billing";
import { currencyFormatter } from "@/lib/constants";
import type { InvoiceStatus } from "@/lib/types/api";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NewInvoiceDialog } from "@/components/billing/new-invoice-dialog";
import { InvoiceDetailSheet } from "@/components/billing/invoice-detail-sheet";

const TABS: { value: string; label: string; status?: InvoiceStatus }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending", status: "PENDING" },
  { value: "partial", label: "Partially Paid", status: "PARTIALLY_PAID" },
  { value: "paid", label: "Paid", status: "PAID" },
  { value: "overdue", label: "Overdue", status: "OVERDUE" },
  { value: "cancelled", label: "Cancelled", status: "CANCELLED" },
];

export default function BillingPage() {
  const { data: invoices, isLoading, isError, refetch } = useInvoices();
  const [newInvoiceOpen, setNewInvoiceOpen] = useState(false);
  const [activeInvoiceId, setActiveInvoiceId] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing Hub"
        description="Compile itemized invoices and record payments."
        actions={
          <Button onClick={() => setNewInvoiceOpen(true)}>
            <PlusIcon className="size-4" /> New Invoice
          </Button>
        }
      />

      {isLoading && <TableSkeleton rows={6} cols={6} />}
      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && (
        <Tabs defaultValue="all">
          <TabsList className="flex-wrap h-auto">
            {TABS.map((tab) => <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>)}
          </TabsList>

          {TABS.map((tab) => {
            const filtered = tab.status ? (invoices ?? []).filter((i) => i.status === tab.status) : (invoices ?? []);
            const sorted = [...filtered].sort((a, b) => b.issueDate.localeCompare(a.issueDate));

            return (
              <TabsContent key={tab.value} value={tab.value}>
                {sorted.length === 0 ? (
                  <EmptyState icon={ReceiptTextIcon} title="No invoices here" description="Invoices will appear here as they're created." />
                ) : (
                  <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice #</TableHead>
                          <TableHead>Patient</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Balance Due</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sorted.map((invoice) => (
                          <TableRow key={invoice.id} className="cursor-pointer" onClick={() => setActiveInvoiceId(invoice.id)}>
                            <TableCell className="font-medium text-slate-900">{invoice.invoiceNumber}</TableCell>
                            <TableCell>{invoice.patientName}</TableCell>
                            <TableCell className="max-w-xs truncate">{invoice.description}</TableCell>
                            <TableCell className="tabular-nums">{currencyFormatter.format(invoice.totalAmount)}</TableCell>
                            <TableCell className="tabular-nums">{currencyFormatter.format(invoice.balanceDue)}</TableCell>
                            <TableCell>{format(parseISO(invoice.dueDate), "MMM d, yyyy")}</TableCell>
                            <TableCell><StatusBadge status={invoice.status} domain="invoice" /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      )}

      <NewInvoiceDialog open={newInvoiceOpen} onOpenChange={setNewInvoiceOpen} />
      <InvoiceDetailSheet
        invoiceId={activeInvoiceId}
        open={!!activeInvoiceId}
        onOpenChange={(open) => !open && setActiveInvoiceId(null)}
      />
    </div>
  );
}
