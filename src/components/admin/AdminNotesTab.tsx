"use client";

import { useState } from "react";
import type { Client } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";

interface Props {
  client: Client;
}

export default function AdminNotesTab({ client }: Props) {
  const [notes, setNotes] = useState(client.notes ?? "");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      await fetch(`/api/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <p className="text-xs text-[#7A7875] mb-3">
        Internal notes — not visible to the client.
      </p>
      <Textarea
        rows={12}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add context, preferences, or notes about this client…"
      />
      <div className="flex items-center gap-3 mt-4">
        <Button onClick={handleSave} loading={loading}>
          Save Notes
        </Button>
        {saved && (
          <span
            className="text-xs text-[#5F8575]"
            style={{ fontFamily: "var(--font-dm-mono), monospace" }}
          >
            Saved.
          </span>
        )}
      </div>
    </div>
  );
}
