"use client";

import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { ReceiptTextIcon } from "lucide-react";
import { billingApi } from "@/lib/api/billing";
import { currencyFormatter } from "@/lib/constants";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function PatientBillingTab({ patientId }: { patientId: number }) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["billing-invoices", "patient", patientId],
    queryFn: () => billingApi.byPatient(patientId),
  });

  if (isLoading) return <TableSkeleton rows={3} cols={5} />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!data || data.length === 0) {
    return <EmptyState icon={ReceiptTextIcon} title="No invoices yet" description="Billing history for this patient will appear here." />;
  }

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Balance Due</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium text-slate-900">{invoice.invoiceNumber}</TableCell>
              <TableCell className="max-w-xs truncate">{invoice.description}</TableCell>
              <TableCell className="tabular-nums">{currencyFormatter.format(invoice.totalAmount)}</TableCell>
              <TableCell className="tabular-nums">{currencyFormatter.format(invoice.balanceDue)}</TableCell>
              <TableCell><StatusBadge status={invoice.status} domain="invoice" /></TableCell>
              <TableCell>{format(parseISO(invoice.dueDate), "MMM d, yyyy")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
