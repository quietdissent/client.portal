import { auth, currentUser } from "@clerk/nextjs/server";

export type UserRole = "admin" | "client";

export async function getRole(): Promise<UserRole | null> {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  if (role === "admin" || role === "client") return role;
  return null;
}

export async function requireRole(required: UserRole): Promise<void> {
  const role = await getRole();
  if (role !== required) {
    throw new Error(`Forbidden: requires role ${required}`);
  }
}

export async function getClerkUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");
  return userId;
}

export async function getClerkUserEmail(): Promise<string | null> {
  const user = await currentUser();
  return user?.emailAddresses[0]?.emailAddress ?? null;
}
