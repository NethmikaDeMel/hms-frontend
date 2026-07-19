"use client";

import { useState } from "react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { LoaderCircleIcon } from "lucide-react";
import { useUpdateAppointmentStatus } from "@/lib/hooks/use-appointments";
import { notifyError } from "@/lib/error-utils";
import type { AppointmentResponse, AppointmentStatus } from "@/lib/types/api";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { BookAppointmentDialog } from "@/components/appointments/book-appointment-dialog";

const NEXT_STATUS: Partial<Record<AppointmentStatus, { label: string; status: AppointmentStatus }[]>> = {
  SCHEDULED: [
    { label: "Confirm", status: "CONFIRMED" },
    { label: "Cancel", status: "CANCELLED" },
  ],
  CONFIRMED: [
    { label: "Check In", status: "CHECKED_IN" },
    { label: "No-show", status: "NO_SHOW" },
    { label: "Cancel", status: "CANCELLED" },
  ],
  CHECKED_IN: [{ label: "Complete", status: "COMPLETED" }],
};

export function AppointmentDetailDialog({
  appointment,
  open,
  onOpenChange,
}: {
  appointment: AppointmentResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const updateStatus = useUpdateAppointmentStatus();

  if (!appointment) return null;

  const actions = NEXT_STATUS[appointment.status] ?? [];
  const canReschedule = appointment.status !== "COMPLETED" && appointment.status !== "CANCELLED";

  const handleTransition = async (status: AppointmentStatus) => {
    try {
      await updateStatus.mutateAsync({ id: appointment.id, body: { status } });
      toast.success(`Appointment marked ${status.replace("_", " ").toLowerCase()}`);
    } catch (error) {
      notifyError(error);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {appointment.patientName}
              <StatusBadge status={appointment.status} domain="appointment" />
            </DialogTitle>
            <DialogDescription>
              Dr. {appointment.doctorName} · {format(parseISO(appointment.appointmentDate), "MMM d, yyyy h:mm a")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 text-sm">
            <p><span className="font-medium text-slate-900">Reason:</span> {appointment.reason}</p>
            {appointment.notes && <p><span className="font-medium text-slate-900">Notes:</span> {appointment.notes}</p>}
          </div>

          <DialogFooter className="flex-wrap gap-2 sm:justify-start">
            {actions.map((action) => (
              <Button
                key={action.status}
                variant={action.status === "CANCELLED" || action.status === "NO_SHOW" ? "outline" : "default"}
                size="sm"
                disabled={updateStatus.isPending}
                onClick={() => handleTransition(action.status)}
              >
                {updateStatus.isPending && <LoaderCircleIcon className="size-3.5 animate-spin" />}
                {action.label}
              </Button>
            ))}
            {canReschedule && (
              <Button variant="outline" size="sm" onClick={() => setRescheduleOpen(true)}>
                Reschedule
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BookAppointmentDialog
        open={rescheduleOpen}
        onOpenChange={setRescheduleOpen}
        mode="reschedule"
        appointmentId={appointment.id}
        initialDoctorId={appointment.doctorId}
        onSaved={() => onOpenChange(false)}
      />
    </>
  );
}
