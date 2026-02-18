import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Search, X, Check, ChevronDown, Loader2, CheckCircle2, XCircle, User, AlertTriangle, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { RoleDefinition, AssignmentData } from "./types";
import { teamMembers } from "@/data/teamMembers";
import { rolesData } from "@/data/roles";

// ─── Local types ─────────────────────────────────────────────────────────────
interface LocalMember {
  id: string;
  name: string;
  title: string;
  role: string;
  availableCapacity: number;
}

interface LocalChair {
  id: string;
  name: string;
}

interface LocalRole {
  roleId: string;
  roleName: string;
  teamName?: string;
  chairs: LocalChair[];
}

interface LocalAssignment {
  id: string;
  memberId: string;
  memberName: string;
  roleId: string;
  roleName: string;
  chairId: string;
  chairName: string;
  workload: number;
}

type SaveState = null | "saving" | "success" | "error";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getCapacityBadgeCls = (cap: number) => {
  if (cap >= 50) return "bg-green-50 text-green-700 border-green-200";
  if (cap >= 20) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-red-50 text-red-700 border-red-200";
};

const getCapacityTextCls = (cap: number) => {
  if (cap >= 50) return "text-green-600";
  if (cap >= 20) return "text-amber-500";
  return "text-red-500";
};

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

const buildChairsForRole = (roleName: string): LocalChair[] => {
  const found = rolesData.find(
    (r) => r.name.toLowerCase() === roleName.toLowerCase()
  );
  if (found && found.chairs.length > 0) {
    return found.chairs.map((c) => ({ id: c.id, name: c.name }));
  }
  return [
    { id: `${roleName}-c1`, name: "Primary Chair" },
    { id: `${roleName}-c2`, name: "Secondary Chair" },
  ];
};

