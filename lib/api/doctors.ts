import { apiFetch } from "@/lib/api-client";
import type {
  DoctorResponse, DoctorRequest, DoctorScheduleResponse, DoctorScheduleRequest,
} from "@/lib/types/api";

export const doctorsApi = {
  list: () => apiFetch<DoctorResponse[]>("/doctors"),
  get: (id: number) => apiFetch<DoctorResponse>(`/doctors/${id}`),
  available: () => apiFetch<DoctorResponse[]>("/doctors/available"),
  byDepartment: (departmentId: number) => apiFetch<DoctorResponse[]>(`/doctors/department/${departmentId}`),
  create: (body: DoctorRequest) => apiFetch<DoctorResponse>("/doctors", { method: "POST", body }),
  update: (id: number, body: DoctorRequest) => apiFetch<DoctorResponse>(`/doctors/${id}`, { method: "PUT", body }),
  assignDepartment: (id: number, departmentId: number) =>
    apiFetch<DoctorResponse>(`/doctors/${id}/department`, { method: "PATCH", body: { departmentId } }),
  remove: (id: number) => apiFetch<void>(`/doctors/${id}`, { method: "DELETE" }),

  schedules: (doctorId: number) => apiFetch<DoctorScheduleResponse[]>(`/doctors/${doctorId}/schedules`),
  createSchedule: (body: DoctorScheduleRequest) =>
    apiFetch<DoctorScheduleResponse>("/doctors/schedules", { method: "POST", body }),
  updateScheduleAvailability: (scheduleId: number, available: boolean) =>
    apiFetch<DoctorScheduleResponse>(`/doctors/schedules/${scheduleId}/availability`, {
      method: "PATCH",
      body: { available },
    }),
  removeSchedule: (scheduleId: number) =>
    apiFetch<void>(`/doctors/schedules/${scheduleId}`, { method: "DELETE" }),
};
