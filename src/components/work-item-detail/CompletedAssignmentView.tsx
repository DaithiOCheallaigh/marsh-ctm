import React, { useState } from "react";
import { ChevronDown, ChevronRight, Check, AlertCircle, User, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RoleDefinition, AssignmentData } from "./assignment-concepts/types";
import { rolesData } from "@/data/roles";

interface CompletedAssignmentViewProps {
  availableRoles: RoleDefinition[];
  existingAssignments: AssignmentData[];
  isPartialCompletion: boolean;
}

interface RoleAccordionProps {
  role: RoleDefinition;
  assignments: AssignmentData[];
  hasAssignments: boolean;
  isFullyCompleted: boolean;
  isPartiallyCompleted: boolean;
  isDisabled: boolean;
}

const RoleAccordion: React.FC<RoleAccordionProps> = ({
  role,
  assignments,
  hasAssignments,
  isFullyCompleted,
  isPartiallyCompleted,
  isDisabled,
}) => {
  const [isExpanded, setIsExpanded] = useState(hasAssignments);

  // Get configured chair count for this role
  const roleData = rolesData.find(
    (r) =>
      r.name.toLowerCase().includes(role.roleName.toLowerCase()) ||
      role.roleName.toLowerCase().includes(r.name.toLowerCase()) ||
      r.id === role.roleId
  );
  const configuredChairCount = role.chairCount || roleData?.chairs?.length || 1;
  const assignedCount = assignments.length;

  const handleToggle = () => {
    if (!isDisabled) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div
      className={cn(
        "rounded-lg border-2 overflow-hidden transition-all",
        isFullyCompleted
          ? "border-[hsl(var(--wq-status-completed-text))] bg-[hsl(var(--wq-status-completed-bg))]"
          : isPartiallyCompleted
          ? "border-[hsl(var(--wq-status-completed-text))] bg-[hsl(var(--wq-status-completed-bg))]"
          : "border-gray-200 bg-gray-50"
      )}
    >
      {/* Header */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={isDisabled}
        className={cn(
          "w-full flex items-center justify-between p-4 text-left transition-all",
          isDisabled
            ? "cursor-not-allowed opacity-60"
            : "hover:bg-black/5 cursor-pointer"
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              hasAssignments
                ? "bg-[hsl(var(--wq-status-completed-text))]"
                : "bg-gray-300"
            )}
          >
            {hasAssignments ? (
              <Check className="h-5 w-5 text-white" />
            ) : (
              <AlertCircle className="h-5 w-5 text-white" />
            )}
          </div>
          <div>
            <p
              className={cn(
                "font-medium",
                hasAssignments
                  ? "text-[hsl(var(--wq-status-completed-text))]"
                  : "text-gray-500"
              )}
            >
              {role.roleName}
            </p>
            {role.teamName && (
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs mt-1",
                  !hasAssignments && "opacity-60"
                )}
              >
                {role.teamName}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasAssignments ? (
            <Badge
              className={cn(
                "text-xs",
                isFullyCompleted
                  ? "bg-[hsl(var(--wq-status-completed-text))] text-white"
                  : "bg-gray-100 text-gray-700 border-gray-300"
              )}
            >
              {isFullyCompleted ? (
                <>
                  <Check className="w-3 h-3 mr-1" />
                  Fully Assigned ({assignedCount}/{configuredChairCount})
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Partial ({assignedCount}/{configuredChairCount})
                </>
              )}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs text-gray-400 border-gray-300">
              No assignments available
            </Badge>
          )}
          {!isDisabled &&
            (isExpanded ? (
              <ChevronDown className="h-5 w-5 text-[hsl(var(--wq-status-completed-text))]" />
            ) : (
              <ChevronRight className="h-5 w-5 text-[hsl(var(--wq-status-completed-text))]" />
            ))}
          {isDisabled && (
            <div className="w-5 h-5" /> // Spacer for alignment
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && hasAssignments && (
        <div className="border-t border-[hsl(var(--wq-border))] bg-white p-4">
          <div className="space-y-3">
            {assignments.map((assignment, index) => {
              // Extract chair name from notes (format: "ChairName" or "ChairName - notes")
              const chairName = assignment.notes?.split(" - ")[0] || `Chair ${index + 1}`;
              const additionalNotes = assignment.notes?.includes(" - ")
                ? assignment.notes.split(" - ").slice(1).join(" - ")
                : null;

              return (
                <div
                  key={`${assignment.roleId}-${index}`}
                  className="flex items-start gap-4 p-4 bg-[hsl(var(--wq-bg-muted))] rounded-lg border border-[hsl(var(--wq-border))]"
                >
                  {/* Member Avatar */}
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>

                  {/* Assignment Details */}
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-[hsl(var(--wq-text-secondary))] mb-1">
                        Chair Name
                      </p>
                      <p className="text-sm font-medium text-primary">{chairName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[hsl(var(--wq-text-secondary))] mb-1">
                        Team Member
                      </p>
                      <p className="text-sm font-medium text-primary">
                        {assignment.selectedPerson?.name || "Unassigned"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[hsl(var(--wq-text-secondary))] mb-1">
                        Workload
                      </p>
                      <p className="text-sm font-medium text-primary">
                        {assignment.workloadPercentage}%
                      </p>
                    </div>
                    {additionalNotes && (
                      <div className="col-span-3">
                        <p className="text-xs text-[hsl(var(--wq-text-secondary))] mb-1">
                          Notes
                        </p>
                        <p className="text-sm text-[hsl(var(--wq-text-secondary))]">
                          {additionalNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const CompletedAssignmentView: React.FC<CompletedAssignmentViewProps> = ({
  availableRoles,
  existingAssignments,
  isPartialCompletion,
}) => {
  // Group assignments by role
  const getAssignmentsForRole = (roleId: string) => {
    return existingAssignments.filter((a) => a.roleId === roleId);
  };

  // Determine completion state for each role
  const getRoleStatus = (role: RoleDefinition) => {
    const assignments = getAssignmentsForRole(role.roleId);
    const roleData = rolesData.find(
      (r) =>
        r.name.toLowerCase().includes(role.roleName.toLowerCase()) ||
        role.roleName.toLowerCase().includes(r.name.toLowerCase()) ||
        r.id === role.roleId
    );
    const configuredChairCount = role.chairCount || roleData?.chairs?.length || 1;
    const assignedCount = assignments.length;

    const hasAssignments = assignedCount > 0;
    const isFullyCompleted = assignedCount >= configuredChairCount;
    const isPartiallyCompleted = hasAssignments && !isFullyCompleted;

    return {
      assignments,
      hasAssignments,
      isFullyCompleted,
      isPartiallyCompleted,
    };
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Briefcase className="w-5 h-5 text-primary" />
        <h4 className="font-semibold text-primary">Role Assignments</h4>
        <Badge
          variant="outline"
          className={cn(
            "text-xs ml-2",
            isPartialCompletion
              ? "bg-gray-100 text-gray-600 border-gray-300"
              : "bg-[hsl(var(--wq-status-completed-bg))] text-[hsl(var(--wq-status-completed-text))] border-[hsl(var(--wq-status-completed-text))]"
          )}
        >
          {isPartialCompletion ? "Partially Completed" : "Fully Completed"}
        </Badge>
      </div>

      {/* Role Accordions */}
      <div className="space-y-3">
        {availableRoles.map((role) => {
          const status = getRoleStatus(role);
          
          // For partial completion: roles without assignments are disabled
          // For full completion: all roles are enabled
          const isDisabled = isPartialCompletion && !status.hasAssignments;

          return (
            <RoleAccordion
              key={role.roleId}
              role={role}
              assignments={status.assignments}
              hasAssignments={status.hasAssignments}
              isFullyCompleted={status.isFullyCompleted}
              isPartiallyCompleted={status.isPartiallyCompleted}
              isDisabled={isDisabled}
            />
          );
        })}
      </div>
    </div>
  );
};
