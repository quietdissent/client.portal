"use client";

import { useState } from "react";
import type { Event, EventStatus } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";

interface Props {
  clientId: string;
  initialEvents: Event[];
}

export default function AdminScheduleTab({ clientId, initialEvents }: Props) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    scheduled_at: "",
    notes: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          title: form.title,
          scheduled_at: form.scheduled_at || undefined,
          notes: form.notes || undefined,
        }),
      });

      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        setError(body.error ?? "Failed to create event");
        return;
      }

      const newEvent = (await res.json()) as Event;
      setEvents((prev) => [...prev, newEvent].sort((a, b) =>
        (a.scheduled_at ?? "").localeCompare(b.scheduled_at ?? "")
      ));
      setShowForm(false);
      setForm({ title: "", scheduled_at: "", notes: "" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#7A7875]">
          {events.length} event{events.length !== 1 ? "s" : ""}
        </p>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "+ Add Event"}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 p-5 bg-[#EDECEA] border border-[#D8D6D1] rounded-md space-y-4"
        >
          <Input
            label="Event title"
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Strategy check-in"
          />
          <Input
            label="Date & time (optional)"
            type="datetime-local"
            value={form.scheduled_at}
            onChange={(e) => setForm((f) => ({ ...f, scheduled_at: e.target.value }))}
          />
          <Textarea
            label="Notes (optional)"
            rows={3}
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Agenda or notes…"
          />
          {error && <p className="text-sm text-[#b35a44]">{error}</p>}
          <Button type="submit" loading={loading}>
            Save Event
          </Button>
        </form>
      )}

      {events.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-[#D8D6D1] rounded-md">
          <p className="text-sm text-[#7A7875]">No events scheduled.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((event) => {
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
              <div
                key={event.id}
                className="flex items-center justify-between px-4 py-3 bg-[#EDECEA] border border-[#D8D6D1] rounded-md"
              >
                <div>
                  <p className="text-sm font-medium text-[#1A1A1A]">{event.title}</p>
                  <p
                    className="text-xs text-[#7A7875] mt-0.5"
                    style={{ fontFamily: "var(--font-dm-mono), monospace" }}
                  >
                    {date}
                  </p>
                  {event.notes && (
                    <p className="text-xs text-[#4A4A4A] mt-1">{event.notes}</p>
                  )}
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
          })}
        </div>
      )}
    </div>
  );
}
