import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/portal/Sidebar";
import { OnboardingGate } from "@/components/portal/OnboardingGate";
import { createServiceClient } from "@/lib/supabase";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) redirect("/sign-in");

  const role = (user.publicMetadata as { role?: string })?.role;
  if (role === "admin") redirect("/admin/clients");

  const db = createServiceClient();

  const { data: clientRow } = await db
    .from("clients")
    .select("id")
    .eq("clerk_user_id", user.id)
    .single();

  let onboardingGate: React.ReactNode = null;

  if (clientRow) {
    const [{ data: agreementDoc }, { data: welcomeDoc }] = await Promise.all([
      db
        .from("documents")
        .select("id, html_content, is_signed")
        .eq("client_id", clientRow.id)
        .eq("type", "agreement")
        .eq("visibility", "client")
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
      db
        .from("documents")
        .select("html_content")
        .eq("client_id", clientRow.id)
        .eq("type", "welcome")
        .eq("visibility", "client")
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
    ]);

    if (agreementDoc) {
      onboardingGate = (
        <OnboardingGate
          welcomeHtml={welcomeDoc?.html_content ?? ""}
          agreementHtml={agreementDoc.html_content ?? ""}
          agreementDocId={agreementDoc.id}
          agreementSigned={agreementDoc.is_signed}
          clientId={clientRow.id}
        />
      );
    }
  }

  return (
    <div className="flex h-screen bg-[#F5F4EF] overflow-hidden">
      {onboardingGate}
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {children}
      </main>
    </div>
  );
}
