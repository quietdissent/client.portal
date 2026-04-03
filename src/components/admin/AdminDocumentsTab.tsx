"use client";

import { useState } from "react";
import type { Document, DocumentType, DocumentVisibility } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";

interface Props {
  clientId: string;
  initialDocuments: Document[];
}

const TYPE_LABELS: Record<string, string> = {
  welcome: "Welcome",
  agreement: "Agreement",
  deliverable: "Deliverable",
  invoice: "Invoice",
  resource: "Resource",
  tax: "Tax",
  other: "Other",
};

export default function AdminDocumentsTab({
  clientId,
  initialDocuments,
}: Props) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState<"html" | "upload">("html");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    type: "deliverable" as DocumentType,
    visibility: "client" as DocumentVisibility,
    html_content: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (mode === "html" && !form.html_content.trim()) {
      setError("HTML content cannot be empty");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          title: form.title,
          type: form.type,
          visibility: form.visibility,
          html_content: mode === "html" ? form.html_content : undefined,
        }),
      });

      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        setError(body.error ?? "Failed to create document");
        return;
      }

      const newDoc = (await res.json()) as Document;
      setDocuments((prev) => [newDoc, ...prev]);
      setShowForm(false);
      setForm({
        title: "",
        type: "deliverable",
        visibility: "client",
        html_content: "",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this document?")) return;
    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    if (res.ok) {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    }
  }

  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#7A7875]">
          {documents.length} document{documents.length !== 1 ? "s" : ""}
        </p>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "+ Add Document"}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 p-5 bg-[#EDECEA] border border-[#D8D6D1] rounded-md space-y-4"
        >
          <div className="flex gap-4">
            <Input
              label="Title"
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Q1 Strategy Brief"
              className="flex-1"
            />
            <Select
              label="Type"
              value={form.type}
              onChange={(e) =>
                setForm((f) => ({ ...f, type: e.target.value as DocumentType }))
              }
            >
              {Object.entries(TYPE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
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
              <option value="client">Client</option>
              <option value="internal">Internal only</option>
            </Select>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("html")}
              className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                mode === "html"
                  ? "bg-[#5F8575]/10 border-[#5F8575]/30 text-[#5F8575]"
                  : "border-[#D8D6D1] text-[#7A7875] hover:border-[#5F8575]/30"
              }`}
              style={{ fontFamily: "var(--font-dm-mono), monospace" }}
            >
              Paste HTML
            </button>
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                mode === "upload"
                  ? "bg-[#5F8575]/10 border-[#5F8575]/30 text-[#5F8575]"
                  : "border-[#D8D6D1] text-[#7A7875] hover:border-[#5F8575]/30"
              }`}
              style={{ fontFamily: "var(--font-dm-mono), monospace" }}
            >
              Upload PDF
            </button>
          </div>

          {mode === "html" && (
            <Textarea
              label="HTML content"
              rows={8}
              value={form.html_content}
              onChange={(e) =>
                setForm((f) => ({ ...f, html_content: e.target.value }))
              }
              placeholder="<p>Paste your document HTML here…</p>"
              className="font-mono text-xs"
            />
          )}

          {mode === "upload" && (
            <div className="p-4 border border-dashed border-[#D8D6D1] rounded-md text-center text-sm text-[#7A7875]">
              PDF upload via Supabase Storage — connect storage bucket and implement
              the upload handler in <code className="font-mono">/api/documents/upload</code>.
            </div>
          )}

          {error && <p className="text-sm text-[#b35a44]">{error}</p>}

          <Button type="submit" loading={loading}>
            Push to Client
          </Button>
        </form>
      )}

      {/* Document list */}
      {documents.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-[#D8D6D1] rounded-md">
          <p className="text-sm text-[#7A7875]">No documents yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between px-4 py-3 bg-[#EDECEA] border border-[#D8D6D1] rounded-md"
            >
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm font-medium text-[#1A1A1A]">{doc.title}</p>
                  <p
                    className="text-xs text-[#7A7875]"
                    style={{ fontFamily: "var(--font-dm-mono), monospace" }}
                  >
                    {new Date(doc.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="muted">{TYPE_LABELS[doc.type ?? "other"] ?? "Other"}</Badge>
                {doc.visibility === "internal" && (
                  <Badge variant="warning">Internal</Badge>
                )}
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-[#7A7875] hover:text-[#b35a44] transition-colors p-1"
                  title="Delete"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 3h10M5 3V2h4v1M4 3l.5 9h5L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
