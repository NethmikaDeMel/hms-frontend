"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeftIcon, LoaderCircleIcon } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { notifyError } from "@/lib/error-utils";
import { LogoMark } from "@/components/shared/logo-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const schema = z.object({ email: z.string().email("Enter a valid email") });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  const onSubmit = async (values: FormValues) => {
    try {
      await authApi.requestPasswordReset(values.email);
      setSubmitted(true);
    } catch (error) {
      notifyError(error, "Request failed");
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <LogoMark className="size-12" />
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Reset your password</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Forgot password</CardTitle>
            <CardDescription>We&apos;ll send reset instructions if the account exists.</CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            {submitted ? (
              <p className="text-sm text-muted-foreground">
                If an account exists for that email, reset instructions have been sent.
              </p>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" autoFocus {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <LoaderCircleIcon className="size-4 animate-spin" />}
                    Send reset instructions
                  </Button>
                </form>
              </Form>
            )}
            <Link href="/login" className="mt-4 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-slate-900">
              <ArrowLeftIcon className="size-3.5" /> Back to login
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
