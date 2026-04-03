import { createServiceClient } from "@/lib/supabase";
import type { Client } from "@/lib/types";
import NewDocumentForm from "@/components/admin/NewDocumentForm";

async function getClients(): Promise<Pick<Client, "id" | "name" | "business_name">[]> {
  const db = createServiceClient();
  const { data } = await db
    .from("clients")
    .select("id, name, business_name")
    .eq("status", "active")
    .order("name");
  return data ?? [];
}

export default async function NewDocumentPage() {
  const clients = await getClients();
  return (
    <div className="px-6 py-8 max-w-2xl">
      <h1
        className="text-2xl text-[#1A1A1A] mb-1"
        style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
      >
        New Document
      </h1>
      <p className="text-sm text-[#7A7875] mb-8">
        Push a document to a client.
      </p>
      <NewDocumentForm clients={clients} />
    </div>
  );
}