// ─── MemberCard ──────────────────────────────────────────────────────────────
interface MemberCardProps {
  member: LocalMember;
  isSelected: boolean;
  onSelect: (m: LocalMember) => void;
  assignmentCount: number;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, isSelected, onSelect, assignmentCount }) => (
  <div
    role="radio"
    aria-checked={isSelected}
    tabIndex={0}
    onClick={() => onSelect(member)}
    onKeyDown={(e) => (e.key === " " || e.key === "Enter") && onSelect(member)}
    className={cn(
      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-150 select-none",
      isSelected
        ? "border-primary bg-primary/5 shadow-sm"
        : "border-border bg-card hover:bg-accent/30"
    )}
  >
    <div className={cn(
      "flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center",
      isSelected ? "border-primary" : "border-muted-foreground/40"
    )}>
      {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
    </div>

    <div className={cn(
      "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold",
      isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
    )}>
      {getInitials(member.name)}
    </div>

    <div className="flex-1 min-w-0">
      <p className={cn("text-sm font-medium truncate", isSelected ? "text-primary" : "text-foreground")}>
        {member.name}
      </p>
      <p className="text-xs text-muted-foreground truncate">{member.title || member.role}</p>
    </div>

    <div className="flex-shrink-0 flex flex-col items-end gap-0.5">
      <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", getCapacityBadgeCls(member.availableCapacity))}>
        {member.availableCapacity}% Availability
      </span>
      {assignmentCount > 0 && (
        <span className="text-[10px] text-muted-foreground">{assignmentCount} assigned</span>
      )}
    </div>
  </div>
);

// ─── RoleCard ─────────────────────────────────────────────────────────────────
interface RoleCardProps {
  role: LocalRole;
  allAssignments: LocalAssignment[];
  isExpanded: boolean;
  onToggle: () => void;
  selectedMember: LocalMember | null;
  saveState: SaveState;
  onAssign: (chairId: string, chairName: string, workload: number) => void;
  onRetry: () => void;
  onCollapse: () => void;
}

const RoleCard: React.FC<RoleCardProps> = ({
  role, allAssignments, isExpanded, onToggle, selectedMember, saveState, onAssign, onRetry, onCollapse,
}) => {
  const [selectedChairId, setSelectedChairId] = useState("");
  const [workloadStr, setWorkloadStr] = useState("20");

  const roleAssignments = allAssignments.filter((a) => a.roleId === role.roleId);
  const assignedChairIds = new Set(roleAssignments.map((a) => a.chairId));
  const assignedCount = roleAssignments.length;
  const totalChairs = role.chairs.length;
  const fullyAssigned = assignedCount >= totalChairs;

  const occupiedChairIds = useMemo(
    () => new Set(allAssignments.filter((a) => a.roleId === role.roleId).map((a) => a.chairId)),
    [allAssignments, role.roleId]
  );

  const memberChairIds = useMemo(
    () => new Set(allAssignments.filter((a) => a.roleId === role.roleId && a.memberId === selectedMember?.id).map((a) => a.chairId)),
    [allAssignments, role.roleId, selectedMember?.id]
  );

  const memberRemainingCapacity = selectedMember?.availableCapacity ?? 100;
  const workload = parseFloat(workloadStr) || 0;
  const exceedsCapacity = workload > memberRemainingCapacity && memberRemainingCapacity >= 0;
  const canAssign = selectedChairId !== "" && workload >= 1 && workload <= 100 && saveState !== "saving";

  // Auto-select chair if exactly one available
  useEffect(() => {
    if (!isExpanded) return;
    const available = role.chairs.filter((c) => !occupiedChairIds.has(c.id) && !memberChairIds.has(c.id));
    if (available.length === 1 && !selectedChairId) {
      setSelectedChairId(available[0].id);
    }
  }, [isExpanded, role.chairs, occupiedChairIds, memberChairIds, selectedChairId]);

  // Reset chair selection when collapsed
  useEffect(() => {
    if (!isExpanded) {
      setSelectedChairId("");
      setWorkloadStr("20");
    }
  }, [isExpanded]);

  const handleAssignClick = () => {
    if (!canAssign) return;
    const chair = role.chairs.find((c) => c.id === selectedChairId);
    if (!chair) return;
    onAssign(selectedChairId, chair.name, workload);
  };

  return (
    <div className={cn(
      "border rounded-lg transition-all duration-200",
      fullyAssigned
        ? "border-border bg-muted/30 opacity-75"
        : isExpanded
        ? "border-primary shadow-sm bg-card"
        : "border-border bg-card hover:shadow-sm hover:border-primary/40 cursor-pointer"
    )}>
      {/* Card header */}
      <div
        className={cn("p-3", !fullyAssigned && "cursor-pointer")}
        onClick={!fullyAssigned ? onToggle : undefined}
      >
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <p className="text-sm font-semibold text-foreground leading-tight">{role.roleName}</p>
          {fullyAssigned ? (
            <Badge className="text-[10px] bg-muted text-muted-foreground border-border whitespace-nowrap flex-shrink-0">
              Fully Assigned
            </Badge>
          ) : (
            <ChevronDown
              className={cn(
                "w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200",
                isExpanded && "rotate-180"
              )}
            />
          )}
        </div>
        {role.teamName && (
          <p className="text-[10px] text-muted-foreground mb-1">{role.teamName}</p>
        )}
        <p className="text-xs text-muted-foreground mb-2.5">
          {assignedCount} of {totalChairs} chairs assigned
        </p>

        {/* Chair pills */}
        <div className="flex flex-wrap gap-1.5">
          {role.chairs.map((chair) => {
            const isAssigned = assignedChairIds.has(chair.id);
            const assignee = allAssignments.find((a) => a.chairId === chair.id && a.roleId === role.roleId);
            return (
              <span
                key={chair.id}
                title={isAssigned && assignee ? `Assigned to ${assignee.memberName}` : chair.name}
                className={cn(
                  "inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-medium transition-all",
                  isAssigned
                    ? "bg-green-50 text-green-700 border-green-200 line-through opacity-70"
                    : "bg-muted text-muted-foreground border-border"
                )}
              >
                {isAssigned ? (
                  <Check className="w-2.5 h-2.5 flex-shrink-0" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 flex-shrink-0" />
                )}
                {chair.name}
              </span>
            );
          })}
        </div>
      </div>

      {/* Inline assignment controls — flat, no nested panel */}
      {isExpanded && selectedMember && (
        <div className="px-3 pb-4 pt-1 border-t border-border space-y-3 animate-in slide-in-from-top-2 duration-200">
          {/* Chair selection */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              Chair <span className="text-destructive">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {role.chairs.map((chair) => {
                const isOccupied = occupiedChairIds.has(chair.id);
                const isMemberBlocked = memberChairIds.has(chair.id);
                const isDisabled = isOccupied || isMemberBlocked || saveState === "saving";
                const isSelected = selectedChairId === chair.id;
                const assignee = allAssignments.find((a) => a.chairId === chair.id && a.roleId === role.roleId);

                return (
                  <button
                    key={chair.id}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => !isDisabled && setSelectedChairId(isSelected ? "" : chair.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border font-medium transition-all",
                      isDisabled
                        ? "bg-muted/50 text-muted-foreground border-border cursor-not-allowed opacity-60"
                        : isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card text-foreground border-border hover:border-primary/50 hover:bg-accent/30 cursor-pointer"
                    )}
                  >
                    {isOccupied ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : isSelected ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <div className="w-2 h-2 rounded-full border border-current opacity-40" />
                    )}
                    <span className={cn(isOccupied && "line-through opacity-70")}>{chair.name}</span>
                    {isOccupied && assignee && (
                      <span className="text-[10px] opacity-70">→ {assignee.memberName.split(" ")[0]}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Workload */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              Workload Percentage <span className="text-destructive">*</span>
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="number"
                min={1}
                max={100}
                value={workloadStr}
                onChange={(e) => setWorkloadStr(e.target.value)}
                onFocus={(e) => e.target.select()}
                disabled={saveState === "saving"}
                className="w-20 h-9 px-2 border border-border rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30 bg-card disabled:opacity-50"
              />
              <span className="text-sm text-muted-foreground">%</span>
              {exceedsCapacity && (
                <span className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Exceeds {selectedMember.name.split(" ")[0]}'s remaining capacity ({memberRemainingCapacity}%). Will over-assign.
                </span>
              )}
            </div>
          </div>

          {/* Save feedback */}
          {saveState === "saving" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving assignment...
            </div>
          )}
          {saveState === "success" && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              Assignment saved successfully!
            </div>
          )}
          {saveState === "error" && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <XCircle className="w-4 h-4" />
              Failed to save.{" "}
              <button onClick={onRetry} className="underline hover:no-underline font-medium flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Retry
              </button>
            </div>
          )}

          {/* Actions */}
          {saveState !== "success" && (
            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={onCollapse} disabled={saveState === "saving"}>
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!canAssign}
                onClick={handleAssignClick}
                className="px-6"
              >
                {saveState === "saving" ? (
                  <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Saving...</>
                ) : (
                  "Assign"
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
export interface MemberFirstConceptProps {
  roles: RoleDefinition[];
  existingAssignments?: AssignmentData[];
  onComplete: (assignments: AssignmentData[]) => void;
  onCompleteWorkItem?: () => void;
  isReadOnly?: boolean;
}

export const MemberFirstConcept: React.FC<MemberFirstConceptProps> = ({
  roles,
  existingAssignments = [],
  onComplete,
  isReadOnly = false,
}) => {
  const localRoles: LocalRole[] = useMemo(
    () =>
      roles.map((r) => ({
        roleId: r.roleId,
        roleName: r.roleName,
        teamName: r.teamName,
        chairs: buildChairsForRole(r.roleName),
      })),
    [roles]
  );

  const initialMembers: LocalMember[] = useMemo(() => {
    return teamMembers
      .slice(0, 20)
      .map((m) => {
        const baseWorkload = (m.currentAssignments || []).reduce((s, a) => s + a.workload, 0);
        const availableCapacity = Math.max(0, 100 - baseWorkload);
        return { id: m.id, name: m.name, title: m.title, role: m.role, availableCapacity };
      })
      .sort((a, b) => b.availableCapacity - a.availableCapacity);
  }, []);

  const [members, setMembers] = useState<LocalMember[]>(initialMembers);
  const [selectedMember, setSelectedMember] = useState<LocalMember | null>(null);
  const [expandedRoleId, setExpandedRoleId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<LocalAssignment[]>([]);
  const [saveState, setSaveState] = useState<SaveState>(null);
  const [pendingSave, setPendingSave] = useState<{ chairId: string; chairName: string; workload: number } | null>(null);
  const [memberSearch, setMemberSearch] = useState("");
  const debouncedSearch = useDebounce(memberSearch, 300);

  const filteredMembers = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q)
    );
  }, [members, debouncedSearch]);

  const memberAssignmentCount = useCallback(
    (memberId: string) => assignments.filter((a) => a.memberId === memberId).length,
    [assignments]
  );

  const handleSelectMember = (member: LocalMember) => {
    if (isReadOnly) return;
    setSelectedMember(member);
    setExpandedRoleId(null);
    setSaveState(null);
    setPendingSave(null);
  };

  const handleToggleRole = (roleId: string) => {
    if (!selectedMember || isReadOnly) return;
    setSaveState(null);
    setPendingSave(null);
    setExpandedRoleId((prev) => (prev === roleId ? null : roleId));
  };

  const executeSave = useCallback(
    async (chairId: string, chairName: string, workload: number) => {
      if (!selectedMember || !expandedRoleId) return;
      const role = localRoles.find((r) => r.roleId === expandedRoleId);
      if (!role) return;

      const duplicate = assignments.find(
        (a) => a.memberId === selectedMember.id && a.roleId === role.roleId && a.chairId === chairId
      );
      if (duplicate) return;

      setSaveState("saving");
      await new Promise((res) => setTimeout(res, 600));

      const newAssignment: LocalAssignment = {
        id: `${selectedMember.id}-${chairId}-${Date.now()}`,
        memberId: selectedMember.id,
        memberName: selectedMember.name,
        roleId: role.roleId,
        roleName: role.roleName,
        chairId,
        chairName,
        workload,
      };

      setAssignments((prev) => [...prev, newAssignment]);

      setMembers((prev) =>
        prev.map((m) =>
          m.id === selectedMember.id
            ? { ...m, availableCapacity: Math.max(0, m.availableCapacity - workload) }
            : m
        )
      );
      setSelectedMember((prev) =>
        prev ? { ...prev, availableCapacity: Math.max(0, prev.availableCapacity - workload) } : prev
      );

      const assignmentData: AssignmentData = {
        roleId: role.roleId,
        roleName: role.roleName,
        teamName: role.teamName,
        selectedPerson: {
          id: selectedMember.id,
          name: selectedMember.name,
          role: selectedMember.title,
          capacity: selectedMember.availableCapacity,
        },
        chairType: "Primary",
        workloadPercentage: workload,
        notes: chairName,
      };
      onComplete([...existingAssignments, assignmentData]);

      setSaveState("success");
      setTimeout(() => {
        setExpandedRoleId(null);
        setSaveState(null);
        setPendingSave(null);
      }, 2000);
    },
    [selectedMember, expandedRoleId, localRoles, assignments, existingAssignments, onComplete]
  );

  const handleAssign = useCallback(
    (chairId: string, chairName: string, workload: number) => {
      setPendingSave({ chairId, chairName, workload });
      executeSave(chairId, chairName, workload);
    },
    [executeSave]
  );

  const handleRetry = () => {
    if (pendingSave) {
      setSaveState(null);
      executeSave(pendingSave.chairId, pendingSave.chairName, pendingSave.workload);
    }
  };

  const handleCollapse = () => {
    setExpandedRoleId(null);
    setSaveState(null);
    setPendingSave(null);
  };

  return (
    <div className="flex gap-6 min-w-0">
      {/* ── LEFT: Team Members (40%) ── */}
      <div className="w-[40%] flex-shrink-0 flex flex-col">
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="px-4 py-3 bg-muted/40 border-b border-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Team Members</h3>
            <p className="text-sm text-muted-foreground">{members.length} members · sorted by capacity</p>
          </div>

          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search members..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full h-9 pl-8 pr-8 text-sm border border-border rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              {memberSearch && (
                <button
                  onClick={() => setMemberSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="p-3 space-y-2 overflow-y-auto max-h-[560px]">
            {filteredMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                isSelected={selectedMember?.id === member.id}
                onSelect={isReadOnly ? () => {} : handleSelectMember}
                assignmentCount={memberAssignmentCount(member.id)}
              />
            ))}
            {filteredMembers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No members found</p>
            )}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Available Roles (60%) ── */}
      <div className="flex-1 min-w-0">
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="px-4 py-3 bg-muted/40 border-b border-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
              Available Roles
            </h3>
            {selectedMember ? (
              <p className="text-sm text-foreground">
                Assigning roles to:{" "}
                <span className="font-semibold text-primary">{selectedMember.name}</span>
                {" — "}
                <span className={cn("text-xs font-medium", getCapacityTextCls(selectedMember.availableCapacity))}>
                  {selectedMember.availableCapacity}% available capacity
                </span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Select a team member on the left to begin assigning roles
              </p>
            )}
          </div>

          <div className="p-4 flex flex-col gap-3">
            {localRoles.map((role) => (
              <RoleCard
                key={role.roleId}
                role={role}
                allAssignments={assignments}
                isExpanded={expandedRoleId === role.roleId}
                onToggle={() => handleToggleRole(role.roleId)}
                selectedMember={selectedMember}
                saveState={expandedRoleId === role.roleId ? saveState : null}
                onAssign={handleAssign}
                onRetry={handleRetry}
                onCollapse={handleCollapse}
              />
            ))}
            {localRoles.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                No roles configured for this work item.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
