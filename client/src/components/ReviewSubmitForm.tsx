import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronLeft, Edit2, AlertCircle, Check, FileText, Upload } from "lucide-react";
import MetricCard from "./MetricCard";

interface ReviewSubmitFormProps {
  onSubmit?: () => void;
  onBack?: () => void;
  data?: any;
}

export default function ReviewSubmitForm({ onSubmit, onBack, data = {} }: ReviewSubmitFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.();
  };

  // Format currency values
  const formatCurrency = (value: any) => {
    const num = parseFloat(String(value).replace(/,/g, ""));
    if (isNaN(num)) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Format loan type for display
  const formatLoanType = (type: string) => {
    const typeMap: Record<string, string> = {
      "permanent-acquisition": "Permanent Acquisition",
      "permanent-refinance": "Permanent Refinance",
      "bridge-acquisition": "Bridge Acquisition",
      "bridge-refinance": "Bridge Refinance",
      "construction": "Construction",
    };
    return typeMap[type] || type;
  };

  // Format property type for display
  const formatPropertyType = (type: string) => {
    const typeMap: Record<string, string> = {
      "multifamily": "Multifamily",
      "office": "Office",
      "retail": "Retail",
      "industrial": "Industrial",
      "mixed-use": "Mixed Use",
      "self-storage": "Self Storage",
      "land": "Land",
    };
    return typeMap[type] || type;
  };

  // Extract loan specifics and property performance data
  const loanSpecifics = data.loanSpecifics || {};
  const annualGrossIncome = loanSpecifics.annualGrossIncome || data.annualGrossIncome;
  const annualOperatingExpenses = loanSpecifics.annualOperatingExpenses || data.annualOperatingExpenses;

  // Check for missing required information
  const missingFields = [];
  if (!data.loanAmount) missingFields.push("Loan Amount");
  if (!data.propertyType) missingFields.push("Property Type");
  if (!loanSpecifics.propertyValue) missingFields.push("Property Value");
  
  // Determine metric statuses based on values
  const ltv = data.calculatedLtv ? parseFloat(data.calculatedLtv) : null;
  const dscr = data.calculatedDscr ? parseFloat(data.calculatedDscr) : null;
  
  const ltvStatus = ltv ? (ltv <= 75 ? "good" : ltv <= 85 ? "neutral" : "warning") : "neutral";
  const dscrStatus = dscr ? (dscr >= 1.25 ? "good" : dscr >= 1.1 ? "neutral" : "warning") : "neutral";

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold mb-2" data-testid="text-heading">
          Review & Submit
        </h1>
        <p className="text-muted-foreground" data-testid="text-subheading">
          Review your application details before submitting for a term sheet
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Calculated Metrics */}
        {(data.calculatedLtv || data.calculatedDscr || data.calculatedMonthlyInterest) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.calculatedLtv && (
              <MetricCard
                label="Loan-to-Value (LTV)"
                value={`${data.calculatedLtv}%`}
                tooltip="Loan amount divided by property value"
                status={ltvStatus}
              />
            )}
            {data.calculatedDscr && (
              <MetricCard
                label="DSCR"
                value={data.calculatedDscr}
                tooltip="Net operating income divided by debt service"
                status={dscrStatus}
              />
            )}
            {data.calculatedMonthlyInterest && (
              <MetricCard
                label="Monthly Interest"
                value={formatCurrency(data.calculatedMonthlyInterest)}
                tooltip="First month's interest payment"
                status="neutral"
              />
            )}
          </div>
        )}

        {/* Missing Information Alert */}
        {missingFields.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Some information is missing: {missingFields.join(", ")}. 
              Please go back and complete all required fields.
            </AlertDescription>
          </Alert>
        )}

        {/* Loan Details */}
        <Card className="p-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Loan Details</h3>
              <p className="text-sm text-muted-foreground mt-1">Quick Start Information</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Loan Type</span>
              <span className="text-sm font-medium" data-testid="text-loan-type">
                {formatLoanType(data.loanType || "Not specified")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Loan Amount</span>
              <span className="text-sm font-medium" data-testid="text-loan-amount">
                {formatCurrency(data.loanAmount || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Property Location</span>
              <span className="text-sm font-medium" data-testid="text-property-location">
                {data.propertyCity && data.propertyState 
                  ? `${data.propertyCity}, ${data.propertyState}` 
                  : "Not specified"}
              </span>
            </div>
          </div>
        </Card>

        {/* Property Information */}
        <Card className="p-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Property Information</h3>
              <p className="text-sm text-muted-foreground mt-1">Property & Borrower Details</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Property Type</span>
              <span className="text-sm font-medium" data-testid="text-property-type">
                {formatPropertyType(data.propertyType || "Not specified")}
              </span>
            </div>
            {data.squareFootage && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Square Footage</span>
                <span className="text-sm font-medium" data-testid="text-square-footage">
                  {Number(data.squareFootage).toLocaleString()} sq ft
                </span>
              </div>
            )}
            {data.units && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Units</span>
                <span className="text-sm font-medium" data-testid="text-units">
                  {data.units}
                </span>
              </div>
            )}
            {data.occupancy && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Occupancy Rate</span>
                <span className="text-sm font-medium" data-testid="text-occupancy">
                  {data.occupancy}%
                </span>
              </div>
            )}
            {data.propertyAddress && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Property Address</span>
                <span className="text-sm font-medium" data-testid="text-address">
                  {data.propertyAddress}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Loan Specifics */}
        {loanSpecifics && Object.keys(loanSpecifics).length > 0 && (
          <Card className="p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Loan Specifics</h3>
                <p className="text-sm text-muted-foreground mt-1">Terms and Conditions</p>
              </div>
            </div>
            <div className="space-y-3">
              {loanSpecifics.propertyValue && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Property Value</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(loanSpecifics.propertyValue)}
                  </span>
                </div>
              )}
              {loanSpecifics.interestRate && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Interest Rate</span>
                  <span className="text-sm font-medium">
                    {loanSpecifics.interestRate}%
                  </span>
                </div>
              )}
              {loanSpecifics.loanTerm && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Loan Term</span>
                  <span className="text-sm font-medium">
                    {loanSpecifics.loanTerm} {data.loanType?.includes("bridge") ? "months" : "years"}
                  </span>
                </div>
              )}
              {loanSpecifics.amortization && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amortization</span>
                  <span className="text-sm font-medium">
                    {loanSpecifics.amortization === "0" ? "Interest Only" : `${loanSpecifics.amortization} years`}
                  </span>
                </div>
              )}
              {loanSpecifics.prepaymentPenalty && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Prepayment Penalty</span>
                  <span className="text-sm font-medium">
                    {loanSpecifics.prepaymentPenalty === "no" ? "None" : loanSpecifics.prepaymentPenalty}
                  </span>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Financial Information */}
        {(data.netWorth || data.liquidAssets || data.creditScore) && (
          <Card className="p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Financial Information</h3>
                <p className="text-sm text-muted-foreground mt-1">Borrower's Financial Capacity</p>
              </div>
            </div>
            <div className="space-y-3">
              {data.netWorth && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Net Worth</span>
                  <span className="text-sm font-medium" data-testid="text-net-worth">
                    {formatCurrency(data.netWorth)}
                  </span>
                </div>
              )}
              {data.liquidAssets && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Liquid Assets</span>
                  <span className="text-sm font-medium" data-testid="text-liquid-assets">
                    {formatCurrency(data.liquidAssets)}
                  </span>
                </div>
              )}
              {data.creditScore && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Credit Score</span>
                  <span className="text-sm font-medium" data-testid="text-credit-score">
                    {data.creditScore}
                  </span>
                </div>
              )}
              {data.downPaymentSource && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Down Payment Source</span>
                  <span className="text-sm font-medium">
                    {data.downPaymentSource}
                  </span>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Property Performance */}
        {(annualGrossIncome || annualOperatingExpenses || data.annualNOI) && (
          <Card className="p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Property Performance</h3>
                <p className="text-sm text-muted-foreground mt-1">Financial Performance Data</p>
              </div>
            </div>
            <div className="space-y-3">
              {annualGrossIncome && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Annual Gross Income</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(annualGrossIncome)}
                  </span>
                </div>
              )}
              {annualOperatingExpenses && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Annual Operating Expenses</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(annualOperatingExpenses)}
                  </span>
                </div>
              )}
              {data.annualNOI && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Annual NOI</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(data.annualNOI)}
                  </span>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Documents Status */}
        <Card className="p-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Documents</h3>
              <p className="text-sm text-muted-foreground mt-1">Upload Status</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Financial Statements</span>
              </div>
              <Badge variant="outline" className="text-xs">
                <Upload className="w-3 h-3 mr-1" />
                Upload Later
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Tax Returns</span>
              </div>
              <Badge variant="outline" className="text-xs">
                <Upload className="w-3 h-3 mr-1" />
                Upload Later
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Rent Roll</span>
              </div>
              <Badge variant="outline" className="text-xs">
                <Upload className="w-3 h-3 mr-1" />
                Upload Later
              </Badge>
            </div>
          </div>
        </Card>

        {/* Submit Confirmation */}
        <Card className="p-8 border-primary/20 bg-primary/5">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Ready to Submit?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                By submitting this application, you authorize us to review your information 
                and provide you with a preliminary term sheet within 24-48 hours.
              </p>
              <p className="text-sm text-muted-foreground">
                You can upload additional documents after submission to strengthen your application.
              </p>
            </div>
          </div>
        </Card>

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onBack}
            className="h-12 px-8"
            data-testid="button-back"
          >
            Back
          </Button>
          <Button
            type="submit"
            size="lg"
            className="h-12 px-8"
            disabled={missingFields.length > 0}
            data-testid="button-submit"
          >
            Submit for Term Sheet
          </Button>
        </div>
      </form>
    </div>
  );
}