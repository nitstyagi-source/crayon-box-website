"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DataQualityAuditRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/iam?tab=data-quality');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] font-sans">
      <div className="flex items-center gap-3 text-stone-500 text-sm font-medium">
        <div className="w-4 h-4 border-2 border-[#C85A32] border-t-transparent rounded-full animate-spin" />
        <span>Redirecting to Security & Data Vault...</span>
      </div>
    </div>
  );
}
