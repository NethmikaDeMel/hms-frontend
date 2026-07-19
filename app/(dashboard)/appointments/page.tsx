"use client";

import { useState } from "react";
import { format } from "date-fns";
import { PlusIcon } from "lucide-react";
import { useAppointmentsByDoctor } from "@/lib/hooks/use-appointments";
import { useDoctors } from "@/lib/hooks/use-doctors";
import type { AppointmentResponse } from "@/lib/types/api";
import { PageHeader } from "@/components/shared/page-header";
import { DoctorCombobox } from "@/components/appointments/doctor-combobox";
import { DayGrid } from "@/components/appointments/day-grid";
import { BookAppointmentDialog } from "@/components/appointments/book-appointment-dialog";
import { AppointmentDetailDialog } from "@/components/appointments/appointment-detail-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { CalendarClockIcon } from "lucide-react";

export default function AppointmentsPage() {
  const { data: doctors } = useDoctors();
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | undefined>();
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [bookingOpen, setBookingOpen] = useState(false);
  const [prefillTime, setPrefillTime] = useState<string | undefined>();
  const [activeAppointment, setActiveAppointment] = useState<AppointmentResponse | null>(null);

  const { data: appointments, isLoading } = useAppointmentsByDoctor(selectedDoctorId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description="Coordinate doctor schedules and manage bookings."
        actions={
          <Button onClick={() => { setPrefillTime(undefined); setBookingOpen(true); }} disabled={!selectedDoctorId}>
            <PlusIcon className="size-4" /> New Appointment
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 @4xl:grid-cols-[280px_1fr]">
        <Card className="h-fit">
          <CardContent className="space-y-4 py-5">
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Doctor</label>
              <div className="mt-1.5">
                <DoctorCombobox value={selectedDoctorId} onChange={(id) => setSelectedDoctorId(id)} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1.5" />
            </div>
            {(doctors?.length ?? 0) === 0 && (
              <p className="text-xs text-muted-foreground">No doctors found. Add doctors under Doctors first.</p>
            )}
          </CardContent>
        </Card>

        <div>
          {!selectedDoctorId && (
            <EmptyState
              icon={CalendarClockIcon}
              title="Select a doctor to view their schedule"
              description="Pick a doctor from the left panel to see and manage their appointment slots."
            />
          )}

          {selectedDoctorId && isLoading && (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          )}

          {selectedDoctorId && !isLoading && (
            <DayGrid
              date={date}
              appointments={appointments ?? []}
              onSlotClick={(time) => { setPrefillTime(time); setBookingOpen(true); }}
              onAppointmentClick={(appt) => setActiveAppointment(appt)}
            />
          )}
        </div>
      </div>

      <BookAppointmentDialog
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        initialDoctorId={selectedDoctorId}
        initialDate={date}
        initialTime={prefillTime}
      />

      <AppointmentDetailDialog
        appointment={activeAppointment}
        open={!!activeAppointment}
        onOpenChange={(open) => !open && setActiveAppointment(null)}
      />
    </div>
  );
}
