import { apiFetch } from "@/lib/api-client";
import type {
  PatientDemographicsReport, AppointmentDensityReport, RevenueSummaryReport,
  PharmacyVelocityReport, LabUtilizationReport, StaffAllocationReport,
} from "@/lib/types/api";

export const reportsApi = {
  patientDemographics: () => apiFetch<PatientDemographicsReport>("/reports/patient-demographics"),
  appointmentDensity: (startDate: string, endDate: string) =>
    apiFetch<AppointmentDensityReport>("/reports/appointment-density", { query: { startDate, endDate } }),
  revenueSummary: (startDate: string, endDate: string) =>
    apiFetch<RevenueSummaryReport>("/reports/revenue-summary", { query: { startDate, endDate } }),
  pharmacyVelocity: () => apiFetch<PharmacyVelocityReport>("/reports/pharmacy-velocity"),
  labUtilization: () => apiFetch<LabUtilizationReport>("/reports/lab-utilization"),
  staffAllocation: () => apiFetch<StaffAllocationReport>("/reports/staff-allocation"),
};
