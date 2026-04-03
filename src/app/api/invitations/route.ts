import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// POST /api/invitations
//
// Clerk webhook — listens for the `user.created` event fired when an invited
// client completes sign-up.  Updates the `clerk_user_id` on their client row
// from the `pending_<invitationId>` placeholder set at invite time.
//
// Configure in Clerk Dashboard → Webhooks → Endpoint: POST /api/invitations
// Events to subscribe: user.created
//
// Security: Clerk signs webhooks via Svix.  For Phase 1 we do a bearer-token
// check against CLERK_WEBHOOK_SECRET.  To add full Svix signature verification
// install the `svix` package and validate svix-id / svix-signature headers.

export async function POST(req: Request) {
  // Verify shared secret
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Only handle user.created
  if (payload.type !== "user.created") {
    return NextResponse.json({ received: true });
  }

  const data = payload.data as {
    id?: string;
    email_addresses?: { email_address: string }[];
  };

  const clerkUserId = data?.id;
  const email = data?.email_addresses?.[0]?.email_address;

  if (!clerkUserId || !email) {
    return NextResponse.json({ error: "Missing user fields" }, { status: 400 });
  }

  // Find the pending client record by email
  const db = createServiceClient();
  const { data: client, error: findError } = await db
    .from("clients")
    .select("id, clerk_user_id")
    .eq("email", email)
    .like("clerk_user_id", "pending_%")
    .single();

  if (findError || !client) {
    // No pending record — user signed up outside of an invitation flow, ignore.
    return NextResponse.json({ received: true });
  }

  // Update with the real Clerk user ID
  const { error: updateError } = await db
    .from("clients")
    .update({ clerk_user_id: clerkUserId })
    .eq("id", client.id);

  if (updateError) {
    console.error("[invitations] Failed to update clerk_user_id:", updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
