import { cn } from "@/lib/utils";

type Priority = "high" | "medium" | "low";

interface PrioritySelectorProps {
  value: Priority;
  onChange: (priority: Priority) => void;
}

const PrioritySelector = ({ value, onChange }: PrioritySelectorProps) => {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onChange("high")}
        className={cn(
          "px-6 py-2 rounded-lg text-sm font-medium transition-all border",
          value === "high"
            ? "bg-[hsl(0,100%,95%)] text-[hsl(0,100%,35%)] border-[hsl(0,100%,80%)]"
            : "bg-[hsl(0,100%,97%)] text-[hsl(0,70%,50%)] border-[hsl(0,50%,90%)] hover:bg-[hsl(0,100%,95%)]"
        )}
      >
        High
      </button>
      <button
        type="button"
        onClick={() => onChange("medium")}
        className={cn(
          "px-6 py-2 rounded-lg text-sm font-medium transition-all border",
          value === "medium"
            ? "bg-[hsl(30,100%,95%)] text-[hsl(30,100%,40%)] border-[hsl(30,100%,70%)]"
            : "bg-[hsl(30,100%,97%)] text-[hsl(30,70%,50%)] border-[hsl(30,50%,85%)] hover:bg-[hsl(30,100%,95%)]"
        )}
      >
        Medium
      </button>
      <button
        type="button"
        onClick={() => onChange("low")}
        className={cn(
          "px-6 py-2 rounded-lg text-sm font-medium transition-all border",
          value === "low"
            ? "bg-[hsl(0,0%,92%)] text-[hsl(0,0%,36%)] border-[hsl(0,0%,80%)]"
            : "bg-[hsl(0,0%,96%)] text-[hsl(0,0%,50%)] border-[hsl(0,0%,88%)] hover:bg-[hsl(0,0%,92%)]"
        )}
      >
        Low
      </button>
    </div>
  );
};

export default PrioritySelector;
