import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, Check, X, AlertCircle, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DocumentUploadFormProps {
  onContinue?: () => void;
  onBack?: () => void;
  applicationId: string | null;
  existingDocuments?: any[];
}

interface DocumentRequirement {
  type: string;
  label: string;
  required: boolean;
  description?: string;
  acceptedTypes?: string;
}

interface UploadedDocument {
  id: string;
  type: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  status: "uploading" | "uploaded" | "failed";
}

export default function DocumentUploadForm({ 
  onContinue, 
  onBack, 
  applicationId,
  existingDocuments = []
}: DocumentUploadFormProps) {
  const { toast } = useToast();
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, UploadedDocument>>(
    existingDocuments.reduce((acc, doc) => ({
      ...acc,
      [doc.type]: { ...doc, status: "uploaded" }
    }), {})
  );
  const [uploadingType, setUploadingType] = useState<string | null>(null);

  // Define document requirements - all optional for initial submission
  const documentRequirements: DocumentRequirement[] = [
    {
      type: "financial-statements",
      label: "Financial Statements",
      required: false, // Changed to optional
      description: "Last 3 years of business financial statements (P&L, Balance Sheet, Cash Flow)",
      acceptedTypes: ".pdf,.xls,.xlsx"
    },
    {
      type: "tax-returns",
      label: "Tax Returns",
      required: false, // Changed to optional
      description: "Last 3 years of business and personal tax returns",
      acceptedTypes: ".pdf"
    },
    {
      type: "rent-roll",
      label: "Rent Roll",
      required: false, // Changed to optional
      description: "Current rent roll showing all tenants, rents, and lease terms",
      acceptedTypes: ".pdf,.xls,.xlsx"
    },
    {
      type: "property-photos",
      label: "Property Photos",
      required: false,
      description: "Recent photos of the property (exterior and interior)",
      acceptedTypes: ".jpg,.jpeg,.png,.pdf"
    },
    {
      type: "purchase-agreement",
      label: "Purchase Agreement",
      required: false,
      description: "Signed purchase agreement or LOI (if acquisition)",
      acceptedTypes: ".pdf,.doc,.docx"
    },
    {
      type: "appraisal",
      label: "Property Appraisal",
      required: false,
      description: "Recent property appraisal report (if available)",
      acceptedTypes: ".pdf"
    },
    {
      type: "environmental",
      label: "Environmental Report",
      required: false,
      description: "Phase I Environmental Site Assessment (if available)",
      acceptedTypes: ".pdf"
    },
    {
      type: "insurance",
      label: "Insurance Documentation",
      required: false,
      description: "Current property insurance policy or quote",
      acceptedTypes: ".pdf"
    }
  ];

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async ({ file, type }: { file: File; type: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await fetch(`/api/applications/${applicationId}/documents`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      setUploadedDocs(prev => ({
        ...prev,
        [variables.type]: {
          ...data,
          status: "uploaded" as const
        }
      }));
      setUploadingType(null);
      toast({
        title: "Document uploaded",
        description: `${data.fileName} has been uploaded successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${applicationId}/documents`] });
    },
    onError: (error: any, variables) => {
      setUploadingType(null);
      setUploadedDocs(prev => {
        const updated = { ...prev };
        if (updated[variables.type]) {
          updated[variables.type].status = "failed";
        }
        return updated;
      });
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleFileSelect = async (type: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!applicationId) {
      toast({
        title: "Error",
        description: "Please save your application before uploading documents.",
        variant: "destructive",
      });
      return;
    }

    const file = files[0];
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    // Set uploading state
    setUploadingType(type);
    setUploadedDocs(prev => ({
      ...prev,
      [type]: {
        id: "",
        type,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        status: "uploading"
      }
    }));

    // Upload the file
    await uploadDocumentMutation.mutateAsync({ file, type });
  };

  const handleRemoveDocument = async (type: string) => {
    const doc = uploadedDocs[type];
    if (!doc || !doc.id) return;

    try {
      await apiRequest("DELETE", `/api/applications/${applicationId}/documents/${doc.id}`);
      
      setUploadedDocs(prev => {
        const updated = { ...prev };
        delete updated[type];
        return updated;
      });

      toast({
        title: "Document removed",
        description: "The document has been removed successfully.",
      });

      queryClient.invalidateQueries({ queryKey: [`/api/applications/${applicationId}/documents`] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to remove document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleContinue = () => {
    // Documents are now optional - users can upload later
    // Show a reminder if no documents uploaded
    const uploadedCount = Object.keys(uploadedDocs).length;
    
    if (uploadedCount === 0) {
      toast({
        title: "No documents uploaded",
        description: "You can upload supporting documents later from your dashboard.",
        duration: 3000,
      });
    }

    onContinue?.();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const requiredDocsUploaded = documentRequirements
    .filter(req => req.required)
    .every(req => uploadedDocs[req.type]?.status === "uploaded");

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold mb-2" data-testid="text-heading">
          Document Upload
        </h1>
        <p className="text-muted-foreground" data-testid="text-subheading">
          Upload required documents to support your loan application
        </p>
      </div>

      <div className="space-y-6">
        {!applicationId && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your application needs to be saved before you can upload documents. 
              Please complete the previous steps first.
            </AlertDescription>
          </Alert>
        )}

        <Card className="p-8">
          <h3 className="text-lg font-semibold mb-6">Required Documents</h3>
          <div className="space-y-4">
            {documentRequirements
              .filter(req => req.required)
              .map((requirement) => (
                <DocumentUploadItem
                  key={requirement.type}
                  requirement={requirement}
                  uploadedDoc={uploadedDocs[requirement.type]}
                  isUploading={uploadingType === requirement.type}
                  onFileSelect={handleFileSelect}
                  onRemove={handleRemoveDocument}
                  disabled={!applicationId || uploadingType !== null}
                />
              ))}
          </div>
        </Card>

        <Card className="p-8">
          <h3 className="text-lg font-semibold mb-6">Optional Documents</h3>
          <p className="text-sm text-muted-foreground mb-4">
            These documents can help expedite your application but are not required at this time.
          </p>
          <div className="space-y-4">
            {documentRequirements
              .filter(req => !req.required)
              .map((requirement) => (
                <DocumentUploadItem
                  key={requirement.type}
                  requirement={requirement}
                  uploadedDoc={uploadedDocs[requirement.type]}
                  isUploading={uploadingType === requirement.type}
                  onFileSelect={handleFileSelect}
                  onRemove={handleRemoveDocument}
                  disabled={!applicationId || uploadingType !== null}
                />
              ))}
          </div>
        </Card>

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onBack}
            className="h-12 px-8"
            data-testid="button-back"
          >
            Back
          </Button>
          <Button
            type="button"
            size="lg"
            className="h-12 px-8"
            onClick={handleContinue}
            disabled={!requiredDocsUploaded}
            data-testid="button-continue"
          >
            Continue to Review
          </Button>
        </div>
      </div>
    </div>
  );
}

// Document upload item component
function DocumentUploadItem({
  requirement,
  uploadedDoc,
  isUploading,
  onFileSelect,
  onRemove,
  disabled
}: {
  requirement: DocumentRequirement;
  uploadedDoc?: UploadedDocument;
  isUploading: boolean;
  onFileSelect: (type: string, files: FileList | null) => void;
  onRemove: (type: string) => void;
  disabled: boolean;
}) {
  const inputId = `file-${requirement.type}`;

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Label className="font-medium">
              {requirement.label}
              {requirement.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {uploadedDoc?.status === "uploaded" && (
              <Badge variant="outline" className="text-xs">
                <Check className="w-3 h-3 mr-1" />
                Uploaded
              </Badge>
            )}
            {isUploading && (
              <Badge variant="outline" className="text-xs">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Uploading...
              </Badge>
            )}
          </div>
          {requirement.description && (
            <p className="text-sm text-muted-foreground mb-2">{requirement.description}</p>
          )}
          
          {uploadedDoc && (
            <div className="flex items-center gap-2 mt-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{uploadedDoc.fileName}</span>
              <span className="text-xs text-muted-foreground">
                ({formatFileSize(uploadedDoc.fileSize)})
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {uploadedDoc?.status === "uploaded" ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemove(requirement.type)}
              disabled={disabled}
              data-testid={`button-remove-${requirement.type}`}
            >
              <X className="w-4 h-4" />
            </Button>
          ) : (
            <>
              <input
                id={inputId}
                type="file"
                accept={requirement.acceptedTypes}
                className="hidden"
                onChange={(e) => onFileSelect(requirement.type, e.target.files)}
                disabled={disabled}
                data-testid={`input-file-${requirement.type}`}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById(inputId)?.click()}
                disabled={disabled}
                data-testid={`button-upload-${requirement.type}`}
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploadedDoc ? "Replace" : "Upload"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}