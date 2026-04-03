import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// GET /api/messages?client_id=xxx
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
      .from("messages")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Mark as read by admin
    await db
      .from("messages")
      .update({ read_by_admin: true })
      .eq("client_id", clientId)
      .eq("read_by_admin", false);

    return NextResponse.json(data);
  }

  // Client: get own messages
  const { data: clientRow } = await db
    .from("clients")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();

  if (!clientRow) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const { data, error } = await db
    .from("messages")
    .select("*")
    .eq("client_id", clientRow.id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Mark as read by client
  await db
    .from("messages")
    .update({ read_by_client: true })
    .eq("client_id", clientRow.id)
    .eq("read_by_client", false);

  return NextResponse.json(data);
}

// POST /api/messages
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await currentUser();
  const role = (user?.publicMetadata as { role?: string })?.role;
  const body = (await req.json()) as {
    content: string;
    client_id?: string; // required for admin
  };

  if (!body.content?.trim()) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  const senderName =
    user?.fullName ||
    user?.emailAddresses[0]?.emailAddress ||
    (role === "admin" ? "Bailey" : "Client");

  const db = createServiceClient();

  let clientId: string;

  if (role === "admin") {
    if (!body.client_id) return NextResponse.json({ error: "client_id required" }, { status: 400 });
    clientId = body.client_id;
  } else {
    const { data: clientRow } = await db
      .from("clients")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();
    if (!clientRow) return NextResponse.json({ error: "Client not found" }, { status: 404 });
    clientId = clientRow.id;
  }

  const { data, error } = await db
    .from("messages")
    .insert({
      client_id: clientId,
      sender_role: role ?? "client",
      sender_name: senderName,
      content: body.content.trim(),
      read_by_client: role === "client",
      read_by_admin: role === "admin",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
