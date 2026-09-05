import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fesqtrunkqlmvyvqodzy.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlc3F0cnVua3FsbXZ5dnFvZHp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNzM4OTYsImV4cCI6MjEwMjY0OTg5Nn0.orDLjRNcUVXRNuGvJCDZHJdx8BDMvYC-6MvRKuDUm3o';

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
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

  const userRole = request.cookies.get('cb_user_role')?.value;

  if (url.pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (userRole === 'PARENT' || userRole === 'STUDENT' || userRole === 'PARENT_STUDENT') {
      // Parents & Students are unified on Mobile App only - zero access to web admin console
      return NextResponse.redirect(new URL('/login?error=mobile_only', request.url));
    }
  }

  if (url.pathname === '/login' && isAuthenticated) {
    if (userRole === 'PARENT' || userRole === 'STUDENT' || userRole === 'PARENT_STUDENT') {
      // Allow parent/student to see login without redirect loop into restricted admin
      return supabaseResponse;
    }
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
