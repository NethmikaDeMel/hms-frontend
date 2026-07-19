"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckIcon, ChevronsUpDownIcon, UserIcon } from "lucide-react";
import { patientsApi } from "@/lib/api/patients";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";

export function PatientCombobox({
  value,
  onChange,
}: {
  value?: number;
  onChange: (patientId: number, label: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [selectedLabel, setSelectedLabel] = useState<string | undefined>();

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const { data: patients, isFetching } = useQuery({
    queryKey: ["patients", "search", debounced],
    queryFn: () => patientsApi.search(debounced),
    enabled: debounced.trim().length > 1,
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between font-normal">
          <span className={selectedLabel ? "truncate" : "truncate text-muted-foreground"}>
            {selectedLabel ?? "Search patient by name or phone…"}
          </span>
          <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Type a name or phone…" value={query} onValueChange={setQuery} />
          <CommandList>
            {debounced.trim().length <= 1 && <CommandEmpty>Type at least 2 characters…</CommandEmpty>}
            {debounced.trim().length > 1 && !isFetching && (patients?.length ?? 0) === 0 && (
              <CommandEmpty>No patients found.</CommandEmpty>
            )}
            <CommandGroup>
              {patients?.map((patient) => (
                <CommandItem
                  key={patient.id}
                  value={String(patient.id)}
                  onSelect={() => {
                    onChange(patient.id, patient.fullName);
                    setSelectedLabel(patient.fullName);
                    setOpen(false);
                  }}
                >
                  <UserIcon className="size-4 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate">{patient.fullName}</p>
                    <p className="truncate text-xs text-muted-foreground">{patient.phone}</p>
                  </div>
                  {value === patient.id && <CheckIcon className="size-4 shrink-0" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
