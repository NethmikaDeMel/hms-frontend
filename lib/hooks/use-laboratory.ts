import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { laboratoryApi } from "@/lib/api/laboratory";
import type { LaboratoryTestRequest, LaboratoryTestResultUpdateRequest } from "@/lib/types/api";

export function useLabTests() {
  return useQuery({ queryKey: ["laboratory-tests"], queryFn: laboratoryApi.list });
}

export function useLabTestsByPatient(patientId: number | undefined) {
  return useQuery({
    queryKey: ["laboratory-tests", "patient", patientId],
    queryFn: () => laboratoryApi.byPatient(patientId as number),
    enabled: !!patientId,
  });
}

export function useCreateLabTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: LaboratoryTestRequest) => laboratoryApi.create(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["laboratory-tests"] }),
  });
}

export function useUpdateLabTestResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: LaboratoryTestResultUpdateRequest }) =>
      laboratoryApi.updateResult(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["laboratory-tests"] }),
  });
}
