import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // Role-based redirect from root
  const { userId, sessionClaims } = await auth();
  if (userId && req.nextUrl.pathname === "/") {
    const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
    const target =
      role === "admin" ? "/admin/clients" : "/portal/dashboard";
    return NextResponse.redirect(new URL(target, req.url));
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
