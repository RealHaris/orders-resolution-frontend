import { AuthPageShell } from "@/modules/Auth/AuthPageShell";
import { SignupForm } from "@/modules/Auth/SignupForm";

/**
 * Public signup page.
 */
export default function SignupPage() {
  return (
    <AuthPageShell title="Sign up">
      <SignupForm />
    </AuthPageShell>
  );
}
