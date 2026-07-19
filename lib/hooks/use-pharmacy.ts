import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pharmacyApi } from "@/lib/api/pharmacy";
import type { PharmacyInventoryRequest } from "@/lib/types/api";

export function usePharmacyInventory() {
  return useQuery({ queryKey: ["pharmacy-inventory"], queryFn: pharmacyApi.list });
}

export function useLowStock() {
  return useQuery({ queryKey: ["pharmacy-inventory", "low-stock"], queryFn: pharmacyApi.lowStock });
}

export function useExpiringInventory(days = 30) {
  return useQuery({ queryKey: ["pharmacy-inventory", "expiring", days], queryFn: () => pharmacyApi.expiring(days) });
}

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["pharmacy-inventory"] });
}

export function useCreatePharmacyItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: PharmacyInventoryRequest) => pharmacyApi.create(body),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useUpdatePharmacyItem(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: PharmacyInventoryRequest) => pharmacyApi.update(id, body),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useDispensePharmacyItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) => pharmacyApi.dispense(id, quantity),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useDeletePharmacyItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => pharmacyApi.remove(id),
    onSuccess: () => invalidateAll(queryClient),
  });
}
