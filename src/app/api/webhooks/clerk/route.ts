import { Webhook } from "svix";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const body = await req.text();

  const wh = new Webhook(secret);
  let event: { type: string; data: Record<string, unknown> };

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as typeof event;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "user.created") {
    return NextResponse.json({ ok: true });
  }

  const clerkUserId = event.data.id as string;
  const emailAddresses = event.data.email_addresses as Array<{ email_address: string }>;
  const primaryEmailAddressId = event.data.primary_email_address_id as string;

  const primaryEmail = emailAddresses.find(
    (e) => (event.data.email_addresses as Array<{ id: string; email_address: string }>)
      .find((addr) => addr.id === primaryEmailAddressId)?.email_address === e.email_address
  )?.email_address ?? emailAddresses[0]?.email_address;

  if (!primaryEmail) {
    console.error("user.created event has no email address", clerkUserId);
    return NextResponse.json({ error: "No email on user" }, { status: 500 });
  }

  try {
    const db = createServiceClient();
    const { data: client, error: lookupError } = await db
      .from("clients")
      .select("id")
      .eq("email", primaryEmail)
      .maybeSingle();

    if (lookupError) throw lookupError;

    if (!client) {
      // No matching client row — nothing to link.
      return NextResponse.json({ ok: true });
    }

    const { error: updateError } = await db
      .from("clients")
      .update({ clerk_user_id: clerkUserId })
      .eq("id", client.id);

    if (updateError) throw updateError;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Clerk webhook error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
