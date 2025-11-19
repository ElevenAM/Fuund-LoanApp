import FinancialSnapshotForm from "../FinancialSnapshotForm";

export default function FinancialSnapshotFormExample() {
  return (
    <div className="p-8 bg-background min-h-screen">
      <FinancialSnapshotForm
        onContinue={(data) => console.log("Continue clicked:", data)}
        onBack={() => console.log("Back clicked")}
      />
    </div>
  );
}
