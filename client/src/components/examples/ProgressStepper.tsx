import ProgressStepper from "../ProgressStepper";

export default function ProgressStepperExample() {
  const steps = [
    { id: 1, name: "Quick Start", status: "completed" as const },
    { id: 2, name: "Property Details", status: "completed" as const },
    { id: 3, name: "Loan Specifics", status: "current" as const },
    { id: 4, name: "Financial Snapshot", status: "upcoming" as const },
    { id: 5, name: "Property Performance", status: "upcoming" as const },
    { id: 6, name: "Documents", status: "upcoming" as const },
    { id: 7, name: "Review & Submit", status: "upcoming" as const },
  ];

  return (
    <div className="w-72 bg-card rounded-lg border">
      <ProgressStepper steps={steps} />
    </div>
  );
}
