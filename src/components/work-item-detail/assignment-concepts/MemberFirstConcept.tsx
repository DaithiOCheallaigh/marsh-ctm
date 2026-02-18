import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
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
type AssignmentMap = Record<string, {memberId: string;memberName: string;workload: number;}>;

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
  { id: `${roleName}-c2`, name: "Secondary Chair" }];

};

const assignmentKey = (roleId: string, chairId: string) => `${roleId}::${chairId}`;

// ─── MemberCard ───────────────────────────────────────────────────────────────

interface MemberCardProps {
  member: LocalMember;
  isSelected: boolean;
  assignmentCount: number;
  onSelect: () => void;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, isSelected, assignmentCount, onSelect }) => {
  const ref = useRef<HTMLDivElement>(null);

  // Scroll into view when this card becomes selected (e.g. after list re-sort)
  useEffect(() => {
    if (isSelected && ref.current) {
      ref.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [isSelected]);

  return (
    <div
      ref={ref}
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => (e.key === " " || e.key === "Enter") && onSelect()}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all duration-200 select-none border-l-[3px]",
        isSelected
          ? "border-l-primary bg-primary/10 shadow-sm"
          : "border-l-transparent hover:bg-accent/20"
      )}
    >
      {/* Radio dot */}
      <div className={cn(
        "flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors",
        isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"
      )}>
        {isSelected && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
      </div>

      {/* Avatar */}
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
        isSelected ? "bg-primary text-primary-foreground ring-2 ring-primary/30" : "bg-muted text-muted-foreground"
      )}>
        {getInitials(member.name)}
      </div>

      {/* Name + title */}
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-semibold truncate leading-tight", isSelected ? "text-primary" : "text-foreground")}>
          {member.name}
        </p>
        <p className="text-xs text-muted-foreground truncate leading-tight">{member.title}</p>
      </div>

      {/* Capacity + assignment count */}
      <div className="flex-shrink-0 flex flex-col items-end gap-0.5">
        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", getCapacityBadgeCls(member.availableCapacity))}>
          {member.availableCapacity}% Availability
        </span>
        {assignmentCount > 0 &&
          <span className="text-[10px] text-muted-foreground">{assignmentCount} assigned</span>
        }
      </div>
    </div>
  );
};


// ─── RoleCard ─────────────────────────────────────────────────────────────────

interface RoleCardProps {
  role: LocalRole;
  assignmentMap: AssignmentMap;
  selectedMember: LocalMember | null;
  isLocked: boolean;
  workloadStr: string;
  onWorkloadChange: (val: string) => void;
  saveState: SaveState;
  onAssign: (chairId: string, chairName: string) => void;
  onRetry: () => void;
}

