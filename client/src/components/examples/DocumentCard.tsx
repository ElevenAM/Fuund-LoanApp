import DocumentCard from "../DocumentCard";

export default function DocumentCardExample() {
  return (
    <div className="p-8 space-y-4 max-w-lg">
      <DocumentCard
        name="Purchase Contract"
        status="uploaded"
        fileType="PDF"
        size="2.4 MB"
        onRemove={() => console.log("Remove document")}
      />
      <DocumentCard
        name="Bank Statements (Last 2 months)"
        status="pending"
        onUpload={() => console.log("Upload document")}
      />
      <DocumentCard
        name="Tax Returns (3 years)"
        status="required"
        onUpload={() => console.log("Upload document")}
      />
    </div>
  );
}
