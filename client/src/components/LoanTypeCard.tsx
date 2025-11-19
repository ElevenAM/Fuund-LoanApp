import { Card } from "@/components/ui/card";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface LoanTypeCardProps {
  value: string;
  title: string;
  description: string;
  icon: string;
  selected?: boolean;
}

export default function LoanTypeCard({
  value,
  title,
  description,
  icon,
  selected = false,
}: LoanTypeCardProps) {
  return (
    <div className="relative">
      <RadioGroupItem
        value={value}
        id={value}
        className="peer sr-only"
        data-testid={`radio-loan-type-${value}`}
      />
      <Label
        htmlFor={value}
        className="cursor-pointer"
        data-testid={`label-loan-type-${value}`}
      >
        <Card
          className={`p-6 hover-elevate transition-all duration-200 ${
            selected
              ? "border-primary border-2"
              : "border-border"
          }`}
        >
          <div className="flex flex-col items-center text-center gap-4">
            <img
              src={icon}
              alt={title}
              className="w-16 h-16 object-contain"
              data-testid={`img-loan-type-${value}`}
            />
            <div>
              <h3 className="font-semibold text-lg mb-1" data-testid={`text-loan-title-${value}`}>
                {title}
              </h3>
              <p className="text-sm text-muted-foreground" data-testid={`text-loan-description-${value}`}>
                {description}
              </p>
            </div>
          </div>
        </Card>
      </Label>
    </div>
  );
}
