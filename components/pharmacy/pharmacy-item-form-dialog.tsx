"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { LoaderCircleIcon } from "lucide-react";
import { useCreatePharmacyItem, useUpdatePharmacyItem } from "@/lib/hooks/use-pharmacy";
import { applyApiErrorToForm } from "@/lib/error-utils";
import type { PharmacyInventoryResponse } from "@/lib/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const numeric = (message: string, opts?: { positive?: boolean; nonNegative?: boolean }) =>
  z.string().min(1, message).refine((v) => {
    const n = Number(v);
    if (isNaN(n)) return false;
    if (opts?.positive) return n > 0;
    if (opts?.nonNegative) return n >= 0;
    return true;
  }, { message: `Must be a valid ${opts?.positive ? "positive " : ""}number` });

const schema = z.object({
  medicineName: z.string().min(1, "Medicine name is required").max(150),
  category: z.string().min(1, "Category is required").max(100),
  manufacturer: z.string().max(150).optional(),
  quantity: numeric("Quantity is required", { nonNegative: true }),
  unitPrice: numeric("Unit price is required", { positive: true }),
  reorderLevel: numeric("Reorder level is required", { nonNegative: true }),
  expiryDate: z.string().min(1, "Expiry date is required"),
  supplier: z.string().max(150).optional(),
  batchNumber: z.string().max(50).optional(),
});
type FormValues = z.infer<typeof schema>;

function toFormValues(item?: PharmacyInventoryResponse): FormValues {
  if (!item) {
    return {
      medicineName: "", category: "", manufacturer: "", quantity: "", unitPrice: "",
      reorderLevel: "", expiryDate: "", supplier: "", batchNumber: "",
    };
  }
  return {
    medicineName: item.medicineName,
    category: item.category,
    manufacturer: item.manufacturer ?? "",
    quantity: String(item.quantity),
    unitPrice: String(item.unitPrice),
    reorderLevel: String(item.reorderLevel),
    expiryDate: item.expiryDate,
    supplier: item.supplier ?? "",
    batchNumber: item.batchNumber ?? "",
  };
}

export function PharmacyItemFormDialog({
  open,
  onOpenChange,
  item,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: PharmacyInventoryResponse;
}) {
  const isEdit = !!item;
  const createMutation = useCreatePharmacyItem();
  const updateMutation = useUpdatePharmacyItem(item?.id ?? 0);
  const mutation = isEdit ? updateMutation : createMutation;

  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: toFormValues(item) });

  useEffect(() => {
    if (open) form.reset(toFormValues(item));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item]);

  const onSubmit = async (values: FormValues) => {
    try {
      await mutation.mutateAsync({
        medicineName: values.medicineName,
        category: values.category,
        manufacturer: values.manufacturer || undefined,
        quantity: Number(values.quantity),
        unitPrice: Number(values.unitPrice),
        reorderLevel: Number(values.reorderLevel),
        expiryDate: values.expiryDate,
        supplier: values.supplier || undefined,
        batchNumber: values.batchNumber || undefined,
      });
      toast.success(isEdit ? "Inventory item updated" : "Stock added");
      onOpenChange(false);
    } catch (error) {
      applyApiErrorToForm(error, form.setError);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Inventory Item" : "Add Stock"}</DialogTitle>
          <DialogDescription>{isEdit ? "Update this medicine's inventory record." : "Add a new medicine batch to inventory."}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="medicineName" render={({ field }) => (
                <FormItem><FormLabel>Medicine name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem><FormLabel>Category</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="manufacturer" render={({ field }) => (
              <FormItem><FormLabel>Manufacturer (optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="quantity" render={({ field }) => (
                <FormItem><FormLabel>Quantity</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="unitPrice" render={({ field }) => (
                <FormItem><FormLabel>Unit price</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="reorderLevel" render={({ field }) => (
                <FormItem><FormLabel>Reorder level</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="expiryDate" render={({ field }) => (
                <FormItem><FormLabel>Expiry date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="batchNumber" render={({ field }) => (
                <FormItem><FormLabel>Batch number (optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="supplier" render={({ field }) => (
              <FormItem><FormLabel>Supplier (optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <LoaderCircleIcon className="size-4 animate-spin" />}
                {isEdit ? "Save changes" : "Add Stock"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
