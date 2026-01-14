import { cn } from "@/lib/utils";
import { getFieldStateClasses } from "@/components/form/FormDirtyContext";

type Priority = "high" | "medium" | "low";

interface PrioritySelectorProps {
  value: Priority;
  onChange: (priority: Priority) => void;
  isDirty?: boolean;
}

const PrioritySelector = ({ value, onChange, isDirty = false }: PrioritySelectorProps) => {
  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={() => onChange("high")}
        className={cn(
          "px-6 py-2 rounded text-sm font-medium transition-all focus:outline-none focus-visible:outline-none focus-visible:ring-0",
          value === "high"
            ? "bg-[hsl(0,72%,51%)] text-white"
            : "bg-[hsl(2,100%,95%)] text-[hsl(10,53%,71%)]"
        )}
      >
        High
      </button>
      <button
        type="button"
        onClick={() => onChange("medium")}
        className={cn(
          "px-6 py-2 rounded text-sm font-medium transition-all focus:outline-none focus-visible:outline-none focus-visible:ring-0",
          value === "medium"
            ? "bg-[hsl(27,100%,55%)] text-white"
            : "bg-[hsl(33,100%,95%)] text-[hsl(27,70%,65%)]"
        )}
      >
        Medium
      </button>
      <button
        type="button"
        onClick={() => onChange("low")}
        className={cn(
          "px-6 py-2 rounded text-sm font-medium transition-all focus:outline-none focus-visible:outline-none focus-visible:ring-0",
          value === "low"
            ? "bg-[hsl(0,0%,58%)] text-white"
            : "bg-[hsl(0,0%,94%)] text-[hsl(0,0%,65%)]"
        )}
      >
        Low
      </button>
    </div>
  );
};

export default PrioritySelector;
