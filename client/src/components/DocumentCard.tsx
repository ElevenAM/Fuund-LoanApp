import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, X, Upload } from "lucide-react";

interface DocumentCardProps {
  name: string;
  status: "uploaded" | "pending" | "required";
  fileType?: string;
  size?: string;
  onRemove?: () => void;
  onUpload?: () => void;
}

export default function DocumentCard({
  name,
  status,
  fileType = "PDF",
  size,
  onRemove,
  onUpload,
}: DocumentCardProps) {
  return (
    <Card className="p-4" data-testid={`card-document-${name.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 rounded bg-muted flex items-center justify-center">
            <FileText className="w-5 h-5 text-muted-foreground" data-testid="icon-file" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" data-testid="text-document-name">
              {name}
            </p>
            {size && (
              <p className="text-xs text-muted-foreground mt-0.5" data-testid="text-document-size">
                {fileType} • {size}
              </p>
            )}
            {status === "pending" && (
              <Badge variant="secondary" className="mt-2" data-testid="badge-upload-later">
                Upload Later
              </Badge>
            )}
            {status === "required" && (
              <Badge variant="destructive" className="mt-2" data-testid="badge-required">
                Required
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {status === "uploaded" && onRemove && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              data-testid="button-remove-document"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          {(status === "pending" || status === "required") && onUpload && (
            <Button
              variant="outline"
              size="sm"
              onClick={onUpload}
              data-testid="button-upload-document"
            >
              <Upload className="w-4 h-4 mr-1" />
              Upload
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
