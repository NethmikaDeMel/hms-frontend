"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { LoaderCircleIcon } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/hooks/use-auth-store";
import { ApiError } from "@/lib/types/api";
import { LogoMark } from "@/components/shared/logo-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
type LoginFormValues = z.infer<typeof loginSchema>;

const REASON_MESSAGES: Record<string, string> = {
  timeout: "You were signed out after a period of inactivity.",
  expired: "Your session has expired. Please sign in again.",
  unauthenticated: "Please sign in to continue.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((s) => s.setSession);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [submitting, setSubmitting] = useState(false);

  const reason = searchParams.get("reason");

  useEffect(() => {
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, router]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitting(true);
    try {
      const login = await authApi.login(values);
      await setSession(login);
      toast.success(`Welcome back, ${login.fullName.split(" ")[0]}`);
      const from = searchParams.get("from");
      router.push(from && from !== "/login" ? from : "/dashboard");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        form.setError("password", { type: "server", message: "Incorrect username or password." });
      } else {
        toast.error("Sign in failed", {
          description: error instanceof ApiError ? error.message : "Something went wrong.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <LogoMark className="size-12" />
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">HMS Portal</h1>
            <p className="text-sm text-muted-foreground">Sign in to your hospital workspace</p>
          </div>
        </div>

        {reason && REASON_MESSAGES[reason] && (
          <div className="rounded-lg border border-info-border bg-info-bg px-4 py-3 text-sm text-info-fg">
            {REASON_MESSAGES[reason]}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Enter your credentials to continue.</CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input autoComplete="username" autoFocus placeholder="e.g. dr.perera" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="current-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting && <LoaderCircleIcon className="size-4 animate-spin" />}
                  Sign in
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
