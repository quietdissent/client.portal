import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import type { DocumentType, DocumentVisibility } from "@/lib/types";

// GET /api/documents?client_id=xxx — fetch documents for a client
export async function GET(req: Request) {
  const { userId, sessionClaims } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("client_id");

  const db = createServiceClient();

  if (role === "admin") {
    // Admin can see all docs for any client including internal
    const query = clientId
      ? db.from("documents").select("*").eq("client_id", clientId).order("created_at", { ascending: false })
      : db.from("documents").select("*").order("created_at", { ascending: false });

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  // Client: fetch own documents with visibility = client
  const { data: clientRow } = await db
    .from("clients")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();

  if (!clientRow) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const { data, error } = await db
    .from("documents")
    .select("*")
    .eq("client_id", clientRow.id)
    .eq("visibility", "client")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/documents — admin: create document
export async function POST(req: Request) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json()) as {
    client_id: string;
    title: string;
    type?: DocumentType;
    visibility?: DocumentVisibility;
    html_content?: string;
    storage_path?: string;
  };

  const db = createServiceClient();
  const { data, error } = await db
    .from("documents")
    .insert(body)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
