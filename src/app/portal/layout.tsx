import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/portal/Sidebar";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) redirect("/sign-in");

  const role = (user.publicMetadata as { role?: string })?.role;
  if (role === "admin") redirect("/admin/clients");

  return (
    <div className="flex h-screen bg-[#F5F4EF] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {children}
      </main>
    </div>
  );
}
