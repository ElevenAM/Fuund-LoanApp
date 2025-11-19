import DocumentUploadZone from "../DocumentUploadZone";

export default function DocumentUploadZoneExample() {
  return (
    <div className="p-8 max-w-2xl space-y-6">
      <DocumentUploadZone
        label="Purchase Contract"
        description="Upload your signed purchase agreement"
        required={true}
        onUpload={(files) => console.log("Files uploaded:", files)}
      />
      <DocumentUploadZone
        label="Bank Statements"
        description="Last 2 months (optional - can upload later)"
        onUpload={(files) => console.log("Files uploaded:", files)}
      />
    </div>
  );
}
