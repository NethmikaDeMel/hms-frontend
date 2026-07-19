"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2Icon, LoaderCircleIcon, PlusIcon, Trash2Icon } from "lucide-react";
import {
  useCreateInvoice, useInvoice, useInvoiceCharges, useAddCharge, useVoidCharge,
  useCompileInvoice, useRecordPayment,
} from "@/lib/hooks/use-billing";
import { applyApiErrorToForm, notifyError } from "@/lib/error-utils";
import { currencyFormatter } from "@/lib/constants";
import { PatientCombobox } from "@/components/appointments/patient-combobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

const draftSchema = z.object({
  patientId: z.number().min(1, "Select a patient"),
  description: z.string().min(1, "Description is required").max(1000),
  dueDate: z.string().min(1, "Due date is required"),
});
type DraftValues = z.infer<typeof draftSchema>;

const chargeSchema = z.object({
  chargeType: z.enum(["CONSULTATION", "LABORATORY", "PHARMACY", "ADMISSION", "OTHER"]),
  description: z.string().min(1, "Description is required").max(500),
  amount: z.string().min(1, "Amount is required").refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
    message: "Must be a positive number",
  }),
});
type ChargeValues = z.infer<typeof chargeSchema>;

const paymentSchema = z.object({
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
type PaymentValues = z.infer<typeof paymentSchema>;

type Step = "draft" | "charges" | "compiled";

export function NewInvoiceDialog({
  open,
  onOpenChange,
  defaultPatientId,
  onDone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultPatientId?: number;
  onDone?: () => void;
}) {
  const [step, setStep] = useState<Step>("draft");
  const [invoiceId, setInvoiceId] = useState<number | undefined>();
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const createInvoice = useCreateInvoice();
  const invoice = useInvoice(invoiceId);
  const charges = useInvoiceCharges(invoiceId);
  const addCharge = useAddCharge();
  const voidCharge = useVoidCharge();
  const compileInvoice = useCompileInvoice();
  const recordPayment = useRecordPayment();

  const draftForm = useForm<DraftValues>({
    resolver: zodResolver(draftSchema),
    defaultValues: { patientId: defaultPatientId ?? 0, description: "", dueDate: "" },
  });
  const chargeForm = useForm<ChargeValues>({
    resolver: zodResolver(chargeSchema),
    defaultValues: { chargeType: "CONSULTATION", description: "", amount: "" },
  });
  const paymentForm = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { method: "CASH", amount: "", referenceNumber: "", insuranceProvider: "" },
  });

  const resetAll = () => {
    setStep("draft");
    setInvoiceId(undefined);
    setShowPaymentForm(false);
    draftForm.reset({ patientId: defaultPatientId ?? 0, description: "", dueDate: "" });
    chargeForm.reset({ chargeType: "CONSULTATION", description: "", amount: "" });
    paymentForm.reset({ method: "CASH", amount: "", referenceNumber: "", insuranceProvider: "" });
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) resetAll();
    onOpenChange(nextOpen);
  };

  const onCreateDraft = async (values: DraftValues) => {
    try {
      const created = await createInvoice.mutateAsync({
        patientId: values.patientId,
        description: values.description,
        dueDate: values.dueDate,
      });
      setInvoiceId(created.id);
      setStep("charges");
      toast.success(`Draft invoice ${created.invoiceNumber} opened`);
    } catch (error) {
      applyApiErrorToForm(error, draftForm.setError);
    }
  };

  const onAddCharge = async (values: ChargeValues) => {
    if (!invoiceId) return;
    try {
      await addCharge.mutateAsync({
        invoiceId,
        body: { chargeType: values.chargeType, description: values.description, amount: Number(values.amount) },
      });
      chargeForm.reset({ chargeType: values.chargeType, description: "", amount: "" });
    } catch (error) {
      applyApiErrorToForm(error, chargeForm.setError);
    }
  };

  const handleCompile = async () => {
    if (!invoiceId) return;
    try {
      await compileInvoice.mutateAsync(invoiceId);
      setStep("compiled");
      toast.success("Final invoice compiled");
    } catch (error) {
      notifyError(error);
    }
  };

  const onRecordPayment = async (values: PaymentValues) => {
    if (!invoiceId) return;
    try {
      await recordPayment.mutateAsync({
        invoiceId,
        body: {
          method: values.method,
          amount: Number(values.amount),
          referenceNumber: values.referenceNumber || undefined,
          insuranceProvider: values.method === "INSURANCE" ? values.insuranceProvider : undefined,
        },
      });
      toast.success("Payment recorded");
      handleClose(false);
      onDone?.();
    } catch (error) {
      applyApiErrorToForm(error, paymentForm.setError);
    }
  };

  const runningTotal = (charges.data ?? []).reduce((sum, c) => sum + c.amount, 0);
  const paymentMethod = paymentForm.watch("method");

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>New Invoice</DialogTitle>
          <DialogDescription>
            Step {step === "draft" ? "1" : step === "charges" ? "2" : "3"} of 3 —{" "}
            {step === "draft" && "Open a draft invoice for a patient"}
            {step === "charges" && "Add itemized charges, then compile"}
            {step === "compiled" && "Invoice compiled — optionally record a payment"}
          </DialogDescription>
        </DialogHeader>

        {step === "draft" && (
          <Form {...draftForm}>
            <form onSubmit={draftForm.handleSubmit(onCreateDraft)} className="space-y-4">
              <FormField control={draftForm.control} name="patientId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient</FormLabel>
                  <FormControl><PatientCombobox value={field.value || undefined} onChange={(id) => field.onChange(id)} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={draftForm.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Input placeholder="e.g. Cardiology consultation and tests" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={draftForm.control} name="dueDate" render={({ field }) => (
                <FormItem><FormLabel>Due date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button type="submit" disabled={createInvoice.isPending}>
                  {createInvoice.isPending && <LoaderCircleIcon className="size-4 animate-spin" />}
                  Open Draft Invoice
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}

        {step === "charges" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200/80 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Invoice</span>
                <span className="font-medium text-slate-900">{invoice.data?.invoiceNumber}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Running total</span>
                <span className="font-semibold tabular-nums text-slate-900">{currencyFormatter.format(runningTotal)}</span>
              </div>
            </div>

            {(charges.data?.length ?? 0) > 0 && (
              <ul className="space-y-1.5">
                {charges.data!.map((charge) => (
                  <li key={charge.id} className="flex items-center justify-between gap-2 rounded-md border border-slate-200/80 px-3 py-2 text-sm">
                    <div className="min-w-0">
                      <span className="font-medium text-slate-900">{charge.chargeType}</span>
                      <span className="ml-2 truncate text-muted-foreground">{charge.description}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="tabular-nums">{currencyFormatter.format(charge.amount)}</span>
                      <Button
                        variant="ghost" size="icon"
                        onClick={() => voidCharge.mutate({ chargeId: charge.id, invoiceId: invoiceId! }, { onError: (e) => notifyError(e) })}
                      >
                        <Trash2Icon className="size-3.5 text-critical-fg" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <Separator />

            <Form {...chargeForm}>
              <form onSubmit={chargeForm.handleSubmit(onAddCharge)} className="space-y-3">
                <p className="text-sm font-medium">Add a charge</p>
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={chargeForm.control} name="chargeType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="CONSULTATION">Consultation</SelectItem>
                          <SelectItem value="LABORATORY">Laboratory</SelectItem>
                          <SelectItem value="PHARMACY">Pharmacy</SelectItem>
                          <SelectItem value="ADMISSION">Admission</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={chargeForm.control} name="amount" render={({ field }) => (
                    <FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={chargeForm.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" variant="outline" size="sm" disabled={addCharge.isPending}>
                  {addCharge.isPending && <LoaderCircleIcon className="size-3.5 animate-spin" />}
                  <PlusIcon className="size-3.5" /> Add Charge
                </Button>
              </form>
            </Form>

            <DialogFooter>
              <Button onClick={handleCompile} disabled={compileInvoice.isPending || (charges.data?.length ?? 0) === 0}>
                {compileInvoice.isPending && <LoaderCircleIcon className="size-4 animate-spin" />}
                Compile Final Invoice
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "compiled" && invoice.data && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg border border-success-border bg-success-bg/40 p-3 text-sm text-success-fg">
              <CheckCircle2Icon className="size-4" />
              Invoice {invoice.data.invoiceNumber} compiled — total {currencyFormatter.format(invoice.data.totalAmount)}
            </div>

            {!showPaymentForm ? (
              <DialogFooter className="sm:justify-between">
                <Button variant="outline" onClick={() => { handleClose(false); onDone?.(); }}>Done, pay later</Button>
                <Button onClick={() => setShowPaymentForm(true)}>Record Payment Now</Button>
              </DialogFooter>
            ) : (
              <Form {...paymentForm}>
                <form onSubmit={paymentForm.handleSubmit(onRecordPayment)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={paymentForm.control} name="method" render={({ field }) => (
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
                    <FormField control={paymentForm.control} name="amount" render={({ field }) => (
                      <FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  {paymentMethod === "INSURANCE" && (
                    <FormField control={paymentForm.control} name="insuranceProvider" render={({ field }) => (
                      <FormItem><FormLabel>Insurance provider</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  )}
                  <FormField control={paymentForm.control} name="referenceNumber" render={({ field }) => (
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
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
