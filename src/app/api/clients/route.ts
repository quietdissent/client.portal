import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import type { EngagementType, ClientStatus } from "@/lib/types";

// GET /api/clients — admin: list all clients
export async function GET() {
  const user = await currentUser();
  const role = (user?.publicMetadata as { role?: string })?.role;
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = createServiceClient();
  const { data, error } = await db
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/clients — admin: create client record after invite
export async function POST(req: Request) {
  const user = await currentUser();
  const role = (user?.publicMetadata as { role?: string })?.role;
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json()) as {
    name: string;
    email: string;
    business_name?: string;
    phone?: string;
    engagement_type?: EngagementType;
    status?: ClientStatus;
  };

  // Send Clerk invitation
  const clerk = await clerkClient();
  const invitation = await clerk.invitations.createInvitation({
    emailAddress: body.email,
    redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up`,
    publicMetadata: { role: "client" },
  });

  // Create client row with placeholder clerk_user_id
  // Will be updated to the real Clerk user ID after the client accepts the invite
  // and the webhook fires (or via manual update).
  const db = createServiceClient();
  const { data, error } = await db
    .from("clients")
    .insert({
      clerk_user_id: `pending_${invitation.id}`,
      name: body.name,
      email: body.email,
      business_name: body.business_name ?? null,
      phone: body.phone ?? null,
      engagement_type: body.engagement_type ?? null,
      status: body.status ?? "active",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
