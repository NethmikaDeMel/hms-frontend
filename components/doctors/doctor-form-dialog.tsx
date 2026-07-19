"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { LoaderCircleIcon } from "lucide-react";
import { useCreateDoctor, useUpdateDoctor } from "@/lib/hooks/use-doctors";
import { useDepartments } from "@/lib/hooks/use-reference-data";
import { applyApiErrorToForm } from "@/lib/error-utils";
import { UserPicker } from "@/components/shared/user-picker";
import type { DoctorResponse, UserResponse } from "@/lib/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const profileSchema = z.object({
  departmentId: z.string().min(1, "Department is required"),
  licenseNumber: z.string().min(1, "License number is required").max(50),
  consultationFee: z.string().min(1, "Consultation fee is required").refine(
    (v) => !isNaN(Number(v)) && Number(v) > 0,
    { message: "Must be a number greater than zero" }
  ),
  yearsOfExperience: z.string().optional().refine(
    (v) => !v || (!isNaN(Number(v)) && Number(v) >= 0),
    { message: "Must be a non-negative number" }
  ),
});
type ProfileValues = z.infer<typeof profileSchema>;

export function DoctorFormDialog({
  open,
  onOpenChange,
  doctor,
  existingUserIds,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor?: DoctorResponse;
  existingUserIds: number[];
}) {
  const isEdit = !!doctor;
  const [selectedUser, setSelectedUser] = useState<UserResponse | undefined>();
  const { data: departments } = useDepartments();
  const createMutation = useCreateDoctor();
  const updateMutation = useUpdateDoctor(doctor?.id ?? 0);
  const mutation = isEdit ? updateMutation : createMutation;

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      departmentId: doctor ? String(doctor.departmentId) : "",
      licenseNumber: doctor?.licenseNumber ?? "",
      consultationFee: doctor ? String(doctor.consultationFee) : "",
      yearsOfExperience: doctor?.yearsOfExperience !== undefined && doctor?.yearsOfExperience !== null ? String(doctor.yearsOfExperience) : "",
    },
  });

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: reset local dialog state when it opens
      setSelectedUser(undefined);
      form.reset({
        departmentId: doctor ? String(doctor.departmentId) : "",
        licenseNumber: doctor?.licenseNumber ?? "",
        consultationFee: doctor ? String(doctor.consultationFee) : "",
        yearsOfExperience: doctor?.yearsOfExperience !== undefined && doctor?.yearsOfExperience !== null ? String(doctor.yearsOfExperience) : "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, doctor]);

  const onSubmit = async (values: ProfileValues) => {
    if (!isEdit && !selectedUser) {
      toast.error("Select or create a DOCTOR-role user account first");
      return;
    }
    try {
      await mutation.mutateAsync({
        userId: isEdit ? doctor!.userId : selectedUser!.id,
        departmentId: Number(values.departmentId),
        licenseNumber: values.licenseNumber,
        consultationFee: Number(values.consultationFee),
        yearsOfExperience: values.yearsOfExperience ? Number(values.yearsOfExperience) : undefined,
      });
      toast.success(isEdit ? "Doctor profile updated" : "Doctor added");
      onOpenChange(false);
    } catch (error) {
      applyApiErrorToForm(error, form.setError);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Doctor" : "Add Doctor"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this doctor's clinical profile." : "Link a DOCTOR-role user account to a clinical profile."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!isEdit && (
              <div>
                <p className="mb-1.5 text-sm font-medium">Staff account</p>
                <UserPicker roleFilter="DOCTOR" excludeUserIds={existingUserIds} selectedUser={selectedUser} onSelect={setSelectedUser} />
              </div>
            )}

            <FormField control={form.control} name="departmentId" render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {departments?.map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="licenseNumber" render={({ field }) => (
                <FormItem><FormLabel>License number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="consultationFee" render={({ field }) => (
                <FormItem><FormLabel>Consultation fee</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <FormField control={form.control} name="yearsOfExperience" render={({ field }) => (
              <FormItem><FormLabel>Years of experience (optional)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <LoaderCircleIcon className="size-4 animate-spin" />}
                {isEdit ? "Save changes" : "Add Doctor"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
