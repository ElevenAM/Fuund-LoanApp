import { useState } from "react";
import SaveIndicator from "../SaveIndicator";
import { Button } from "@/components/ui/button";

export default function SaveIndicatorExample() {
  const [status, setStatus] = useState<"saving" | "saved" | "idle">("saved");

  const handleSave = () => {
    setStatus("saving");
    setTimeout(() => setStatus("saved"), 1500);
  };

  return (
    <div className="p-8 space-y-4">
      <SaveIndicator status={status} />
      <Button onClick={handleSave} size="sm" data-testid="button-trigger-save">
        Trigger Save
      </Button>
    </div>
  );
}
