"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  AUTH_PASSWORD_MAX_LENGTH,
  AUTH_PASSWORD_MIN_LENGTH,
} from "@/common/constants/shared/auth";
import { getErrorMessage } from "@/common/http";
import { login } from "@/common/rest-api-calls/application/accounts";
import userStore from "@/common/stores/application/user-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { queryClient } from "@/lib/query-client";
import { queries } from "@/lib/queries";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(
      AUTH_PASSWORD_MIN_LENGTH,
      `Password must be at least ${AUTH_PASSWORD_MIN_LENGTH} characters`,
    )
    .max(
      AUTH_PASSWORD_MAX_LENGTH,
      `Password must be at most ${AUTH_PASSWORD_MAX_LENGTH} characters`,
    ),
});

type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * Email + password login form.
 */
export function LoginForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      userStore.update.user(data.user);
      queryClient.setQueryData(queries.users.me.queryKey, data.user);
      router.push("/dashboard");
    },
    onError: (error) => {
      setFormError(getErrorMessage(error, "Invalid email or password"));
    },
  });

  /**
   * Submits credentials to POST /api/users/login.
   */
  const onSubmit = form.handleSubmit((values) => {
    setFormError(null);
    mutation.mutate(values);
  });

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>Sign in with your email and password</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit}>
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.email || undefined}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                autoComplete="email"
                {...form.register("email")}
              />
              <FieldError errors={[form.formState.errors.email]} />
            </Field>
            <Field data-invalid={!!form.formState.errors.password || undefined}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...form.register("password")}
              />
              <FieldError errors={[form.formState.errors.password]} />
            </Field>
            {formError ? <FieldError>{formError}</FieldError> : null}
            <Field>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Signing in…" : "Login"}
              </Button>
              <FieldDescription className="text-center">
                Don&apos;t have an account?{" "}
                <Link href="/signup">Sign up</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
