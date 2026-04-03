import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import type { ClientStatus, EngagementType } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

// GET /api/clients/[id] — admin: get single client with docs, messages, events
export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const { userId } = await auth();
  const user = await currentUser();
  const role = (user?.publicMetadata as { role?: string })?.role;

  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createServiceClient();

  // Admin can get any client; a client can only get their own record
  let query = db.from("clients").select("*").eq("id", id);
  if (role !== "admin") {
    query = query.eq("clerk_user_id", userId);
  }

  const { data: client, error } = await query.single();
  if (error || !client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [docsResult, msgsResult, eventsResult] = await Promise.all([
    db
      .from("documents")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
    db
      .from("messages")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: true }),
    db
      .from("events")
      .select("*")
      .eq("client_id", id)
      .order("scheduled_at", { ascending: true }),
  ]);

  return NextResponse.json({
    client,
    documents: docsResult.data ?? [],
    messages: msgsResult.data ?? [],
    events: eventsResult.data ?? [],
  });
}

// PATCH /api/clients/[id] — admin: update client
export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const user = await currentUser();
  const role = (user?.publicMetadata as { role?: string })?.role;
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json()) as Partial<{
    name: string;
    business_name: string;
    phone: string;
    engagement_type: EngagementType;
    status: ClientStatus;
    notes: string;
    pipeline_stage: string;
    clerk_user_id: string;
  }>;

  const db = createServiceClient();
  const { data, error } = await db
    .from("clients")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
