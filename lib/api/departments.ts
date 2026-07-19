import { apiFetch } from "@/lib/api-client";
import type { Department, DepartmentRequest } from "@/lib/types/api";

export const departmentsApi = {
  list: () => apiFetch<Department[]>("/departments"),
  get: (id: number) => apiFetch<Department>(`/departments/${id}`),
  create: (body: DepartmentRequest) => apiFetch<Department>("/departments", { method: "POST", body }),
  update: (id: number, body: DepartmentRequest) => apiFetch<Department>(`/departments/${id}`, { method: "PUT", body }),
  remove: (id: number) => apiFetch<void>(`/departments/${id}`, { method: "DELETE" }),
};
