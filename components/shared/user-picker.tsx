"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { LoaderCircleIcon } from "lucide-react";
import { useUsers, useCreateUser, useRoles } from "@/lib/hooks/use-reference-data";
import { applyApiErrorToForm } from "@/lib/error-utils";
import type { UserResponse } from "@/lib/types/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2Icon } from "lucide-react";

const newUserSchema = z.object({
  username: z.string().min(4, "At least 4 characters").max(100),
  password: z.string().min(8, "At least 8 characters"),
  email: z.string().email("Enter a valid email"),
  fullName: z.string().min(1, "Full name is required").max(150),
  phone: z.string().regex(/^\+?[0-9]{7,15}$/, "Enter 7-15 digits").optional().or(z.literal("")),
  specialization: z.string().max(100).optional(),
});
type NewUserValues = z.infer<typeof newUserSchema>;

export function UserPicker({
  roleFilter,
  excludeUserIds = [],
  selectedUser,
  onSelect,
}: {
  roleFilter: string;
  excludeUserIds?: number[];
  selectedUser?: UserResponse | null;
  onSelect: (user: UserResponse) => void;
}) {
  const { data: users } = useUsers();
  const { data: roles } = useRoles();
  const createUser = useCreateUser();

  const eligibleExisting = (users ?? []).filter(
    (u) => u.roleName === roleFilter && u.active && !excludeUserIds.includes(u.id)
  );
  const targetRole = roles?.find((r) => r.name === roleFilter);

  const form = useForm<NewUserValues>({
    resolver: zodResolver(newUserSchema),
    defaultValues: { username: "", password: "", email: "", fullName: "", phone: "", specialization: "" },
  });

  const onCreateSubmit = async (values: NewUserValues) => {
    if (!targetRole) {
      toast.error("Role not found", { description: `No '${roleFilter}' role exists yet. Create it under Admin Settings first.` });
      return;
    }
    try {
      const user = await createUser.mutateAsync({
        username: values.username,
        password: values.password,
        email: values.email,
        fullName: values.fullName,
        phone: values.phone || undefined,
        specialization: values.specialization || undefined,
        roleId: targetRole.id,
      });
      toast.success("User account created");
      onSelect(user);
      form.reset();
    } catch (error) {
      applyApiErrorToForm(error, form.setError);
    }
  };

  if (selectedUser) {
    return (
      <Card className="border-success-border bg-success-bg/40">
        <CardContent className="flex items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-2">
            <CheckCircle2Icon className="size-4 text-success-fg" />
            <div>
              <p className="text-sm font-medium text-slate-900">{selectedUser.fullName}</p>
              <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
            </div>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => onSelect(undefined as never)}>
            Change
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="existing">
      <TabsList className="w-full">
        <TabsTrigger value="existing" className="flex-1">Select Existing</TabsTrigger>
        <TabsTrigger value="new" className="flex-1">Create New</TabsTrigger>
      </TabsList>

      <TabsContent value="existing" className="pt-3">
        {eligibleExisting.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No available {roleFilter.toLowerCase()} accounts without a profile yet. Create one instead.
          </p>
        ) : (
          <Select onValueChange={(v) => {
            const user = eligibleExisting.find((u) => String(u.id) === v);
            if (user) onSelect(user);
          }}>
            <SelectTrigger><SelectValue placeholder={`Select a ${roleFilter.toLowerCase()} account`} /></SelectTrigger>
            <SelectContent>
              {eligibleExisting.map((user) => (
                <SelectItem key={user.id} value={String(user.id)}>{user.fullName} — {user.email}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </TabsContent>

      <TabsContent value="new" className="pt-3">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="fullName" render={({ field }) => (
                <FormItem><FormLabel>Full name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="username" render={({ field }) => (
                <FormItem><FormLabel>Username</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem><FormLabel>Temporary password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Phone (optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="specialization" render={({ field }) => (
                <FormItem><FormLabel>Specialization (optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <Button type="submit" variant="outline" size="sm" disabled={createUser.isPending}>
              {createUser.isPending && <LoaderCircleIcon className="size-3.5 animate-spin" />}
              Create {roleFilter.charAt(0) + roleFilter.slice(1).toLowerCase()} Account
            </Button>
          </form>
        </Form>
      </TabsContent>
    </Tabs>
  );
}
