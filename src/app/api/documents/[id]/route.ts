import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

type Params = { params: Promise<{ id: string }> };

// DELETE /api/documents/[id] — admin only
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const db = createServiceClient();
  const { error } = await db.from("documents").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
