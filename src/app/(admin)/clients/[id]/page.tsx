import { createServiceClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import type { Client, Document, Message, Event } from "@/lib/types";
import { ENGAGEMENT_LABELS, STATUS_LABELS } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import ClientDetailTabs from "@/components/admin/ClientDetailTabs";

type Params = { params: Promise<{ id: string }> };

async function getData(id: string) {
  const db = createServiceClient();

  const [clientResult, docsResult, msgsResult, eventsResult] = await Promise.all([
    db.from("clients").select("*").eq("id", id).single<Client>(),
    db
      .from("documents")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
    db
      .from("messages")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: true }),
    db
      .from("events")
      .select("*")
      .eq("client_id", id)
      .order("scheduled_at", { ascending: true }),
  ]);

  if (!clientResult.data) return null;

  return {
    client: clientResult.data,
    documents: (docsResult.data as Document[]) ?? [],
    messages: (msgsResult.data as Message[]) ?? [],
    events: (eventsResult.data as Event[]) ?? [],
  };
}

export default async function ClientDetailPage({ params }: Params) {
  const { id } = await params;
  const data = await getData(id);
  if (!data) notFound();

  const { client } = data;

  return (
    <div className="flex flex-col h-full">
      {/* Client header */}
      <div className="px-6 py-6 border-b border-[#D8D6D1] bg-[#F5F4EF]">
        <div className="flex items-start justify-between">
          <div>
            <h1
              className="text-2xl text-[#1A1A1A]"
              style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
            >
              {client.name}
            </h1>
            {client.business_name && (
              <p className="text-sm text-[#4A4A4A] mt-0.5">{client.business_name}</p>
            )}
            <p
              className="text-xs text-[#7A7875] mt-1"
              style={{ fontFamily: "var(--font-dm-mono), monospace" }}
            >
              {client.email}
              {client.phone && ` · ${client.phone}`}
            </p>
          </div>
          <div className="flex gap-2">
            {client.engagement_type && (
              <Badge variant="muted">
                {ENGAGEMENT_LABELS[client.engagement_type]}
              </Badge>
            )}
            <Badge
              variant={
                client.status === "active"
                  ? "accent"
                  : client.status === "paused"
                  ? "warning"
                  : "muted"
              }
            >
              {STATUS_LABELS[client.status]}
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ClientDetailTabs
        client={client}
        initialDocuments={data.documents}
        initialMessages={data.messages}
        initialEvents={data.events}
      />
    </div>
  );
}
