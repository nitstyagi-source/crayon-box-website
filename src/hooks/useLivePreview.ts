import { useState, useEffect } from "react";
import { getPageContent } from "@/app/actions/cms";

export function useLivePreview(pageSlug: string) {
  const [cmsData, setCmsData] = useState<Record<string, any>>({});

  useEffect(() => {
    // Initial fetch
    getPageContent(pageSlug).then((res) => {
      if (res.success && res.data) setCmsData(res.data);
    });

    // Listen for live updates from CMS Parent Frame
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "CMS_UPDATE_PREVIEW" && event.data?.pageSlug === pageSlug) {
        setCmsData(event.data.content);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [pageSlug]);

  return cmsData;
}
