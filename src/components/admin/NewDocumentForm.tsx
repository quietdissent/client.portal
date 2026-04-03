"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Client, DocumentType, DocumentVisibility } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";

interface Props {
  clients: Pick<Client, "id" | "name" | "business_name">[];
}

export default function NewDocumentForm({ clients }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    client_id: "",
    title: "",
    type: "deliverable" as DocumentType,
    visibility: "client" as DocumentVisibility,
    html_content: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.client_id || !form.title.trim() || !form.html_content.trim()) {
      setError("Client, title, and content are required.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        setError(body.error ?? "Failed to create document");
        return;
      }

      router.push(`/admin/clients/${form.client_id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Select
        label="Client"
        required
        value={form.client_id}
        onChange={(e) => setForm((f) => ({ ...f, client_id: e.target.value }))}
      >
        <option value="">Select client…</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
            {c.business_name ? ` — ${c.business_name}` : ""}
          </option>
        ))}
      </Select>

      <Input
        label="Title"
        required
        value={form.title}
        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        placeholder="Q2 Strategy Report"
      />

      <div className="flex gap-4">
        <Select
          label="Type"
          value={form.type}
          onChange={(e) =>
            setForm((f) => ({ ...f, type: e.target.value as DocumentType }))
          }
        >
          <option value="welcome">Welcome</option>
          <option value="agreement">Agreement</option>
          <option value="deliverable">Deliverable</option>
          <option value="invoice">Invoice</option>
          <option value="resource">Resource</option>
          <option value="tax">Tax</option>
          <option value="other">Other</option>
        </Select>

        <Select
          label="Visibility"
          value={form.visibility}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              visibility: e.target.value as DocumentVisibility,
            }))
          }
        >
          <option value="client">Client-visible</option>
          <option value="internal">Internal only</option>
        </Select>
      </div>

      <Textarea
        label="HTML content"
        rows={12}
        value={form.html_content}
        onChange={(e) => setForm((f) => ({ ...f, html_content: e.target.value }))}
        placeholder="<p>Paste your document HTML here…</p>"
        className="font-mono text-xs"
      />

      {error && <p className="text-sm text-[#b35a44]">{error}</p>}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Push to Client
        </Button>
      </div>
    </form>
  );
}
