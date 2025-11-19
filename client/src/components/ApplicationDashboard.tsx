import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Circle, Clock, FileText, Upload } from "lucide-react";
import DocumentCard from "./DocumentCard";

export default function ApplicationDashboard() {
  const applicationStatus = "submitted";

  const statusSteps = [
    { id: "draft", label: "Draft", status: "completed" },
    { id: "submitted", label: "Submitted", status: "current" },
    { id: "term-sheet", label: "Term Sheet", status: "upcoming" },
    { id: "underwriting", label: "Underwriting", status: "upcoming" },
    { id: "closing", label: "Closing", status: "upcoming" },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2" data-testid="text-heading">
          Application Dashboard
        </h1>
        <p className="text-muted-foreground" data-testid="text-subheading">
          Track your commercial loan application
        </p>
      </div>

      <Card className="p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-1">Application #LA-2024-0123</h2>
            <p className="text-sm text-muted-foreground">
              Permanent Acquisition • $3,000,000 • New York, NY
            </p>
          </div>
          <Badge className="w-fit" data-testid="badge-status">
            <Clock className="w-3 h-3 mr-1" />
            Under Review
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
              <span className="text-sm text-muted-foreground">Submitted</span>
              <span className="text-sm font-medium" data-testid="text-submitted-date">
                Jan 15, 2024
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Property Type</span>
              <span className="text-sm font-medium" data-testid="text-property-type">
                Multifamily
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">LTV</span>
              <span className="text-sm font-medium" data-testid="text-ltv">
                75.0%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">DSCR</span>
              <span className="text-sm font-medium" data-testid="text-dscr">
                1.35
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Circle className="w-4 h-4 mt-0.5 text-primary fill-primary" />
              <div>
                <p className="text-sm font-medium">Await Term Sheet</p>
                <p className="text-xs text-muted-foreground">
                  Expected within 7-14 business days
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Circle className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Upload Pending Documents
                </p>
                <p className="text-xs text-muted-foreground">
                  2 documents marked for later upload
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Pending Documents</h3>
          <Badge variant="secondary" data-testid="badge-pending-count">
            2 Pending
          </Badge>
        </div>
        <div className="space-y-4">
          <DocumentCard
            name="Bank Statements (Last 2 months)"
            status="pending"
            onUpload={() => console.log("Upload bank statements")}
          />
          <DocumentCard
            name="Tax Returns (3 years)"
            status="pending"
            onUpload={() => console.log("Upload tax returns")}
          />
        </div>
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
    </div>
  );
}
