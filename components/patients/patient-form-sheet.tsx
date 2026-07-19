"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { LoaderCircleIcon } from "lucide-react";
import { useCreatePatient, useUpdatePatient } from "@/lib/hooks/use-patients";
import { applyApiErrorToForm } from "@/lib/error-utils";
import type { PatientResponse } from "@/lib/types/api";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";

const phoneRegex = /^\+?[0-9]{7,15}$/;
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

const patientSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  dateOfBirth: z.string().min(1, "Date of birth is required").refine((v) => new Date(v) < new Date(), {
    message: "Date of birth must be in the past",
  }),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], { error: "Gender is required" }),
  phone: z.string().regex(phoneRegex, "Enter 7-15 digits, optionally starting with '+'"),
  email: z.string().email("Enter a valid email").or(z.literal("")).optional(),
  address: z.string().max(255).optional(),
  bloodGroup: z.enum(bloodGroups).optional().or(z.literal("")),
  emergencyContactName: z.string().max(150).optional(),
  emergencyContactPhone: z.string().regex(phoneRegex, "Enter 7-15 digits").or(z.literal("")).optional(),
  allergies: z.string().max(500).optional(),
});
type PatientFormValues = z.infer<typeof patientSchema>;

function toFormValues(patient?: PatientResponse): PatientFormValues {
  if (!patient) {
    return {
      firstName: "", lastName: "", dateOfBirth: "", gender: "MALE", phone: "",
      email: "", address: "", bloodGroup: "", emergencyContactName: "",
      emergencyContactPhone: "", allergies: "",
    };
  }
  return {
    firstName: patient.firstName,
    lastName: patient.lastName,
    dateOfBirth: patient.dateOfBirth,
    gender: patient.gender,
    phone: patient.phone,
    email: patient.email ?? "",
    address: patient.address ?? "",
    bloodGroup: (patient.bloodGroup as PatientFormValues["bloodGroup"]) ?? "",
    emergencyContactName: patient.emergencyContactName ?? "",
    emergencyContactPhone: patient.emergencyContactPhone ?? "",
    allergies: patient.allergies ?? "",
  };
}

export function PatientFormSheet({
  open,
  onOpenChange,
  patient,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: PatientResponse;
  onSaved?: (id: number) => void;
}) {
  const isEdit = !!patient;
  const createMutation = useCreatePatient();
  const updateMutation = useUpdatePatient(patient?.id ?? 0);
  const mutation = isEdit ? updateMutation : createMutation;

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: toFormValues(patient),
  });

  useEffect(() => {
    if (open) form.reset(toFormValues(patient));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, patient]);

  const onSubmit = async (values: PatientFormValues) => {
    const payload = {
      ...values,
      email: values.email || undefined,
      bloodGroup: values.bloodGroup || undefined,
      emergencyContactPhone: values.emergencyContactPhone || undefined,
    };
    try {
      const result = await mutation.mutateAsync(payload as never);
      toast.success(isEdit ? "Patient updated" : "Patient registered", {
        description: `${values.firstName} ${values.lastName}`,
      });
      onOpenChange(false);
      onSaved?.(isEdit ? patient!.id : (result as PatientResponse).id);
    } catch (error) {
      applyApiErrorToForm(error, form.setError);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Patient" : "Register New Patient"}</SheetTitle>
          <SheetDescription>
            {isEdit ? "Update this patient's profile information." : "Add a new patient to the directory."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="firstName" render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="lastName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of birth</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="gender" render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl><Input placeholder="+94770000000" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (optional)</FormLabel>
                  <FormControl><Input type="email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem>
                <FormLabel>Address (optional)</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="bloodGroup" render={({ field }) => (
              <FormItem>
                <FormLabel>Blood group (optional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {bloodGroups.map((bg) => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="emergencyContactName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Emergency contact name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="emergencyContactPhone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Emergency contact phone</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="allergies" render={({ field }) => (
              <FormItem>
                <FormLabel>Known allergies / health notes (optional)</FormLabel>
                <FormControl><Textarea rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <SheetFooter className="mt-auto px-0 pb-0">
              <Button type="submit" disabled={mutation.isPending} className="w-full">
                {mutation.isPending && <LoaderCircleIcon className="size-4 animate-spin" />}
                {isEdit ? "Save changes" : "Register patient"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
