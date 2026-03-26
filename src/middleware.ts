import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin-only routes
    if (path.startsWith("/users") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Settings: admin + resp_labo + resp_qc + direction
    if (path.startsWith("/settings")) {
      const allowed = ["admin", "resp_labo", "resp_qc", "direction"];
      if (!allowed.includes(token?.role as string)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/trials/:path*",
    "/spectro/:path*",
    "/densito/:path*",
    "/formulations/:path*",
    "/validation/:path*",
    "/production/:path*",
    "/qc/:path*",
    "/metal/:path*",
    "/tints/:path*",
    "/ai/:path*",
    "/settings/:path*",
    "/users/:path*",
  ],
};
