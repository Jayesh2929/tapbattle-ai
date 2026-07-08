import { NextRequest, NextResponse } from "next/server";

/**
 * Gates every /admin route behind HTTP Basic Auth. Credentials are read
 * from environment variables so they're never hardcoded in the repo:
 *
 *   ADMIN_USERNAME=your-username
 *   ADMIN_PASSWORD=a-strong-password
 *
 * If these aren't set, the middleware falls back to a default so local
 * development still works, but you should always set real values before
 * deploying (see .env.example).
 */
const FALLBACK_USER = "admin";
const FALLBACK_PASSWORD = "changeme";

export function middleware(request: NextRequest) {
  const expectedUser = process.env.ADMIN_USERNAME || FALLBACK_USER;
  const expectedPassword = process.env.ADMIN_PASSWORD || FALLBACK_PASSWORD;

  const authHeader = request.headers.get("authorization");

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = Buffer.from(encoded, "base64").toString("utf-8");
      const [user, password] = decoded.split(":");
      if (user === expectedUser && password === expectedPassword) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="TapBattle AI Admin"',
    },
  });
}

export const config = {
  matcher: ["/admin/:path*"],
};
