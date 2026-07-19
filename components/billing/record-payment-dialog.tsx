"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { LoaderCircleIcon } from "lucide-react";
import { useRecordPayment } from "@/lib/hooks/use-billing";
import { applyApiErrorToForm } from "@/lib/error-utils";
import { currencyFormatter } from "@/lib/constants";
import type { BillingInvoiceResponse } from "@/lib/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const schema = z.object({
  method: z.enum(["CASH", "CARD", "INSURANCE"]),
  amount: z.string().min(1, "Amount is required").refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
    message: "Must be a positive number",
  }),
  referenceNumber: z.string().max(100).optional(),
  insuranceProvider: z.string().max(150).optional(),
}).refine((v) => v.method !== "INSURANCE" || !!v.insuranceProvider, {
  message: "Insurance provider is required for insurance payments",
  path: ["insuranceProvider"],
});
type FormValues = z.infer<typeof schema>;

export function RecordPaymentDialog({
  invoice,
  open,
  onOpenChange,
}: {
  invoice: BillingInvoiceResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const recordPayment = useRecordPayment();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { method: "CASH", amount: "", referenceNumber: "", insuranceProvider: "" },
  });

  if (!invoice) return null;
  const method = form.watch("method");

  const onSubmit = async (values: FormValues) => {
    try {
      await recordPayment.mutateAsync({
        invoiceId: invoice.id,
        body: {
          method: values.method,
          amount: Number(values.amount),
          referenceNumber: values.referenceNumber || undefined,
          insuranceProvider: values.method === "INSURANCE" ? values.insuranceProvider : undefined,
        },
      });
      toast.success("Payment recorded");
      onOpenChange(false);
      form.reset({ method: "CASH", amount: "", referenceNumber: "", insuranceProvider: "" });
    } catch (error) {
      applyApiErrorToForm(error, form.setError);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment — {invoice.invoiceNumber}</DialogTitle>
          <DialogDescription>Outstanding balance: {currencyFormatter.format(invoice.balanceDue)}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="method" render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment method</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="CARD">Card</SelectItem>
                      <SelectItem value="INSURANCE">Insurance</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            {method === "INSURANCE" && (
              <FormField control={form.control} name="insuranceProvider" render={({ field }) => (
                <FormItem><FormLabel>Insurance provider</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            )}
            <FormField control={form.control} name="referenceNumber" render={({ field }) => (
              <FormItem><FormLabel>Reference number (optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <DialogFooter>
              <Button type="submit" disabled={recordPayment.isPending}>
                {recordPayment.isPending && <LoaderCircleIcon className="size-4 animate-spin" />}
                Confirm Payment
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
