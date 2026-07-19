// ---------------------------------------------------------------------------
// Shared API types mirroring the backend DTOs exactly (see build prompt §2).
// ---------------------------------------------------------------------------

export interface ApiErrorShape {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  details: string[];
}

export class ApiError extends Error {
  status: number;
  code: string;
  details: string[];
  constructor(shape: ApiErrorShape) {
    super(shape.message);
    this.name = "ApiError";
    this.status = shape.status;
    this.code = shape.error;
    this.details = shape.details ?? [];
  }
}

// ---- Auth ------------------------------------------------------------------
export interface LoginRequest {
  username: string;
  password: string;
}
export interface LoginResponse {
  token: string;
  userId: number;
  username: string;
  fullName: string;
  roleName: string;
  issuedAt: string;
  expiresAt: string;
}
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ---- Roles / Users -----------------------------------------------------------
export interface Role {
  id: number;
  name: string;
  description?: string | null;
}
export interface RoleRequest {
  name: string;
  description?: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone?: string | null;
  specialization?: string | null;
  roleName: string;
  active: boolean;
  createdAt: string;
}
export interface UserRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
  phone?: string;
  specialization?: string;
  roleId: number;
}

// ---- Departments -------------------------------------------------------------
export interface Department {
  id: number;
  name: string;
  description?: string | null;
  location?: string | null;
}
export interface DepartmentRequest {
  name: string;
  description?: string;
  location?: string;
}

// ---- Doctors -------------------------------------------------------------
export interface DoctorResponse {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  phone?: string | null;
  departmentId: number;
  departmentName: string;
  licenseNumber: string;
  consultationFee: number;
  yearsOfExperience?: number | null;
  availableForBooking: boolean;
}
export interface DoctorRequest {
  userId: number;
  departmentId: number;
  licenseNumber: string;
  consultationFee: number;
  yearsOfExperience?: number;
}
export type DayOfWeek =
  | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
