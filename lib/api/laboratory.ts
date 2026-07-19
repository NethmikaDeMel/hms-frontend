import { apiFetch } from "@/lib/api-client";
import type {
  LaboratoryTestResponse, LaboratoryTestRequest, LaboratoryTestResultUpdateRequest,
} from "@/lib/types/api";

export const laboratoryApi = {
  list: () => apiFetch<LaboratoryTestResponse[]>("/laboratory-tests"),
  get: (id: number) => apiFetch<LaboratoryTestResponse>(`/laboratory-tests/${id}`),
  byPatient: (patientId: number) => apiFetch<LaboratoryTestResponse[]>(`/laboratory-tests/patient/${patientId}`),
  create: (body: LaboratoryTestRequest) => apiFetch<LaboratoryTestResponse>("/laboratory-tests", { method: "POST", body }),
  updateResult: (id: number, body: LaboratoryTestResultUpdateRequest) =>
    apiFetch<LaboratoryTestResponse>(`/laboratory-tests/${id}/result`, { method: "PATCH", body }),
  report: (id: number) => apiFetch<LaboratoryTestResponse>(`/laboratory-tests/${id}/report`),
};
