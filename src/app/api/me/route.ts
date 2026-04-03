import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// GET /api/me — returns the current client's record
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createServiceClient();
  const { data, error } = await db
    .from("clients")
    .select("*")
    .eq("clerk_user_id", userId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Client record not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
