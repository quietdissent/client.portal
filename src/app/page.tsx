import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// Role-based redirect entry point. Using currentUser() instead of sessionClaims
// because publicMetadata is not included in Clerk's JWT by default — it requires
// a custom session token template. currentUser() fetches the full user object
// via the Clerk API and always has publicMetadata.
export default async function RootPage() {
  const user = await currentUser();

  if (!user) redirect("/sign-in");

  const role = (user.publicMetadata as { role?: string })?.role;
  redirect(role === "admin" ? "/admin/clients" : "/portal/dashboard");
}
