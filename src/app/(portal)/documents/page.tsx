import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";
import { Badge } from "@/components/ui/Badge";
import type { Document } from "@/lib/types";
import DocumentViewer from "@/components/portal/DocumentViewer";

const TYPE_LABELS: Record<string, string> = {
  welcome: "Welcome",
  agreement: "Agreement",
  deliverable: "Deliverable",
  invoice: "Invoice",
  resource: "Resource",
  tax: "Tax",
  other: "Document",
};

async function getDocuments(clerkUserId: string): Promise<Document[]> {
  const db = createServiceClient();
  const { data: client } = await db
    .from("clients")
    .select("id")
    .eq("clerk_user_id", clerkUserId)
    .single();

  if (!client) return [];

  const { data } = await db
    .from("documents")
    .select("*")
    .eq("client_id", client.id)
    .eq("visibility", "client")
    .order("created_at", { ascending: false });

  return (data as Document[]) ?? [];
}

export default async function DocumentsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const documents = await getDocuments(userId);

  return (
    <div className="px-6 py-8 max-w-3xl">
      <h1
        className="text-2xl text-[#1A1A1A] mb-1"
        style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
      >
        Documents
      </h1>
      <p className="text-sm text-[#7A7875] mb-8">
        All files and resources shared with you.
      </p>

      {documents.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-[#D8D6D1] rounded-md">
          <p className="text-[#7A7875] text-sm">No documents yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <DocumentViewer key={doc.id} document={doc} typeLabel={TYPE_LABELS[doc.type ?? "other"] ?? "Document"} />
          ))}
        </div>
      )}
    </div>
  );
}