export interface DoctorScheduleResponse {
  id: number;
  doctorId: number;
  doctorName: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  available: boolean;
}
export interface DoctorScheduleRequest {
  doctorId: number;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

// ---- Employees / Attendance / Leave --------------------------------------
export interface EmployeeResponse {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  departmentId: number;
  departmentName: string;
  designation: string;
  hireDate: string;
  salary?: number | null;
  employmentStatus: "ACTIVE" | "INACTIVE";
}
export interface EmployeeRequest {
  userId: number;
  departmentId: number;
  designation: string;
  hireDate: string;
  salary?: number;
}
export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY" | "ON_LEAVE";
export interface AttendanceResponse {
  id: number;
  employeeId: number;
  employeeName: string;
  attendanceDate: string;
  clockIn?: string | null;
  clockOut?: string | null;
  status: AttendanceStatus;
}
export type LeaveType = "SICK" | "CASUAL" | "ANNUAL" | "MATERNITY" | "PATERNITY" | "UNPAID";
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";
export interface LeaveResponse {
  id: number;
  employeeId: number;
  employeeName: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  dayCount: number;
  status: LeaveStatus;
  reason?: string | null;
  createdAt: string;
}
export interface LeaveRequest {
  employeeId: number;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string;
}

// ---- Patients --------------------------------------------------------------
export type Gender = "MALE" | "FEMALE" | "OTHER";
export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export interface PatientResponse {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string;
  age: number;
  gender: Gender;
  phone: string;
  email?: string | null;
  address?: string | null;
  bloodGroup?: BloodGroup | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  allergies?: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface PatientRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  phone: string;
  email?: string;
  address?: string;
  bloodGroup?: BloodGroup;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  allergies?: string;
}

export type PatientDocumentType =
  | "LAB_REPORT" | "PRESCRIPTION" | "INSURANCE" | "IMAGING" | "EXTERNAL_MEDICAL_REPORT" | "OTHER";
export interface PatientDocumentResponse {
  id: number;
  patientId: number;
  documentName: string;
  documentType: PatientDocumentType;
  fileUrl: string;
  notes?: string | null;
  uploadedAt: string;
}
export interface PatientDocumentRequest {
  patientId: number;
  documentName: string;
  documentType: PatientDocumentType;
  fileUrl: string;
  notes?: string;
}

// ---- Appointments ------------------------------------------------------------
export type AppointmentStatus =
  | "SCHEDULED" | "CONFIRMED" | "CHECKED_IN" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
export interface AppointmentResponse {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialization?: string | null;
  appointmentDate: string;
  status: AppointmentStatus;
  reason: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface AppointmentRequest {
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  reason: string;
  notes?: string;
}
export interface AppointmentStatusUpdateRequest {
  status: AppointmentStatus;
  notes?: string;
}

// ---- Medical Records -----------------------------------------------------
export interface MedicalRecordResponse {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  appointmentId?: number | null;
  diagnosis: string;
  treatment?: string | null;
  prescription?: string | null;
  notes?: string | null;
  recordDate: string;
  createdAt: string;
}
export interface MedicalRecordRequest {
  patientId: number;
  doctorId: number;
  appointmentId?: number;
  diagnosis: string;
  treatment?: string;
  prescription?: string;
  notes?: string;
}

// ---- Laboratory ------------------------------------------------------------
export type LabTestStatus = "ORDERED" | "SAMPLE_COLLECTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export interface LaboratoryTestResponse {
  id: number;
  patientId: number;
  patientName: string;
  orderedById: number;
  orderedByName: string;
  testName: string;
  testType: string;
  status: LabTestStatus;
  result?: string | null;
  referenceRange?: string | null;
  orderedDate: string;
  completedDate?: string | null;
}
export interface LaboratoryTestRequest {
  patientId: number;
  orderedById: number;
  testName: string;
  testType: string;
}
export interface LaboratoryTestResultUpdateRequest {
  status: LabTestStatus;
  result?: string;
  referenceRange?: string;
}

// ---- Pharmacy --------------------------------------------------------------
export interface PharmacyInventoryResponse {
  id: number;
  medicineName: string;
  category: string;
  manufacturer?: string | null;
  quantity: number;
  unitPrice: number;
  reorderLevel: number;
  lowStock: boolean;
  expiryDate: string;
  supplier?: string | null;
  batchNumber?: string | null;
  updatedAt: string;
}
export interface PharmacyInventoryRequest {
  medicineName: string;
  category: string;
  manufacturer?: string;
  quantity: number;
  unitPrice: number;
  reorderLevel: number;
  expiryDate: string;
  supplier?: string;
  batchNumber?: string;
}

// ---- Billing --------------------------------------------------------------
export type InvoiceStatus = "PENDING" | "PAID" | "OVERDUE" | "PARTIALLY_PAID" | "CANCELLED";
export interface BillingInvoiceResponse {
  id: number;
  invoiceNumber: string;
  patientId: number;
  patientName: string;
  appointmentId?: number | null;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: InvoiceStatus;
  description: string;
  issueDate: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}
export interface BillingInvoiceRequest {
  patientId: number;
  appointmentId?: number;
  description: string;
  dueDate: string;
}
export type ChargeType = "CONSULTATION" | "LABORATORY" | "PHARMACY" | "ADMISSION" | "OTHER";
export interface BillingChargeResponse {
  id: number;
  invoiceId: number;
  chargeType: ChargeType;
  description: string;
  amount: number;
  chargeDate: string;
}
export interface BillingChargeRequest {
  chargeType: ChargeType;
  description: string;
  amount: number;
}
export type PaymentMethod = "CASH" | "CARD" | "INSURANCE";
export interface PaymentResponse {
  id: number;
  invoiceId: number;
  method: PaymentMethod;
  amount: number;
  referenceNumber?: string | null;
  insuranceProvider?: string | null;
  paidAt: string;
}
export interface RecordPaymentRequest {
  method: PaymentMethod;
  amount: number;
  referenceNumber?: string;
  insuranceProvider?: string;
}

// ---- Reports ---------------------------------------------------------------
export interface CountBreakdown {
  label: string;
  count: number;
}
export interface PatientDemographicsReport {
  totalPatients: number;
  byGender: CountBreakdown[];
  byBloodGroup: CountBreakdown[];
}
export interface AppointmentDensityReport {
  startDate: string;
  endDate: string;
  totalAppointments: number;
  byStatus: CountBreakdown[];
  byDay: CountBreakdown[];
}
export interface RevenueSummaryReport {
  startDate: string;
  endDate: string;
  totalRevenueCollected: number;
  totalOutstanding: number;
  totalOverdue: number;
  paidInvoiceCount: number;
  pendingInvoiceCount: number;
  overdueInvoiceCount: number;
}
export interface PharmacyVelocityReport {
  totalDistinctMedicines: number;
  totalUnitsInStock: number;
  totalInventoryValue: number;
  lowStockItemCount: number;
  expiringWithin30DaysCount: number;
}
export interface LabUtilizationReport {
  totalTestsOrdered: number;
  byTestType: CountBreakdown[];
  byStatus: CountBreakdown[];
}
export interface StaffAllocationReport {
  totalActiveStaff: number;
  byDepartment: CountBreakdown[];
}
