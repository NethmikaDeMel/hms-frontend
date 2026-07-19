"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { LoaderCircleIcon } from "lucide-react";
import { useCreateLabTest } from "@/lib/hooks/use-laboratory";
import { useDoctorUsers } from "@/lib/hooks/use-reference-data";
import { applyApiErrorToForm } from "@/lib/error-utils";
import { PatientCombobox } from "@/components/appointments/patient-combobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const schema = z.object({
  patientId: z.number().min(1, "Select a patient"),
  orderedById: z.string().min(1, "Select the ordering physician"),
  testName: z.string().min(1, "Test name is required").max(150),
  testType: z.string().min(1, "Test type is required").max(100),
});
type FormValues = z.infer<typeof schema>;

export function NewTestRequestDialog({
  open,
  onOpenChange,
  defaultPatientId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultPatientId?: number;
}) {
  const createMutation = useCreateLabTest();
  const doctorUsers = useDoctorUsers();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { patientId: defaultPatientId ?? 0, orderedById: "", testName: "", testType: "" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await createMutation.mutateAsync({
        patientId: values.patientId,
        orderedById: Number(values.orderedById),
        testName: values.testName,
        testType: values.testType,
      });
      toast.success("Test request created");
      onOpenChange(false);
      form.reset({ patientId: 0, orderedById: "", testName: "", testType: "" });
    } catch (error) {
      applyApiErrorToForm(error, form.setError);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Test Request</DialogTitle>
          <DialogDescription>Dispatch a laboratory test order for a patient.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="patientId" render={({ field }) => (
              <FormItem>
                <FormLabel>Patient</FormLabel>
                <FormControl><PatientCombobox value={field.value || undefined} onChange={(id) => field.onChange(id)} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="orderedById" render={({ field }) => (
              <FormItem>
                <FormLabel>Ordering physician</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {doctorUsers.data?.map((doc) => <SelectItem key={doc.id} value={String(doc.id)}>{doc.fullName}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="testName" render={({ field }) => (
              <FormItem><FormLabel>Test name</FormLabel><FormControl><Input placeholder="e.g. Complete Blood Count" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="testType" render={({ field }) => (
              <FormItem><FormLabel>Test type</FormLabel><FormControl><Input placeholder="e.g. Hematology" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <DialogFooter>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <LoaderCircleIcon className="size-4 animate-spin" />}
                Dispatch Request
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
