import { createServiceClient } from "@/lib/supabase";
import type { Client } from "@/lib/types";
import { ENGAGEMENT_LABELS, STATUS_LABELS } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import InviteClientButton from "@/components/admin/InviteClientButton";

async function getClients(): Promise<Client[]> {
  const db = createServiceClient();
  const { data } = await db
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as Client[]) ?? [];
}

async function getUnreadCounts(
  clientIds: string[]
): Promise<Record<string, number>> {
  if (clientIds.length === 0) return {};
  const db = createServiceClient();
  const { data } = await db
    .from("messages")
    .select("client_id")
    .in("client_id", clientIds)
    .eq("read_by_admin", false)
    .eq("sender_role", "client");

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.client_id] = (counts[row.client_id] ?? 0) + 1;
  }
  return counts;
}

export default async function AdminClientsPage() {
  const clients = await getClients();
  const unreadCounts = await getUnreadCounts(clients.map((c) => c.id));

  return (
    <div className="px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-2xl text-[#1A1A1A]"
            style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
          >
            Clients
          </h1>
          <p className="text-sm text-[#7A7875] mt-0.5">
            {clients.length} {clients.length === 1 ? "client" : "clients"}
          </p>
        </div>
        <InviteClientButton />
      </div>

      {/* Table */}
      {clients.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-[#D8D6D1] rounded-md">
          <p className="text-[#7A7875] text-sm">No clients yet. Invite your first client.</p>
        </div>
      ) : (
        <div className="border border-[#D8D6D1] rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#D8D6D1] bg-[#EDECEA]">
                {["Client", "Business", "Engagement", "Status", "Unread"].map(
                  (col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-xs font-medium text-[#7A7875] uppercase tracking-wider"
                      style={{ fontFamily: "var(--font-dm-mono), monospace" }}
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {clients.map((client, i) => {
                const unread = unreadCounts[client.id] ?? 0;
                return (
                  <tr
                    key={client.id}
                    className={`border-b border-[#D8D6D1] last:border-0 hover:bg-[#EDECEA] transition-colors ${
                      i % 2 === 0 ? "bg-[#F5F4EF]" : "bg-[#F8F7F3]"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="font-medium text-[#1A1A1A] hover:text-[#5F8575] transition-colors"
                      >
                        {client.name}
                      </Link>
                      <p
                        className="text-xs text-[#7A7875]"
                        style={{ fontFamily: "var(--font-dm-mono), monospace" }}
                      >
                        {client.email}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-[#4A4A4A]">
                      {client.business_name ?? (
                        <span className="text-[#7A7875]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {client.engagement_type ? (
                        <Badge variant="muted">
                          {ENGAGEMENT_LABELS[client.engagement_type]}
                        </Badge>
                      ) : (
                        <span className="text-[#7A7875]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
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
                    </td>
                    <td className="px-4 py-3">
                      {unread > 0 ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#5F8575] text-white text-[10px] font-bold">
                          {unread}
                        </span>
                      ) : (
                        <span className="text-[#D8D6D1]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
