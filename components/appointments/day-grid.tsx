"use client";

import { format, parseISO } from "date-fns";
import { PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppointmentResponse } from "@/lib/types/api";
import { StatusBadge } from "@/components/shared/status-badge";

const HOURS = Array.from({ length: 11 }, (_, i) => 8 + i); // 08:00 - 18:00

export function DayGrid({
  date,
  appointments,
  onSlotClick,
  onAppointmentClick,
}: {
  date: string;
  appointments: AppointmentResponse[];
  onSlotClick: (time: string) => void;
  onAppointmentClick: (appointment: AppointmentResponse) => void;
}) {
  const byHour = new Map<number, AppointmentResponse[]>();
  appointments
    .filter((a) => a.appointmentDate.startsWith(date) && a.status !== "CANCELLED")
    .forEach((a) => {
      const hour = parseISO(a.appointmentDate).getHours();
      byHour.set(hour, [...(byHour.get(hour) ?? []), a]);
    });

  return (
    <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-white shadow-xs">
      {HOURS.map((hour) => {
        const slotAppointments = byHour.get(hour) ?? [];
        const timeLabel = `${hour.toString().padStart(2, "0")}:00`;
        return (
          <div key={hour} className="flex min-h-16 items-stretch">
            <div className="w-20 shrink-0 border-r border-slate-100 px-3 py-3 text-xs font-medium text-muted-foreground">
              {format(new Date(2000, 0, 1, hour), "h:mm a")}
            </div>
            <div className="flex flex-1 flex-wrap items-center gap-2 p-2">
              {slotAppointments.length === 0 ? (
                <button
                  onClick={() => onSlotClick(timeLabel)}
                  className="group flex h-12 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-200 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:bg-info-bg/40 hover:text-primary"
                >
                  <PlusIcon className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  Available — click to book
                </button>
              ) : (
                slotAppointments.map((appt) => (
                  <button
                    key={appt.id}
                    onClick={() => onAppointmentClick(appt)}
                    className={cn(
                      "flex min-w-[220px] flex-1 items-center justify-between gap-2 rounded-lg border p-2.5 text-left transition-colors",
                      "border-slate-200/80 bg-slate-50/60 hover:border-slate-300"
                    )}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{appt.patientName}</p>
                      <p className="truncate text-xs text-muted-foreground">{appt.reason}</p>
                    </div>
                    <StatusBadge status={appt.status} domain="appointment" />
                  </button>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
