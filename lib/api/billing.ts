import { apiFetch } from "@/lib/api-client";
import type {
  BillingInvoiceResponse, BillingInvoiceRequest, BillingChargeResponse, BillingChargeRequest,
  PaymentResponse, RecordPaymentRequest, InvoiceStatus,
} from "@/lib/types/api";

export const billingApi = {
  list: () => apiFetch<BillingInvoiceResponse[]>("/billing-invoices"),
  get: (id: number) => apiFetch<BillingInvoiceResponse>(`/billing-invoices/${id}`),
  byPatient: (patientId: number) => apiFetch<BillingInvoiceResponse[]>(`/billing-invoices/patient/${patientId}`),
  byStatus: (status: InvoiceStatus) => apiFetch<BillingInvoiceResponse[]>(`/billing-invoices/status/${status}`),
  create: (body: BillingInvoiceRequest) => apiFetch<BillingInvoiceResponse>("/billing-invoices", { method: "POST", body }),
  cancel: (id: number) => apiFetch<void>(`/billing-invoices/${id}/cancel`, { method: "PATCH" }),
  compile: (id: number) => apiFetch<BillingInvoiceResponse>(`/billing-invoices/${id}/compile`, { method: "POST" }),
  refreshOverdue: () => apiFetch<void>("/billing-invoices/refresh-overdue", { method: "POST" }),

  charges: (invoiceId: number) => apiFetch<BillingChargeResponse[]>(`/billing-invoices/${invoiceId}/charges`),
  addCharge: (invoiceId: number, body: BillingChargeRequest) =>
    apiFetch<BillingChargeResponse>(`/billing-invoices/${invoiceId}/charges`, { method: "POST", body }),
  voidCharge: (chargeId: number) => apiFetch<void>(`/billing-invoices/charges/${chargeId}`, { method: "DELETE" }),

  payments: (invoiceId: number) => apiFetch<PaymentResponse[]>(`/billing-invoices/${invoiceId}/payments`),
  recordPayment: (invoiceId: number, body: RecordPaymentRequest) =>
    apiFetch<PaymentResponse>(`/billing-invoices/${invoiceId}/record-payment`, { method: "POST", body }),
};
