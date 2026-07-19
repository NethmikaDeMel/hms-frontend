import { apiFetch } from "@/lib/api-client";
import type {
  AppointmentResponse, AppointmentRequest, AppointmentStatusUpdateRequest,
} from "@/lib/types/api";

export const appointmentsApi = {
  list: () => apiFetch<AppointmentResponse[]>("/appointments"),
  get: (id: number) => apiFetch<AppointmentResponse>(`/appointments/${id}`),
  byPatient: (patientId: number) => apiFetch<AppointmentResponse[]>(`/appointments/patient/${patientId}`),
  byDoctor: (doctorId: number) => apiFetch<AppointmentResponse[]>(`/appointments/doctor/${doctorId}`),
  create: (body: AppointmentRequest) => apiFetch<AppointmentResponse>("/appointments", { method: "POST", body }),
  updateStatus: (id: number, body: AppointmentStatusUpdateRequest) =>
    apiFetch<AppointmentResponse>(`/appointments/${id}/status`, { method: "PATCH", body }),
  reschedule: (id: number, body: AppointmentRequest) =>
    apiFetch<AppointmentResponse>(`/appointments/${id}/reschedule`, { method: "PUT", body }),
  cancel: (id: number) => apiFetch<void>(`/appointments/${id}`, { method: "DELETE" }),
};
