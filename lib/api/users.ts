import { apiFetch } from "@/lib/api-client";
import type { UserResponse, UserRequest } from "@/lib/types/api";

export const usersApi = {
  list: () => apiFetch<UserResponse[]>("/users"),
  get: (id: number) => apiFetch<UserResponse>(`/users/${id}`),
  doctors: () => apiFetch<UserResponse[]>("/users/doctors"),
  create: (body: UserRequest) => apiFetch<UserResponse>("/users", { method: "POST", body }),
  update: (id: number, body: UserRequest) => apiFetch<UserResponse>(`/users/${id}`, { method: "PUT", body }),
  deactivate: (id: number) => apiFetch<void>(`/users/${id}/deactivate`, { method: "PATCH" }),
  remove: (id: number) => apiFetch<void>(`/users/${id}`, { method: "DELETE" }),
};
