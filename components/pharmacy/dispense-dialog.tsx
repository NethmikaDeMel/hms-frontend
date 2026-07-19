"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { LoaderCircleIcon } from "lucide-react";
import { useDispensePharmacyItem } from "@/lib/hooks/use-pharmacy";
import { applyApiErrorToForm } from "@/lib/error-utils";
import type { PharmacyInventoryResponse } from "@/lib/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const schema = z.object({
  quantity: z.string().min(1, "Quantity is required").refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
    message: "Must be a positive number",
  }),
});
type FormValues = z.infer<typeof schema>;

export function DispenseDialog({
  item,
  open,
  onOpenChange,
}: {
  item: PharmacyInventoryResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const dispense = useDispensePharmacyItem();
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { quantity: "" } });

  if (!item) return null;

  const onSubmit = async (values: FormValues) => {
    try {
      await dispense.mutateAsync({ id: item.id, quantity: Number(values.quantity) });
      toast.success(`Dispensed ${values.quantity} unit(s) of ${item.medicineName}`);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      applyApiErrorToForm(error, form.setError);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dispense — {item.medicineName}</DialogTitle>
          <DialogDescription>{item.quantity} unit(s) currently in stock.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="quantity" render={({ field }) => (
              <FormItem><FormLabel>Quantity to dispense</FormLabel><FormControl><Input type="number" autoFocus {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <DialogFooter>
              <Button type="submit" disabled={dispense.isPending}>
                {dispense.isPending && <LoaderCircleIcon className="size-4 animate-spin" />}
                Confirm Dispense
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
