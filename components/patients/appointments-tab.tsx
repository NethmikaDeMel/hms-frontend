"use client";

import { format, parseISO } from "date-fns";
import { CalendarClockIcon } from "lucide-react";
import { useAppointmentsByPatient } from "@/lib/hooks/use-appointments";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export function PatientAppointmentsTab({ patientId }: { patientId: number }) {
  const { data, isLoading, isError, refetch } = useAppointmentsByPatient(patientId);

  if (isLoading) return <TableSkeleton rows={4} cols={4} />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!data || data.length === 0) {
    return <EmptyState icon={CalendarClockIcon} title="No appointments yet" description="This patient has no appointment history." />;
  }

  const sorted = [...data].sort((a, b) => b.appointmentDate.localeCompare(a.appointmentDate));

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Doctor</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((appt) => (
            <TableRow key={appt.id}>
              <TableCell>{format(parseISO(appt.appointmentDate), "MMM d, yyyy h:mm a")}</TableCell>
              <TableCell>Dr. {appt.doctorName}</TableCell>
              <TableCell className="max-w-xs truncate">{appt.reason}</TableCell>
              <TableCell><StatusBadge status={appt.status} domain="appointment" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
