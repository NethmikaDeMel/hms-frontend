import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentsApi } from "@/lib/api/appointments";
import type { AppointmentRequest, AppointmentStatusUpdateRequest } from "@/lib/types/api";

export const appointmentKeys = {
  all: ["appointments"] as const,
  byPatient: (patientId: number) => ["appointments", "patient", patientId] as const,
  byDoctor: (doctorId: number) => ["appointments", "doctor", doctorId] as const,
};

export function useAppointments() {
  return useQuery({ queryKey: appointmentKeys.all, queryFn: appointmentsApi.list });
}

export function useAppointmentsByDoctor(doctorId: number | undefined) {
  return useQuery({
    queryKey: appointmentKeys.byDoctor(doctorId ?? 0),
    queryFn: () => appointmentsApi.byDoctor(doctorId as number),
    enabled: !!doctorId,
  });
}

export function useAppointmentsByPatient(patientId: number | undefined) {
  return useQuery({
    queryKey: appointmentKeys.byPatient(patientId ?? 0),
    queryFn: () => appointmentsApi.byPatient(patientId as number),
    enabled: !!patientId,
  });
}

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["appointments"] });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AppointmentRequest) => appointmentsApi.create(body),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: AppointmentStatusUpdateRequest }) =>
      appointmentsApi.updateStatus(id, body),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useRescheduleAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: AppointmentRequest }) =>
      appointmentsApi.reschedule(id, body),
    onSuccess: () => invalidateAll(queryClient),
  });
}
