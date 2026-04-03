import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import type { EventStatus } from "@/lib/types";

// GET /api/events?client_id=xxx
export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await currentUser();
  const role = (user?.publicMetadata as { role?: string })?.role;
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("client_id");

  const db = createServiceClient();

  if (role === "admin") {
    if (!clientId) return NextResponse.json({ error: "client_id required" }, { status: 400 });
    const { data, error } = await db
      .from("events")
      .select("*")
      .eq("client_id", clientId)
      .order("scheduled_at", { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  // Client
  const { data: clientRow } = await db
    .from("clients")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();
  if (!clientRow) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await db
    .from("events")
    .select("*")
    .eq("client_id", clientRow.id)
    .order("scheduled_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/events — admin only
export async function POST(req: Request) {
  const user = await currentUser();
  const role = (user?.publicMetadata as { role?: string })?.role;
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json()) as {
    client_id: string;
    title: string;
    scheduled_at?: string;
    cal_event_uid?: string;
    status?: EventStatus;
    notes?: string;
  };

  const db = createServiceClient();
  const { data, error } = await db.from("events").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
