"use client";

import { useState } from "react";
import { CheckIcon, ChevronsUpDownIcon, StethoscopeIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDoctors } from "@/lib/hooks/use-doctors";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";

export function DoctorCombobox({
  value,
  onChange,
}: {
  value?: number;
  onChange: (doctorUserId: number, label: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const { data: doctors, isLoading } = useDoctors();
  const selected = doctors?.find((d) => d.userId === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between font-normal">
          {selected ? (
            <span className="flex items-center gap-2 truncate">
              <span className={cn("size-2 rounded-full", selected.availableForBooking ? "bg-success" : "bg-slate-300")} />
              Dr. {selected.fullName}
              <span className="text-xs text-muted-foreground">· {selected.departmentName}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">{isLoading ? "Loading doctors…" : "Select a doctor"}</span>
          )}
          <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search doctors…" />
          <CommandList>
            <CommandEmpty>No doctors found.</CommandEmpty>
            <CommandGroup>
              {doctors?.map((doctor) => (
                <CommandItem
                  key={doctor.id}
                  value={`${doctor.fullName} ${doctor.departmentName}`}
                  onSelect={() => {
                    onChange(doctor.userId, doctor.fullName);
                    setOpen(false);
                  }}
                >
                  <StethoscopeIcon className="size-4 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate">Dr. {doctor.fullName}</p>
                    <p className="truncate text-xs text-muted-foreground">{doctor.departmentName}</p>
                  </div>
                  <span className={cn("size-2 shrink-0 rounded-full", doctor.availableForBooking ? "bg-success" : "bg-slate-300")} />
                  {value === doctor.userId && <CheckIcon className="size-4 shrink-0" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
