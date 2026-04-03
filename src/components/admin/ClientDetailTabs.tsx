"use client";

import { useState } from "react";
import type { Client, Document, Message, Event } from "@/lib/types";
import AdminDocumentsTab from "./AdminDocumentsTab";
import MessagesThread from "@/components/portal/MessagesThread";
import AdminScheduleTab from "./AdminScheduleTab";
import AdminNotesTab from "./AdminNotesTab";

interface Props {
  client: Client;
  initialDocuments: Document[];
  initialMessages: Message[];
  initialEvents: Event[];
}

const TABS = ["Documents", "Messages", "Schedule", "Notes"] as const;
type Tab = (typeof TABS)[number];

export default function ClientDetailTabs({
  client,
  initialDocuments,
  initialMessages,
  initialEvents,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("Documents");

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Tab bar */}
      <div className="flex gap-1 px-6 pt-4 border-b border-[#D8D6D1]">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm rounded-t-md transition-colors ${
              activeTab === tab
                ? "bg-[#F5F4EF] border border-b-[#F5F4EF] border-[#D8D6D1] text-[#1A1A1A] font-medium -mb-px"
                : "text-[#7A7875] hover:text-[#4A4A4A]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === "Documents" && (
          <AdminDocumentsTab clientId={client.id} initialDocuments={initialDocuments} />
        )}
        {activeTab === "Messages" && (
          <div className="flex flex-col h-full">
            <MessagesThread
              initialMessages={initialMessages}
              clientId={client.id}
              senderRole="admin"
            />
          </div>
        )}
        {activeTab === "Schedule" && (
          <AdminScheduleTab clientId={client.id} initialEvents={initialEvents} />
        )}
        {activeTab === "Notes" && (
          <AdminNotesTab client={client} />
        )}
      </div>
    </div>
  );
}
