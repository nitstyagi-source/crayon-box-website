import { AlertTriangle, X } from "lucide-react";

export default function EmergencyBanner() {
  // In a real app, this state would come from a CMS or context
  const isVisible = true;

  if (!isVisible) return null;

  return (
    <div className="bg-destructive text-destructive-foreground px-4 py-3 relative z-50">
      <div className="container mx-auto flex items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium leading-snug">
            <strong>Weather Advisory:</strong> School will remain closed on Friday due to severe weather conditions. All classes will resume online.
          </p>
        </div>
        <button 
          className="shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
