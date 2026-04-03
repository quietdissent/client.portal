import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";
import type { Client, Message } from "@/lib/types";
import MessagesThread from "@/components/portal/MessagesThread";

async function getData(clerkUserId: string) {
  const db = createServiceClient();

  const { data: client } = await db
    .from("clients")
    .select("id, name")
    .eq("clerk_user_id", clerkUserId)
    .single<Pick<Client, "id" | "name">>();

  if (!client) return null;

  const { data: messages } = await db
    .from("messages")
    .select("*")
    .eq("client_id", client.id)
    .order("created_at", { ascending: true });

  // Mark admin messages as read
  await db
    .from("messages")
    .update({ read_by_client: true })
    .eq("client_id", client.id)
    .eq("read_by_client", false)
    .eq("sender_role", "admin");

  return { client, messages: (messages as Message[]) ?? [] };
}

export default async function MessagesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const data = await getData(userId);

  if (!data) {
    return (
      <div className="p-8">
        <p className="text-[#7A7875]">Account setup in progress.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#D8D6D1]">
        <h1
          className="text-xl text-[#1A1A1A]"
          style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
        >
          Messages
        </h1>
        <p className="text-xs text-[#7A7875] mt-0.5">
          Direct line to Bailey
        </p>
      </div>

      <MessagesThread
        initialMessages={data.messages}
        clientId={data.client.id}
        senderRole="client"
      />
    </div>
  );
}
