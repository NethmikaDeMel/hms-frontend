"use client";

import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { PrinterIcon } from "lucide-react";
import { laboratoryApi } from "@/lib/api/laboratory";
import type { LaboratoryTestResponse } from "@/lib/types/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";

export function ReportViewDialog({
  test,
  open,
  onOpenChange,
}: {
  test: LaboratoryTestResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: report, isLoading, isError, refetch } = useQuery({
    queryKey: ["laboratory-tests", test?.id, "report"],
    queryFn: () => laboratoryApi.report(test!.id),
    enabled: open && !!test,
  });

  if (!test) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg print:shadow-none">
        <DialogHeader>
          <DialogTitle>Diagnostic Report</DialogTitle>
        </DialogHeader>

        {isLoading && <Skeleton className="h-48 w-full" />}
        {isError && <ErrorState message="Report isn't ready yet." onRetry={() => refetch()} />}

        {report && (
          <div id="lab-report-print" className="space-y-4 rounded-lg border border-slate-200/80 p-5">
            <div className="flex items-start justify-between border-b border-slate-200/80 pb-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">HMS Portal — Laboratory Report</p>
                <p className="text-xs text-muted-foreground">Generated {format(new Date(), "MMM d, yyyy h:mm a")}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-muted-foreground">Patient</p><p className="font-medium text-slate-900">{report.patientName}</p></div>
              <div><p className="text-xs text-muted-foreground">Ordered by</p><p className="font-medium text-slate-900">{report.orderedByName}</p></div>
              <div><p className="text-xs text-muted-foreground">Test</p><p className="font-medium text-slate-900">{report.testName}</p></div>
              <div><p className="text-xs text-muted-foreground">Type</p><p className="font-medium text-slate-900">{report.testType}</p></div>
              <div><p className="text-xs text-muted-foreground">Ordered</p><p className="text-slate-900">{format(parseISO(report.orderedDate), "MMM d, yyyy")}</p></div>
              <div><p className="text-xs text-muted-foreground">Completed</p><p className="text-slate-900">{report.completedDate ? format(parseISO(report.completedDate), "MMM d, yyyy") : "—"}</p></div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Result</p>
              <p className="mt-1 text-sm text-slate-900">{report.result}</p>
            </div>
            {report.referenceRange && (
              <div>
                <p className="text-xs text-muted-foreground">Reference range</p>
                <p className="mt-1 text-sm text-slate-900">{report.referenceRange}</p>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="print:hidden">
          <Button variant="outline" onClick={() => window.print()} disabled={!report}>
            <PrinterIcon className="size-4" /> Print / Save PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
