import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";
import type { Client, Event } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

async function getData(clerkUserId: string) {
  const db = createServiceClient();
  const { data: client } = await db
    .from("clients")
    .select("id")
    .eq("clerk_user_id", clerkUserId)
    .single<Pick<Client, "id">>();

  if (!client) return null;

  const { data: events } = await db
    .from("events")
    .select("*")
    .eq("client_id", client.id)
    .order("scheduled_at", { ascending: true });

  return { events: (events as Event[]) ?? [] };
}

export default async function SchedulePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const calUrl = process.env.NEXT_PUBLIC_CAL_URL;
  const data = await getData(userId);
  const events = data?.events ?? [];

  const upcomingEvents = events.filter((e) => e.status === "scheduled");
  const pastEvents = events.filter((e) => e.status !== "scheduled");

  return (
    <div className="px-6 py-8 max-w-3xl">
      <h1
        className="text-2xl text-[#1A1A1A] mb-1"
        style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
      >
        Schedule
      </h1>
      <p className="text-sm text-[#7A7875] mb-8">
        Book a call or view upcoming sessions.
      </p>

      {/* Cal.com embed */}
      {calUrl ? (
        <div className="mb-10">
          <h2
            className="text-xs text-[#7A7875] uppercase tracking-widest mb-3"
            style={{ fontFamily: "var(--font-dm-mono), monospace" }}
          >
            Book a Call
          </h2>
          <div className="border border-[#D8D6D1] rounded-md overflow-hidden bg-[#EDECEA]">
            <iframe
              src={calUrl}
              className="w-full h-[600px]"
              title="Book a call with Bailey"
              frameBorder="0"
            />
          </div>
        </div>
      ) : (
        <div className="mb-10 p-6 border border-dashed border-[#D8D6D1] rounded-md text-center">
          <p className="text-sm text-[#7A7875]">
            Booking not yet configured. Contact Bailey to schedule.
          </p>
        </div>
      )}

      {/* Upcoming events */}
      {upcomingEvents.length > 0 && (
        <div className="mb-8">
          <h2
            className="text-xs text-[#7A7875] uppercase tracking-widest mb-3"
            style={{ fontFamily: "var(--font-dm-mono), monospace" }}
          >
            Upcoming
          </h2>
          <div className="space-y-2">
            {upcomingEvents.map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {/* Past events */}
      {pastEvents.length > 0 && (
        <div>
          <h2
            className="text-xs text-[#7A7875] uppercase tracking-widest mb-3"
            style={{ fontFamily: "var(--font-dm-mono), monospace" }}
          >
            Past
          </h2>
          <div className="space-y-2">
            {pastEvents.map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EventRow({ event }: { event: Event }) {
  const date = event.scheduled_at
    ? new Date(event.scheduled_at).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "TBD";

  return (
    <div className="flex items-center justify-between px-5 py-4 bg-[#EDECEA] border border-[#D8D6D1] rounded-md">
      <div>
        <p className="text-sm font-medium text-[#1A1A1A]">{event.title}</p>
        <p
          className="text-xs text-[#7A7875] mt-0.5"
          style={{ fontFamily: "var(--font-dm-mono), monospace" }}
        >
          {date}
        </p>
      </div>
      <Badge
        variant={
          event.status === "scheduled"
            ? "accent"
            : event.status === "completed"
            ? "muted"
            : "warning"
        }
      >
        {event.status}
      </Badge>
    </div>
  );
}
