import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Building2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import ProgressStepper from "@/components/ProgressStepper";
import SaveIndicator from "@/components/SaveIndicator";
import QuickStartForm from "@/components/QuickStartForm";
import PropertyBasicsForm from "@/components/PropertyBasicsForm";
import LoanSpecificsForm from "@/components/LoanSpecificsForm";
import FinancialSnapshotForm from "@/components/FinancialSnapshotForm";
import PropertyPerformanceForm from "@/components/PropertyPerformanceForm";
import ReviewSubmitForm from "@/components/ReviewSubmitForm";

export default function Application() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [saveStatus, setSaveStatus] = useState<"saving" | "saved" | "idle">("saved");
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [applicationData, setApplicationData] = useState<any>({});
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/api/login?redirect=/apply";
    }
  }, [authLoading, isAuthenticated]);
  
  // Load existing draft application or create new one
  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ["/api/applications"],
    enabled: isAuthenticated,
  });
  
  // Initialize application on mount
  useEffect(() => {
    if (applications && applications.length > 0) {
      // Find the most recent draft application
      const draftApp = applications
        .filter((app: any) => app.status === "draft")
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      
      if (draftApp) {
        setApplicationId(draftApp.id);
        setApplicationData(draftApp);
        
        // Set current step based on saved progress
        const stepMap: Record<string, number> = {
          "quick-start": 1,
          "property-details": 2,
          "loan-specifics": 3,
          "financial-snapshot": 4,
          "property-performance": 5,
          "documents": 6,
          "review-submit": 7,
        };
        setCurrentStep(stepMap[draftApp.currentStep] || 1);
      }
    }
  }, [applications]);
  
  // Create application mutation
  const createApplicationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/applications", data);
      return await response.json();
    },
    onSuccess: (data) => {
      setApplicationId(data.id);
      setApplicationData(data);
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
    },
  });
  
  // Update application mutation
  const updateApplicationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PATCH", `/api/applications/${id}`, data);
      return await response.json();
    },
    onSuccess: (data) => {
      setApplicationData(data);
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/applications", data.id] });
    },
  });

  const steps = [
    { id: 1, name: "Quick Start", status: (currentStep > 1 ? "completed" : currentStep === 1 ? "current" : "upcoming") as "completed" | "current" | "upcoming" },
    { id: 2, name: "Property Details", status: (currentStep > 2 ? "completed" : currentStep === 2 ? "current" : "upcoming") as "completed" | "current" | "upcoming" },
    { id: 3, name: "Loan Specifics", status: (currentStep > 3 ? "completed" : currentStep === 3 ? "current" : "upcoming") as "completed" | "current" | "upcoming" },
    { id: 4, name: "Financial Snapshot", status: (currentStep > 4 ? "completed" : currentStep === 4 ? "current" : "upcoming") as "completed" | "current" | "upcoming" },
    { id: 5, name: "Property Performance", status: (currentStep > 5 ? "completed" : currentStep === 5 ? "current" : "upcoming") as "completed" | "current" | "upcoming" },
    { id: 6, name: "Documents", status: (currentStep > 6 ? "completed" : currentStep === 6 ? "current" : "upcoming") as "completed" | "current" | "upcoming" },
    { id: 7, name: "Review & Submit", status: (currentStep === 7 ? "current" : "upcoming") as "completed" | "current" | "upcoming" },
  ];

  // Helper function to clean empty strings from payload
  const cleanPayload = (obj: any) => {
    const cleaned: any = {};
    for (const key in obj) {
      const value = obj[key];
      // Convert empty strings to undefined so they don't get sent to the API
      // Keep non-empty strings, numbers, booleans, objects, and arrays
      if (value !== "" && value !== null) {
        cleaned[key] = value;
      }
    }
    return cleaned;
  };

  const handleContinue = async (data: any) => {
    console.log("Step data:", data);
    setSaveStatus("saving");
    
    try {
      // Clean empty strings from incoming data
      const cleanedData = cleanPayload(data);
      
      // Merge new data with existing application data
      const mergedData = {
        ...applicationData,
        ...cleanedData,
      };
      
      // Determine next step
      const nextStep = Math.min(currentStep + 1, 7);
      const stepNames = [
        "quick-start",
        "property-details",
        "loan-specifics",
        "financial-snapshot",
        "property-performance",
        "documents",
        "review-submit",
      ];
      
      const updatePayload = {
        ...mergedData,
        currentStep: stepNames[nextStep - 1],
      };
      
      let savedApp;
      if (applicationId) {
        // Update existing application - strip server-managed fields
        const { userId, id, createdAt, updatedAt, ltv, dscr, monthlyInterest, ...updateData } = updatePayload;
        savedApp = await updateApplicationMutation.mutateAsync({
          id: applicationId,
          data: updateData,
        });
      } else {
        // Create new application - strip server-managed fields except status
        const { userId, id, createdAt, updatedAt, ltv, dscr, monthlyInterest, ...createData } = updatePayload;
        savedApp = await createApplicationMutation.mutateAsync({
          ...createData,
          status: "draft",
        });
      }
      
      // Update local state with the saved application
      setApplicationId(savedApp.id);
      setApplicationData(savedApp);
      
      setSaveStatus("saved");
      setCurrentStep(nextStep);
    } catch (error: any) {
      console.error("Error saving application:", error);
      setSaveStatus("idle");
      toast({
        title: "Error saving application",
        description: error.message || "Failed to save. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!applicationId) {
      toast({
        title: "Error",
        description: "No application to submit",
        variant: "destructive",
      });
      return;
    }
    
    setSaveStatus("saving");
    
    try {
      await updateApplicationMutation.mutateAsync({
        id: applicationId,
        data: { status: "submitted" },
      });
      
      toast({
        title: "Application submitted!",
        description: "Your application has been submitted successfully.",
      });
      
      setLocation("/dashboard");
    } catch (error: any) {
      console.error("Error submitting application:", error);
      setSaveStatus("idle");
      toast({
        title: "Error submitting application",
        description: error.message || "Failed to submit. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveAndExit = async () => {
    if (applicationId) {
      setSaveStatus("saving");
      try {
        await updateApplicationMutation.mutateAsync({
          id: applicationId,
          data: {}, // Just trigger a save with current state
        });
        setSaveStatus("saved");
      } catch (error) {
        console.error("Error saving on exit:", error);
        setSaveStatus("idle");
      }
    }
    setLocation("/dashboard");
  };
  
  const renderStep = () => {
    if (authLoading || applicationsLoading) {
      return (
        <div className="w-full max-w-4xl mx-auto">
          <div className="text-center py-16">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      );
    }
    
    switch (currentStep) {
      case 1:
        return <QuickStartForm onContinue={handleContinue} initialData={applicationData} />;
      case 2:
        return <PropertyBasicsForm onContinue={handleContinue} onBack={handleBack} initialData={applicationData} />;
      case 3:
        return <LoanSpecificsForm onContinue={handleContinue} onBack={handleBack} initialData={applicationData} />;
      case 4:
        return <FinancialSnapshotForm onContinue={handleContinue} onBack={handleBack} initialData={applicationData} />;
      case 5:
        return <PropertyPerformanceForm onContinue={handleContinue} onBack={handleBack} initialData={applicationData} />;
      case 7:
        return <ReviewSubmitForm onSubmit={handleSubmit} onBack={handleBack} data={applicationData} />;
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
              <Button variant="outline" size="sm" onClick={handleSaveAndExit} data-testid="button-save-exit">
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
