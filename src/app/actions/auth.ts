"use server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

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
