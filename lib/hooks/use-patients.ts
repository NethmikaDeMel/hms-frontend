import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientsApi } from "@/lib/api/patients";
import type { PatientRequest } from "@/lib/types/api";

export const patientKeys = {
  all: ["patients"] as const,
  detail: (id: number) => ["patients", id] as const,
  search: (q: string) => ["patients", "search", q] as const,
};

export function usePatients() {
  return useQuery({ queryKey: patientKeys.all, queryFn: patientsApi.list });
}

export function usePatient(id: number) {
  return useQuery({ queryKey: patientKeys.detail(id), queryFn: () => patientsApi.get(id), enabled: !!id });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: PatientRequest) => patientsApi.create(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: patientKeys.all }),
  });
}

export function useUpdatePatient(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: PatientRequest) => patientsApi.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.all });
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(id) });
    },
  });
}
