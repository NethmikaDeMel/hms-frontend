import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { departmentsApi } from "@/lib/api/departments";
import { rolesApi } from "@/lib/api/roles";
import { usersApi } from "@/lib/api/users";
import type { DepartmentRequest, RoleRequest, UserRequest } from "@/lib/types/api";

export function useDepartments() {
  return useQuery({ queryKey: ["departments"], queryFn: departmentsApi.list });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: DepartmentRequest) => departmentsApi.create(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["departments"] }),
  });
}

export function useUpdateDepartment(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: DepartmentRequest) => departmentsApi.update(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["departments"] }),
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => departmentsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["departments"] }),
  });
}

export function useRoles() {
  return useQuery({ queryKey: ["roles"], queryFn: rolesApi.list });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: RoleRequest) => rolesApi.create(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roles"] }),
  });
}

export function useUpdateRole(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: RoleRequest) => rolesApi.update(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roles"] }),
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => rolesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roles"] }),
  });
}

export function useUsers() {
  return useQuery({ queryKey: ["users"], queryFn: usersApi.list });
}

export function useDoctorUsers() {
  return useQuery({ queryKey: ["users", "doctors"], queryFn: usersApi.doctors });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UserRequest) => usersApi.create(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}
