"use client";

import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { FlaskConicalIcon } from "lucide-react";
import { laboratoryApi } from "@/lib/api/laboratory";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function PatientLabTestsTab({ patientId }: { patientId: number }) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["laboratory-tests", "patient", patientId],
    queryFn: () => laboratoryApi.byPatient(patientId),
  });

  if (isLoading) return <TableSkeleton rows={3} cols={4} />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!data || data.length === 0) {
    return <EmptyState icon={FlaskConicalIcon} title="No lab tests yet" description="Test orders for this patient will appear here." />;
  }

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Test</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Ordered</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="font-medium text-slate-900">{t.testName}</TableCell>
              <TableCell>{t.testType}</TableCell>
              <TableCell>{format(parseISO(t.orderedDate), "MMM d, yyyy")}</TableCell>
              <TableCell><StatusBadge status={t.status} domain="lab" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
