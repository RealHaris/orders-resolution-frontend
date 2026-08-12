import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ACCESS_TOKEN_COOKIE } from "@/common/constants/shared/constants";

/**
 * Root route: send signed-in users to the dashboard, everyone else to login.
 */
export default async function Home() {
  const cookieStore = await cookies();
  if (cookieStore.has(ACCESS_TOKEN_COOKIE)) {
    redirect("/orders");
  }
  redirect("/login");
}
