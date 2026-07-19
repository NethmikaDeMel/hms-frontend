"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  UsersIcon, CalendarClockIcon, ClipboardListIcon,
  FlaskConicalIcon, PillIcon, ReceiptTextIcon, AlertTriangleIcon,
  UserCogIcon, TrendingUpIcon, ClockIcon, BadgeCheckIcon,
} from "lucide-react";
import { isToday, parseISO } from "date-fns";
import { useAuthStore } from "@/lib/hooks/use-auth-store";
import { ROLES } from "@/lib/constants";
import { currencyFormatter } from "@/lib/constants";
import { patientsApi } from "@/lib/api/patients";
import { appointmentsApi } from "@/lib/api/appointments";
import { doctorsApi } from "@/lib/api/doctors";
import { laboratoryApi } from "@/lib/api/laboratory";
import { pharmacyApi } from "@/lib/api/pharmacy";
import { billingApi } from "@/lib/api/billing";
import { employeesApi, leaveApi } from "@/lib/api/staff";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ConsultationsQueue } from "@/components/dashboard/consultations-queue";
import { RecentPrescriptions } from "@/components/dashboard/recent-prescriptions";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";

function useDashboardData(role: string | undefined) {
  const patients = useQuery({ queryKey: ["patients"], queryFn: patientsApi.list, enabled: !!role });
  const appointments = useQuery({ queryKey: ["appointments"], queryFn: appointmentsApi.list, enabled: !!role });
  const doctors = useQuery({
    queryKey: ["doctors"],
    queryFn: doctorsApi.list,
    enabled: role === ROLES.ADMIN,
  });
  const labTests = useQuery({
    queryKey: ["laboratory-tests"],
    queryFn: laboratoryApi.list,
    enabled: role === ROLES.LAB_TECH || role === ROLES.DOCTOR || role === ROLES.ADMIN,
  });
  const lowStock = useQuery({
    queryKey: ["pharmacy", "low-stock"],
    queryFn: pharmacyApi.lowStock,
    enabled: role === ROLES.PHARMACIST || role === ROLES.ADMIN,
  });
  const expiring = useQuery({
    queryKey: ["pharmacy", "expiring"],
    queryFn: () => pharmacyApi.expiring(30),
    enabled: role === ROLES.PHARMACIST || role === ROLES.ADMIN,
  });
  const invoices = useQuery({
    queryKey: ["billing-invoices"],
    queryFn: billingApi.list,
    enabled: role === ROLES.ACCOUNTANT || role === ROLES.ADMIN || role === ROLES.RECEPTIONIST,
  });
  const employees = useQuery({
    queryKey: ["employees"],
    queryFn: employeesApi.list,
    enabled: role === ROLES.ADMIN,
  });
  const pendingLeave = useQuery({
    queryKey: ["leave-records", "status", "PENDING"],
    queryFn: () => leaveApi.byStatus("PENDING"),
    enabled: role === ROLES.ADMIN,
  });

  return { patients, appointments, doctors, labTests, lowStock, expiring, invoices, employees, pendingLeave };
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const role = user?.roleName;
  const data = useDashboardData(role);

  const todaysAppointments = (data.appointments.data ?? []).filter(
    (a) => isToday(parseISO(a.appointmentDate)) && a.status !== "CANCELLED"
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back${user ? `, ${user.fullName.split(" ")[0]}` : ""}`}
        description="Here's what's happening across the hospital right now."
      />

      {role === ROLES.ADMIN && (
        <AdminDashboard data={data} todaysAppointments={todaysAppointments} />
      )}
      {role === ROLES.DOCTOR && user && <DoctorDashboard doctorUserId={user.userId} todaysAppointments={todaysAppointments} data={data} />}
      {role === ROLES.NURSE && <NurseDashboard todaysAppointments={todaysAppointments} data={data} />}
      {role === ROLES.RECEPTIONIST && <ReceptionistDashboard todaysAppointments={todaysAppointments} data={data} />}
      {role === ROLES.LAB_TECH && <LabTechDashboard data={data} />}
      {role === ROLES.PHARMACIST && <PharmacistDashboard data={data} />}
      {role === ROLES.ACCOUNTANT && <AccountantDashboard data={data} />}
    </div>
  );
}

type DashboardData = ReturnType<typeof useDashboardData>;

function AdminDashboard({
  data,
  todaysAppointments,
}: {
  data: DashboardData;
  todaysAppointments: ReturnType<typeof Array.prototype.filter>;
}) {
  const overdueCount = (data.invoices.data ?? []).filter((i) => i.status === "OVERDUE").length;
  const monthlyRevenue = (data.invoices.data ?? [])
    .filter((i) => i.status === "PAID" || i.status === "PARTIALLY_PAID")
    .reduce((sum, i) => sum + i.paidAmount, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 @sm:grid-cols-2 @lg:grid-cols-3 @4xl:grid-cols-6">
        <MetricCard label="Total Patients" value={data.patients.data?.length ?? "—"} icon={UsersIcon} tone="info" />
        <MetricCard label="Total Staff" value={data.employees.data?.length ?? "—"} icon={UserCogIcon} />
        <MetricCard label="Today's Appointments" value={todaysAppointments.length} icon={CalendarClockIcon} tone="info" />
        <MetricCard label="Revenue Collected" value={currencyFormatter.format(monthlyRevenue)} icon={TrendingUpIcon} tone="success" />
        <MetricCard label="Low Stock Alerts" value={data.lowStock.data?.length ?? "—"} icon={AlertTriangleIcon} tone={data.lowStock.data?.length ? "warning" : "default"} pulse={!!data.lowStock.data?.length} />
        <MetricCard label="Pending Leave Requests" value={data.pendingLeave.data?.length ?? "—"} icon={ClipboardListIcon} tone={data.pendingLeave.data?.length ? "warning" : "default"} />
      </div>

      <div className="grid grid-cols-1 gap-6 @4xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Overdue Invoices</CardTitle></CardHeader>
          <CardContent className="pb-6">
            <p className="text-3xl font-semibold tabular-nums text-critical-fg">{overdueCount}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              <Link href="/billing" className="text-primary hover:underline">Review the billing hub →</Link>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Doctor Roster</CardTitle></CardHeader>
          <CardContent className="pb-6">
            <p className="text-3xl font-semibold tabular-nums text-slate-900">{data.doctors.data?.length ?? "—"}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              <Link href="/doctors" className="text-primary hover:underline">Manage doctors →</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DoctorDashboard({
  doctorUserId,
  todaysAppointments,
  data,
}: {
  doctorUserId: number;
  todaysAppointments: ReturnType<typeof Array.prototype.filter>;
  data: DashboardData;
}) {
  const patientsWaiting = todaysAppointments.filter((a) => a.status === "CHECKED_IN").length;
  const pendingReports = (data.labTests.data ?? []).filter(
    (t) => t.orderedById === doctorUserId && t.status !== "COMPLETED" && t.status !== "CANCELLED"
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 @sm:grid-cols-2 @lg:grid-cols-4">
        <MetricCard label="Today's Appointments" value={todaysAppointments.length} icon={CalendarClockIcon} tone="info" />
        <MetricCard label="Patients Waiting" value={patientsWaiting} icon={ClockIcon} tone={patientsWaiting ? "warning" : "default"} />
        <MetricCard label="Pending Lab Reports" value={pendingReports} icon={FlaskConicalIcon} tone={pendingReports ? "warning" : "default"} />
        <MetricCard label="Completed Today" value={todaysAppointments.filter((a) => a.status === "COMPLETED").length} icon={BadgeCheckIcon} tone="success" />
      </div>

      <div className="grid grid-cols-1 gap-6 @4xl:grid-cols-2">
        <ConsultationsQueue doctorId={doctorUserId} />
        <RecentPrescriptions doctorId={doctorUserId} />
      </div>
    </div>
  );
}

function NurseDashboard({ todaysAppointments, data }: { todaysAppointments: ReturnType<typeof Array.prototype.filter>; data: DashboardData }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 @sm:grid-cols-2 @lg:grid-cols-4">
        <MetricCard label="Patients Today" value={data.patients.data?.length ?? "—"} icon={UsersIcon} tone="info" />
        <MetricCard label="Today's Appointments" value={todaysAppointments.length} icon={CalendarClockIcon} />
        <MetricCard label="Checked In" value={todaysAppointments.filter((a) => a.status === "CHECKED_IN").length} icon={ClockIcon} tone="warning" />
        <MetricCard label="Completed Today" value={todaysAppointments.filter((a) => a.status === "COMPLETED").length} icon={BadgeCheckIcon} tone="success" />
      </div>
      <TodaysQueueCard appointments={todaysAppointments} />
    </div>
  );
}

function ReceptionistDashboard({ todaysAppointments, data }: { todaysAppointments: ReturnType<typeof Array.prototype.filter>; data: DashboardData }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 @sm:grid-cols-2 @lg:grid-cols-4">
        <MetricCard label="Appointments Booked Today" value={todaysAppointments.length} icon={CalendarClockIcon} tone="info" />
        <MetricCard label="Checked In" value={todaysAppointments.filter((a) => a.status === "CHECKED_IN").length} icon={ClockIcon} tone="warning" />
        <MetricCard label="Total Registered Patients" value={data.patients.data?.length ?? "—"} icon={UsersIcon} />
        <MetricCard label="Scheduled (Not Yet Arrived)" value={todaysAppointments.filter((a) => a.status === "SCHEDULED" || a.status === "CONFIRMED").length} icon={ClipboardListIcon} />
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/patients" className="rounded-lg border border-slate-200/80 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-xs hover:border-slate-300">
          + Register New Patient
        </Link>
        <Link href="/appointments" className="rounded-lg border border-slate-200/80 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-xs hover:border-slate-300">
          + Book Appointment
        </Link>
      </div>
      <TodaysQueueCard appointments={todaysAppointments} />
    </div>
  );
}

function LabTechDashboard({ data }: { data: DashboardData }) {
  const tests = data.labTests.data ?? [];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 @sm:grid-cols-2 @lg:grid-cols-4">
        <MetricCard
          label="Pending Test Requests"
          value={tests.filter((t) => t.status === "ORDERED").length}
          icon={FlaskConicalIcon}
          tone="warning"
        />
        <MetricCard label="Awaiting Sample" value={tests.filter((t) => t.status === "ORDERED").length} icon={ClockIcon} />
        <MetricCard label="In Progress" value={tests.filter((t) => t.status === "IN_PROGRESS" || t.status === "SAMPLE_COLLECTED").length} icon={ClipboardListIcon} tone="info" />
        <MetricCard label="Completed Today" value={tests.filter((t) => t.status === "COMPLETED").length} icon={BadgeCheckIcon} tone="success" />
      </div>
      <Card>
        <CardHeader><CardTitle>Test Queue</CardTitle></CardHeader>
        <CardContent className="pb-6">
          {data.labTests.isLoading && <Skeleton className="h-32 w-full" />}
          {!data.labTests.isLoading && tests.length === 0 && <p className="text-sm text-muted-foreground">No test requests yet.</p>}
          <ul className="space-y-2">
            {tests.slice(0, 8).map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200/80 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{t.patientName} — {t.testName}</p>
                  <p className="truncate text-xs text-muted-foreground">{t.testType}</p>
                </div>
                <StatusBadge status={t.status} domain="lab" />
              </li>
            ))}
          </ul>
          <Link href="/laboratory" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
            Open Laboratory workspace →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function PharmacistDashboard({ data }: { data: DashboardData }) {
  const lowStock = data.lowStock.data ?? [];
  const expiring = data.expiring.data ?? [];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 @sm:grid-cols-2 @lg:grid-cols-4">
        <MetricCard label="Low Stock Items" value={lowStock.length} icon={AlertTriangleIcon} tone={lowStock.length ? "warning" : "default"} pulse={!!lowStock.length} />
        <MetricCard label="Expiring ≤ 30 Days" value={expiring.length} icon={AlertTriangleIcon} tone={expiring.length ? "critical" : "default"} pulse={!!expiring.length} />
        <MetricCard label="Total Medicines Tracked" value={"—"} icon={PillIcon} />
        <MetricCard label="Dispensed Today" value={"—"} icon={BadgeCheckIcon} tone="success" hint="Tracked per-dispense action" />
      </div>
      <Card>
        <CardHeader><CardTitle>Inventory Quick View — Low Stock</CardTitle></CardHeader>
        <CardContent className="pb-6">
          {data.lowStock.isLoading && <Skeleton className="h-32 w-full" />}
          {!data.lowStock.isLoading && lowStock.length === 0 && <p className="text-sm text-muted-foreground">Nothing is low on stock right now.</p>}
          <ul className="space-y-2">
            {lowStock.slice(0, 8).map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-warning-border bg-warning-bg/40 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{item.medicineName}</p>
                  <p className="truncate text-xs text-muted-foreground">Batch {item.batchNumber ?? "—"}</p>
                </div>
                <p className="shrink-0 text-sm font-medium tabular-nums text-warning-fg">{item.quantity} left</p>
              </li>
            ))}
          </ul>
          <Link href="/pharmacy" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
            Open Pharmacy workspace →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function AccountantDashboard({ data }: { data: DashboardData }) {
  const invoices = data.invoices.data ?? [];
  const todaysRevenue = invoices
    .filter((i) => i.status === "PAID" || i.status === "PARTIALLY_PAID")
    .reduce((sum, i) => sum + i.paidAmount, 0);
  const outstanding = invoices.reduce((sum, i) => sum + (i.status === "CANCELLED" ? 0 : i.balanceDue), 0);
  const overdue = invoices.filter((i) => i.status === "OVERDUE");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 @sm:grid-cols-2 @lg:grid-cols-4">
        <MetricCard label="Revenue Collected" value={currencyFormatter.format(todaysRevenue)} icon={TrendingUpIcon} tone="success" />
        <MetricCard label="Outstanding Balance" value={currencyFormatter.format(outstanding)} icon={ReceiptTextIcon} tone="warning" />
        <MetricCard label="Overdue Invoices" value={overdue.length} icon={AlertTriangleIcon} tone={overdue.length ? "critical" : "default"} />
        <MetricCard label="Pending Payments" value={invoices.filter((i) => i.status === "PENDING").length} icon={ClockIcon} />
      </div>
      <Card>
        <CardHeader><CardTitle>Recent Transactions Ledger</CardTitle></CardHeader>
        <CardContent className="pb-6">
          {data.invoices.isLoading && <Skeleton className="h-32 w-full" />}
          <ul className="space-y-2">
            {invoices.slice(0, 8).map((invoice) => (
              <li key={invoice.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200/80 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{invoice.invoiceNumber} — {invoice.patientName}</p>
                  <p className="truncate text-xs text-muted-foreground">{invoice.description}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-medium tabular-nums text-slate-900">{currencyFormatter.format(invoice.totalAmount)}</span>
                  <StatusBadge status={invoice.status} domain="invoice" />
                </div>
              </li>
            ))}
          </ul>
          <Link href="/billing" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
            Open Billing Hub →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function TodaysQueueCard({ appointments }: { appointments: ReturnType<typeof Array.prototype.filter> }) {
  const sorted = [...appointments].sort((a, b) => a.appointmentDate.localeCompare(b.appointmentDate));
  return (
    <Card>
      <CardHeader><CardTitle>Today&apos;s Appointment Queue</CardTitle></CardHeader>
      <CardContent className="pb-6">
        {sorted.length === 0 && <p className="text-sm text-muted-foreground">No appointments scheduled for today.</p>}
        <ul className="space-y-2">
          {sorted.map((appt) => (
            <li key={appt.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200/80 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">{appt.patientName}</p>
                <p className="truncate text-xs text-muted-foreground">Dr. {appt.doctorName} — {appt.reason}</p>
              </div>
              <StatusBadge status={appt.status} domain="appointment" />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
