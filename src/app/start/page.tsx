import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

// Where Clerk lands users after sign-in: admins go straight to the console.
export const dynamic = "force-dynamic";

export default async function StartPage() {
  const { isAdmin } = await getSession();
  redirect(isAdmin ? "/admin" : "/dashboard");
}
