import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Edit2, AlertCircle } from "lucide-react";
import MetricCard from "./MetricCard";
import DocumentCard from "./DocumentCard";
import successIcon from "@assets/generated_images/Document_upload_success_icon_3ca99d90.png";

interface ReviewSubmitFormProps {
  onSubmit?: () => void;
  onBack?: () => void;
  onEdit?: (section: string) => void;
}

export default function ReviewSubmitForm({ onSubmit, onBack, onEdit }: ReviewSubmitFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Application submitted for term sheet");
    onSubmit?.();
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-6" data-testid="button-back">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back
      </Button>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2" data-testid="text-heading">
          Review & Submit for Term Sheet
        </h2>
        <p className="text-muted-foreground" data-testid="text-subheading">
          Double-check your information before submitting
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            label="Loan-to-Value (LTV)"
            value="75.0%"
            tooltip="Calculated based on loan amount and property value"
            status="good"
          />
          <MetricCard
            label="DSCR"
            value="1.35"
            tooltip="Net operating income divided by debt service"
            status="good"
            trend="up"
          />
          <MetricCard
            label="Monthly Interest"
            value="$12,500"
            tooltip="Estimated based on current rates"
            status="neutral"
          />
        </div>

        <Card className="p-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Loan Details</h3>
              <p className="text-sm text-muted-foreground mt-1">Quick Start Information</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit?.("quick-start")}
              data-testid="button-edit-loan-details"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Loan Type</span>
              <span className="text-sm font-medium" data-testid="text-loan-type">
                Permanent Acquisition
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Loan Amount</span>
              <span className="text-sm font-medium" data-testid="text-loan-amount">
                $3,000,000
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Property Location</span>
              <span className="text-sm font-medium" data-testid="text-property-location">
                New York, NY
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Property Information</h3>
              <p className="text-sm text-muted-foreground mt-1">Property & Borrower Details</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit?.("property-basics")}
              data-testid="button-edit-property-info"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Property Type</span>
              <span className="text-sm font-medium" data-testid="text-property-type">
                Multifamily
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Square Footage</span>
              <span className="text-sm font-medium" data-testid="text-square-footage">
                50,000 SF
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Occupancy</span>
              <span className="text-sm font-medium" data-testid="text-occupancy">
                95%
              </span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Borrower Entity</span>
              <span className="text-sm font-medium" data-testid="text-entity-name">
                ABC Properties LLC
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Contact</span>
              <span className="text-sm font-medium" data-testid="text-contact">
                john@example.com
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-8">
          <h3 className="text-lg font-semibold mb-4">Document Status</h3>
          <div className="space-y-4">
            <DocumentCard
              name="Purchase Contract"
              status="uploaded"
              fileType="PDF"
              size="2.4 MB"
            />
            <DocumentCard
              name="Bank Statements (Last 2 months)"
              status="pending"
            />
            <DocumentCard
              name="Tax Returns"
              status="pending"
            />
          </div>

          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  Missing Documents
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                  You have 2 documents marked as "Upload Later". These will be required before moving to underwriting after term sheet acceptance.
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-8 bg-accent">
          <div className="flex flex-col items-center text-center gap-4">
            <img src={successIcon} alt="Ready to submit" className="w-16 h-16" />
            <div>
              <h3 className="text-lg font-semibold mb-1">Ready to Submit</h3>
              <p className="text-sm text-muted-foreground">
                You'll receive your term sheet within 1-14 days
              </p>
            </div>
          </div>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack} type="button" data-testid="button-back-bottom">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <Button type="submit" size="lg" className="h-12 px-8" data-testid="button-submit">
            Submit for Term Sheet
          </Button>
        </div>
      </form>
    </div>
  );
}