const RoleCard: React.FC<RoleCardProps> = ({
  role, assignmentMap, selectedMember, isLocked,
  workloadStr, onWorkloadChange, saveState, onAssign, onRetry
}) => {
  const assignedInRole = role.chairs.filter((c) => !!assignmentMap[assignmentKey(role.roleId, c.id)]);
  const allFilled = assignedInRole.length >= role.chairs.length;

  // Check if the currently selected member is already assigned to any chair in this role
  const selectedMemberAlreadyInRole = selectedMember
    ? role.chairs.some((c) => assignmentMap[assignmentKey(role.roleId, c.id)]?.memberId === selectedMember.id)
    : false;

  // Only unassigned chairs, in original order
  const availableChairs = role.chairs.filter((c) => !assignmentMap[assignmentKey(role.roleId, c.id)]);

  // Local dropdown — defaults to first available chair
  const [selectedChairId, setSelectedChairId] = useState<string>(availableChairs[0]?.id ?? "");

  // Reset to first available when a chair gets assigned
  useEffect(() => {
    if (!availableChairs.find((c) => c.id === selectedChairId)) {
      setSelectedChairId(availableChairs[0]?.id ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableChairs.length]);

  const workload = parseFloat(workloadStr) || 0;
  const remaining = selectedMember?.availableCapacity ?? 100;
  const exceedsCapacity = workload > remaining;
  // Also block assign if selected member is already in this role
  const canAssign = selectedChairId !== "" && workload >= 1 && workload <= 100 && saveState !== "saving" && !selectedMemberAlreadyInRole;

  const handleAssignClick = () => {
    if (!canAssign) return;
    const chair = role.chairs.find((c) => c.id === selectedChairId);
    if (chair) onAssign(chair.id, chair.name);
  };

  return (
    <div className={cn(
      "border rounded-lg overflow-hidden transition-all duration-200",
      allFilled
        ? "border-[hsl(var(--wq-border))] bg-[hsl(var(--wq-bg-muted))] opacity-60"
        : "border-[hsl(var(--wq-border))] bg-card"
    )}>
      {/* Role header */}
      <div className="px-4 py-3 border-b border-[hsl(var(--wq-border))]">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-primary leading-tight">{role.roleName}</p>
            {role.teamName &&
              <p className="text-xs text-[hsl(var(--wq-text-secondary))] mt-0.5">{role.teamName}</p>
            }
          </div>
          <span className="text-xs text-[hsl(var(--wq-text-secondary))] whitespace-nowrap flex-shrink-0">
            {assignedInRole.length} of {role.chairs.length} chairs assigned
          </span>
        </div>
      </div>

      {/* Assigned chairs summary */}
      {assignedInRole.length > 0 &&
        <div className="divide-y divide-[hsl(var(--wq-border))]">
          {assignedInRole.map((chair) => {
            const existing = assignmentMap[assignmentKey(role.roleId, chair.id)];
            const isCurrentMember = existing?.memberId === selectedMember?.id;
            return (
              <div key={chair.id} className="flex items-center gap-3 px-4 py-2 bg-[hsl(var(--wq-bg-muted))]">
                <div className="w-4 h-4 rounded-full bg-[hsl(var(--wq-success,142,71%,45%))] flex items-center justify-center flex-shrink-0 [background-color:hsl(142,71%,45%)]">
                  <Check className="w-2.5 h-2.5 text-primary-foreground" />
                </div>
                <span className="text-sm text-[hsl(var(--wq-text-secondary))] line-through flex-1">
                  {chair.name}
                </span>
                <span className={cn("text-xs", isCurrentMember ? "text-primary font-semibold" : "text-[hsl(var(--wq-text-secondary))]")}>
                  → {existing?.memberName}
                  <span className="ml-1 opacity-70">({existing?.workload}%)</span>
                </span>
              </div>
            );
          })}
        </div>
      }

      {/* "Member already in this role" notice */}
      {!allFilled && selectedMemberAlreadyInRole &&
        <div className="px-4 py-3 flex items-center gap-2 text-xs text-[hsl(var(--wq-text-secondary))] bg-muted/40 border-t border-[hsl(var(--wq-border))]">
          <CheckCircle2 className="w-3.5 h-3.5 text-[hsl(142,71%,45%)] flex-shrink-0" />
          <span>
            <span className="font-medium text-foreground">{selectedMember?.name.split(" ")[0]}</span>
            {" "}is already assigned to this role. Select another member to fill remaining chairs.
          </span>
        </div>
      }

      {/* Chair dropdown + workload + assign — hidden when all filled or member already in this role */}
      {!allFilled && !selectedMemberAlreadyInRole &&
        <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
          {/* Chair dropdown */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <label className="text-xs font-medium text-[hsl(var(--wq-text-secondary))] whitespace-nowrap">
              Chair
            </label>
            <select
              value={selectedChairId}
              onChange={(e) => setSelectedChairId(e.target.value)}
              disabled={isLocked || saveState === "saving"}
              className="flex-1 h-9 px-2 border border-[hsl(var(--wq-border))] rounded-md text-sm bg-card text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {availableChairs.map((chair) =>
                <option key={chair.id} value={chair.id}>{chair.name}</option>
              )}
            </select>
          </div>

          {/* Workload input */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <label className="text-xs font-medium text-[hsl(var(--wq-text-secondary))] whitespace-nowrap">
              Workload
            </label>
            <input
              type="number"
              min={1}
              max={100}
              step={0.5}
              value={workloadStr}
              onChange={(e) => onWorkloadChange(e.target.value)}
              onFocus={(e) => e.target.select()}
              disabled={isLocked || saveState === "saving"}
              className="w-16 h-9 px-2 border border-[hsl(var(--wq-border))] rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30 bg-card disabled:opacity-50"
            />
            <span className="text-sm text-[hsl(var(--wq-text-secondary))]">%</span>
          </div>

          {/* Capacity warning */}
          {exceedsCapacity && !isLocked &&
            <span className="text-xs text-[hsl(38,92%,50%)] flex items-center gap-1 w-full">
              <AlertTriangle className="w-3 h-3 flex-shrink-0" />
              Exceeds {selectedMember?.name.split(" ")[0]}'s remaining capacity ({remaining}%)
            </span>
          }

          {/* Save feedback + Assign button */}
          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            {saveState === "saving" &&
              <span className="text-xs text-[hsl(var(--wq-text-secondary))] flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Saving...
              </span>
            }
            {saveState === "success" &&
              <span className="text-xs text-[hsl(142,71%,45%)] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Saved
              </span>
            }
            {saveState === "error" &&
              <button onClick={onRetry} className="text-xs text-destructive flex items-center gap-1 hover:underline">
                <XCircle className="w-3 h-3" /> Failed — <RefreshCw className="w-3 h-3" /> Retry
              </button>
            }
            {saveState !== "success" &&
              <Button size="sm" disabled={!canAssign || isLocked} onClick={handleAssignClick} className="h-9 px-5">
                {saveState === "saving" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Assign"}
              </Button>
            }
          </div>
        </div>
      }
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
  isReadOnly = false
}) => {
  const localRoles: LocalRole[] = useMemo(
    () => roles.map((r) => ({
      roleId: r.roleId,
      roleName: r.roleName,
      teamName: r.teamName,
      chairs: buildChairsForRole(r.roleName)
    })),
    [roles]
  );

  const initialMembers: LocalMember[] = useMemo(() => {
    return teamMembers.
    map((m) => {
      const baseWorkload = (m.currentAssignments || []).reduce((s, a) => s + a.workload, 0);
      return {
        id: m.id,
        name: m.name,
        title: m.title,
        availableCapacity: Math.max(0, 100 - baseWorkload)
      };
    }).
    sort((a, b) => b.availableCapacity - a.availableCapacity);
  }, []);

  const [members, setMembers] = useState<LocalMember[]>(initialMembers);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [assignmentMap, setAssignmentMap] = useState<AssignmentMap>({});
  const [workloadStr, setWorkloadStr] = useState("20");

  // Keep refs up-to-date so the unmount effect always reads the latest values
  const assignmentMapRef = useRef(assignmentMap);
  const localRolesRef = useRef(localRoles);
  const existingAssignmentsRef = useRef(existingAssignments);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => { assignmentMapRef.current = assignmentMap; }, [assignmentMap]);
  useEffect(() => { localRolesRef.current = localRoles; }, [localRoles]);
  useEffect(() => { existingAssignmentsRef.current = existingAssignments; }, [existingAssignments]);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  // Auto-save all assignments when the user navigates away
  useEffect(() => {
    return () => {
      const map = assignmentMapRef.current;
      const roles = localRolesRef.current;
      const existing = existingAssignmentsRef.current;

      const newAssignments: AssignmentData[] = Object.entries(map).map(([key, val]) => {
        const [roleId, chairId] = key.split("::");
        const role = roles.find((r) => r.roleId === roleId);
        return {
          roleId,
          roleName: role?.roleName ?? roleId,
          teamName: role?.teamName,
          selectedPerson: { id: val.memberId, name: val.memberName },
          chairType: "Primary" as const,
          workloadPercentage: val.workload,
          notes: chairId,
        };
      });

      if (newAssignments.length > 0) {
        onCompleteRef.current([...existing, ...newAssignments]);
      }
    };
  }, []);
  const [saveState, setSaveState] = useState<SaveState>(null);
  const [activeRoleId, setActiveRoleId] = useState<string | null>(null);
  const [pendingSave, setPendingSave] = useState<{roleId: string;chairId: string;chairName: string;workload: number;} | null>(null);
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
    (memberId: string) => Object.values(assignmentMap).filter((a) => a.memberId === memberId).length,
    [assignmentMap]
  );

  const handleSelectMember = (memberId: string) => {
    if (isReadOnly) return;
    setSelectedMemberId(memberId);
    setSaveState(null);
    setPendingSave(null);
    setWorkloadStr("20");
  };

  const executeSave = useCallback(
    async (roleId: string, chairId: string, chairName: string, workload: number) => {
      if (!selectedMember) return;

      const key = assignmentKey(roleId, chairId);
      if (assignmentMap[key]?.memberId === selectedMember.id) return;

      setActiveRoleId(roleId);
      setSaveState("saving");
      await new Promise((res) => setTimeout(res, 600));

      const newMap = {
        ...assignmentMap,
        [key]: { memberId: selectedMember.id, memberName: selectedMember.name, workload }
      };
      setAssignmentMap(newMap);

      setMembers((prev) =>
        prev
          .map((m) =>
            m.id === selectedMember.id
              ? { ...m, availableCapacity: Math.max(0, m.availableCapacity - workload) }
              : m
          )
          .sort((a, b) => b.availableCapacity - a.availableCapacity)
      );

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
            capacity: selectedMember.availableCapacity
          },
          chairType: "Primary",
          workloadPercentage: workload,
          notes: chairName
        };
        onComplete([...existingAssignments, assignmentData]);
      }

      setSaveState("success");
      setTimeout(() => {
        setActiveRoleId(null);
        setSaveState(null);
        setPendingSave(null);
        setWorkloadStr("20");
      }, 1500);
    },
    [selectedMember, assignmentMap, localRoles, existingAssignments, onComplete]
  );

  const handleAssign = useCallback(
    (roleId: string, chairId: string, chairName: string) => {
      const workload = parseFloat(workloadStr) || 0;
      setPendingSave({ roleId, chairId, chairName, workload });
      executeSave(roleId, chairId, chairName, workload);
    },
    [workloadStr, executeSave]
  );

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
          <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--wq-border))]">
            <div>
              <h3 className="text-primary font-bold text-sm">Team Members</h3>
              <p className="text-xs text-[hsl(var(--wq-text-secondary))] mt-0.5">
                {members.length} members · sorted by capacity
              </p>
            </div>
          </div>

          <div className="px-4 py-3 border-b border-[hsl(var(--wq-border))]">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--wq-text-secondary))] pointer-events-none" />
              <input
                type="text"
                placeholder="Search members..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full h-9 pl-8 pr-8 text-sm border border-[hsl(var(--wq-border))] rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-primary/30" />

              {memberSearch &&
              <button
                onClick={() => setMemberSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[hsl(var(--wq-text-secondary))] hover:text-primary">

                  <X className="w-3.5 h-3.5" />
                </button>
              }
            </div>
          </div>

          <div className="overflow-y-auto max-h-[560px] divide-y divide-[hsl(var(--wq-border))]">
            {filteredMembers.map((member) =>
            <MemberCard
              key={member.id}
              member={member}
              isSelected={selectedMemberId === member.id}
              assignmentCount={memberAssignmentCount(member.id)}
              onSelect={() => handleSelectMember(member.id)} />

            )}
            {filteredMembers.length === 0 &&
            <p className="text-sm text-[hsl(var(--wq-text-secondary))] text-center py-8">No members found</p>
            }
          </div>
        </div>
      </div>

      {/* ── RIGHT: Available Roles (60%) ── */}
      <div className="flex-1 min-w-0">
        <div className="bg-card rounded-lg border border-[hsl(var(--wq-border))] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--wq-border))]">
            <div className="min-w-0">
              <h3 className="text-primary font-bold text-sm">Role Assignments</h3>
              {selectedMember ?
              <p className="text-xs text-[hsl(var(--wq-text-secondary))] mt-0.5">
                  Assigning to:{" "}
                  <span className="font-semibold text-primary">{selectedMember.name}</span>
                  {" — "}
                  <span className={cn("font-medium", getCapacityTextCls(selectedMember.availableCapacity))}>
                    {selectedMember.availableCapacity}% available capacity
                  </span>
                </p> :

              <p className="text-xs text-[hsl(var(--wq-text-secondary))] mt-0.5 flex items-center gap-1.5">
                  <User className="w-3 h-3" />
                  Select a team member on the left to begin assigning roles
                </p>
              }
            </div>
          </div>

          <div className={cn("p-4 flex flex-col gap-3", !selectedMember && "opacity-50 pointer-events-none")}>
            {localRoles.map((role) =>
            <RoleCard
              key={role.roleId}
              role={role}
              assignmentMap={assignmentMap}
              selectedMember={selectedMember}
              isLocked={!selectedMember}
              workloadStr={workloadStr}
              onWorkloadChange={setWorkloadStr}
              saveState={activeRoleId === role.roleId ? saveState : null}
              onAssign={(chairId, chairName) => handleAssign(role.roleId, chairId, chairName)}
              onRetry={handleRetry} />

            )}
            {localRoles.length === 0 &&
            <p className="text-sm text-[hsl(var(--wq-text-secondary))] text-center py-8">
                No roles configured for this work item.
              </p>
            }
          </div>
        </div>
      </div>
    </div>);

};