"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GovernanceMISAnalyticsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/trust?tab=analytics');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] font-sans">
      <div className="flex items-center gap-3 text-stone-500 text-sm font-medium">
        <div className="w-4 h-4 border-2 border-[#C85A32] border-t-transparent rounded-full animate-spin" />
        <span>Redirecting to Trust Board & MIS Intelligence...</span>
      </div>
    </div>
  );
}
