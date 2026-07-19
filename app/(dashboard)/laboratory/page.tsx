"use client";

import { useState } from "react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { PlusIcon, FlaskConicalIcon } from "lucide-react";
import { useLabTests, useUpdateLabTestResult } from "@/lib/hooks/use-laboratory";
import { notifyError } from "@/lib/error-utils";
import type { LabTestStatus, LaboratoryTestResponse } from "@/lib/types/api";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NewTestRequestDialog } from "@/components/laboratory/new-test-request-dialog";
import { ResultEntryDialog } from "@/components/laboratory/result-entry-dialog";
import { ReportViewDialog } from "@/components/laboratory/report-view-dialog";

const TABS: { value: string; label: string; statuses: LabTestStatus[] }[] = [
  { value: "all", label: "All", statuses: [] },
  { value: "ordered", label: "Ordered", statuses: ["ORDERED"] },
  { value: "collected", label: "Sample Collected", statuses: ["SAMPLE_COLLECTED"] },
  { value: "in-progress", label: "In Progress", statuses: ["IN_PROGRESS"] },
  { value: "completed", label: "Completed", statuses: ["COMPLETED"] },
];

export default function LaboratoryPage() {
  const { data: tests, isLoading, isError, refetch } = useLabTests();
  const updateResult = useUpdateLabTestResult();
  const [newRequestOpen, setNewRequestOpen] = useState(false);
  const [resultTest, setResultTest] = useState<LaboratoryTestResponse | null>(null);
  const [reportTest, setReportTest] = useState<LaboratoryTestResponse | null>(null);

  const handleQuickTransition = async (test: LaboratoryTestResponse, status: LabTestStatus) => {
    try {
      await updateResult.mutateAsync({ id: test.id, body: { status } });
      toast.success(`Marked ${status.replace("_", " ").toLowerCase()}`);
    } catch (error) {
      notifyError(error);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laboratory"
        description="Track test requests from order through sample collection to results."
        actions={
          <Button onClick={() => setNewRequestOpen(true)}>
            <PlusIcon className="size-4" /> New Test Request
          </Button>
        }
      />

      {isLoading && <TableSkeleton rows={6} cols={6} />}
      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && (
        <Tabs defaultValue="all">
          <TabsList>
            {TABS.map((tab) => <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>)}
          </TabsList>

          {TABS.map((tab) => {
            const filtered = tab.statuses.length === 0
              ? (tests ?? [])
              : (tests ?? []).filter((t) => tab.statuses.includes(t.status));
            const sorted = [...filtered].sort((a, b) => b.orderedDate.localeCompare(a.orderedDate));

            return (
              <TabsContent key={tab.value} value={tab.value}>
                {sorted.length === 0 ? (
                  <EmptyState icon={FlaskConicalIcon} title="No tests in this category" description="Test requests will appear here as they move through the workflow." />
                ) : (
                  <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Patient</TableHead>
                          <TableHead>Test</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Ordered By</TableHead>
                          <TableHead>Ordered</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sorted.map((test) => (
                          <TableRow key={test.id}>
                            <TableCell className="font-medium text-slate-900">{test.patientName}</TableCell>
                            <TableCell>{test.testName}</TableCell>
                            <TableCell>{test.testType}</TableCell>
                            <TableCell>{test.orderedByName}</TableCell>
                            <TableCell>{format(parseISO(test.orderedDate), "MMM d, yyyy")}</TableCell>
                            <TableCell><StatusBadge status={test.status} domain="lab" /></TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {test.status === "ORDERED" && (
                                  <Button size="sm" variant="outline" onClick={() => handleQuickTransition(test, "SAMPLE_COLLECTED")}>
                                    Mark Sample Collected
                                  </Button>
                                )}
                                {test.status === "SAMPLE_COLLECTED" && (
                                  <Button size="sm" variant="outline" onClick={() => handleQuickTransition(test, "IN_PROGRESS")}>
                                    Start Processing
                                  </Button>
                                )}
                                {(test.status === "IN_PROGRESS" || test.status === "SAMPLE_COLLECTED") && (
                                  <Button size="sm" onClick={() => setResultTest(test)}>Enter Result</Button>
                                )}
                                {test.status === "COMPLETED" && (
                                  <Button size="sm" variant="outline" onClick={() => setReportTest(test)}>View Report</Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      )}

      <NewTestRequestDialog open={newRequestOpen} onOpenChange={setNewRequestOpen} />
      <ResultEntryDialog test={resultTest} open={!!resultTest} onOpenChange={(open) => !open && setResultTest(null)} />
      <ReportViewDialog test={reportTest} open={!!reportTest} onOpenChange={(open) => !open && setReportTest(null)} />
    </div>
  );
}
