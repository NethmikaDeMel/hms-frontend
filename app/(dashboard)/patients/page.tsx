"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon, SearchIcon, UsersIcon } from "lucide-react";
import { patientsApi } from "@/lib/api/patients";
import { usePatients } from "@/lib/hooks/use-patients";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { PatientFormSheet } from "@/components/patients/patient-form-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { format, parseISO } from "date-fns";

export default function PatientsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const allPatients = usePatients();
  const searchResults = useQuery({
    queryKey: ["patients", "search", debounced],
    queryFn: () => patientsApi.search(debounced),
    enabled: debounced.trim().length > 0,
  });

  useMemo(() => {
    const timeout = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const isSearching = debounced.trim().length > 0;
  const data = isSearching ? searchResults.data : allPatients.data;
  const isLoading = isSearching ? searchResults.isLoading : allPatients.isLoading;
  const isError = isSearching ? searchResults.isError : allPatients.isError;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients"
        description="Search, register, and manage patient records."
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <PlusIcon className="size-4" /> Register New Patient
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone…"
          className="pl-9"
        />
      </div>

      {isLoading && <TableSkeleton rows={6} cols={6} />}
      {isError && <ErrorState onRetry={() => (isSearching ? searchResults.refetch() : allPatients.refetch())} />}

      {!isLoading && !isError && (data?.length ?? 0) === 0 && (
        <EmptyState
          icon={UsersIcon}
          title={isSearching ? "No matching patients" : "No patients registered yet"}
          description={isSearching ? "Try a different name or phone number." : "Register your first patient to get started."}
          action={!isSearching ? <Button onClick={() => setFormOpen(true)}><PlusIcon className="size-4" />Register New Patient</Button> : undefined}
        />
      )}

      {!isLoading && !isError && (data?.length ?? 0) > 0 && (
        <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Age / Gender</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Blood Group</TableHead>
                <TableHead>Registered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data!.map((patient) => (
                <TableRow
                  key={patient.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/patients/${patient.id}`)}
                >
                  <TableCell className="font-medium text-slate-900">{patient.fullName}</TableCell>
                  <TableCell>{patient.age} / {patient.gender.charAt(0) + patient.gender.slice(1).toLowerCase()}</TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell>
                    {patient.bloodGroup ? <Badge variant="outline">{patient.bloodGroup}</Badge> : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>{format(parseISO(patient.createdAt), "MMM d, yyyy")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <PatientFormSheet open={formOpen} onOpenChange={setFormOpen} onSaved={(id) => router.push(`/patients/${id}`)} />
    </div>
  );
}
