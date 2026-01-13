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
          "px-6 py-2 rounded-lg text-sm font-medium transition-all border-2 focus:outline-none focus-visible:outline-none focus-visible:ring-0",
          value === "high"
            ? "bg-[hsl(0,85%,60%)] text-white border-[hsl(0,85%,50%)] shadow-sm"
            : "bg-[hsl(0,20%,96%)] text-[hsl(0,10%,60%)] border-[hsl(0,10%,88%)] hover:bg-[hsl(0,30%,92%)] hover:border-[hsl(0,30%,80%)]"
        )}
      >
        High
      </button>
      <button
        type="button"
        onClick={() => onChange("medium")}
        className={cn(
          "px-6 py-2 rounded-lg text-sm font-medium transition-all border-2 focus:outline-none focus-visible:outline-none focus-visible:ring-0",
          value === "medium"
            ? "bg-[hsl(35,90%,55%)] text-white border-[hsl(35,90%,45%)] shadow-sm"
            : "bg-[hsl(35,20%,96%)] text-[hsl(35,10%,55%)] border-[hsl(35,10%,88%)] hover:bg-[hsl(35,30%,92%)] hover:border-[hsl(35,30%,80%)]"
        )}
      >
        Medium
      </button>
      <button
        type="button"
        onClick={() => onChange("low")}
        className={cn(
          "px-6 py-2 rounded-lg text-sm font-medium transition-all border-2 focus:outline-none focus-visible:outline-none focus-visible:ring-0",
          value === "low"
            ? "bg-[hsl(210,15%,50%)] text-white border-[hsl(210,15%,40%)] shadow-sm"
            : "bg-[hsl(210,5%,96%)] text-[hsl(210,5%,55%)] border-[hsl(210,5%,88%)] hover:bg-[hsl(210,10%,92%)] hover:border-[hsl(210,10%,80%)]"
        )}
      >
        Low
      </button>
    </div>
  );
};

export default PrioritySelector;
