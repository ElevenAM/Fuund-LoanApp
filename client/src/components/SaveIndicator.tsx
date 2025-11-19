import { Check, Loader2 } from "lucide-react";

interface SaveIndicatorProps {
  status: "saving" | "saved" | "idle";
}

export default function SaveIndicator({ status }: SaveIndicatorProps) {
  if (status === "idle") return null;

  return (
    <div className="flex items-center gap-2 text-sm" data-testid="save-indicator">
      {status === "saving" ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" data-testid="icon-saving" />
          <span className="text-muted-foreground">Saving...</span>
        </>
      ) : (
        <>
          <Check className="w-4 h-4 text-primary" data-testid="icon-saved" />
          <span className="text-muted-foreground">All changes saved</span>
        </>
      )}
    </div>
  );
}
