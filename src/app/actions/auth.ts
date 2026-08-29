"use server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fesqtrunkqlmvyvqodzy.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlc3F0cnVua3FsbXZ5dnFvZHp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNzM4OTYsImV4cCI6MjEwMjY0OTg5Nn0.orDLjRNcUVXRNuGvJCDZHJdx8BDMvYC-6MvRKuDUm3o';

export async function setServerAuthSession(payload: {
  userId: string;
  email: string;
  role: string;
  fullName: string;
  accessToken: string;
}) {
  try {
    const cookieStore = await cookies();
    cookieStore.set("cb_auth_token", payload.accessToken, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });
    cookieStore.set("cb_user_role", payload.role, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    cookieStore.set("cb_user_email", payload.email, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    cookieStore.set("cb_user_name", payload.fullName, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function clearServerAuthSession() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("cb_auth_token");
    cookieStore.delete("cb_user_role");
    cookieStore.delete("cb_user_email");
    cookieStore.delete("cb_user_name");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function loginWithCredentialsAction(formData: {
  email: string;
  password: string;
}) {
  const cleanEmail = formData.email.trim().toLowerCase();
  const cleanPass = formData.password.trim();

  // 1. Check Super Admin hardcoded master credential bypass
  if (cleanEmail === 'nits.tyagi@gmail.com' && cleanPass === 'CrayonBoxAdmin@2026!') {
    await setServerAuthSession({
      userId: 'super-admin-root',
      email: cleanEmail,
      role: 'SUPER_ADMIN',
      fullName: 'Nitin Tyagi',
      accessToken: 'master-super-admin-session-token'
    });
    return { success: true, role: 'SUPER_ADMIN' };
  }

  // 2. Try Supabase Auth
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {}
        }
      }
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPass
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.session && data.user) {
      let detectedRole = "SUPER_ADMIN";
      let fullName = data.user.user_metadata?.full_name || "Staff Member";
      if (cleanEmail.includes("teacher") || cleanEmail.includes("faculty")) detectedRole = "TEACHER";
      else if (cleanEmail.includes("parent")) detectedRole = "PARENT";

      await setServerAuthSession({
        userId: data.user.id,
        email: cleanEmail,
        role: detectedRole,
        fullName: fullName,
        accessToken: data.session.access_token
      });

      return { success: true, role: detectedRole };
    }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to authenticate session." };
  }

  return { success: false, error: "Invalid credentials. Please verify your email and password." };
}
