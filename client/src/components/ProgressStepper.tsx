import { Check, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Step {
  id: number;
  name: string;
  status: "completed" | "current" | "upcoming";
  hasMissingFields?: boolean;
  missingFieldCount?: number;
}

interface ProgressStepperProps {
  steps: Step[];
  onStepClick?: (stepId: number) => void;
}

export default function ProgressStepper({ steps, onStepClick }: ProgressStepperProps) {
  const handleStepClick = (step: Step) => {
    if (step.status === "completed" && onStepClick) {
      console.log(`Navigating to step ${step.id}: ${step.name}`);
      onStepClick(step.id);
    }
  };

  return (
    <nav aria-label="Progress" className="px-6 py-8">
      <ol className="space-y-4">
        {steps.map((step, stepIdx) => (
          <li key={step.id} className="relative">
            {step.status === "completed" ? (
              <button
                onClick={() => handleStepClick(step)}
                className="flex items-start group w-full text-left hover:opacity-80 transition-opacity cursor-pointer"
                data-testid={`step-completed-${step.id}`}
              >
                <span className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${
                  step.hasMissingFields ? "bg-amber-500" : "bg-primary"
                }`}>
                  {step.hasMissingFields ? (
                    <AlertCircle className="w-5 h-5 text-white" data-testid={`icon-warning-${step.id}`} />
                  ) : (
                    <Check className="w-5 h-5 text-primary-foreground" data-testid={`icon-check-${step.id}`} />
                  )}
                </span>
                <div className="ml-3 flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground group-hover:underline" data-testid={`text-step-name-${step.id}`}>
                    {step.name}
                  </span>
                  {step.hasMissingFields && step.missingFieldCount && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span 
                          className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full"
                          data-testid={`badge-missing-${step.id}`}
                        >
                          {step.missingFieldCount} missing
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{step.missingFieldCount} required field{step.missingFieldCount > 1 ? 's' : ''} need{step.missingFieldCount === 1 ? 's' : ''} to be completed</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </button>
            ) : step.status === "current" ? (
              <div className="flex items-start" data-testid={`step-current-${step.id}`}>
                <span className={`flex items-center justify-center w-8 h-8 rounded-full border-2 bg-background flex-shrink-0 ${
                  step.hasMissingFields ? "border-amber-500" : "border-primary"
                }`}>
                  <span className={`w-3 h-3 rounded-full ${step.hasMissingFields ? "bg-amber-500" : "bg-primary"}`} data-testid={`indicator-current-${step.id}`} />
                </span>
                <div className="ml-3 flex items-center gap-2">
                  <span className={`text-sm font-semibold ${step.hasMissingFields ? "text-amber-600 dark:text-amber-400" : "text-primary"}`} data-testid={`text-step-name-${step.id}`}>
                    {step.name}
                  </span>
                  {step.hasMissingFields && step.missingFieldCount && (
                    <span 
                      className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full"
                      data-testid={`badge-missing-${step.id}`}
                    >
                      {step.missingFieldCount} missing
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-start group opacity-50 cursor-not-allowed" data-testid={`step-upcoming-${step.id}`}>
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
