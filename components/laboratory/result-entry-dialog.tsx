"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { LoaderCircleIcon } from "lucide-react";
import { useUpdateLabTestResult } from "@/lib/hooks/use-laboratory";
import { applyApiErrorToForm } from "@/lib/error-utils";
import type { LaboratoryTestResponse } from "@/lib/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const schema = z.object({
  result: z.string().min(1, "Result is required").max(2000),
  referenceRange: z.string().max(255).optional(),
});
type FormValues = z.infer<typeof schema>;

export function ResultEntryDialog({
  test,
  open,
  onOpenChange,
}: {
  test: LaboratoryTestResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateResult = useUpdateLabTestResult();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { result: "", referenceRange: "" },
  });

  if (!test) return null;

  const onSubmit = async (values: FormValues) => {
    try {
      await updateResult.mutateAsync({
        id: test.id,
        body: { status: "COMPLETED", result: values.result, referenceRange: values.referenceRange || undefined },
      });
      toast.success("Result recorded, test marked completed");
      onOpenChange(false);
      form.reset();
    } catch (error) {
      applyApiErrorToForm(error, form.setError);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Enter Result — {test.testName}</DialogTitle>
          <DialogDescription>{test.patientName} · {test.testType}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="result" render={({ field }) => (
              <FormItem><FormLabel>Result</FormLabel><FormControl><Textarea rows={4} {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="referenceRange" render={({ field }) => (
              <FormItem><FormLabel>Reference range (optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <DialogFooter>
              <Button type="submit" disabled={updateResult.isPending}>
                {updateResult.isPending && <LoaderCircleIcon className="size-4 animate-spin" />}
                Save Result &amp; Complete
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
