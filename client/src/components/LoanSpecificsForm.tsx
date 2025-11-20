import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface LoanSpecificsFormProps {
  onContinue?: (data: any) => void;
  onBack?: () => void;
  initialData?: any;
}

export default function LoanSpecificsForm({ onContinue, onBack, initialData }: LoanSpecificsFormProps) {
  const loanType = initialData?.loanType || "";
  const existingSpecifics = initialData?.loanSpecifics || {};

  // Common fields
  const [interestRate, setInterestRate] = useState(existingSpecifics.interestRate || "");
  const [loanTerm, setLoanTerm] = useState(existingSpecifics.loanTerm || "");
  const [amortization, setAmortization] = useState(existingSpecifics.amortization || "");
  const [prepaymentPenalty, setPrepaymentPenalty] = useState(existingSpecifics.prepaymentPenalty || "no");
  const [propertyValue, setPropertyValue] = useState(existingSpecifics.propertyValue || "");
  
  // Type-specific fields
  const [exitStrategy, setExitStrategy] = useState(existingSpecifics.exitStrategy || "");
  const [constructionBudget, setConstructionBudget] = useState(existingSpecifics.constructionBudget || "");
  const [constructionPeriod, setConstructionPeriod] = useState(existingSpecifics.constructionPeriod || "");
  const [drawSchedule, setDrawSchedule] = useState(existingSpecifics.drawSchedule || "monthly");
  const [currentLoanBalance, setCurrentLoanBalance] = useState(existingSpecifics.currentLoanBalance || "");
  const [currentLender, setCurrentLender] = useState(existingSpecifics.currentLender || "");
  const [rateType, setRateType] = useState(existingSpecifics.rateType || "fixed");
  const [recourse, setRecourse] = useState(existingSpecifics.recourse || "non-recourse");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build loan specifics object based on loan type
    const loanSpecifics: any = {
      interestRate,
      propertyValue,
    };

    // Add fields based on loan type
    if (loanType.includes("permanent")) {
      loanSpecifics.loanTerm = loanTerm;
      loanSpecifics.amortization = amortization;
      loanSpecifics.prepaymentPenalty = prepaymentPenalty;
      loanSpecifics.rateType = rateType;
      loanSpecifics.recourse = recourse;
    }

    if (loanType.includes("bridge")) {
      loanSpecifics.loanTerm = loanTerm;
      loanSpecifics.exitStrategy = exitStrategy;
      loanSpecifics.prepaymentPenalty = prepaymentPenalty;
      loanSpecifics.recourse = recourse;
    }

    if (loanType.includes("refinance")) {
      loanSpecifics.currentLoanBalance = currentLoanBalance;
      loanSpecifics.currentLender = currentLender;
    }

    if (loanType === "construction") {
      loanSpecifics.constructionBudget = constructionBudget;
      loanSpecifics.constructionPeriod = constructionPeriod;
      loanSpecifics.drawSchedule = drawSchedule;
      loanSpecifics.loanTerm = loanTerm;
      loanSpecifics.recourse = recourse;
    }

    onContinue?.({ loanSpecifics });
  };

  const formatLoanTypeDisplay = (type: string) => {
    const typeMap: Record<string, string> = {
      "permanent-acquisition": "Permanent Acquisition Loan",
      "permanent-refinance": "Permanent Refinance Loan",
      "bridge-acquisition": "Bridge Acquisition Loan",
      "bridge-refinance": "Bridge Refinance Loan",
      "construction": "Construction Loan",
    };
    return typeMap[type] || type;
  };

  return (
    <TooltipProvider>
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold mb-2" data-testid="text-heading">
            Loan Specifics
          </h1>
          <p className="text-muted-foreground" data-testid="text-subheading">
            Provide details about your {formatLoanTypeDisplay(loanType).toLowerCase()}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="p-8">
            <div className="space-y-6">
              {/* Property Value - Common for all */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="property-value" className="text-base font-semibold">
                    {loanType.includes("acquisition") ? "Purchase Price" : "Current Property Value"}
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The current market value or purchase price of the property</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="property-value"
                    type="text"
                    placeholder="2,500,000"
                    className="pl-7 h-12"
                    value={propertyValue}
                    onChange={(e) => setPropertyValue(e.target.value)}
                    data-testid="input-property-value"
                    required
                  />
                </div>
              </div>

              {/* Interest Rate - Common for all */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="interest-rate" className="text-base font-semibold">
                    Expected Interest Rate
                  </Label>
                  <div className="relative mt-2">
                    <Input
                      id="interest-rate"
                      type="text"
                      placeholder="5.5"
                      className="pr-7 h-12"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      data-testid="input-interest-rate"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      %
                    </span>
                  </div>
                </div>

                {/* Rate Type for Permanent Loans */}
                {loanType.includes("permanent") && (
                  <div>
                    <Label className="text-base font-semibold">Rate Type</Label>
                    <Select value={rateType} onValueChange={setRateType}>
                      <SelectTrigger className="mt-2 h-12" data-testid="select-rate-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Rate</SelectItem>
                        <SelectItem value="variable">Variable Rate</SelectItem>
                        <SelectItem value="hybrid">Hybrid (Fixed then Variable)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Loan Term and Amortization for Permanent Loans */}
              {loanType.includes("permanent") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="loan-term" className="text-base font-semibold">
                      Loan Term (Years) <span className="text-destructive">*</span>
                    </Label>
                    <Select value={loanTerm} onValueChange={setLoanTerm}>
                      <SelectTrigger className="mt-2 h-12" data-testid="select-loan-term">
                        <SelectValue placeholder="Select term" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 Years</SelectItem>
                        <SelectItem value="7">7 Years</SelectItem>
                        <SelectItem value="10">10 Years</SelectItem>
                        <SelectItem value="15">15 Years</SelectItem>
                        <SelectItem value="20">20 Years</SelectItem>
                        <SelectItem value="25">25 Years</SelectItem>
                        <SelectItem value="30">30 Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="amortization" className="text-base font-semibold">
                      Amortization (Years) <span className="text-destructive">*</span>
                    </Label>
                    <Select value={amortization} onValueChange={setAmortization}>
                      <SelectTrigger className="mt-2 h-12" data-testid="select-amortization">
                        <SelectValue placeholder="Select amortization" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Interest Only</SelectItem>
                        <SelectItem value="15">15 Years</SelectItem>
                        <SelectItem value="20">20 Years</SelectItem>
                        <SelectItem value="25">25 Years</SelectItem>
                        <SelectItem value="30">30 Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Bridge Loan Specifics */}
              {loanType.includes("bridge") && (
                <>
                  <div>
                    <Label htmlFor="loan-term-bridge" className="text-base font-semibold">
                      Loan Term (Months) <span className="text-destructive">*</span>
                    </Label>
                    <Select value={loanTerm} onValueChange={setLoanTerm}>
                      <SelectTrigger className="mt-2 h-12" data-testid="select-loan-term-bridge">
                        <SelectValue placeholder="Select term" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 Months</SelectItem>
                        <SelectItem value="12">12 Months</SelectItem>
                        <SelectItem value="18">18 Months</SelectItem>
                        <SelectItem value="24">24 Months</SelectItem>
                        <SelectItem value="36">36 Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="exit-strategy" className="text-base font-semibold">
                      Exit Strategy <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="exit-strategy"
                      placeholder="Describe your plan to repay the bridge loan (e.g., refinance with permanent financing, property sale, etc.)"
                      className="mt-2 min-h-[100px]"
                      value={exitStrategy}
                      onChange={(e) => setExitStrategy(e.target.value)}
                      data-testid="textarea-exit-strategy"
                      required
                    />
                  </div>
                </>
              )}

              {/* Refinance Specifics */}
              {loanType.includes("refinance") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="current-balance" className="text-base font-semibold">
                      Current Loan Balance <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="current-balance"
                        type="text"
                        placeholder="1,500,000"
                        className="pl-7 h-12"
                        value={currentLoanBalance}
                        onChange={(e) => setCurrentLoanBalance(e.target.value)}
                        data-testid="input-current-balance"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="current-lender" className="text-base font-semibold">
                      Current Lender
                    </Label>
                    <Input
                      id="current-lender"
                      type="text"
                      placeholder="Bank name or lender"
                      className="mt-2 h-12"
                      value={currentLender}
                      onChange={(e) => setCurrentLender(e.target.value)}
                      data-testid="input-current-lender"
                    />
                  </div>
                </div>
              )}

              {/* Construction Loan Specifics */}
              {loanType === "construction" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="construction-budget" className="text-base font-semibold">
                        Total Construction Budget <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative mt-2">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input
                          id="construction-budget"
                          type="text"
                          placeholder="5,000,000"
                          className="pl-7 h-12"
                          value={constructionBudget}
                          onChange={(e) => setConstructionBudget(e.target.value)}
                          data-testid="input-construction-budget"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="construction-period" className="text-base font-semibold">
                        Construction Period (Months) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="construction-period"
                        type="text"
                        placeholder="18"
                        className="mt-2 h-12"
                        value={constructionPeriod}
                        onChange={(e) => setConstructionPeriod(e.target.value)}
                        data-testid="input-construction-period"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-base font-semibold">Draw Schedule</Label>
                    <RadioGroup value={drawSchedule} onValueChange={setDrawSchedule} className="mt-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="monthly" id="draw-monthly" />
                        <Label htmlFor="draw-monthly">Monthly</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="milestone" id="draw-milestone" />
                        <Label htmlFor="draw-milestone">Milestone-Based</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="percentage" id="draw-percentage" />
                        <Label htmlFor="draw-percentage">Percentage of Completion</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div>
                    <Label htmlFor="loan-term-construction" className="text-base font-semibold">
                      Loan Term After Construction (Months)
                    </Label>
                    <Input
                      id="loan-term-construction"
                      type="text"
                      placeholder="36"
                      className="mt-2 h-12"
                      value={loanTerm}
                      onChange={(e) => setLoanTerm(e.target.value)}
                      data-testid="input-loan-term-construction"
                    />
                  </div>
                </>
              )}

              {/* Prepayment Penalty for non-construction loans */}
              {loanType !== "construction" && (
                <div>
                  <Label className="text-base font-semibold">Prepayment Penalty</Label>
                  <RadioGroup value={prepaymentPenalty} onValueChange={setPrepaymentPenalty} className="mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="prepay-no" />
                      <Label htmlFor="prepay-no">No Prepayment Penalty</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="stepdown" id="prepay-stepdown" />
                      <Label htmlFor="prepay-stepdown">Step-Down (e.g., 5-4-3-2-1)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yield-maintenance" id="prepay-yield" />
                      <Label htmlFor="prepay-yield">Yield Maintenance</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="defeasance" id="prepay-defeasance" />
                      <Label htmlFor="prepay-defeasance">Defeasance</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {/* Recourse - Common for all */}
              <div>
                <Label className="text-base font-semibold">Recourse Type</Label>
                <RadioGroup value={recourse} onValueChange={setRecourse} className="mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="non-recourse" id="non-recourse" />
                    <Label htmlFor="non-recourse">Non-Recourse</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="limited-recourse" id="limited-recourse" />
                    <Label htmlFor="limited-recourse">Limited Recourse</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="full-recourse" id="full-recourse" />
                    <Label htmlFor="full-recourse">Full Recourse</Label>
                  </div>
                </RadioGroup>
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
              data-testid="button-continue"
            >
              Continue to Financial Snapshot
            </Button>
          </div>
        </form>
      </div>
    </TooltipProvider>
  );
}