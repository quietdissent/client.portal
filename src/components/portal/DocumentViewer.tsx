"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import type { Document } from "@/lib/types";

interface Props {
  document: Document;
  typeLabel: string;
}

export default function DocumentViewer({ document: doc, typeLabel }: Props) {
  const [open, setOpen] = useState(false);

  const date = new Date(doc.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const signedPatch = doc.is_signed
    ? `<script>document.addEventListener('DOMContentLoaded',function(){var f=document.getElementById('client-sign-form');var s=document.getElementById('client-signed-display');var n=document.getElementById('signed-name-display');var st=document.getElementById('sb-status');if(f)f.style.display='none';if(s)s.style.display='block';if(n&&'${doc.signer_name||''}')n.textContent='${doc.signer_name||''}';if(st){st.textContent='Signed';st.classList.add('signed');}});<\/script></body>`
    : null;

  const displayHtml = signedPatch && doc.html_content
    ? doc.html_content.replace('</body>', signedPatch)
    : doc.html_content;

  return (
    <div className="border border-[#D8D6D1] rounded-md overflow-hidden bg-[#EDECEA]">
      {/* Row */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#E5E3DE] transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-[#7A7875]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 2h7l3 3v9H3V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M10 2v3h3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-medium text-[#1A1A1A]">{doc.title}</p>
            <p
              className="text-xs text-[#7A7875]"
              style={{ fontFamily: "var(--font-dm-mono), monospace" }}
            >
              {date}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {doc.is_signed && (
              <span style={{ fontFamily: "var(--font-dm-mono, monospace)", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#5F8575" }}>
                Signed
              </span>
            )}
          <Badge variant="muted">{typeLabel}</Badge>
          <span
            className="text-[#7A7875] transition-transform duration-200"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </button>

      {/* Expanded viewer */}
      {open && (
        <div className="border-t border-[#D8D6D1]">
          {doc.html_content ? (
            <iframe
              srcDoc={displayHtml ?? undefined}
              className="w-full rounded-md border-0"
              style={{ height: "80vh" }}
              title={doc.title}
              sandbox="allow-scripts allow-same-origin"
            />
          ) : doc.storage_path ? (
            <div className="p-4">
              <iframe
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/${doc.storage_path}`}
                className="w-full h-[600px] rounded-md border border-[#D8D6D1]"
                title={doc.title}
              />
            </div>
          ) : (
            <div className="p-6 text-sm text-[#7A7875]">No content available.</div>
          )}
        </div>
      )}
    </div>
  );
}

