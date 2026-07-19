import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { doctorsApi } from "@/lib/api/doctors";
import type { DoctorRequest, DoctorScheduleRequest } from "@/lib/types/api";

export function useDoctors() {
  return useQuery({ queryKey: ["doctors"], queryFn: doctorsApi.list });
}

export function useAvailableDoctors() {
  return useQuery({ queryKey: ["doctors", "available"], queryFn: doctorsApi.available });
}

export function useDoctorSchedules(doctorId: number | undefined) {
  return useQuery({
    queryKey: ["doctors", doctorId, "schedules"],
    queryFn: () => doctorsApi.schedules(doctorId as number),
    enabled: !!doctorId,
  });
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: DoctorRequest) => doctorsApi.create(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["doctors"] }),
  });
}

export function useUpdateDoctor(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: DoctorRequest) => doctorsApi.update(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["doctors"] }),
  });
}

export function useAssignDoctorDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, departmentId }: { id: number; departmentId: number }) =>
      doctorsApi.assignDepartment(id, departmentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["doctors"] }),
  });
}

export function useCreateDoctorSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: DoctorScheduleRequest) => doctorsApi.createSchedule(body),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ["doctors", variables.doctorId, "schedules"] }),
  });
}

export function useUpdateScheduleAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ scheduleId, available }: { scheduleId: number; available: boolean; doctorId: number }) =>
      doctorsApi.updateScheduleAvailability(scheduleId, available),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ["doctors", variables.doctorId, "schedules"] }),
  });
}

export function useRemoveDoctorSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ scheduleId }: { scheduleId: number; doctorId: number }) =>
      doctorsApi.removeSchedule(scheduleId),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ["doctors", variables.doctorId, "schedules"] }),
  });
}
