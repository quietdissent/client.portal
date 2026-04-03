"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { Message } from "@/lib/types";
import { Button } from "@/components/ui/Button";

interface Props {
  initialMessages: Message[];
  clientId: string;
  senderRole: "admin" | "client";
}

export default function MessagesThread({
  initialMessages,
  clientId,
  senderRole,
}: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Supabase Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${clientId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            // Avoid duplicates (optimistic update)
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId]);

  async function send() {
    const trimmed = content.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: trimmed,
          client_id: senderRole === "admin" ? clientId : undefined,
        }),
      });
      if (res.ok) {
        const newMsg = (await res.json()) as Message;
        setMessages((prev) =>
          prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]
        );
        setContent("");
      }
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Thread */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-sm text-[#7A7875] text-center py-12">
            No messages yet. Send a message to start the conversation.
          </p>
        )}
        {messages.map((msg) => {
          const isOwnMessage = msg.sender_role === senderRole;
          const time = new Date(msg.created_at).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          });
          const date = new Date(msg.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-3 rounded-md text-sm ${
                  isOwnMessage
                    ? "bg-[#5F8575] text-white"
                    : "bg-[#EDECEA] text-[#1A1A1A] border border-[#D8D6D1]"
                }`}
              >
                {msg.content}
              </div>
              <p
                className="text-[10px] text-[#7A7875] mt-1 px-1"
                style={{ fontFamily: "var(--font-dm-mono), monospace" }}
              >
                {msg.sender_name} · {date}, {time}
              </p>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Compose */}
      <div className="border-t border-[#D8D6D1] px-6 py-4 bg-[#F5F4EF]">
        <div className="flex gap-3 items-end">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Enter to send)"
            rows={2}
            className="flex-1 px-3 py-2 text-sm rounded-md bg-[#EDECEA] border border-[#D8D6D1] text-[#1A1A1A] placeholder-[#7A7875] focus:outline-none focus:border-[#5F8575] resize-none"
          />
          <Button
            onClick={send}
            loading={sending}
            disabled={!content.trim()}
            size="md"
          >
            Send
          </Button>
        </div>
        <p
          className="text-[10px] text-[#7A7875] mt-2"
          style={{ fontFamily: "var(--font-dm-mono), monospace" }}
        >
          Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
