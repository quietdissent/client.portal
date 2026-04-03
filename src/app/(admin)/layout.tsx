import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, sessionClaims } = await auth();

  if (!userId) redirect("/sign-in");

  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  if (role !== "admin") redirect("/portal/dashboard");

  return (
    <div className="flex h-screen bg-[#F5F4EF] overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
