import { AuthPageShell } from "@/modules/Auth/AuthPageShell";
import { LoginForm } from "@/modules/Auth/LoginForm";

/**
 * Public login page.
 */
export default function LoginPage() {
  return (
    <AuthPageShell title="Login">
      <LoginForm />
    </AuthPageShell>
  );
}
