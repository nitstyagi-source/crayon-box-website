"use client";

import React from "react";
import { FeeCollectionsPOSDesk } from "@/components/finance/FeeCollectionsPOSDesk";

export default function BillingCollectionsPage() {
  return (
    <div className="space-y-6">
      <FeeCollectionsPOSDesk embedded={false} />
    </div>
  );
}
