"use client";

import { useState } from "react";
import { PlusIcon, StethoscopeIcon, CalendarDaysIcon, PencilIcon } from "lucide-react";
import { useDoctors } from "@/lib/hooks/use-doctors";
import { currencyFormatter } from "@/lib/constants";
import type { DoctorResponse } from "@/lib/types/api";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DoctorFormDialog } from "@/components/doctors/doctor-form-dialog";
import { DoctorScheduleSheet } from "@/components/doctors/doctor-schedule-sheet";

export default function DoctorsPage() {
  const { data: doctors, isLoading, isError, refetch } = useDoctors();
  const [formOpen, setFormOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<DoctorResponse | undefined>();
  const [scheduleDoctor, setScheduleDoctor] = useState<DoctorResponse | null>(null);

  const existingUserIds = (doctors ?? []).map((d) => d.userId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Doctors"
        description="Manage doctor profiles, department assignments, and schedules."
        actions={
          <Button onClick={() => { setEditingDoctor(undefined); setFormOpen(true); }}>
            <PlusIcon className="size-4" /> Add Doctor
          </Button>
        }
      />

      {isLoading && <TableSkeleton rows={5} cols={6} />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && (doctors?.length ?? 0) === 0 && (
        <EmptyState
          icon={StethoscopeIcon}
          title="No doctors yet"
          description="Add your first doctor to start scheduling appointments."
          action={<Button onClick={() => setFormOpen(true)}><PlusIcon className="size-4" />Add Doctor</Button>}
        />
      )}

      {!isLoading && !isError && (doctors?.length ?? 0) > 0 && (
        <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>License #</TableHead>
                <TableHead>Consultation Fee</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors!.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell className="font-medium text-slate-900">Dr. {doctor.fullName}</TableCell>
                  <TableCell>{doctor.departmentName}</TableCell>
                  <TableCell>{doctor.licenseNumber}</TableCell>
                  <TableCell className="tabular-nums">{currencyFormatter.format(doctor.consultationFee)}</TableCell>
                  <TableCell>{doctor.yearsOfExperience ?? "—"} yrs</TableCell>
                  <TableCell>
                    <Badge variant={doctor.availableForBooking ? "success" : "neutral"}>
                      {doctor.availableForBooking ? "Available" : "Unavailable"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setScheduleDoctor(doctor)}>
                        <CalendarDaysIcon className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { setEditingDoctor(doctor); setFormOpen(true); }}>
                        <PencilIcon className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <DoctorFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        doctor={editingDoctor}
        existingUserIds={existingUserIds}
      />
      <DoctorScheduleSheet
        doctor={scheduleDoctor}
        open={!!scheduleDoctor}
        onOpenChange={(open) => !open && setScheduleDoctor(null)}
      />
    </div>
  );
}
