import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InfoIcon, Plus, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface PropertyPerformanceFormProps {
  onContinue?: (data: any) => void;
  onBack?: () => void;
  initialData?: any;
}

interface Tenant {
  name: string;
  unit: string;
  monthlyRent: string;
  leaseExpiry: string;
}

export default function PropertyPerformanceForm({ onContinue, onBack, initialData }: PropertyPerformanceFormProps) {
  const [annualGrossIncome, setAnnualGrossIncome] = useState(initialData?.annualGrossIncome || "");
  const [annualOperatingExpenses, setAnnualOperatingExpenses] = useState(initialData?.annualOperatingExpenses || "");
  const [annualNOI, setAnnualNOI] = useState(initialData?.annualNOI || "");
  const [occupancyRate, setOccupancyRate] = useState(initialData?.occupancy || "");
  const [majorTenants, setMajorTenants] = useState<Tenant[]>(
    initialData?.majorTenants || []
  );
  const [recentImprovements, setRecentImprovements] = useState(initialData?.recentImprovements || "");
  const [plannedImprovements, setPlannedImprovements] = useState(initialData?.plannedImprovements || "");
  
  // Property type and loan type from initial data
  const propertyType = initialData?.propertyType || "";
  const loanType = initialData?.loanType || "";

  // Check if this is an income-producing property
  const isIncomeProducing = 
    propertyType !== "land" && 
    propertyType !== "owner-occupied" &&
    loanType !== "construction";

  // Auto-calculate NOI
  const calculateNOI = () => {
    const income = parseFloat(annualGrossIncome.replace(/,/g, "") || "0");
    const expenses = parseFloat(annualOperatingExpenses.replace(/,/g, "") || "0");
    if (income > 0 && expenses > 0) {
      const noi = income - expenses;
      setAnnualNOI(noi.toFixed(2));
    }
  };

  const addTenant = () => {
    setMajorTenants([...majorTenants, { name: "", unit: "", monthlyRent: "", leaseExpiry: "" }]);
  };

  const removeTenant = (index: number) => {
    setMajorTenants(majorTenants.filter((_, i) => i !== index));
  };

  const updateTenant = (index: number, field: keyof Tenant, value: string) => {
    const updated = [...majorTenants];
    updated[index] = { ...updated[index], [field]: value };
    setMajorTenants(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data: any = {};
    
    // Only include performance data for income-producing properties
    if (isIncomeProducing) {
      data.annualGrossIncome = annualGrossIncome;
      data.annualOperatingExpenses = annualOperatingExpenses;
      data.annualNOI = annualNOI;
      data.occupancy = occupancyRate;
      if (majorTenants.length > 0) {
        data.majorTenants = majorTenants;
      }
    }
    
    // Always include improvements data
    if (recentImprovements) {
      data.recentImprovements = recentImprovements;
    }
    if (plannedImprovements) {
      data.plannedImprovements = plannedImprovements;
    }

    onContinue?.(data);
  };

  // For construction or land, show a simpler form
  if (!isIncomeProducing) {
    return (
      <TooltipProvider>
        <div className="w-full max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold mb-2" data-testid="text-heading">
              Property Details
            </h1>
            <p className="text-muted-foreground" data-testid="text-subheading">
              {loanType === "construction" 
                ? "Tell us about your construction plans"
                : "Provide additional property information"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <Card className="p-8">
              <div className="space-y-6">
                {loanType === "construction" ? (
                  <>
                    <div>
                      <Label htmlFor="planned-improvements" className="text-base font-semibold">
                        Construction Plans & Specifications
                      </Label>
                      <Textarea
                        id="planned-improvements"
                        placeholder="Describe your construction plans, including building type, size, materials, and key features..."
                        className="mt-2 min-h-[150px]"
                        value={plannedImprovements}
                        onChange={(e) => setPlannedImprovements(e.target.value)}
                        data-testid="textarea-construction-plans"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="recent-improvements" className="text-base font-semibold">
                        Recent Property Improvements
                      </Label>
                      <Textarea
                        id="recent-improvements"
                        placeholder="List any recent upgrades, renovations, or improvements made to the property..."
                        className="mt-2 min-h-[100px]"
                        value={recentImprovements}
                        onChange={(e) => setRecentImprovements(e.target.value)}
                        data-testid="textarea-recent-improvements"
                      />
                    </div>
                    <div>
                      <Label htmlFor="planned-improvements-land" className="text-base font-semibold">
                        Planned Development or Use
                      </Label>
                      <Textarea
                        id="planned-improvements-land"
                        placeholder="Describe your plans for the property..."
                        className="mt-2 min-h-[100px]"
                        value={plannedImprovements}
                        onChange={(e) => setPlannedImprovements(e.target.value)}
                        data-testid="textarea-planned-use"
                      />
                    </div>
                  </>
                )}
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
                Continue to Document Upload
              </Button>
            </div>
          </form>
        </div>
      </TooltipProvider>
    );
  }

  // For income-producing properties, show full financial performance form
  return (
    <TooltipProvider>
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold mb-2" data-testid="text-heading">
            Property Performance
          </h1>
          <p className="text-muted-foreground" data-testid="text-subheading">
            Provide financial performance data for your {propertyType}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="p-8">
            <div className="space-y-6">
              {/* Income and Expenses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="gross-income" className="text-base font-semibold">
                      Annual Gross Rental Income <span className="text-destructive">*</span>
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Total rental income before any expenses</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="gross-income"
                      type="text"
                      placeholder="500,000"
                      className="pl-7 h-12"
                      value={annualGrossIncome}
                      onChange={(e) => setAnnualGrossIncome(e.target.value)}
                      onBlur={calculateNOI}
                      data-testid="input-gross-income"
                      required
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="operating-expenses" className="text-base font-semibold">
                      Annual Operating Expenses <span className="text-destructive">*</span>
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Total operating expenses including maintenance, taxes, insurance, utilities</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="operating-expenses"
                      type="text"
                      placeholder="150,000"
                      className="pl-7 h-12"
                      value={annualOperatingExpenses}
                      onChange={(e) => setAnnualOperatingExpenses(e.target.value)}
                      onBlur={calculateNOI}
                      data-testid="input-operating-expenses"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* NOI and Occupancy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="noi" className="text-base font-semibold">
                      Annual Net Operating Income (NOI)
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Gross income minus operating expenses</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="noi"
                      type="text"
                      placeholder="350,000"
                      className="pl-7 h-12 bg-muted"
                      value={annualNOI}
                      onChange={(e) => setAnnualNOI(e.target.value)}
                      data-testid="input-noi"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Auto-calculated or enter manually</p>
                </div>
                <div>
                  <Label htmlFor="occupancy" className="text-base font-semibold">
                    Current Occupancy Rate <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative mt-2">
                    <Input
                      id="occupancy"
                      type="text"
                      placeholder="95"
                      className="pr-7 h-12"
                      value={occupancyRate}
                      onChange={(e) => setOccupancyRate(e.target.value)}
                      data-testid="input-occupancy"
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* Major Tenants */}
              {propertyType !== "residential" && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-base font-semibold">Major Tenants (Optional)</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={addTenant}
                      data-testid="button-add-tenant"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Tenant
                    </Button>
                  </div>
                  {majorTenants.length > 0 && (
                    <div className="space-y-3">
                      {majorTenants.map((tenant, index) => (
                        <div key={index} className="p-4 border rounded-lg relative">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-2"
                            onClick={() => removeTenant(index)}
                            data-testid={`button-remove-tenant-${index}`}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div>
                              <Label htmlFor={`tenant-name-${index}`} className="text-sm">
                                Tenant Name
                              </Label>
                              <Input
                                id={`tenant-name-${index}`}
                                type="text"
                                placeholder="Company Name"
                                value={tenant.name}
                                onChange={(e) => updateTenant(index, "name", e.target.value)}
                                className="mt-1"
                                data-testid={`input-tenant-name-${index}`}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`tenant-unit-${index}`} className="text-sm">
                                Unit/Suite
                              </Label>
                              <Input
                                id={`tenant-unit-${index}`}
                                type="text"
                                placeholder="Suite 100"
                                value={tenant.unit}
                                onChange={(e) => updateTenant(index, "unit", e.target.value)}
                                className="mt-1"
                                data-testid={`input-tenant-unit-${index}`}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`tenant-rent-${index}`} className="text-sm">
                                Monthly Rent
                              </Label>
                              <div className="relative mt-1">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                  $
                                </span>
                                <Input
                                  id={`tenant-rent-${index}`}
                                  type="text"
                                  placeholder="5,000"
                                  className="pl-6"
                                  value={tenant.monthlyRent}
                                  onChange={(e) => updateTenant(index, "monthlyRent", e.target.value)}
                                  data-testid={`input-tenant-rent-${index}`}
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor={`tenant-expiry-${index}`} className="text-sm">
                                Lease Expiry
                              </Label>
                              <Input
                                id={`tenant-expiry-${index}`}
                                type="month"
                                value={tenant.leaseExpiry}
                                onChange={(e) => updateTenant(index, "leaseExpiry", e.target.value)}
                                className="mt-1"
                                data-testid={`input-tenant-expiry-${index}`}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Property Improvements */}
              <div>
                <Label htmlFor="recent-improvements" className="text-base font-semibold">
                  Recent Property Improvements (Optional)
                </Label>
                <Textarea
                  id="recent-improvements"
                  placeholder="List any recent upgrades, renovations, or improvements made to the property..."
                  className="mt-2 min-h-[80px]"
                  value={recentImprovements}
                  onChange={(e) => setRecentImprovements(e.target.value)}
                  data-testid="textarea-recent-improvements"
                />
              </div>

              <div>
                <Label htmlFor="planned-improvements" className="text-base font-semibold">
                  Planned Property Improvements (Optional)
                </Label>
                <Textarea
                  id="planned-improvements"
                  placeholder="List any planned upgrades or improvements for the property..."
                  className="mt-2 min-h-[80px]"
                  value={plannedImprovements}
                  onChange={(e) => setPlannedImprovements(e.target.value)}
                  data-testid="textarea-planned-improvements"
                />
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
              Continue to Document Upload
            </Button>
          </div>
        </form>
      </div>
    </TooltipProvider>
  );
}