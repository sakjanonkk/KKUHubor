import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { checkRateLimit } from "./lib/rate-limit";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limit API routes
  if (pathname.startsWith("/api/")) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const method = request.method;

    const result = checkRateLimit(ip, pathname, method);
    if (result.limited) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(result.retryAfter || 60),
          },
        }
      );
    }

    // Let API routes pass through (no intl processing needed)
    return NextResponse.next();
  }

  // i18n routing for non-API routes
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/(th|en)/:path*", "/api/:path*"],
};
