"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SearchIcon, UserIcon } from "lucide-react";
import { patientsApi } from "@/lib/api/patients";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const { data: patients, isFetching } = useQuery({
    queryKey: ["global-search", "patients", debounced],
    queryFn: () => patientsApi.search(debounced),
    enabled: debounced.trim().length > 1,
  });

  const goToPatient = (id: number) => {
    setOpen(false);
    setQuery("");
    router.push(`/patients/${id}`);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full max-w-md items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-sm text-muted-foreground shadow-xs transition hover:border-slate-300"
      >
        <SearchIcon className="size-4 shrink-0" />
        <span className="truncate">Search patients, invoices, lab orders…</span>
        <kbd className="ml-auto hidden shrink-0 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 sm:inline-block">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search patients, invoices, lab orders…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {debounced.trim().length <= 1 && (
            <CommandEmpty>Type at least 2 characters to search patients…</CommandEmpty>
          )}
          {debounced.trim().length > 1 && !isFetching && (patients?.length ?? 0) === 0 && (
            <CommandEmpty>No patients found for &ldquo;{debounced}&rdquo;.</CommandEmpty>
          )}
          {(patients?.length ?? 0) > 0 && (
            <CommandGroup heading="Patients">
              {patients!.map((patient) => (
                <CommandItem key={patient.id} onSelect={() => goToPatient(patient.id)} value={patient.fullName}>
                  <UserIcon />
                  <span>{patient.fullName}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{patient.phone}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
