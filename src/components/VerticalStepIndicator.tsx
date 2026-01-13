import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  name: string;
  shortName: string;
}

interface VerticalStepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
}

export const VerticalStepIndicator = ({
  steps,
  currentStep,
  onStepClick,
}: VerticalStepIndicatorProps) => {
  return (
    <div className="w-[200px] flex-shrink-0 py-6">
      <div className="bg-white rounded-lg border border-border-primary p-4 sticky top-6">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Progress
        </h3>
        <div className="space-y-0">
          {steps.map((step, index) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const isUpcoming = currentStep < step.id;
            const isClickable = isCompleted && onStepClick;

            return (
              <div key={step.id} className="relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "absolute left-4 top-8 w-0.5 h-12 -translate-x-1/2 transition-colors duration-300",
                      isCompleted
                        ? "bg-[hsl(var(--wq-status-completed-text))]"
                        : "bg-[hsl(var(--wq-border))]"
                    )}
                  />
                )}

                {/* Step item */}
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    "flex items-start gap-3 w-full py-3 text-left transition-all duration-200 group",
                    isClickable && "cursor-pointer hover:opacity-80",
                    !isClickable && "cursor-default"
                  )}
                >
                  {/* Step circle */}
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 flex-shrink-0",
                      isCurrent &&
                        "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/30 scale-110",
                      isCompleted &&
                        "bg-[hsl(var(--wq-status-completed-bg))] border-[hsl(var(--wq-status-completed-text))] text-[hsl(var(--wq-status-completed-text))]",
                      isUpcoming &&
                        "bg-card border-[hsl(var(--wq-border))] text-[hsl(var(--wq-text-secondary))]"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 animate-scale-in" />
                    ) : (
                      <span className="text-sm font-semibold">{step.id}</span>
                    )}
                  </div>

                  {/* Step text */}
                  <div className="flex flex-col min-w-0 pt-1">
                    <span
                      className={cn(
                        "text-sm font-medium transition-colors duration-200",
                        isCurrent && "text-primary",
                        isCompleted && "text-[hsl(var(--wq-status-completed-text))]",
                        isUpcoming && "text-[hsl(var(--wq-text-secondary))]"
                      )}
                    >
                      {step.shortName}
                    </span>
                    <span
                      className={cn(
                        "text-xs transition-colors duration-200 truncate",
                        isCurrent && "text-primary/70",
                        isCompleted && "text-[hsl(var(--wq-status-completed-text))]/70",
                        isUpcoming && "text-muted-foreground"
                      )}
                    >
                      {step.name}
                    </span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
