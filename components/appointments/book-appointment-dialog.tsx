"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { LoaderCircleIcon } from "lucide-react";
import { useCreateAppointment, useRescheduleAppointment } from "@/lib/hooks/use-appointments";
import { applyApiErrorToForm } from "@/lib/error-utils";
import { PatientCombobox } from "@/components/appointments/patient-combobox";
import { DoctorCombobox } from "@/components/appointments/doctor-combobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const schema = z.object({
  patientId: z.number({ error: "Select a patient" }).min(1, "Select a patient"),
  doctorId: z.number({ error: "Select a doctor" }).min(1, "Select a doctor"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  reason: z.string().min(1, "Reason is required").max(500),
  notes: z.string().max(1000).optional(),
});
type FormValues = z.infer<typeof schema>;

export function BookAppointmentDialog({
  open,
  onOpenChange,
  mode = "create",
  appointmentId,
  initialDoctorId,
  initialDate,
  initialTime,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "reschedule";
  appointmentId?: number;
  initialDoctorId?: number;
  initialDate?: string;
  initialTime?: string;
  onSaved?: () => void;
}) {
  const createMutation = useCreateAppointment();
  const rescheduleMutation = useRescheduleAppointment();
  const isReschedule = mode === "reschedule";

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      patientId: 0,
      doctorId: initialDoctorId ?? 0,
      date: initialDate ?? "",
      time: initialTime ?? "",
      reason: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        patientId: form.getValues("patientId") || 0,
        doctorId: initialDoctorId ?? 0,
        date: initialDate ?? "",
        time: initialTime ?? "",
        reason: "",
        notes: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialDoctorId, initialDate, initialTime]);

  const onSubmit = async (values: FormValues) => {
    const appointmentDate = `${values.date}T${values.time}:00`;
    const payload = {
      patientId: values.patientId,
      doctorId: values.doctorId,
      appointmentDate,
      reason: values.reason,
      notes: values.notes || undefined,
    };
    try {
      if (isReschedule && appointmentId) {
        await rescheduleMutation.mutateAsync({ id: appointmentId, body: payload });
        toast.success("Appointment rescheduled");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Appointment booked");
      }
      onOpenChange(false);
      onSaved?.();
    } catch (error) {
      applyApiErrorToForm(error, form.setError);
    }
  };

  const pending = createMutation.isPending || rescheduleMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isReschedule ? "Reschedule Appointment" : "Schedule Appointment"}</DialogTitle>
          <DialogDescription>
            {isReschedule ? "Pick a new date, time, or doctor for this appointment." : "Book a new appointment slot."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!isReschedule && (
              <FormField control={form.control} name="patientId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient</FormLabel>
                  <FormControl>
                    <PatientCombobox value={field.value || undefined} onChange={(id) => field.onChange(id)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            )}

            <FormField control={form.control} name="doctorId" render={({ field }) => (
              <FormItem>
                <FormLabel>Doctor</FormLabel>
                <FormControl>
                  <DoctorCombobox value={field.value || undefined} onChange={(id) => field.onChange(id)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="time" render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <FormControl><Input type="time" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="reason" render={({ field }) => (
              <FormItem>
                <FormLabel>Reason for visit</FormLabel>
                <FormControl><Textarea rows={2} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (optional)</FormLabel>
                <FormControl><Textarea rows={2} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={pending}>
                {pending && <LoaderCircleIcon className="size-4 animate-spin" />}
                {isReschedule ? "Confirm Reschedule" : "Confirm Booking"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
