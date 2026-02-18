import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Search, X, Check, ChevronDown, ChevronRight, Trash2,
  Loader2, CheckCircle2, XCircle, ClipboardList, RefreshCw, User, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { RoleDefinition, AssignmentData } from "./types";
import { teamMembers, getMemberTotalWorkload as getBaseWorkload } from "@/data/teamMembers";
import { rolesData, RoleChair } from "@/data/roles";

// ─── Local types ─────────────────────────────────────────────────────────────
interface LocalMember {
  id: string;
  name: string;
  title: string;
  role: string;
  availableCapacity: number; // 0-100, decreases as assignments are made in this session
}

interface LocalChair {
  id: string;
  name: string;
  description: string;
  typicalWorkload: string;
  type: "primary" | "secondary";
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

/** Extract real chairs for a role from rolesData, fall back to generic chairs */
const buildChairsForRole = (roleName: string): LocalChair[] => {
  const found = rolesData.find(
    (r) => r.name.toLowerCase() === roleName.toLowerCase()
  );
  if (found && found.chairs.length > 0) {
    return found.chairs.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      typicalWorkload: c.typicalWorkload,
      type: c.type,
    }));
  }
  // Fallback: generic chairs based on role name
  return [
    { id: `${roleName}-c1`, name: "Primary Chair", description: "Lead responsibility", typicalWorkload: "30-40%", type: "primary" as const },
    { id: `${roleName}-c2`, name: "Secondary Chair", description: "Support role", typicalWorkload: "20-30%", type: "secondary" as const },
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
    {/* Radio dot */}
    <div className={cn(
      "flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center",
      isSelected ? "border-primary" : "border-muted-foreground/40"
    )}>
      {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
    </div>

    {/* Avatar */}
    <div className={cn(
      "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold",
      isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
    )}>
      {getInitials(member.name)}
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0">
      <p className={cn("text-sm font-medium truncate", isSelected ? "text-primary" : "text-foreground")}>
        {member.name}
      </p>
      <p className="text-xs text-muted-foreground truncate">{member.title || member.role}</p>
    </div>

    {/* Capacity badge */}
    <div className="flex-shrink-0 flex flex-col items-end gap-0.5">
      <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", getCapacityBadgeCls(member.availableCapacity))}>
        {member.availableCapacity}% Avail
      </span>
      {assignmentCount > 0 && (
        <span className="text-[10px] text-muted-foreground">{assignmentCount} assigned</span>
      )}
    </div>
  </div>
);

// ─── InlineConfigPanel ────────────────────────────────────────────────────────
interface InlineConfigProps {
  role: LocalRole;
  member: LocalMember;
  /** All assignments across all roles/members — used to find occupied chairs */
  allAssignments: LocalAssignment[];
  saveState: SaveState;
  onAssign: (chairId: string, chairName: string, workload: number) => void;
  onRetry: () => void;
  onCollapse: () => void;
}

const InlineConfigPanel: React.FC<InlineConfigProps> = ({
  role, member, allAssignments, saveState, onAssign, onRetry, onCollapse,
}) => {
  const [selectedChairId, setSelectedChairId] = useState("");
  const [workloadStr, setWorkloadStr] = useState("20");

  // Chairs already assigned for this role (by any member)
  const occupiedChairIds = useMemo(
    () => new Set(allAssignments.filter((a) => a.roleId === role.roleId).map((a) => a.chairId)),
    [allAssignments, role.roleId]
  );

  // Chair already assigned to this member in this role (blocked)
  const memberChairIds = useMemo(
    () => new Set(allAssignments.filter((a) => a.roleId === role.roleId && a.memberId === member.id).map((a) => a.chairId)),
    [allAssignments, role.roleId, member.id]
  );

  const memberRemainingCapacity = member.availableCapacity;
  const workload = parseFloat(workloadStr) || 0;
  const exceedsCapacity = workload > memberRemainingCapacity && memberRemainingCapacity >= 0;
  const canAssign = selectedChairId !== "" && workload >= 1 && workload <= 100 && saveState !== "saving";

  // Auto-select chair if exactly one available
  useEffect(() => {
    const available = role.chairs.filter((c) => !occupiedChairIds.has(c.id) && !memberChairIds.has(c.id));
    if (available.length === 1 && !selectedChairId) {
      setSelectedChairId(available[0].id);
    }
  }, [role.chairs, occupiedChairIds, memberChairIds, selectedChairId]);

  const handleAssign = () => {
    if (!canAssign) return;
    const chair = role.chairs.find((c) => c.id === selectedChairId);
    if (!chair) return;
    onAssign(selectedChairId, chair.name, workload);
  };

  return (
    <div className="mt-3 p-4 bg-muted/40 border border-border rounded-lg space-y-4 animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-primary">
          {role.roleName} — Assign {member.name}
        </p>
        <button
          onClick={onCollapse}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Collapse"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Chair selection */}
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">
          Chair <span className="text-destructive">*</span>
        </label>
        <div className="border border-border rounded-md bg-card overflow-hidden divide-y divide-border">
          {role.chairs.map((chair) => {
            const isOccupied = occupiedChairIds.has(chair.id);
            const isMemberBlocked = memberChairIds.has(chair.id);
            const isDisabled = isOccupied || isMemberBlocked || saveState === "saving";
            const isSelected = selectedChairId === chair.id;

            // Find who is assigned to this chair
            const assignee = allAssignments.find((a) => a.chairId === chair.id && a.roleId === role.roleId);

            return (
              <button
                key={chair.id}
                type="button"
                disabled={isDisabled}
                onClick={() => !isDisabled && setSelectedChairId(isSelected ? "" : chair.id)}
                className={cn(
                  "w-full flex items-start gap-2.5 px-3 py-2.5 text-left text-sm transition-colors",
                  isDisabled
                    ? "bg-muted/50 text-muted-foreground cursor-not-allowed"
                    : isSelected
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-accent/40 text-foreground"
                )}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {isOccupied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : isSelected ? (
                    <div className="w-3.5 h-3.5 rounded-full bg-primary" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground/30" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn("font-medium", isOccupied && "line-through opacity-70")}>
                      {chair.name}
                    </span>
                     <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full border",
                      chair.type === "primary"
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "bg-muted text-muted-foreground border-border"
                    )}>
                      {chair.type === "primary" ? "Primary" : "Secondary"}
                    </span>
                    {isOccupied && assignee && (
                      <span className="text-[10px] text-emerald-600">→ {assignee.memberName}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{chair.description}</p>
                  <p className="text-xs text-muted-foreground/70">Typical: {chair.typicalWorkload}</p>
                </div>
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
            <span className="text-xs text-[hsl(var(--wq-status-warning-text,38_92%_50%))] flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Exceeds {member.name.split(" ")[0]}'s remaining capacity ({memberRemainingCapacity}%). Will over-assign.
            </span>
          )}
        </div>
      </div>

      {/* Save state feedback */}
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

      {/* Assign button */}
      {saveState !== "success" && (
        <div className="flex justify-end">
          <Button
            size="sm"
            disabled={!canAssign}
            onClick={handleAssign}
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
  );
};

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
  const roleAssignments = allAssignments.filter((a) => a.roleId === role.roleId);
  const assignedChairIds = new Set(roleAssignments.map((a) => a.chairId));
  const assignedCount = roleAssignments.length;
  const totalChairs = role.chairs.length;
  const fullyAssigned = assignedCount >= totalChairs;

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
                    : chair.type === "primary"
                    ? "bg-primary/8 text-primary border-primary/20"
                    : "bg-muted text-muted-foreground border-border"
                )}
              >
                {isAssigned ? (
                  <Check className="w-2.5 h-2.5 flex-shrink-0" />
                ) : (
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full flex-shrink-0",
                    chair.type === "primary" ? "bg-primary" : "bg-muted-foreground/40"
                  )} />
                )}
                {chair.name}
              </span>
            );
          })}
        </div>
      </div>

      {/* Inline config panel */}
      {isExpanded && selectedMember && (
        <div className="px-3 pb-3">
          <InlineConfigPanel
            role={role}
            member={selectedMember}
            allAssignments={allAssignments}
            onAssign={onAssign}
            saveState={saveState}
            onRetry={onRetry}
            onCollapse={onCollapse}
          />
        </div>
      )}
    </div>
  );
};

