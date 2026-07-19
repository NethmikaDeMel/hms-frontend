"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { LoaderCircleIcon, PlusIcon, Trash2Icon } from "lucide-react";
import {
  useDoctorSchedules, useCreateDoctorSchedule, useUpdateScheduleAvailability, useRemoveDoctorSchedule,
} from "@/lib/hooks/use-doctors";
import { applyApiErrorToForm, notifyError } from "@/lib/error-utils";
import type { DayOfWeek, DoctorResponse } from "@/lib/types/api";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { CalendarDaysIcon } from "lucide-react";

const DAYS: DayOfWeek[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

const scheduleSchema = z.object({
  dayOfWeek: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
}).refine((v) => v.endTime > v.startTime, { message: "End time must be after start time", path: ["endTime"] });
type ScheduleValues = z.infer<typeof scheduleSchema>;

export function DoctorScheduleSheet({
  doctor,
  open,
  onOpenChange,
}: {
  doctor: DoctorResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const { data: schedules, isLoading } = useDoctorSchedules(doctor?.id);
  const createSchedule = useCreateDoctorSchedule();
  const toggleAvailability = useUpdateScheduleAvailability();
  const removeSchedule = useRemoveDoctorSchedule();

  const form = useForm<ScheduleValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: { dayOfWeek: "MONDAY", startTime: "09:00", endTime: "13:00" },
  });

  if (!doctor) return null;

  const onSubmit = async (values: ScheduleValues) => {
    try {
      await createSchedule.mutateAsync({ doctorId: doctor.id, ...values });
      toast.success("Schedule block added");
      setAddOpen(false);
      form.reset();
    } catch (error) {
      applyApiErrorToForm(error, form.setError);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Dr. {doctor.fullName} — Schedule</SheetTitle>
          <SheetDescription>Weekly availability blocks for {doctor.departmentName}.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          <div className="flex justify-end">
            {!addOpen && (
              <Button size="sm" onClick={() => setAddOpen(true)}>
                <PlusIcon className="size-4" /> Add Block
              </Button>
            )}
          </div>

          {addOpen && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 rounded-lg border border-slate-200/80 p-4">
                <FormField control={form.control} name="dayOfWeek" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {DAYS.map((d) => <SelectItem key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="startTime" render={({ field }) => (
                    <FormItem><FormLabel>Start</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="endTime" render={({ field }) => (
                    <FormItem><FormLabel>End</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={createSchedule.isPending}>
                    {createSchedule.isPending && <LoaderCircleIcon className="size-3.5 animate-spin" />}
                    Save Block
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setAddOpen(false)}>Cancel</Button>
                </div>
              </form>
            </Form>
          )}

          {isLoading && <TableSkeleton rows={3} cols={1} />}
          {!isLoading && (schedules?.length ?? 0) === 0 && (
            <EmptyState icon={CalendarDaysIcon} title="No schedule blocks yet" description="Add a weekly availability block above." />
          )}

          {!isLoading && (schedules?.length ?? 0) > 0 && (
            <ul className="space-y-2">
              {schedules!.map((block) => (
                <li key={block.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200/80 p-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{block.dayOfWeek.charAt(0) + block.dayOfWeek.slice(1).toLowerCase()}</p>
                    <p className="text-xs text-muted-foreground">{block.startTime} – {block.endTime}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={block.available}
                      onCheckedChange={(checked) =>
                        toggleAvailability.mutate(
                          { scheduleId: block.id, available: checked, doctorId: doctor.id },
                          { onError: (e) => notifyError(e) }
                        )
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        removeSchedule.mutate(
                          { scheduleId: block.id, doctorId: doctor.id },
                          { onSuccess: () => toast.success("Block removed"), onError: (e) => notifyError(e) }
                        )
                      }
                    >
                      <Trash2Icon className="size-4 text-critical-fg" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
