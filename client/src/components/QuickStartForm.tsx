import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup } from "@/components/ui/radio-group";
import LoanTypeCard from "./LoanTypeCard";
import buildingIcon from "@assets/generated_images/Permanent_acquisition_building_icon_c15f24a8.png";
import refinanceIcon from "@assets/generated_images/Permanent_refinance_building_icon_f8352c80.png";
import bridgeIcon from "@assets/generated_images/Bridge_loan_icon_8437f513.png";
import constructionIcon from "@assets/generated_images/Construction_loan_icon_77ba02ca.png";

interface QuickStartFormProps {
  onContinue?: (data: any) => void;
  initialData?: any;
}

export default function QuickStartForm({ onContinue, initialData }: QuickStartFormProps) {
  const [loanType, setLoanType] = useState(initialData?.loanType || "");
  const [loanAmount, setLoanAmount] = useState(initialData?.loanAmount || "");
  const [city, setCity] = useState(initialData?.propertyCity || "");
  const [state, setState] = useState(initialData?.propertyState || "");

  const loanTypes = [
    {
      value: "permanent-acquisition",
      title: "Permanent Acquisition",
      description: "Long-term financing for property purchase",
      icon: buildingIcon,
    },
    {
      value: "permanent-refinance",
      title: "Permanent Refinance",
      description: "Refinance existing permanent loan",
      icon: refinanceIcon,
    },
    {
      value: "bridge-acquisition",
      title: "Bridge Acquisition",
      description: "Short-term financing for property purchase",
      icon: bridgeIcon,
    },
    {
      value: "bridge-refinance",
      title: "Bridge Refinance",
      description: "Short-term refinance with exit strategy",
      icon: bridgeIcon,
    },
    {
      value: "construction",
      title: "Construction",
      description: "Financing for new construction projects",
      icon: constructionIcon,
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      loanType,
      loanAmount,
      propertyCity: city,
      propertyState: state,
    };
    console.log("Quick Start submitted:", data);
    onContinue?.(data);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold mb-2" data-testid="text-heading">
          Get your term sheet in 7-10 minutes
        </h1>
        <p className="text-muted-foreground" data-testid="text-subheading">
          Start by answering three quick questions
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <Label className="text-base font-semibold mb-4 block">
                What type of loan do you need? <span className="text-destructive">*</span>
              </Label>
              <RadioGroup value={loanType} onValueChange={setLoanType}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {loanTypes.map((type) => (
                    <LoanTypeCard
                      key={type.value}
                      {...type}
                      selected={loanType === type.value}
                    />
                  ))}
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="loan-amount" className="text-base font-semibold">
                Loan Amount Requested <span className="text-destructive">*</span>
              </Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="loan-amount"
                  type="text"
                  placeholder="1,000,000"
                  className="pl-7 h-12"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  data-testid="input-loan-amount"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city" className="text-base font-semibold">
                  Property City <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="New York"
                  className="mt-2 h-12"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  data-testid="input-city"
                />
              </div>
              <div>
                <Label htmlFor="state" className="text-base font-semibold">
                  State <span className="text-destructive">*</span>
                </Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger className="mt-2 h-12" data-testid="select-state">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NY">New York</SelectItem>
                    <SelectItem value="CA">California</SelectItem>
                    <SelectItem value="TX">Texas</SelectItem>
                    <SelectItem value="FL">Florida</SelectItem>
                    <SelectItem value="IL">Illinois</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            className="h-12 px-8"
            disabled={!loanType || !loanAmount || !city || !state}
            data-testid="button-continue"
          >
            Continue to Property Details
          </Button>
        </div>
      </form>
    </div>
  );
}
