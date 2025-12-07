import { useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DocumentUploadZoneProps {
  label: string;
  description?: string;
  required?: boolean;
  onUpload?: (files: FileList) => void;
  acceptedTypes?: string;
}

export default function DocumentUploadZone({
  label,
  description,
  required = false,
  onUpload,
  acceptedTypes = ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg",
}: DocumentUploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files: FileList) => {
    setUploadedFile(files[0]?.name || null);
    onUpload?.(files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <Card
        className={`relative border-2 border-dashed transition-colors ${
          dragActive ? "border-primary bg-accent" : "border-border"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        data-testid={`upload-zone-${label.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <div className="p-8 text-center">
          {uploadedFile ? (
            <div className="flex flex-col items-center gap-3">
              <FileText className="w-12 h-12 text-primary" />
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium" data-testid="text-uploaded-file">
                  {uploadedFile}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setUploadedFile(null)}
                  className="h-6 w-6"
                  data-testid="button-delete-file"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm font-medium mb-1">
                Drag and drop your file here, or
              </p>
              <Button
                type="button"
                variant="ghost"
                className="h-auto p-0 text-sm"
                onClick={() => document.getElementById(`file-input-${label}`)?.click()}
                data-testid="button-browse"
              >
                browse to upload
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Accepts: PDF, Word, Excel, Images
              </p>
            </>
          )}
          <input
            id={`file-input-${label}`}
            type="file"
            className="hidden"
            onChange={handleChange}
            accept={acceptedTypes}
            data-testid="input-file"
          />
        </div>
      </Card>
    </div>
  );
}
