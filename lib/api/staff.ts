import { apiFetch } from "@/lib/api-client";
import type {
  EmployeeResponse, EmployeeRequest, AttendanceResponse, LeaveResponse, LeaveRequest, LeaveStatus,
} from "@/lib/types/api";

export const employeesApi = {
  list: () => apiFetch<EmployeeResponse[]>("/employees"),
  get: (id: number) => apiFetch<EmployeeResponse>(`/employees/${id}`),
  byDepartment: (departmentId: number) => apiFetch<EmployeeResponse[]>(`/employees/department/${departmentId}`),
  create: (body: EmployeeRequest) => apiFetch<EmployeeResponse>("/employees", { method: "POST", body }),
  update: (id: number, body: EmployeeRequest) => apiFetch<EmployeeResponse>(`/employees/${id}`, { method: "PUT", body }),
  reassignDepartment: (id: number, departmentId: number) =>
    apiFetch<EmployeeResponse>(`/employees/${id}/department`, { method: "PATCH", body: { departmentId } }),
  deactivate: (id: number) => apiFetch<void>(`/employees/${id}/deactivate`, { method: "PATCH" }),
};

export const attendanceApi = {
  clockIn: (employeeId: number) => apiFetch<AttendanceResponse>("/attendance/clock-in", { method: "POST", body: { employeeId } }),
  clockOut: (employeeId: number) => apiFetch<AttendanceResponse>(`/attendance/${employeeId}/clock-out`, { method: "PATCH" }),
  forEmployee: (employeeId: number) => apiFetch<AttendanceResponse[]>(`/attendance/employee/${employeeId}`),
  forDate: (date: string) => apiFetch<AttendanceResponse[]>(`/attendance/date/${date}`),
};

export const leaveApi = {
  apply: (body: LeaveRequest) => apiFetch<LeaveResponse>("/leave-records", { method: "POST", body }),
  forEmployee: (employeeId: number) => apiFetch<LeaveResponse[]>(`/leave-records/employee/${employeeId}`),
  byStatus: (status: LeaveStatus) => apiFetch<LeaveResponse[]>(`/leave-records/status/${status}`),
  updateStatus: (id: number, status: LeaveStatus) =>
    apiFetch<LeaveResponse>(`/leave-records/${id}/status`, { method: "PATCH", body: { status } }),
};
