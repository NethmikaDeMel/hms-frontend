"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { FileTextIcon, LoaderCircleIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { patientDocumentsApi } from "@/lib/api/patients";
import { applyApiErrorToForm, notifyError } from "@/lib/error-utils";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";

const DOC_TYPES = ["LAB_REPORT", "PRESCRIPTION", "INSURANCE", "IMAGING", "EXTERNAL_MEDICAL_REPORT", "OTHER"] as const;

const docSchema = z.object({
  documentName: z.string().min(1, "Document name is required").max(200),
  documentType: z.enum(DOC_TYPES),
  fileUrl: z.string().min(1, "File URL is required").max(500),
  notes: z.string().max(500).optional(),
});
type DocFormValues = z.infer<typeof docSchema>;

export function PatientDocumentsTab({ patientId }: { patientId: number }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["patient-documents", patientId],
    queryFn: () => patientDocumentsApi.forPatient(patientId),
  });

  const form = useForm<DocFormValues>({
    resolver: zodResolver(docSchema),
    defaultValues: { documentName: "", documentType: "OTHER", fileUrl: "", notes: "" },
  });

  const createMutation = useMutation({
    mutationFn: (values: DocFormValues) => patientDocumentsApi.create({ patientId, ...values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-documents", patientId] });
      toast.success("Document linked");
      setDialogOpen(false);
      form.reset();
    },
    onError: (error) => applyApiErrorToForm(error, form.setError),
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => patientDocumentsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-documents", patientId] });
      toast.success("Document removed");
    },
    onError: (error) => notifyError(error),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <PlusIcon className="size-4" /> Link Document
        </Button>
      </div>

      {isLoading && <TableSkeleton rows={3} cols={1} />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && (data?.length ?? 0) === 0 && (
        <EmptyState icon={FileTextIcon} title="No documents linked" description="Lab reports, prescriptions, and external records will appear here." />
      )}

      {!isLoading && (data?.length ?? 0) > 0 && (
        <ul className="space-y-2">
          {data!.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200/80 bg-white p-3 shadow-xs">
              <div className="flex min-w-0 items-center gap-3">
                <FileTextIcon className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="truncate text-sm font-medium text-primary hover:underline">
                    {doc.documentName}
                  </a>
                  <p className="text-xs text-muted-foreground">{format(parseISO(doc.uploadedAt), "MMM d, yyyy")}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant="outline">{doc.documentType.replaceAll("_", " ")}</Badge>
                <Button variant="ghost" size="icon" onClick={() => removeMutation.mutate(doc.id)}>
                  <Trash2Icon className="size-4 text-critical-fg" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Document</DialogTitle>
            <DialogDescription>
              Paste a URL to the file (e.g. from your storage provider). File upload isn&apos;t wired to storage in this build — see FRONTEND_TODO.md.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => createMutation.mutate(v))} className="space-y-4">
              <FormField control={form.control} name="documentName" render={({ field }) => (
                <FormItem><FormLabel>Document name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="documentType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {DOC_TYPES.map((t) => <SelectItem key={t} value={t}>{t.replaceAll("_", " ")}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="fileUrl" render={({ field }) => (
                <FormItem><FormLabel>File URL</FormLabel><FormControl><Input placeholder="https://…" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <LoaderCircleIcon className="size-4 animate-spin" />}
                  Link Document
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