// ─── AssignmentsTable ─────────────────────────────────────────────────────────
interface AssignmentsTableProps {
  assignments: LocalAssignment[];
  members: LocalMember[];
  onRemove: (id: string) => void;
}

const AssignmentsTable: React.FC<AssignmentsTableProps> = ({ assignments, members, onRemove }) => {
  const [expandedMembers, setExpandedMembers] = useState<Set<string>>(new Set());
  const [recentIds, setRecentIds] = useState<Set<string>>(new Set());
  const [confirmId, setConfirmId] = useState<string | null>(null);

  // Auto-expand group for latest assignment
  useEffect(() => {
    if (assignments.length === 0) return;
    const latest = assignments[assignments.length - 1];
    // expand that member's group
    setExpandedMembers((prev) => new Set([...prev, latest.memberId]));
    // highlight the row briefly
    setRecentIds((prev) => new Set([...prev, latest.id]));
    const timer = setTimeout(() => {
      setRecentIds((prev) => { const n = new Set(prev); n.delete(latest.id); return n; });
    }, 2500);
    return () => clearTimeout(timer);
  }, [assignments.length]);

  const grouped = useMemo(() => {
    const map = new Map<string, LocalAssignment[]>();
    for (const a of assignments) {
      if (!map.has(a.memberId)) map.set(a.memberId, []);
      map.get(a.memberId)!.push(a);
    }
    return map;
  }, [assignments]);

  const toggleMember = (memberId: string) => {
    setExpandedMembers((prev) => {
      const n = new Set(prev);
      if (n.has(memberId)) n.delete(memberId); else n.add(memberId);
      return n;
    });
  };

  if (assignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
        <ClipboardList className="w-7 h-7 opacity-40" />
        <p className="text-sm">No assignments yet. Select a member and role above to begin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {[...grouped.entries()].map(([memberId, memberAssignments]) => {
        const member = members.find((m) => m.id === memberId);
        const isOpen = expandedMembers.has(memberId);
        const totalAssignedWorkload = memberAssignments.reduce((s, a) => s + a.workload, 0);
        const remaining = member ? Math.max(0, member.availableCapacity) : "—";

        return (
          <div key={memberId} className="border border-border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleMember(memberId)}
              className="w-full flex items-center gap-2 px-4 py-2.5 bg-muted/40 hover:bg-muted/70 transition-colors text-left"
            >
              {isOpen
                ? <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                : <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
              <span className="text-sm font-medium text-foreground">{memberAssignments[0].memberName}</span>
              <span className="text-xs text-muted-foreground">
                ({memberAssignments.length} assignment{memberAssignments.length !== 1 ? "s" : ""},{" "}
                <span className={cn("font-medium", getCapacityTextCls(typeof remaining === "number" ? remaining : 50))}>
                  {remaining}% available
                </span>
                )
              </span>
            </button>

            {isOpen && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-card">
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Role</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Chair</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Workload</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {memberAssignments.map((a) => (
                    <tr
                      key={a.id}
                      className={cn(
                        "border-b last:border-0 border-border transition-all duration-500",
                        recentIds.has(a.id) ? "bg-green-50" : "bg-card hover:bg-accent/20"
                      )}
                    >
                      <td className="px-4 py-2 text-foreground">{a.roleName}</td>
                      <td className="px-4 py-2 text-foreground">{a.chairName}</td>
                      <td className="px-4 py-2 text-foreground">{a.workload}%</td>
                      <td className="px-4 py-2 text-right">
                        {confirmId === a.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs text-muted-foreground">Remove?</span>
                            <button
                              onClick={() => { onRemove(a.id); setConfirmId(null); }}
                              className="text-xs text-destructive hover:underline font-medium"
                            >Yes</button>
                            <button
                              onClick={() => setConfirmId(null)}
                              className="text-xs text-muted-foreground hover:underline"
                            >No</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmId(a.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            aria-label="Remove assignment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      })}
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
  onCompleteWorkItem,
  isReadOnly = false,
}) => {
  // Build localRoles with real chair data from rolesData
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

  // Derive real members from teamMembers, compute available capacity
  const initialMembers: LocalMember[] = useMemo(() => {
    return teamMembers
      .slice(0, 20) // Use first 20 to keep the list manageable
      .map((m) => {
        const baseWorkload = (m.currentAssignments || []).reduce((s, a) => s + a.workload, 0);
        const availableCapacity = Math.max(0, 100 - baseWorkload);
        return {
          id: m.id,
          name: m.name,
          title: m.title,
          role: m.role,
          availableCapacity,
        };
      })
      .sort((a, b) => b.availableCapacity - a.availableCapacity); // Sort by highest capacity first
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

      // Guard: same member cannot be assigned to same role+chair
      const duplicate = assignments.find(
        (a) => a.memberId === selectedMember.id && a.roleId === role.roleId && a.chairId === chairId
      );
      if (duplicate) return;

      setSaveState("saving");

      // Simulate async save (replace with real API call)
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

      // Update member capacity
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

      // Persist to parent
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

      // Auto-collapse after 2s
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

  const handleRemoveAssignment = (id: string) => {
    const a = assignments.find((x) => x.id === id);
    if (!a) return;
    setAssignments((prev) => prev.filter((x) => x.id !== id));
    setMembers((prev) =>
      prev.map((m) =>
        m.id === a.memberId
          ? { ...m, availableCapacity: Math.min(100, m.availableCapacity + a.workload) }
          : m
      )
    );
    if (selectedMember?.id === a.memberId) {
      setSelectedMember((prev) =>
        prev ? { ...prev, availableCapacity: Math.min(100, prev.availableCapacity + a.workload) } : prev
      );
    }
  };

  const handleCollapse = () => {
    setExpandedRoleId(null);
    setSaveState(null);
    setPendingSave(null);
  };

  const hasAnyAssignments = assignments.length > 0;

  return (
    <div className="flex gap-6 min-w-0 items-stretch">
      {/* ── LEFT: Team Members (40%) ── */}
      <div className="w-[40%] flex-shrink-0 flex flex-col">
        <div className="rounded-lg border border-border overflow-hidden flex flex-col flex-1">
          <div className="px-4 py-3 bg-muted/40 border-b border-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Team Members</h3>
            <p className="text-sm text-muted-foreground">{members.length} members · sorted by capacity</p>
          </div>

          <div className="p-3 border-b border-border">
            {/* Search */}
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

          {/* Member list */}
          <div className="p-3 space-y-2 overflow-y-auto flex-1">
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

      {/* ── RIGHT: Role Assignment + Table (60%) ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">

        {/* Available Roles Section */}
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
              <p className="col-span-2 text-sm text-muted-foreground text-center py-6">
                No roles configured for this work item.
              </p>
            )}
          </div>
        </div>

        {/* Live Assignments Table */}
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="px-4 py-3 bg-muted/40 border-b border-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Live Assignments
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {assignments.length} assignment{assignments.length !== 1 ? "s" : ""} across{" "}
              {new Set(assignments.map((a) => a.memberId)).size} member{new Set(assignments.map((a) => a.memberId)).size !== 1 ? "s" : ""}
              {" — "}each assignment persists immediately
            </p>
          </div>
          <div className="p-4">
            <AssignmentsTable
              assignments={assignments}
              members={members}
              onRemove={handleRemoveAssignment}
            />
          </div>
        </div>

        {/* Complete button */}
        {!isReadOnly && (
          <div className="flex justify-end pt-2">
            <Button
              onClick={onCompleteWorkItem}
              disabled={!hasAnyAssignments}
              className="px-8"
            >
              Complete Work Item
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
