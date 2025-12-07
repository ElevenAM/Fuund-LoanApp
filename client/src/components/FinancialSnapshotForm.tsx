import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft } from "lucide-react";
import DocumentUploadZone from "./DocumentUploadZone";

interface FinancialSnapshotFormProps {
  onContinue?: (data: any) => void;
  onBack?: () => void;
  initialData?: any;
}

export default function FinancialSnapshotForm({ onContinue, onBack, initialData }: FinancialSnapshotFormProps) {
  const [formData, setFormData] = useState({
    netWorth: initialData?.netWorth || "",
    liquidAssets: initialData?.liquidAssets || "",
    downPaymentSource: initialData?.downPaymentSource || "",
    creditScore: initialData?.creditScore || "",
    hasBankruptcy: initialData?.hasBankruptcy || false,
    authorizeCreditPull: initialData?.authorizeCreditPull || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onContinue?.(formData);
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-6" data-testid="button-back">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back
      </Button>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2" data-testid="text-heading">
          Financial Snapshot
        </h2>
        <p className="text-muted-foreground" data-testid="text-subheading">
          Help us understand your financial capacity
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-8">
          <h3 className="text-lg font-semibold mb-6">Proof of Capacity</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="net-worth">
                  Estimated Net Worth <span className="text-destructive">*</span>
                </Label>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="net-worth"
                    value={formData.netWorth}
                    onChange={(e) => updateField("netWorth", e.target.value)}
                    placeholder="5,000,000"
                    className="pl-7"
                    data-testid="input-net-worth"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="liquid-assets">
                  Liquid Assets Available <span className="text-destructive">*</span>
                </Label>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="liquid-assets"
                    value={formData.liquidAssets}
                    onChange={(e) => updateField("liquidAssets", e.target.value)}
                    placeholder="2,000,000"
                    className="pl-7"
                    data-testid="input-liquid-assets"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="down-payment-source">
                Down Payment Source <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.downPaymentSource} onValueChange={(val) => updateField("downPaymentSource", val)}>
                <SelectTrigger className="mt-2" data-testid="select-down-payment-source">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="securities">Securities</SelectItem>
                  <SelectItem value="equity-partner">Equity Partner</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <Card className="p-8">
          <h3 className="text-lg font-semibold mb-6">Credit Information</h3>
          <div className="space-y-6">
            <div>
              <Label htmlFor="credit-score">Estimated Credit Score</Label>
              <Input
                id="credit-score"
                value={formData.creditScore}
                onChange={(e) => updateField("creditScore", e.target.value)}
                placeholder="750"
                className="mt-2"
                data-testid="input-credit-score"
              />
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="bankruptcy"
                checked={formData.hasBankruptcy}
                onCheckedChange={(checked) => updateField("hasBankruptcy", checked)}
                data-testid="checkbox-bankruptcy"
              />
              <div className="space-y-1 leading-none">
                <Label
                  htmlFor="bankruptcy"
                  className="text-sm font-normal cursor-pointer"
                >
                  Any bankruptcies or foreclosures in the last 7 years
                </Label>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="credit-pull"
                checked={formData.authorizeCreditPull}
                onCheckedChange={(checked) => updateField("authorizeCreditPull", checked)}
                data-testid="checkbox-credit-pull"
              />
              <div className="space-y-1 leading-none">
                <Label
                  htmlFor="credit-pull"
                  className="text-sm font-normal cursor-pointer"
                >
                  I authorize a soft credit pull for pre-qualification
                </Label>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-8">
          <h3 className="text-lg font-semibold mb-6">Supporting Documents</h3>
          <p className="text-sm text-muted-foreground mb-6">
            You can upload these now or later before underwriting
          </p>
          <div className="space-y-6">
            <DocumentUploadZone
              label="Bank Statements (Last 2 months)"
              description="For acquisitions - can upload later"
            />
            <DocumentUploadZone
              label="Most Recent Tax Return"
              description="Optional at this stage"
            />
            <DocumentUploadZone
              label="Personal Financial Statement"
              description="Or complete a quick form later"
            />
          </div>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack} type="button" data-testid="button-back-bottom">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <Button type="submit" size="lg" className="h-12 px-8" data-testid="button-continue">
            Continue to Documents
          </Button>
        </div>
      </form>
    </div>
  );
}
