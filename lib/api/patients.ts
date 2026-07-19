import { apiFetch } from "@/lib/api-client";
import type { PatientResponse, PatientRequest, PatientDocumentResponse, PatientDocumentRequest } from "@/lib/types/api";

export const patientsApi = {
  list: () => apiFetch<PatientResponse[]>("/patients"),
  get: (id: number) => apiFetch<PatientResponse>(`/patients/${id}`),
  search: (q: string) => apiFetch<PatientResponse[]>("/patients/search", { query: { q } }),
  create: (body: PatientRequest) => apiFetch<PatientResponse>("/patients", { method: "POST", body }),
  update: (id: number, body: PatientRequest) => apiFetch<PatientResponse>(`/patients/${id}`, { method: "PUT", body }),
  remove: (id: number) => apiFetch<void>(`/patients/${id}`, { method: "DELETE" }),
};

export const patientDocumentsApi = {
  forPatient: (patientId: number) =>
    apiFetch<PatientDocumentResponse[]>(`/patient-documents/patient/${patientId}`),
  create: (body: PatientDocumentRequest) =>
    apiFetch<PatientDocumentResponse>("/patient-documents", { method: "POST", body }),
  remove: (id: number) => apiFetch<void>(`/patient-documents/${id}`, { method: "DELETE" }),
};
