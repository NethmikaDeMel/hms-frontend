"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ArrowLeftIcon, PencilIcon } from "lucide-react";
import { usePatient } from "@/lib/hooks/use-patients";
import { PatientFormSheet } from "@/components/patients/patient-form-sheet";
import { PatientAppointmentsTab } from "@/components/patients/appointments-tab";
import { PatientMedicalHistoryTab } from "@/components/patients/medical-history-tab";
import { PatientLabTestsTab } from "@/components/patients/lab-tests-tab";
import { PatientDocumentsTab } from "@/components/patients/documents-tab";
import { PatientBillingTab } from "@/components/patients/billing-tab";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const patientId = Number(id);
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const { data: patient, isLoading, isError, refetch } = usePatient(patientId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError || !patient) {
    return <ErrorState message="Couldn't load this patient." onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => router.push("/patients")}
          className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-slate-900"
        >
          <ArrowLeftIcon className="size-3.5" /> Back to Patients
        </button>

        <Card>
          <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold tracking-tight text-slate-900">{patient.fullName}</h1>
                {patient.bloodGroup && <Badge variant="outline">{patient.bloodGroup}</Badge>}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {patient.age} years old · {patient.gender.charAt(0) + patient.gender.slice(1).toLowerCase()} · {patient.phone}
                {patient.email && ` · ${patient.email}`}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Registered {format(parseISO(patient.createdAt), "MMM d, yyyy")}
                {patient.allergies && (
                  <span className="ml-2 rounded-full bg-critical-bg px-2 py-0.5 text-critical-fg">
                    Allergies: {patient.allergies}
                  </span>
                )}
              </p>
            </div>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <PencilIcon className="size-3.5" /> Edit Profile
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="history">Medical History</TabsTrigger>
          <TabsTrigger value="lab">Lab Tests</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardContent className="grid grid-cols-1 gap-4 py-5 sm:grid-cols-2">
              <OverviewField label="Address" value={patient.address} />
              <OverviewField label="Emergency Contact" value={patient.emergencyContactName} />
              <OverviewField label="Emergency Phone" value={patient.emergencyContactPhone} />
              <OverviewField label="Allergies" value={patient.allergies} />
              <OverviewField label="Last Updated" value={format(parseISO(patient.updatedAt), "MMM d, yyyy h:mm a")} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments"><PatientAppointmentsTab patientId={patientId} /></TabsContent>
        <TabsContent value="history"><PatientMedicalHistoryTab patientId={patientId} /></TabsContent>
        <TabsContent value="lab"><PatientLabTestsTab patientId={patientId} /></TabsContent>
        <TabsContent value="documents"><PatientDocumentsTab patientId={patientId} /></TabsContent>
        <TabsContent value="billing"><PatientBillingTab patientId={patientId} /></TabsContent>
      </Tabs>

      <PatientFormSheet open={editOpen} onOpenChange={setEditOpen} patient={patient} />
    </div>
  );
}

function OverviewField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm text-slate-900">{value || "—"}</p>
    </div>
  );
}
