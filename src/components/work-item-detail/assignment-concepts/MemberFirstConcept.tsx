import React, { useState, useMemo, useCallback } from "react";
import { Search, X, Check, User, AlertTriangle, Loader2, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { RoleDefinition, AssignmentData } from "./types";
import { teamMembers } from "@/data/teamMembers";
import { rolesData } from "@/data/roles";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LocalMember {
  id: string;
  name: string;
  title: string;
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

/** roleId+chairId → assignment */
type AssignmentMap = Record<string, { memberId: string; memberName: string; workload: number }>;

type SaveState = null | "saving" | "success" | "error";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  const found = rolesData.find((r) => r.name.toLowerCase() === roleName.toLowerCase());
  if (found && found.chairs.length > 0) {
    return found.chairs.map((c) => ({ id: c.id, name: c.name }));
  }
  return [
    { id: `${roleName}-c1`, name: "Primary Chair" },
    { id: `${roleName}-c2`, name: "Secondary Chair" },
  ];
};

const assignmentKey = (roleId: string, chairId: string) => `${roleId}::${chairId}`;

// ─── MemberCard ───────────────────────────────────────────────────────────────

interface MemberCardProps {
  member: LocalMember;
  isSelected: boolean;
  assignmentCount: number;
  onSelect: () => void;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, isSelected, assignmentCount, onSelect }) => (
  <div
    role="radio"
    aria-checked={isSelected}
    tabIndex={0}
    onClick={onSelect}
    onKeyDown={(e) => (e.key === " " || e.key === "Enter") && onSelect()}
    className={cn(
      "flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all duration-150 select-none border-l-2",
      isSelected
        ? "border-l-primary bg-primary/5"
        : "border-l-transparent hover:bg-accent/20"
    )}
  >
    {/* Radio */}
    <div className={cn(
      "flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center",
      isSelected ? "border-primary" : "border-muted-foreground/40"
    )}>
      {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
    </div>

    {/* Avatar */}
    <div className={cn(
      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold",
      isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
    )}>
      {getInitials(member.name)}
    </div>

    {/* Name + title */}
    <div className="flex-1 min-w-0">
      <p className={cn("text-sm font-medium truncate leading-tight", isSelected ? "text-primary" : "text-foreground")}>
        {member.name}
      </p>
      <p className="text-xs text-muted-foreground truncate leading-tight">{member.title}</p>
    </div>

    {/* Availability */}
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
  assignmentMap: AssignmentMap;
  selectedMember: LocalMember | null;
  isLocked: boolean;
  /** Which chair is currently staged for input within this role */
  activeChairId: string | null;
  onSelectChair: (chairId: string) => void;
  workloadStr: string;
  onWorkloadChange: (val: string) => void;
  saveState: SaveState;
  onAssign: () => void;
  onRetry: () => void;
}

const RoleCard: React.FC<RoleCardProps> = ({
  role,
  assignmentMap,
  selectedMember,
  isLocked,
  activeChairId,
  onSelectChair,
  workloadStr,
  onWorkloadChange,
  saveState,
  onAssign,
  onRetry,
}) => {
  const assignedInRole = role.chairs.filter((c) => assignmentMap[assignmentKey(role.roleId, c.id)]);
  const allFilled = assignedInRole.length >= role.chairs.length;

  const workload = parseFloat(workloadStr) || 0;
  const remaining = selectedMember?.availableCapacity ?? 100;
  const exceedsCapacity = workload > remaining;
  const canAssign = activeChairId !== null && workload >= 1 && workload <= 100 && saveState !== "saving";

  return (
    <div className={cn(
      "border rounded-lg transition-all duration-200 overflow-hidden",
      allFilled ? "border-border bg-muted/20 opacity-70" : isLocked ? "border-border bg-card" : "border-border bg-card"
    )}>
      {/* Role header */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground leading-tight">{role.roleName}</p>
            {role.teamName && <p className="text-xs text-muted-foreground mt-0.5">{role.teamName}</p>}
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
            {assignedInRole.length} of {role.chairs.length} chairs assigned
          </span>
        </div>
      </div>

      {/* Chair list */}
      <div className="divide-y divide-border">
        {role.chairs.map((chair) => {
          const key = assignmentKey(role.roleId, chair.id);
          const existing = assignmentMap[key];
          const isAssigned = !!existing;
          const isActive = activeChairId === chair.id && !isAssigned;
          const isSelectable = !isAssigned && !isLocked && !allFilled;

          return (
            <div key={chair.id}>
              {/* Chair row */}
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 transition-colors",
                  isSelectable ? "cursor-pointer hover:bg-accent/20" : "cursor-default",
                  isActive && "bg-primary/5",
                  isAssigned && "bg-muted/30"
                )}
                onClick={() => isSelectable && onSelectChair(chair.id)}
              >
                {/* Radio / check */}
                <div className={cn(
                  "flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center",
                  isAssigned
                    ? "border-green-500 bg-green-500"
                    : isActive
                    ? "border-primary"
                    : "border-muted-foreground/40"
                )}>
                  {isAssigned ? (
                    <Check className="w-2.5 h-2.5 text-white" />
                  ) : isActive ? (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  ) : null}
                </div>

                {/* Chair name */}
                <span className={cn(
                  "text-sm flex-1",
                  isAssigned ? "text-muted-foreground line-through" : "text-foreground"
                )}>
                  {chair.name}
                </span>

                {/* Assigned member name */}
                {isAssigned && existing && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    → {existing.memberName}
                    <span className="text-[10px] text-muted-foreground/70">({existing.workload}%)</span>
                  </span>
                )}
              </div>

              {/* Inline workload + assign controls — only for active chair */}
              {isActive && (
                <div className="px-4 pb-3 pt-2 bg-primary/5 border-t border-primary/10 space-y-2 animate-in slide-in-from-top-1 duration-150">
                  {/* Workload row */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                      Workload %
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      step={0.5}
                      value={workloadStr}
                      onChange={(e) => onWorkloadChange(e.target.value)}
                      onFocus={(e) => e.target.select()}
                      disabled={saveState === "saving"}
                      className="w-20 h-8 px-2 border border-border rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30 bg-card disabled:opacity-50"
                    />
                    <span className="text-sm text-muted-foreground">%</span>

                    {exceedsCapacity && (
                      <span className="text-xs text-amber-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Exceeds {selectedMember?.name.split(" ")[0]}'s remaining capacity ({remaining}%)
                      </span>
                    )}

                    {/* Spacer + Assign button */}
                    <div className="flex items-center gap-2 ml-auto">
                      {/* Save feedback inline */}
                      {saveState === "saving" && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                        </span>
                      )}
                      {saveState === "success" && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Saved
                        </span>
                      )}
                      {saveState === "error" && (
                        <button onClick={onRetry} className="text-xs text-destructive flex items-center gap-1 hover:underline">
                          <XCircle className="w-3 h-3" /> Failed —
                          <RefreshCw className="w-3 h-3" /> Retry
                        </button>
                      )}

                      {saveState !== "success" && (
                        <Button size="sm" disabled={!canAssign} onClick={onAssign} className="h-8 px-5">
                          {saveState === "saving" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Assign"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
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
  // Build local role structures with real chair data
  const localRoles: LocalRole[] = useMemo(
    () => roles.map((r) => ({
      roleId: r.roleId,
      roleName: r.roleName,
      teamName: r.teamName,
      chairs: buildChairsForRole(r.roleName),
    })),
    [roles]
  );

  // Build member list from teamMembers, sorted by available capacity desc
  const initialMembers: LocalMember[] = useMemo(() => {
    return teamMembers
      .map((m) => {
        const baseWorkload = (m.currentAssignments || []).reduce((s, a) => s + a.workload, 0);
        return {
          id: m.id,
          name: m.name,
          title: m.title,
          availableCapacity: Math.max(0, 100 - baseWorkload),
        };
      })
      .sort((a, b) => b.availableCapacity - a.availableCapacity);
  }, []);

  const [members, setMembers] = useState<LocalMember[]>(initialMembers);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [assignmentMap, setAssignmentMap] = useState<AssignmentMap>({});

  // Active chair state — one at a time across all roles
  const [activeChair, setActiveChair] = useState<{ roleId: string; chairId: string } | null>(null);
  const [workloadStr, setWorkloadStr] = useState("20");
  const [saveState, setSaveState] = useState<SaveState>(null);
  const [pendingSave, setPendingSave] = useState<{ roleId: string; chairId: string; chairName: string; workload: number } | null>(null);

  const [memberSearch, setMemberSearch] = useState("");
  const debouncedSearch = useDebounce(memberSearch, 300);

  const selectedMember = useMemo(
    () => members.find((m) => m.id === selectedMemberId) ?? null,
    [members, selectedMemberId]
  );

  const filteredMembers = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) => m.name.toLowerCase().includes(q) || m.title.toLowerCase().includes(q)
    );
  }, [members, debouncedSearch]);

  const memberAssignmentCount = useCallback(
    (memberId: string) =>
      Object.values(assignmentMap).filter((a) => a.memberId === memberId).length,
    [assignmentMap]
  );

  // All chairs across all roles assigned?
  const allChairsAssigned = useMemo(() => {
    return localRoles.every((role) =>
      role.chairs.every((chair) => !!assignmentMap[assignmentKey(role.roleId, chair.id)])
    );
  }, [localRoles, assignmentMap]);

  const handleSelectMember = (memberId: string) => {
    if (isReadOnly) return;
    setSelectedMemberId(memberId);
    setActiveChair(null);
    setSaveState(null);
    setPendingSave(null);
    setWorkloadStr("20");
  };

  const handleSelectChair = (roleId: string, chairId: string) => {
    if (!selectedMemberId || isReadOnly) return;
    // Toggle off if same chair clicked again
    if (activeChair?.roleId === roleId && activeChair?.chairId === chairId) {
      setActiveChair(null);
      setSaveState(null);
      return;
    }
    setActiveChair({ roleId, chairId });
    setWorkloadStr("20");
    setSaveState(null);
    setPendingSave(null);
  };

  const executeSave = useCallback(
    async (roleId: string, chairId: string, chairName: string, workload: number) => {
      if (!selectedMember) return;

      // Guard: same member + role + chair
      const key = assignmentKey(roleId, chairId);
      if (assignmentMap[key]?.memberId === selectedMember.id) return;

      setSaveState("saving");
      await new Promise((res) => setTimeout(res, 600));

      const newMap = {
        ...assignmentMap,
        [key]: { memberId: selectedMember.id, memberName: selectedMember.name, workload },
      };
      setAssignmentMap(newMap);

      // Update member available capacity
      setMembers((prev) =>
        prev.map((m) =>
          m.id === selectedMember.id
            ? { ...m, availableCapacity: Math.max(0, m.availableCapacity - workload) }
            : m
        )
      );

      // Emit to parent
      const role = localRoles.find((r) => r.roleId === roleId);
      if (role) {
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
      }

      setSaveState("success");

      // Auto-clear: collapse chair input after success
      setTimeout(() => {
        setActiveChair(null);
        setSaveState(null);
        setPendingSave(null);
        setWorkloadStr("20");
      }, 1500);
    },
    [selectedMember, assignmentMap, localRoles, existingAssignments, onComplete]
  );

  const handleAssign = () => {
    if (!activeChair) return;
    const role = localRoles.find((r) => r.roleId === activeChair.roleId);
    const chair = role?.chairs.find((c) => c.id === activeChair.chairId);
    if (!chair) return;
    const workload = parseFloat(workloadStr) || 0;
    setPendingSave({ roleId: activeChair.roleId, chairId: activeChair.chairId, chairName: chair.name, workload });
    executeSave(activeChair.roleId, activeChair.chairId, chair.name, workload);
  };

  const handleRetry = () => {
    if (pendingSave) {
      setSaveState(null);
      executeSave(pendingSave.roleId, pendingSave.chairId, pendingSave.chairName, pendingSave.workload);
    }
  };

  return (
    <div className="flex gap-6 min-w-0">
      {/* ── LEFT: Team Members (40%) ── */}
      <div className="w-[40%] flex-shrink-0">
        <div className="bg-card rounded-lg border border-[hsl(var(--wq-border))] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--wq-border))]">
            <h3 className="text-primary font-bold text-sm">
              Team Members
              <span className="ml-2 text-[hsl(var(--wq-text-secondary))] font-normal text-xs">
                · {members.length} members · sorted by capacity
              </span>
            </h3>
          </div>

          {/* Search */}
          <div className="px-4 py-3 border-b border-[hsl(var(--wq-border))]">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--wq-text-secondary))] pointer-events-none" />
              <input
                type="text"
                placeholder="Search members..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full h-9 pl-8 pr-8 text-sm border border-[hsl(var(--wq-border))] rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              {memberSearch && (
                <button
                  onClick={() => setMemberSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[hsl(var(--wq-text-secondary))] hover:text-primary"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Member list */}
          <div className="overflow-y-auto max-h-[560px] divide-y divide-[hsl(var(--wq-border))]">
            {filteredMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                isSelected={selectedMemberId === member.id}
                assignmentCount={memberAssignmentCount(member.id)}
                onSelect={() => handleSelectMember(member.id)}
              />
            ))}
            {filteredMembers.length === 0 && (
              <p className="text-sm text-[hsl(var(--wq-text-secondary))] text-center py-8">No members found</p>
            )}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Available Roles (60%) ── */}
      <div className="flex-1 min-w-0">
        <div className="bg-card rounded-lg border border-[hsl(var(--wq-border))] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--wq-border))]">
            <div className="min-w-0">
              <h3 className="text-primary font-bold text-sm">Available Roles</h3>
              {selectedMember ? (
                <p className="text-xs text-[hsl(var(--wq-text-secondary))] mt-0.5">
                  Assigning to:{" "}
                  <span className="font-semibold text-primary">{selectedMember.name}</span>
                  {" — "}
                  <span className={cn("font-medium", getCapacityTextCls(selectedMember.availableCapacity))}>
                    {selectedMember.availableCapacity}% available capacity
                  </span>
                </p>
              ) : (
                <p className="text-xs text-[hsl(var(--wq-text-secondary))] mt-0.5 flex items-center gap-1.5">
                  <User className="w-3 h-3" />
                  Select a team member on the left to begin assigning roles
                </p>
              )}
            </div>
          </div>

          {/* Role cards */}
          <div className={cn("p-4 flex flex-col gap-3", !selectedMember && "opacity-50 pointer-events-none")}>
            {localRoles.map((role) => (
              <RoleCard
                key={role.roleId}
                role={role}
                assignmentMap={assignmentMap}
                selectedMember={selectedMember}
                isLocked={!selectedMember}
                activeChairId={
                  activeChair?.roleId === role.roleId ? activeChair.chairId : null
                }
                onSelectChair={(chairId) => handleSelectChair(role.roleId, chairId)}
                workloadStr={workloadStr}
                onWorkloadChange={setWorkloadStr}
                saveState={activeChair?.roleId === role.roleId ? saveState : null}
                onAssign={handleAssign}
                onRetry={handleRetry}
              />
            ))}
            {localRoles.length === 0 && (
              <p className="text-sm text-[hsl(var(--wq-text-secondary))] text-center py-8">
                No roles configured for this work item.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
