import { apiFetch } from "@/lib/api-client";
import type { MedicalRecordResponse, MedicalRecordRequest } from "@/lib/types/api";

export const medicalRecordsApi = {
  list: () => apiFetch<MedicalRecordResponse[]>("/medical-records"),
  get: (id: number) => apiFetch<MedicalRecordResponse>(`/medical-records/${id}`),
  byPatient: (patientId: number) => apiFetch<MedicalRecordResponse[]>(`/medical-records/patient/${patientId}`),
  create: (body: MedicalRecordRequest) => apiFetch<MedicalRecordResponse>("/medical-records", { method: "POST", body }),
  remove: (id: number) => apiFetch<void>(`/medical-records/${id}`, { method: "DELETE" }),
};
