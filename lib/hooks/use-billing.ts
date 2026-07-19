import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { billingApi } from "@/lib/api/billing";
import type { BillingInvoiceRequest, BillingChargeRequest, RecordPaymentRequest, InvoiceStatus } from "@/lib/types/api";

export function useInvoices() {
  return useQuery({ queryKey: ["billing-invoices"], queryFn: billingApi.list });
}

export function useInvoicesByStatus(status: InvoiceStatus | "ALL") {
  return useQuery({
    queryKey: ["billing-invoices", "status", status],
    queryFn: () => (status === "ALL" ? billingApi.list() : billingApi.byStatus(status)),
  });
}

export function useInvoice(id: number | undefined) {
  return useQuery({
    queryKey: ["billing-invoices", id],
    queryFn: () => billingApi.get(id as number),
    enabled: !!id,
  });
}

export function useInvoiceCharges(invoiceId: number | undefined) {
  return useQuery({
    queryKey: ["billing-invoices", invoiceId, "charges"],
    queryFn: () => billingApi.charges(invoiceId as number),
    enabled: !!invoiceId,
  });
}

export function useInvoicePayments(invoiceId: number | undefined) {
  return useQuery({
    queryKey: ["billing-invoices", invoiceId, "payments"],
    queryFn: () => billingApi.payments(invoiceId as number),
    enabled: !!invoiceId,
  });
}

function invalidateInvoice(queryClient: ReturnType<typeof useQueryClient>, invoiceId: number) {
  queryClient.invalidateQueries({ queryKey: ["billing-invoices"] });
  queryClient.invalidateQueries({ queryKey: ["billing-invoices", invoiceId] });
  queryClient.invalidateQueries({ queryKey: ["billing-invoices", invoiceId, "charges"] });
  queryClient.invalidateQueries({ queryKey: ["billing-invoices", invoiceId, "payments"] });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: BillingInvoiceRequest) => billingApi.create(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["billing-invoices"] }),
  });
}

export function useAddCharge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, body }: { invoiceId: number; body: BillingChargeRequest }) =>
      billingApi.addCharge(invoiceId, body),
    onSuccess: (_data, variables) => invalidateInvoice(queryClient, variables.invoiceId),
  });
}

export function useVoidCharge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ chargeId }: { chargeId: number; invoiceId: number }) => billingApi.voidCharge(chargeId),
    onSuccess: (_data, variables) => invalidateInvoice(queryClient, variables.invoiceId),
  });
}

export function useCompileInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invoiceId: number) => billingApi.compile(invoiceId),
    onSuccess: (_data, invoiceId) => invalidateInvoice(queryClient, invoiceId),
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, body }: { invoiceId: number; body: RecordPaymentRequest }) =>
      billingApi.recordPayment(invoiceId, body),
    onSuccess: (_data, variables) => invalidateInvoice(queryClient, variables.invoiceId),
  });
}

export function useCancelInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invoiceId: number) => billingApi.cancel(invoiceId),
    onSuccess: (_data, invoiceId) => invalidateInvoice(queryClient, invoiceId),
  });
}
