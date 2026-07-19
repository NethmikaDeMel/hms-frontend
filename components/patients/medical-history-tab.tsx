"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { LoaderCircleIcon, PlusIcon, StethoscopeIcon } from "lucide-react";
import { medicalRecordsApi } from "@/lib/api/medical-records";
import { useDoctorUsers } from "@/lib/hooks/use-reference-data";
import { applyApiErrorToForm } from "@/lib/error-utils";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";

const recordSchema = z.object({
  doctorId: z.string().min(1, "Doctor is required"),
  diagnosis: z.string().min(1, "Diagnosis is required").max(1000),
  treatment: z.string().max(1000).optional(),
  prescription: z.string().max(1000).optional(),
  notes: z.string().max(2000).optional(),
});
type RecordFormValues = z.infer<typeof recordSchema>;

export function PatientMedicalHistoryTab({ patientId }: { patientId: number }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["medical-records", "patient", patientId],
    queryFn: () => medicalRecordsApi.byPatient(patientId),
  });
  const doctorUsers = useDoctorUsers();

  const form = useForm<RecordFormValues>({
    resolver: zodResolver(recordSchema),
    defaultValues: { doctorId: "", diagnosis: "", treatment: "", prescription: "", notes: "" },
  });

  const createMutation = useMutation({
    mutationFn: (values: RecordFormValues) =>
      medicalRecordsApi.create({
        patientId,
        doctorId: Number(values.doctorId),
        diagnosis: values.diagnosis,
        treatment: values.treatment || undefined,
        prescription: values.prescription || undefined,
        notes: values.notes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-records", "patient", patientId] });
      toast.success("Medical record logged");
      setDialogOpen(false);
      form.reset();
    },
    onError: (error) => applyApiErrorToForm(error, form.setError),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <PlusIcon className="size-4" /> New Record
        </Button>
      </div>

      {isLoading && <TableSkeleton rows={3} cols={1} />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && (data?.length ?? 0) === 0 && (
        <EmptyState icon={StethoscopeIcon} title="No medical records yet" description="Diagnoses, treatments, and prescriptions will appear here." />
      )}

      {!isLoading && (data?.length ?? 0) > 0 && (
        <ol className="space-y-4 border-l-2 border-slate-200 pl-6">
          {data!.map((record) => (
            <li key={record.id} className="relative">
              <span className="absolute -left-[29px] top-1.5 size-3 rounded-full border-2 border-white bg-primary" />
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">{record.diagnosis}</p>
                    <p className="shrink-0 text-xs text-muted-foreground">
                      {format(parseISO(record.recordDate), "MMM d, yyyy h:mm a")}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Dr. {record.doctorName}</p>
                  {record.treatment && (
                    <p className="mt-2 text-sm text-slate-700"><span className="font-medium">Treatment:</span> {record.treatment}</p>
                  )}
                  {record.prescription && (
                    <p className="mt-1 text-sm text-slate-700"><span className="font-medium">Prescription:</span> {record.prescription}</p>
                  )}
                  {record.notes && (
                    <p className="mt-1 text-sm text-muted-foreground">{record.notes}</p>
                  )}
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Log Diagnosis / Prescription</DialogTitle>
            <DialogDescription>Add a new medical record for this patient.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => createMutation.mutate(v))} className="space-y-4">
              <FormField control={form.control} name="doctorId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Doctor</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {doctorUsers.data?.map((doc) => (
                        <SelectItem key={doc.id} value={String(doc.id)}>{doc.fullName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="diagnosis" render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnosis</FormLabel>
                  <FormControl><Textarea rows={2} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="treatment" render={({ field }) => (
                <FormItem>
                  <FormLabel>Treatment (optional)</FormLabel>
                  <FormControl><Textarea rows={2} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="prescription" render={({ field }) => (
                <FormItem>
                  <FormLabel>Prescription (optional)</FormLabel>
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
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <LoaderCircleIcon className="size-4 animate-spin" />}
                  Save Record
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
