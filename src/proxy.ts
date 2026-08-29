import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user || null;
  } catch {}

  const hasIamAuth = request.cookies.has('cb_auth_token') || request.cookies.has('cb_user_role') || request.cookies.has('cb_user_email');
  const isAuthenticated = Boolean(user) || hasIamAuth;

  const url = request.nextUrl.clone();
  
  if (url.pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (url.pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (url.pathname === '/login' && isAuthenticated) {
    // Already logged in
    const role = request.cookies.get('cb_user_role')?.value;
    if (role === 'PARENT' || role === 'STUDENT' || role === 'Parent' || role === 'Student') {
      return NextResponse.redirect(new URL('/family/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
