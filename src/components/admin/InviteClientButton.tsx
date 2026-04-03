"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import type { EngagementType } from "@/lib/types";

export default function InviteClientButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    business_name: "",
    engagement_type: "" as EngagementType | "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          business_name: form.business_name || undefined,
          engagement_type: form.engagement_type || undefined,
        }),
      });

      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        setError(body.error ?? "Something went wrong");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        setForm({ name: "", email: "", business_name: "", engagement_type: "" });
        // Refresh the page to show the new client
        window.location.reload();
      }, 1500);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Invite Client</Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-md bg-[#F5F4EF] border border-[#D8D6D1] rounded-md shadow-xl p-6">
            <div className="mb-5">
              <h2
                className="text-lg text-[#1A1A1A]"
                style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
              >
                Invite a Client
              </h2>
              <p className="text-xs text-[#7A7875] mt-1">
                They'll receive an email to create their account.
              </p>
            </div>

            {success ? (
              <div className="py-8 text-center">
                <p className="text-[#5F8575] font-medium">Invitation sent.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Full name"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Alex Chen"
                />
                <Input
                  label="Email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="alex@example.com"
                />
                <Input
                  label="Business name (optional)"
                  value={form.business_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, business_name: e.target.value }))
                  }
                  placeholder="Acme Corp"
                />
                <Select
                  label="Engagement type (optional)"
                  value={form.engagement_type}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      engagement_type: e.target.value as EngagementType | "",
                    }))
                  }
                >
                  <option value="">Select…</option>
                  <option value="01">01 — Strategy Sprint</option>
                  <option value="02">02 — Advisory Retainer</option>
                  <option value="03">03 — Full Partnership</option>
                </Select>

                {error && (
                  <p className="text-sm text-[#b35a44]">{error}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={loading}
                    className="flex-1"
                  >
                    Send Invite
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
