import { Check } from "lucide-react";

interface Step {
  id: number;
  name: string;
  status: "completed" | "current" | "upcoming";
}

interface ProgressStepperProps {
  steps: Step[];
}

export default function ProgressStepper({ steps }: ProgressStepperProps) {
  return (
    <nav aria-label="Progress" className="px-6 py-8">
      <ol className="space-y-4">
        {steps.map((step, stepIdx) => (
          <li key={step.id} className="relative">
            {step.status === "completed" ? (
              <div className="flex items-start group" data-testid={`step-completed-${step.id}`}>
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary flex-shrink-0">
                  <Check className="w-5 h-5 text-primary-foreground" data-testid={`icon-check-${step.id}`} />
                </span>
                <span className="ml-3 text-sm font-medium text-foreground" data-testid={`text-step-name-${step.id}`}>
                  {step.name}
                </span>
              </div>
            ) : step.status === "current" ? (
              <div className="flex items-start" data-testid={`step-current-${step.id}`}>
                <span className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-primary bg-background flex-shrink-0">
                  <span className="w-3 h-3 rounded-full bg-primary" data-testid={`indicator-current-${step.id}`} />
                </span>
                <span className="ml-3 text-sm font-semibold text-primary" data-testid={`text-step-name-${step.id}`}>
                  {step.name}
                </span>
              </div>
            ) : (
              <div className="flex items-start group" data-testid={`step-upcoming-${step.id}`}>
                <span className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-border bg-background flex-shrink-0">
                  <span className="w-2 h-2 rounded-full bg-muted" data-testid={`indicator-upcoming-${step.id}`} />
                </span>
                <span className="ml-3 text-sm font-medium text-muted-foreground" data-testid={`text-step-name-${step.id}`}>
                  {step.name}
                </span>
              </div>
            )}
            {stepIdx < steps.length - 1 && (
              <div className="absolute left-4 top-8 -ml-px h-6 w-0.5 bg-border" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
