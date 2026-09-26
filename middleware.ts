import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes - send unauthenticated users to LOGIN (existing users),
  // preserving where they were headed so login can return them there.
  const protectedPaths = ["/onboard", "/dashboard", "/build-preview"];
  const isProtected = protectedPaths.some((p) =>
    request.nextUrl.pathname.startsWith(p)
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Retire the old ELVISS onboarding — send logged-in users to the new builder.
  if (user && request.nextUrl.pathname.startsWith("/onboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/build-preview";
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from signup, into the builder.
  if (user && request.nextUrl.pathname === "/signup") {
    const url = request.nextUrl.clone();
    url.pathname = "/build-preview";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/onboard/:path*", "/dashboard/:path*", "/build-preview/:path*", "/signup"],
};
