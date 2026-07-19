"use client";

import Link from "next/link";
import { format, isToday, parseISO } from "date-fns";
import { ArrowRightIcon, ClockIcon } from "lucide-react";
import { useAppointmentsByDoctor } from "@/lib/hooks/use-appointments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { CalendarCheck2Icon } from "lucide-react";

export function ConsultationsQueue({ doctorId }: { doctorId: number }) {
  const { data, isLoading } = useAppointmentsByDoctor(doctorId);

  const todaysQueue = (data ?? [])
    .filter((appt) => isToday(parseISO(appt.appointmentDate)) && appt.status !== "CANCELLED")
    .sort((a, b) => a.appointmentDate.localeCompare(b.appointmentDate));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Consultations Queue</CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        {isLoading && <TableSkeleton rows={4} cols={1} />}
        {!isLoading && todaysQueue.length === 0 && (
          <EmptyState icon={CalendarCheck2Icon} title="No consultations today" description="Your queue is clear for today." />
        )}
        {!isLoading && todaysQueue.length > 0 && (
          <ol className="space-y-3">
            {todaysQueue.map((appt) => (
              <li
                key={appt.id}
                className="flex items-center gap-4 rounded-lg border border-slate-200/80 p-3"
              >
                <div className="flex w-16 shrink-0 items-center gap-1.5 text-sm font-medium text-slate-700">
                  <ClockIcon className="size-3.5 text-muted-foreground" />
                  {format(parseISO(appt.appointmentDate), "h:mm a")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{appt.patientName}</p>
                  <p className="truncate text-xs text-muted-foreground">{appt.reason}</p>
                </div>
                <StatusBadge status={appt.status} domain="appointment" />
                <Link
                  href={`/patients/${appt.patientId}?tab=history`}
                  className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Open Medical History <ArrowRightIcon className="size-3" />
                </Link>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
