// Root page — middleware handles role-based redirect to /admin/clients or /portal/dashboard
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/sign-in");
}
