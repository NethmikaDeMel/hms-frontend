import { apiFetch } from "@/lib/api-client";
import type { Role, RoleRequest } from "@/lib/types/api";

export const rolesApi = {
  list: () => apiFetch<Role[]>("/roles"),
  get: (id: number) => apiFetch<Role>(`/roles/${id}`),
  create: (body: RoleRequest) => apiFetch<Role>("/roles", { method: "POST", body }),
  update: (id: number, body: RoleRequest) => apiFetch<Role>(`/roles/${id}`, { method: "PUT", body }),
  remove: (id: number) => apiFetch<void>(`/roles/${id}`, { method: "DELETE" }),
};
