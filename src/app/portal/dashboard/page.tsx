import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import type { Client, ENGAGEMENT_LABELS } from "@/lib/types";
import { ENGAGEMENT_LABELS as EL } from "@/lib/types";

async function getClientData(clerkUserId: string) {
  const db = createServiceClient();

  const { data: client } = await db
    .from("clients")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .single<Client>();

  if (!client) return null;

  const [docsResult, msgsResult, eventsResult] = await Promise.all([
    db.from("documents").select("id").eq("client_id", client.id).eq("visibility", "client"),
    db
      .from("messages")
      .select("id")
      .eq("client_id", client.id)
      .eq("read_by_client", false)
      .eq("sender_role", "admin"),
    db
      .from("events")
      .select("*")
      .eq("client_id", client.id)
      .eq("status", "scheduled")
      .order("scheduled_at", { ascending: true })
      .limit(1),
  ]);

  return {
    client,
    documentCount: docsResult.data?.length ?? 0,
    unreadCount: msgsResult.data?.length ?? 0,
    nextEvent: eventsResult.data?.[0] ?? null,
  };
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const data = await getClientData(userId);

  if (!data) {
    return (
      <div className="p-8">
        <p className="text-[#7A7875]">
          Your account is being set up. Please check back shortly.
        </p>
      </div>
    );
  }

  const { client, documentCount, unreadCount, nextEvent } = data;

  const formattedDate = nextEvent?.scheduled_at
    ? new Date(nextEvent.scheduled_at).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="px-6 py-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl text-[#1A1A1A] mb-1"
          style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
        >
          Welcome back, {client.name.split(" ")[0]}.
        </h1>
        {client.engagement_type && (
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="accent">
              {EL[client.engagement_type]}
            </Badge>
            <Badge variant={client.status === "active" ? "accent" : "muted"}>
              {client.status}
            </Badge>
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link href="/portal/messages">
          <Card className="hover:border-[#5F8575]/40 transition-colors cursor-pointer">
            <p
              className="text-xs text-[#7A7875] mb-1"
              style={{ fontFamily: "var(--font-dm-mono), monospace" }}
            >
              UNREAD MESSAGES
            </p>
            <p className="text-2xl font-medium text-[#1A1A1A]">{unreadCount}</p>
            {unreadCount > 0 && (
              <p className="text-xs text-[#5F8575] mt-1">New from Bailey</p>
            )}
          </Card>
        </Link>

        <Link href="/portal/documents">
          <Card className="hover:border-[#5F8575]/40 transition-colors cursor-pointer">
            <p
              className="text-xs text-[#7A7875] mb-1"
              style={{ fontFamily: "var(--font-dm-mono), monospace" }}
            >
              DOCUMENTS
            </p>
            <p className="text-2xl font-medium text-[#1A1A1A]">{documentCount}</p>
            <p className="text-xs text-[#7A7875] mt-1">In your portal</p>
          </Card>
        </Link>

        <Link href="/portal/schedule">
          <Card className="hover:border-[#5F8575]/40 transition-colors cursor-pointer">
            <p
              className="text-xs text-[#7A7875] mb-1"
              style={{ fontFamily: "var(--font-dm-mono), monospace" }}
            >
              NEXT CALL
            </p>
            {nextEvent ? (
              <>
                <p className="text-sm font-medium text-[#1A1A1A] leading-snug">
                  {nextEvent.title}
                </p>
                <p className="text-xs text-[#5F8575] mt-1">{formattedDate}</p>
              </>
            ) : (
              <>
                <p className="text-sm text-[#7A7875]">None scheduled</p>
                <p className="text-xs text-[#5F8575] mt-1">Book a call →</p>
              </>
            )}
          </Card>
        </Link>
      </div>

      {/* Quick links */}
      <div className="space-y-2">
        <h2
          className="text-xs text-[#7A7875] uppercase tracking-widest mb-3"
          style={{ fontFamily: "var(--font-dm-mono), monospace" }}
        >
          Your Portal
        </h2>
        {[
          {
            href: "/portal/documents",
            title: "Documents",
            desc: "Review agreements, deliverables, and resources",
          },
          {
            href: "/portal/messages",
            title: "Messages",
            desc: "Communicate directly with Bailey",
          },
          {
            href: "/portal/schedule",
            title: "Schedule",
            desc: "Book or view upcoming calls",
          },
        ].map((link) => (
          <Link key={link.href} href={link.href}>
            <div className="flex items-center justify-between px-5 py-4 bg-[#EDECEA] border border-[#D8D6D1] rounded-md hover:border-[#5F8575]/40 transition-colors group">
              <div>
                <p className="text-sm font-medium text-[#1A1A1A]">{link.title}</p>
                <p className="text-xs text-[#7A7875]">{link.desc}</p>
              </div>
              <span className="text-[#D8D6D1] group-hover:text-[#5F8575] transition-colors">
                →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
