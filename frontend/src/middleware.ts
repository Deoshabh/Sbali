import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Server-side middleware for:
 * 1. Admin route protection (JWT role check — fast, first gate before page renders)
 * 2. Security headers: nonce-based CSP, COOP, CORP
 * 3. Bot protection: blocks non-GET/HEAD methods on page routes
 *
 * Full auth verification still happens on the backend.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // ── Block POST/PUT/PATCH/DELETE to page routes ──────────────────────────────
  // Next.js 14+ tries to parse these as Server Action FormData and throws errors.
  if (
    method !== 'GET' &&
    method !== 'HEAD' &&
    !pathname.startsWith('/api/') &&
    !pathname.startsWith('/_next/') &&
    !pathname.includes('.')
  ) {
    return new NextResponse(null, { status: 405, statusText: 'Method Not Allowed' });
  }

  // ── Generate per-request CSP nonce (base64-encoded UUID) ───────────────────
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  const cspDirectives = [
    "default-src 'self'",
    // strict-dynamic + nonce: trusted scripts can load other scripts dynamically.
    // 'unsafe-inline' kept as fallback for browsers without strict-dynamic support.
    // 'unsafe-eval' removed — Firebase 12+ and React 18 do not require it.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' https://checkout.razorpay.com https://apis.google.com https://challenges.cloudflare.com https://static.cloudflareinsights.com https://www.googletagmanager.com`,
    // script-src-elem is set explicitly so parser-inserted third-party scripts
    // (e.g. Cloudflare email-decode) are still allowed when strict-dynamic is active.
    `script-src-elem 'self' 'nonce-${nonce}' 'unsafe-inline' https://sbali.in https://checkout.razorpay.com https://apis.google.com https://challenges.cloudflare.com https://static.cloudflareinsights.com https://www.googletagmanager.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https://cdn.sbali.in https://cdn.radeo.in https://minio.sbali.in https://images.unsplash.com https://*.googleusercontent.com",
    "media-src 'self' data: blob: https://cdn.sbali.in https://cdn.radeo.in https://minio.sbali.in",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://api.sbali.in https://cdn.sbali.in https://minio.sbali.in https://*.firebaseio.com https://*.googleapis.com https://checkout.razorpay.com https://lumberjack.razorpay.com https://*.razorpay.com wss://*.sbali.in https://api.honeybadger.io https://challenges.cloudflare.com https://www.google-analytics.com https://www.googletagmanager.com",
    "frame-src https://checkout.razorpay.com https://api.razorpay.com https://*.razorpay.com https://*.firebaseapp.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    // Trusted Types: mitigate DOM-based XSS by enforcing typed DOM APIs.
    // 'allow-duplicates' lets third-party scripts (Firebase, Razorpay) register their own policies.
    "trusted-types nextjs nextjs#bundler goog#html gapi#gapi firebase firebase-js-sdk-policy default 'allow-duplicates'",
    "require-trusted-types-for 'script'",
  ].join('; ');

  // Pass nonce to server components via request header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  // ── Admin route protection ──────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('accessToken')?.value;

    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Decode JWT payload (base64) to check role — no crypto verification here.
    // Cryptographic verification happens on the backend API.
    try {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Invalid token format');

      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64url').toString('utf-8')
      );

      // Check expiration
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Check admin role
      const adminRoles = ['admin', 'designer', 'publisher'];
      if (!payload.role || !adminRoles.includes(payload.role)) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch {
      // If token is malformed, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── Build response with security headers ────────────────────────────────────
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Content Security Policy (nonce-based, replaces next.config.mjs static CSP)
  response.headers.set('Content-Security-Policy', cspDirectives);

  // Cross-Origin-Opener-Policy: same-origin-allow-popups allows Razorpay/Firebase
  // popup windows while preventing cross-origin window.opener access.
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');

  // Cross-Origin-Resource-Policy: prevents other origins from embedding our resources.
  response.headers.set('Cross-Origin-Resource-Policy', 'same-site');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    '/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt).*)',
  ],
};
