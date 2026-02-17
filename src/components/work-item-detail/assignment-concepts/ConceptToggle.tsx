import { cn } from "@/lib/utils";

export type ConceptView = "classic" | "bulk-assign" | "role-first" | "command-centre";

interface ConceptToggleProps {
  activeView: ConceptView;
  onViewChange: (view: ConceptView) => void;
}

const views: { id: ConceptView; label: string }[] = [
  { id: "classic", label: "Classic" },
  { id: "bulk-assign", label: "Concept 1: Bulk Assign" },
  { id: "role-first", label: "Concept 2: Role-First" },
  { id: "command-centre", label: "Command Centre" },
];

export const ConceptToggle = ({ activeView, onViewChange }: ConceptToggleProps) => {
  return (
    <div className="inline-flex rounded-full border border-[hsl(var(--wq-border))] bg-white p-1 shadow-sm">
      {views.map((view) => (
        <button
          key={view.id}
          type="button"
          onClick={() => onViewChange(view.id)}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
            activeView === view.id
              ? "bg-[hsl(220,50%,20%)] text-white shadow-sm"
              : "text-[hsl(var(--wq-text-secondary))] hover:text-primary hover:bg-[hsl(var(--wq-bg-hover))]"
          )}
        >
          {view.label}
        </button>
      ))}
    </div>
  );
};
