import { apiFetch } from "@/lib/api-client";
import type { PharmacyInventoryResponse, PharmacyInventoryRequest } from "@/lib/types/api";

export const pharmacyApi = {
  list: () => apiFetch<PharmacyInventoryResponse[]>("/pharmacy-inventory"),
  get: (id: number) => apiFetch<PharmacyInventoryResponse>(`/pharmacy-inventory/${id}`),
  lowStock: () => apiFetch<PharmacyInventoryResponse[]>("/pharmacy-inventory/low-stock"),
  expiring: (days = 30) => apiFetch<PharmacyInventoryResponse[]>("/pharmacy-inventory/expiring", { query: { days } }),
  create: (body: PharmacyInventoryRequest) => apiFetch<PharmacyInventoryResponse>("/pharmacy-inventory", { method: "POST", body }),
  update: (id: number, body: PharmacyInventoryRequest) =>
    apiFetch<PharmacyInventoryResponse>(`/pharmacy-inventory/${id}`, { method: "PUT", body }),
  dispense: (id: number, quantity: number) =>
    apiFetch<PharmacyInventoryResponse>(`/pharmacy-inventory/${id}/dispense`, { method: "PATCH", query: { quantity } }),
  remove: (id: number) => apiFetch<void>(`/pharmacy-inventory/${id}`, { method: "DELETE" }),
};
