"use client";

import { useState } from "react";
import { toast } from "sonner";
import { format, parseISO, differenceInCalendarDays } from "date-fns";
import { PlusIcon, PillIcon, PencilIcon, Trash2Icon, PackageMinusIcon } from "lucide-react";
import {
  usePharmacyInventory, useLowStock, useExpiringInventory, useDeletePharmacyItem,
} from "@/lib/hooks/use-pharmacy";
import { notifyError } from "@/lib/error-utils";
import { currencyFormatter } from "@/lib/constants";
import type { PharmacyInventoryResponse } from "@/lib/types/api";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PharmacyItemFormDialog } from "@/components/pharmacy/pharmacy-item-form-dialog";
import { DispenseDialog } from "@/components/pharmacy/dispense-dialog";

function InventoryTable({
  items,
  onEdit,
  onDispense,
  onDelete,
}: {
  items: PharmacyInventoryResponse[];
  onEdit: (item: PharmacyInventoryResponse) => void;
  onDispense: (item: PharmacyInventoryResponse) => void;
  onDelete: (item: PharmacyInventoryResponse) => void;
}) {
  if (items.length === 0) {
    return <EmptyState icon={PillIcon} title="Nothing here" description="No items match this filter." />;
  }
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Medicine</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Unit Price</TableHead>
            <TableHead>Expiry</TableHead>
            <TableHead>Batch</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const daysToExpiry = differenceInCalendarDays(parseISO(item.expiryDate), new Date());
            return (
              <TableRow key={item.id} className={item.lowStock ? "bg-warning-bg/30" : undefined}>
                <TableCell className="font-medium text-slate-900">{item.medicineName}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell className="tabular-nums">
                  {item.quantity}
                  {item.lowStock && <Badge variant="warning" className="ml-2">Low</Badge>}
                </TableCell>
                <TableCell className="tabular-nums">{currencyFormatter.format(item.unitPrice)}</TableCell>
                <TableCell>
                  {format(parseISO(item.expiryDate), "MMM d, yyyy")}
                  {daysToExpiry <= 30 && <Badge variant="critical" className="ml-2">{daysToExpiry}d</Badge>}
                </TableCell>
                <TableCell>{item.batchNumber ?? "—"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onDispense(item)}>
                      <PackageMinusIcon className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                      <PencilIcon className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(item)}>
                      <Trash2Icon className="size-4 text-critical-fg" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default function PharmacyPage() {
  const allItems = usePharmacyInventory();
  const lowStock = useLowStock();
  const expiring = useExpiringInventory(30);
  const deleteItem = useDeletePharmacyItem();

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PharmacyInventoryResponse | undefined>();
  const [dispenseItem, setDispenseItem] = useState<PharmacyInventoryResponse | null>(null);

  const handleDelete = async (item: PharmacyInventoryResponse) => {
    if (!confirm(`Remove ${item.medicineName} from inventory?`)) return;
    try {
      await deleteItem.mutateAsync(item.id);
      toast.success("Inventory item removed");
    } catch (error) {
      notifyError(error);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pharmacy"
        description="Track inventory, dispense stock, and monitor expiry."
        actions={
          <Button onClick={() => { setEditingItem(undefined); setFormOpen(true); }}>
            <PlusIcon className="size-4" /> Add Stock
          </Button>
        }
      />

      {allItems.isLoading && <TableSkeleton rows={6} cols={7} />}
      {allItems.isError && <ErrorState onRetry={() => allItems.refetch()} />}

      {!allItems.isLoading && !allItems.isError && (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="low-stock">Low Stock {lowStock.data?.length ? `(${lowStock.data.length})` : ""}</TabsTrigger>
            <TabsTrigger value="expiring">Expiring Soon {expiring.data?.length ? `(${expiring.data.length})` : ""}</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <InventoryTable
              items={allItems.data ?? []}
              onEdit={(item) => { setEditingItem(item); setFormOpen(true); }}
              onDispense={setDispenseItem}
              onDelete={handleDelete}
            />
          </TabsContent>
          <TabsContent value="low-stock">
            <InventoryTable
              items={lowStock.data ?? []}
              onEdit={(item) => { setEditingItem(item); setFormOpen(true); }}
              onDispense={setDispenseItem}
              onDelete={handleDelete}
            />
          </TabsContent>
          <TabsContent value="expiring">
            <InventoryTable
              items={expiring.data ?? []}
              onEdit={(item) => { setEditingItem(item); setFormOpen(true); }}
              onDispense={setDispenseItem}
              onDelete={handleDelete}
            />
          </TabsContent>
        </Tabs>
      )}

      <PharmacyItemFormDialog open={formOpen} onOpenChange={setFormOpen} item={editingItem} />
      <DispenseDialog item={dispenseItem} open={!!dispenseItem} onOpenChange={(open) => !open && setDispenseItem(null)} />
    </div>
  );
}
