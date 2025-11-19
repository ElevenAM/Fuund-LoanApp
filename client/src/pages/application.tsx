import { useState } from "react";
import { useLocation } from "wouter";
import { Building2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ProgressStepper from "@/components/ProgressStepper";
import SaveIndicator from "@/components/SaveIndicator";
import QuickStartForm from "@/components/QuickStartForm";
import PropertyBasicsForm from "@/components/PropertyBasicsForm";
import FinancialSnapshotForm from "@/components/FinancialSnapshotForm";
import ReviewSubmitForm from "@/components/ReviewSubmitForm";

export default function Application() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [saveStatus, setSaveStatus] = useState<"saving" | "saved" | "idle">("saved");

  const steps = [
    { id: 1, name: "Quick Start", status: (currentStep > 1 ? "completed" : currentStep === 1 ? "current" : "upcoming") as "completed" | "current" | "upcoming" },
    { id: 2, name: "Property Details", status: (currentStep > 2 ? "completed" : currentStep === 2 ? "current" : "upcoming") as "completed" | "current" | "upcoming" },
    { id: 3, name: "Loan Specifics", status: (currentStep > 3 ? "completed" : currentStep === 3 ? "current" : "upcoming") as "completed" | "current" | "upcoming" },
    { id: 4, name: "Financial Snapshot", status: (currentStep > 4 ? "completed" : currentStep === 4 ? "current" : "upcoming") as "completed" | "current" | "upcoming" },
    { id: 5, name: "Property Performance", status: (currentStep > 5 ? "completed" : currentStep === 5 ? "current" : "upcoming") as "completed" | "current" | "upcoming" },
    { id: 6, name: "Documents", status: (currentStep > 6 ? "completed" : currentStep === 6 ? "current" : "upcoming") as "completed" | "current" | "upcoming" },
    { id: 7, name: "Review & Submit", status: (currentStep === 7 ? "current" : "upcoming") as "completed" | "current" | "upcoming" },
  ];

  const handleContinue = (data: any) => {
    console.log("Step data:", data);
    setSaveStatus("saving");
    setTimeout(() => {
      setSaveStatus("saved");
      setCurrentStep((prev) => Math.min(prev + 1, 7));
    }, 1000);
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    console.log("Application submitted!");
    setLocation("/dashboard");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <QuickStartForm onContinue={handleContinue} />;
      case 2:
        return <PropertyBasicsForm onContinue={handleContinue} onBack={handleBack} />;
      case 4:
        return <FinancialSnapshotForm onContinue={handleContinue} onBack={handleBack} />;
      case 7:
        return <ReviewSubmitForm onSubmit={handleSubmit} onBack={handleBack} />;
      default:
        return (
          <div className="w-full max-w-4xl mx-auto">
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold mb-4">Step {currentStep} Coming Soon</h2>
              <p className="text-muted-foreground mb-8">This step is part of the full implementation</p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button onClick={() => handleContinue({})}>
                  Continue
                </Button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden lg:block w-80 border-r bg-card">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            <h1 className="font-semibold">Commercial Loans</h1>
          </div>
        </div>
        <ProgressStepper steps={steps} />
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="border-b bg-card px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden" data-testid="button-menu">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <div className="p-6 border-b">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-6 h-6 text-primary" />
                      <h1 className="font-semibold">Commercial Loans</h1>
                    </div>
                  </div>
                  <ProgressStepper steps={steps} />
                </SheetContent>
              </Sheet>
              <div className="lg:hidden flex items-center gap-2">
                <Building2 className="w-6 h-6 text-primary" />
                <h1 className="font-semibold">Commercial Loans</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <SaveIndicator status={saveStatus} />
              <Button variant="outline" size="sm" onClick={() => setLocation("/")} data-testid="button-save-exit">
                Save & Exit
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {renderStep()}
        </main>
      </div>
    </div>
  );
}
