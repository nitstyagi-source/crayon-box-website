"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#070B14] flex items-center justify-center text-slate-400 font-mono text-sm">
      Redirecting to central login portal...
    </div>
  );
}
