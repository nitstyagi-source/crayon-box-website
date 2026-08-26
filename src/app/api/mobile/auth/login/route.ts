import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireServerEnv } from "@/lib/server-env";

function getSupabaseAuthClient() {
  return createClient(
    requireServerEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireServerEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
    auth: { autoRefreshToken: false, persistSession: false }
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAuthClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: identifier.trim().toLowerCase(),
      password,
    });

    if (error || !data.user || !data.session) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const metadata = data.user.app_metadata ?? {};
    const role = typeof metadata.role === "string" ? metadata.role : "Parent";

    return NextResponse.json({
      success: true,
      token: data.session.access_token,
      user: {
        id: data.user.id,
        fullName: data.user.user_metadata?.full_name ?? data.user.email,
        email: data.user.email,
        role,
      },
      activeRole: role,
    });
  } catch (error: any) {
    console.error("Mobile password sign-in failed", error);
    return NextResponse.json(
      { success: false, error: "Authentication service is unavailable." },
      { status: 500 }
    );
  }
}
