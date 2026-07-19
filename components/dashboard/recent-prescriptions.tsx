"use client";

import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { PillIcon } from "lucide-react";
import { medicalRecordsApi } from "@/lib/api/medical-records";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/table-skeleton";

export function RecentPrescriptions({ doctorId }: { doctorId: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["medical-records", "doctor", doctorId],
    queryFn: medicalRecordsApi.list,
  });

  const recent = (data ?? [])
    .filter((record) => record.doctorId === doctorId && record.prescription)
    .sort((a, b) => b.recordDate.localeCompare(a.recordDate))
    .slice(0, 8);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Prescriptions Handled</CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        {isLoading && <TableSkeleton rows={4} cols={1} />}
        {!isLoading && recent.length === 0 && (
          <EmptyState icon={PillIcon} title="No prescriptions yet" description="Prescriptions you issue will appear here." />
        )}
        {!isLoading && recent.length > 0 && (
          <ul className="space-y-3">
            {recent.map((record) => (
              <li key={record.id} className="rounded-lg border border-slate-200/80 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-900">{record.patientName}</p>
                  <p className="shrink-0 text-xs text-muted-foreground">
                    {format(parseISO(record.recordDate), "MMM d, h:mm a")}
                  </p>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{record.prescription}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
