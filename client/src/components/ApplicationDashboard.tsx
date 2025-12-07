import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Circle, Clock, FileText, Upload, Plus, Loader2 } from "lucide-react";
import { format } from "date-fns";
import DocumentCard from "./DocumentCard";
import { useQuery } from "@tanstack/react-query";

interface Document {
  id: string;
  type: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

interface Application {
  id: string;
  status: string;
  loanType?: string;
  loanAmount?: string;
  propertyCity?: string;
  propertyState?: string;
  propertyType?: string;
  createdAt: string;
  currentStep?: string;
  calculatedLtv?: string;
  calculatedDscr?: string;
  calculatedMonthlyInterest?: string;
}

interface ApplicationDashboardProps {
  applications: Application[];
}

export default function ApplicationDashboard({ applications }: ApplicationDashboardProps) {
  const [, setLocation] = useLocation();
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(
    applications[0]?.id || null
  );
  
  const selectedApplication = applications.find((app) => app.id === selectedApplicationId);

  const { data: documents, isLoading: documentsLoading } = useQuery<Document[]>({
    queryKey: ['/api/applications', selectedApplicationId, 'documents'],
    enabled: !!selectedApplicationId,
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getDocumentTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      "bank-statements": "Bank Statements",
      "tax-return": "Tax Return",
      "personal-financial-statement": "Personal Financial Statement",
      "financial-statements": "Financial Statements",
      "tax-returns": "Tax Returns",
      "rent-roll": "Rent Roll",
      "property-photos": "Property Photos",
      "purchase-agreement": "Purchase Agreement",
      "appraisal": "Property Appraisal",
      "environmental": "Environmental Report",
      "insurance": "Insurance Documentation",
    };
    return typeLabels[type] || type.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  const statusSteps = [
    { id: "draft", label: "Draft", status: "completed" },
    { id: "submitted", label: "Submitted", status: "current" },
    { id: "term-sheet", label: "Term Sheet", status: "upcoming" },
    { id: "underwriting", label: "Underwriting", status: "upcoming" },
    { id: "closing", label: "Closing", status: "upcoming" },
  ];

  if (applications.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2" data-testid="text-heading">
            Application Dashboard
          </h1>
          <p className="text-muted-foreground" data-testid="text-subheading">
            Track your commercial loan applications
          </p>
        </div>
        
        <Card className="p-12 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">No applications yet</h2>
          <p className="text-muted-foreground mb-6">
            Start your first application to get financing for your commercial real estate project
          </p>
          <Button onClick={() => setLocation("/apply")} data-testid="button-start-first-app">
            <Plus className="w-4 h-4 mr-2" />
            Start New Application
          </Button>
        </Card>
      </div>
    );
  }
  
  const formatStatus = (status: string) => {
    switch (status) {
      case "draft":
        return { label: "Draft", variant: "secondary" as const };
      case "submitted":
        return { label: "Under Review", variant: "default" as const };
      case "term-sheet":
        return { label: "Term Sheet Ready", variant: "default" as const };
      case "underwriting":
        return { label: "In Underwriting", variant: "default" as const };
      case "approved":
        return { label: "Approved", variant: "default" as const };
      case "rejected":
        return { label: "Rejected", variant: "destructive" as const };
      default:
        return { label: status, variant: "secondary" as const };
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2" data-testid="text-heading">
          Application Dashboard
        </h1>
        <p className="text-muted-foreground" data-testid="text-subheading">
          Track your commercial loan applications
        </p>
      </div>
      
      {/* Applications List */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Your Applications</h3>
        <div className="space-y-3">
          {applications.map((app) => {
            const statusInfo = formatStatus(app.status);
            return (
              <div
                key={app.id}
                className={`p-4 rounded-lg border cursor-pointer transition-colors hover-elevate ${
                  selectedApplicationId === app.id
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
                onClick={() => setSelectedApplicationId(app.id)}
                data-testid={`application-card-${app.id}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold truncate">
                        {app.loanType
                          ? app.loanType.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
                          : "Application"}
                      </h4>
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      {app.loanAmount && <span>${Number(app.loanAmount).toLocaleString()}</span>}
                      {app.propertyCity && app.propertyState && (
                        <>
                          <span>•</span>
                          <span>{app.propertyCity}, {app.propertyState}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>Created {format(new Date(app.createdAt), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                  {app.status === "draft" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation("/apply");
                      }}
                      data-testid={`button-continue-${app.id}`}
                    >
                      Continue
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      
      {selectedApplication && (
        <>
          <Card className="p-8 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">
                  Application #{selectedApplication.id.slice(0, 12).toUpperCase()}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {selectedApplication.loanType
                    ? selectedApplication.loanType.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
                    : ""}
                  {selectedApplication.loanAmount && ` • $${Number(selectedApplication.loanAmount).toLocaleString()}`}
                  {selectedApplication.propertyCity && selectedApplication.propertyState &&
                    ` • ${selectedApplication.propertyCity}, ${selectedApplication.propertyState}`}
                </p>
              </div>
              <Badge className="w-fit" data-testid="badge-status">
                <Clock className="w-3 h-3 mr-1" />
                {formatStatus(selectedApplication.status).label}
              </Badge>
            </div>

        <div className="relative">
          <div className="flex justify-between">
            {statusSteps.map((step, idx) => (
              <div key={step.id} className="flex flex-col items-center flex-1 relative">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    step.status === "completed"
                      ? "bg-primary"
                      : step.status === "current"
                      ? "bg-primary/20 border-2 border-primary"
                      : "bg-muted border-2 border-border"
                  }`}
                  data-testid={`status-indicator-${step.id}`}
                >
                  {step.status === "completed" ? (
                    <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
                  ) : step.status === "current" ? (
                    <Circle className="w-4 h-4 fill-primary text-primary" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <p
                  className={`text-xs text-center ${
                    step.status === "current"
                      ? "font-semibold text-primary"
                      : step.status === "completed"
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  }`}
                  data-testid={`text-status-${step.id}`}
                >
                  {step.label}
                </p>
                {idx < statusSteps.length - 1 && (
                  <div
                    className={`absolute top-5 left-1/2 w-full h-0.5 ${
                      step.status === "completed" ? "bg-primary" : "bg-border"
                    }`}
                    style={{ zIndex: -1 }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Application Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Created</span>
              <span className="text-sm font-medium" data-testid="text-submitted-date">
                {format(new Date(selectedApplication.createdAt), "MMM d, yyyy")}
              </span>
            </div>
            {selectedApplication.propertyType && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Property Type</span>
                <span className="text-sm font-medium" data-testid="text-property-type">
                  {selectedApplication.propertyType.charAt(0).toUpperCase() + selectedApplication.propertyType.slice(1)}
                </span>
              </div>
            )}
            {selectedApplication.calculatedLtv && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">LTV</span>
                <span className="text-sm font-medium" data-testid="text-ltv">
                  {selectedApplication.calculatedLtv}%
                </span>
              </div>
            )}
            {selectedApplication.calculatedDscr && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">DSCR</span>
                <span className="text-sm font-medium" data-testid="text-dscr">
                  {selectedApplication.calculatedDscr}
                </span>
              </div>
            )}
            {selectedApplication.calculatedMonthlyInterest && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Monthly Interest</span>
                <span className="text-sm font-medium" data-testid="text-monthly-interest">
                  ${Number(selectedApplication.calculatedMonthlyInterest).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
          <div className="space-y-3">
            {selectedApplication.status === "draft" && (
              <div className="flex items-start gap-3">
                <Circle className="w-4 h-4 mt-0.5 text-primary fill-primary" />
                <div>
                  <p className="text-sm font-medium">Complete Application</p>
                  <p className="text-xs text-muted-foreground">
                    Continue filling out your application to submit it
                  </p>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-xs mt-1"
                    onClick={() => setLocation("/apply")}
                    data-testid="button-continue-app"
                  >
                    Continue Application →
                  </Button>
                </div>
              </div>
            )}
            {selectedApplication.status === "submitted" && (
              <div className="flex items-start gap-3">
                <Circle className="w-4 h-4 mt-0.5 text-primary fill-primary" />
                <div>
                  <p className="text-sm font-medium">Await Term Sheet</p>
                  <p className="text-xs text-muted-foreground">
                    Expected within 7-14 business days
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Uploaded Documents
        </h3>
        {documentsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : documents && documents.length > 0 ? (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div 
                key={doc.id} 
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
                data-testid={`document-row-${doc.id}`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium" data-testid={`text-document-name-${doc.id}`}>
                      {doc.fileName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getDocumentTypeLabel(doc.type)} • {formatFileSize(doc.fileSize)}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Uploaded
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No documents uploaded yet
            </p>
            {selectedApplication?.status === "draft" && (
              <Button
                variant="link"
                className="h-auto p-0 text-sm mt-2"
                onClick={() => setLocation("/apply")}
                data-testid="button-upload-documents"
              >
                Upload documents in your application
              </Button>
            )}
          </div>
        )}
      </Card>

      <Card className="p-8 mt-6">
        <h3 className="text-lg font-semibold mb-4">Lender-Ordered Reports</h3>
        <p className="text-sm text-muted-foreground mb-4">
          These will be ordered after term sheet acceptance (borrower pays)
        </p>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium">Appraisal</p>
              <p className="text-xs text-muted-foreground">Est. $5,000 - $25,000</p>
            </div>
            <Badge variant="outline">Not Started</Badge>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium">Phase I Environmental</p>
              <p className="text-xs text-muted-foreground">Est. $2,000 - $5,000</p>
            </div>
            <Badge variant="outline">Not Started</Badge>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium">Property Condition Assessment</p>
              <p className="text-xs text-muted-foreground">Est. $3,000 - $17,000</p>
            </div>
            <Badge variant="outline">Not Started</Badge>
          </div>
        </div>
      </Card>
        </>
      )}
    </div>
  );
}
