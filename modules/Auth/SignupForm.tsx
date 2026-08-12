"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  AUTH_PASSWORD_MAX_LENGTH,
  AUTH_PASSWORD_MIN_LENGTH,
} from "@/common/constants/shared/auth";
import { ACCESS_TOKEN_COOKIE } from "@/common/constants/shared/constants";
import { getErrorMessage } from "@/common/http";
import { signup } from "@/common/rest-api-calls/application/accounts";
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

const signupSchema = z.object({
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

type SignupFormValues = z.infer<typeof signupSchema>;

/**
 * Email + password signup form with password toggle and auto-login after creation.
 */
export function SignupForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      const token = data.token || data.accessToken;
      if (token) {
        document.cookie = `${ACCESS_TOKEN_COOKIE}=${token}; path=/; max-age=2592000; SameSite=Lax`;
      }
      userStore.update.user(data.user);
      queryClient.setQueryData(queries.users.me.queryKey, data.user);
      window.location.href = "/dashboard";
    },
    onError: (error) => {
      setFormError(getErrorMessage(error, "Could not create your account"));
    },
  });

  /**
   * Submits credentials to POST /api/users/signup.
   */
  const onSubmit = form.handleSubmit((values) => {
    setFormError(null);
    mutation.mutate(values);
  });

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Create an account</CardTitle>
        <CardDescription>
          Enter your email and a password to get started
        </CardDescription>
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
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className="pr-10"
                  {...form.register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
              <FieldError errors={[form.formState.errors.password]} />
            </Field>
            {formError ? <FieldError>{formError}</FieldError> : null}
            <Field>
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? "Creating account…" : "Sign up"}
              </Button>
              <FieldDescription className="text-center">
                Already have an account? <Link href="/login">Log in</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
