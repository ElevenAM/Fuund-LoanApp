import QuickStartForm from "../QuickStartForm";

export default function QuickStartFormExample() {
  return (
    <div className="p-8 bg-background min-h-screen">
      <QuickStartForm onContinue={(data) => console.log("Continue clicked:", data)} />
    </div>
  );
}
