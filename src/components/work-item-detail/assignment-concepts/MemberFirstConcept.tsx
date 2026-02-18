import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Search, X, Check, ChevronDown, ChevronRight, Trash2,
  Loader2, CheckCircle2, XCircle, ClipboardList, RefreshCw, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { RoleDefinition, AssignmentData } from "./types";

// ─── Local types ────────────────────────────────────────────────────────────
interface LocalMember {
  id: string;
  name: string;
  title: string;
  availableCapacity: number; // 0-100
}

interface LocalChair {
  id: string;
  name: string;
  description: string;
}

interface LocalRole {
  roleId: string;
  roleName: string;
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

// ─── Placeholder data ────────────────────────────────────────────────────────
const PLACEHOLDER_MEMBERS: LocalMember[] = [
  { id: "m1", name: "Jennifer Walsh",    title: "Account Manager",     availableCapacity: 40 },
  { id: "m2", name: "Lisa Park",         title: "Risk Analyst",        availableCapacity: 60 },
  { id: "m3", name: "Robert Wilson",     title: "Claims Specialist",   availableCapacity: 20 },
  { id: "m4", name: "Emily Richardson",  title: "Strategic Advisor",   availableCapacity: 80 },
  { id: "m5", name: "Marcus Chen",       title: "Underwriter",         availableCapacity: 0  },
];

const buildLocalRoles = (roles: RoleDefinition[]): LocalRole[] =>
  roles.map((r) => ({
    roleId: r.roleId,
    roleName: r.roleName,
    chairs: [
      { id: `${r.roleId}-c1`, name: "Primary Chair",   description: "Lead role responsibility" },
      { id: `${r.roleId}-c2`, name: "Secondary Chair", description: "Support role" },
      { id: `${r.roleId}-c3`, name: "Tertiary Chair",  description: "Additional coverage" },
      { id: `${r.roleId}-c4`, name: "Chair 4",         description: "Extended support" },
    ],
  }));

// ─── Capacity helpers ────────────────────────────────────────────────────────
const getCapacityColor = (cap: number) => {
  if (cap >= 50) return "text-green-600";
  if (cap >= 20) return "text-amber-500";
  return "text-red-500";
};

const getCapacityBg = (cap: number) => {
  if (cap >= 50) return "bg-green-50 text-green-700 border-green-200";
  if (cap >= 20) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-red-50 text-red-700 border-red-200";
};

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

// ─── Sub-components ──────────────────────────────────────────────────────────
interface MemberCardProps {
  member: LocalMember;
  isSelected: boolean;
  onSelect: (member: LocalMember) => void;
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
      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-150",
      isSelected
        ? "border-primary bg-primary/5 shadow-sm"
        : "border-[hsl(var(--wq-border))] bg-white hover:bg-[hsl(var(--wq-bg-hover))]"
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
      isSelected ? "bg-primary text-primary-foreground" : "bg-[hsl(var(--wq-bg-muted))] text-[hsl(var(--wq-text-secondary))]"
    )}>
      {getInitials(member.name)}
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0">
      <p className={cn("text-sm font-medium truncate", isSelected ? "text-primary" : "text-foreground")}>
        {member.name}
      </p>
      <p className="text-xs text-muted-foreground truncate">{member.title}</p>
    </div>

    {/* Capacity badge */}
    <div className="flex-shrink-0 flex flex-col items-end gap-0.5">
      <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", getCapacityBg(member.availableCapacity))}>
        {member.availableCapacity}% Cap
      </span>
      {assignmentCount > 0 && (
        <span className="text-[10px] text-muted-foreground">{assignmentCount} assigned</span>
      )}
    </div>
  </div>
);

// ─── Inline config panel ─────────────────────────────────────────────────────
interface InlineConfigProps {
  role: LocalRole;
  member: LocalMember;
  assignments: LocalAssignment[];
  onSave: (chairId: string, chairName: string, workload: number) => void;
  saveState: SaveState;
  onRetry: () => void;
}

const InlineConfigPanel: React.FC<InlineConfigProps> = ({
  role, member, assignments, onSave, saveState, onRetry
}) => {
  const [selectedChairId, setSelectedChairId] = useState("");
  const [workload, setWorkload] = useState(20);
  const [workloadStr, setWorkloadStr] = useState("20");

  const assignedChairIds = useMemo(
    () => new Set(assignments.filter((a) => a.roleId === role.roleId).map((a) => a.chairId)),
    [assignments, role.roleId]
  );

  const availableChairs = role.chairs.filter((c) => !assignedChairIds.has(c.id));
  const memberRemainingCapacity = member.availableCapacity;
  const exceedsCapacity = workload > memberRemainingCapacity;

  // Trigger auto-save when both are filled
  useEffect(() => {
    if (selectedChairId && workload >= 1 && workload <= 100 && saveState === null) {
      const chair = role.chairs.find((c) => c.id === selectedChairId);
      if (chair) {
        onSave(selectedChairId, chair.name, workload);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChairId]);

  const handleWorkloadBlur = () => {
    const val = parseFloat(workloadStr);
    if (!isNaN(val) && val >= 1 && val <= 100) {
      setWorkload(val);
    }
  };

  return (
    <div className="mt-3 p-4 bg-[hsl(var(--wq-bg-muted))] border border-[hsl(var(--wq-border))] rounded-lg space-y-4 animate-in slide-in-from-top-2 duration-200">
      <p className="text-sm font-semibold text-primary">
        {role.roleName} — Assign {member.name}
      </p>

      {/* Chair selection */}
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">
          Chair <span className="text-red-500">*</span>
        </label>
        <div className="border border-[hsl(var(--wq-border))] rounded-md bg-white overflow-hidden">
          {role.chairs.map((chair) => {
            const isAssigned = assignedChairIds.has(chair.id);
            const isSelected = selectedChairId === chair.id;
            return (
              <button
                key={chair.id}
                type="button"
                disabled={isAssigned || saveState === "saving"}
                onClick={() => !isAssigned && setSelectedChairId(chair.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-left text-sm border-b last:border-b-0 transition-colors",
                  isAssigned
                    ? "bg-gray-50 text-muted-foreground cursor-not-allowed"
                    : isSelected
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-[hsl(var(--wq-bg-hover))] text-foreground"
                )}
              >
                {isAssigned ? (
                  <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                ) : isSelected ? (
                  <div className="w-3.5 h-3.5 rounded-full bg-primary flex-shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground/30 flex-shrink-0" />
                )}
                <span className={cn("flex-1", isAssigned && "line-through")}>{chair.name}</span>
                {isAssigned && (
                  <span className="text-xs text-muted-foreground">(✓ Assigned)</span>
                )}
              </button>
            );
          })}
          {availableChairs.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted-foreground text-center">All chairs assigned</div>
          )}
        </div>
      </div>

      {/* Workload */}
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">
          Workload Percentage <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={100}
            value={workloadStr}
            onChange={(e) => setWorkloadStr(e.target.value)}
            onBlur={handleWorkloadBlur}
            disabled={saveState === "saving"}
            className="w-20 h-9 px-2 border border-[hsl(var(--wq-border))] rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white disabled:opacity-50"
          />
          <span className="text-sm text-muted-foreground">%</span>
          {exceedsCapacity && (
            <span className="text-xs text-amber-600 flex items-center gap-1">
              ⚠️ Exceeds {member.name.split(" ")[0]}'s remaining capacity ({memberRemainingCapacity}%)
            </span>
          )}
        </div>
      </div>

      {/* Save state */}
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
        <div className="flex items-center gap-2 text-sm text-red-600">
          <XCircle className="w-4 h-4" />
          Failed to save.{" "}
          <button onClick={onRetry} className="underline hover:no-underline font-medium flex items-center gap-1">
            <RefreshCw className="w-3 h-3" />Retry
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Role card (in available roles grid) ─────────────────────────────────────
interface RoleCardProps {
  role: LocalRole;
  assignments: LocalAssignment[];
  isExpanded: boolean;
  onToggle: () => void;
  selectedMember: LocalMember | null;
  saveState: SaveState;
  onSave: (chairId: string, chairName: string, workload: number) => void;
  onRetry: () => void;
}

const RoleCard: React.FC<RoleCardProps> = ({
  role, assignments, isExpanded, onToggle, selectedMember, saveState, onSave, onRetry
}) => {
  const roleAssignments = assignments.filter((a) => a.roleId === role.roleId);
  const assignedChairIds = new Set(roleAssignments.map((a) => a.chairId));
  const assignedCount = roleAssignments.length;
  const totalChairs = role.chairs.length;
  const fullyAssigned = assignedCount >= totalChairs;

  return (
    <div className={cn(
      "border rounded-lg transition-all duration-200",
      fullyAssigned
        ? "border-[hsl(var(--wq-border))] bg-gray-50 opacity-70"
        : isExpanded
        ? "border-primary shadow-sm bg-white"
        : "border-[hsl(var(--wq-border))] bg-white hover:shadow-sm hover:border-primary/40 cursor-pointer"
    )}>
      {/* Card header */}
      <div
        className={cn("p-3", !fullyAssigned && "cursor-pointer")}
        onClick={!fullyAssigned ? onToggle : undefined}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-sm font-semibold text-foreground">{role.roleName}</p>
          {fullyAssigned ? (
            <Badge className="text-[10px] bg-gray-100 text-gray-500 border-gray-200 whitespace-nowrap">
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
        <p className="text-xs text-muted-foreground mb-2">
          {assignedCount} of {totalChairs} chairs assigned
        </p>
        <ul className="space-y-0.5">
          {role.chairs.map((chair) => {
            const isAssigned = assignedChairIds.has(chair.id);
            const assignee = assignments.find((a) => a.chairId === chair.id);
            return (
              <li key={chair.id} className={cn(
                "flex items-center gap-1.5 text-xs",
                isAssigned ? "text-muted-foreground line-through" : "text-foreground"
              )}>
                {isAssigned ? (
                  <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                ) : (
                  <div className="w-3 h-3 rounded-full border border-muted-foreground/30 flex-shrink-0" />
                )}
                {chair.name}
                {isAssigned && assignee && (
                  <span className="no-underline not-italic text-[10px] text-green-600">({assignee.memberName})</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Inline config panel */}
      {isExpanded && selectedMember && (
        <div className="px-3 pb-3">
          <InlineConfigPanel
            role={role}
            member={selectedMember}
            assignments={assignments}
            onSave={onSave}
            saveState={saveState}
            onRetry={onRetry}
          />
        </div>
      )}
    </div>
  );
};

// ─── Assignments table ────────────────────────────────────────────────────────
interface AssignmentsTableProps {
  assignments: LocalAssignment[];
  members: LocalMember[];
  onRemove: (id: string) => void;
}

const AssignmentsTable: React.FC<AssignmentsTableProps> = ({ assignments, members, onRemove }) => {
  const [expandedMembers, setExpandedMembers] = useState<Set<string>>(new Set());
  const [recentIds, setRecentIds] = useState<Set<string>>(new Set());
  const [confirmId, setConfirmId] = useState<string | null>(null);

  // Track recently added
  useEffect(() => {
    if (assignments.length === 0) return;
    const latest = assignments[assignments.length - 1];
    setRecentIds((prev) => new Set([...prev, latest.id]));
    const timer = setTimeout(() => {
      setRecentIds((prev) => {
        const next = new Set(prev);
        next.delete(latest.id);
        return next;
      });
    }, 2000);
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
      const next = new Set(prev);
      if (next.has(memberId)) next.delete(memberId);
      else next.add(memberId);
      return next;
    });
  };

  if (assignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
        <ClipboardList className="w-8 h-8 opacity-40" />
        <p className="text-sm">No assignments made yet. Select a role above to begin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {[...grouped.entries()].map(([memberId, memberAssignments]) => {
        const member = members.find((m) => m.id === memberId);
        const isOpen = expandedMembers.has(memberId);
        const totalWorkload = memberAssignments.reduce((s, a) => s + a.workload, 0);
        const remaining = member ? Math.max(0, member.availableCapacity - totalWorkload) : "—";

        return (
          <div key={memberId} className="border border-[hsl(var(--wq-border))] rounded-lg overflow-hidden">
            {/* Group header */}
            <button
              type="button"
              onClick={() => toggleMember(memberId)}
              className="w-full flex items-center gap-2 px-4 py-2.5 bg-[hsl(var(--wq-bg-muted))] hover:bg-[hsl(var(--wq-bg-hover))] transition-colors text-left"
            >
              {isOpen
                ? <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                : <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
              <span className="text-sm font-medium text-foreground">{memberAssignments[0].memberName}</span>
              <span className="text-xs text-muted-foreground">
                ({memberAssignments.length} assignment{memberAssignments.length !== 1 ? "s" : ""}, {remaining}% remaining)
              </span>
            </button>

            {/* Expanded rows */}
            {isOpen && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--wq-border))] bg-white">
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
                        "border-b last:border-0 border-[hsl(var(--wq-border))] transition-all",
                        recentIds.has(a.id) ? "bg-green-50" : "bg-white hover:bg-[hsl(var(--wq-bg-hover))]"
                      )}
                    >
                      <td className="px-4 py-2 text-foreground">{a.roleName}</td>
                      <td className="px-4 py-2 text-foreground">{a.chairName}</td>
                      <td className="px-4 py-2 text-foreground">{a.workload}%</td>
                      <td className="px-4 py-2 text-right">
                        {confirmId === a.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-xs text-muted-foreground">Remove?</span>
                            <button
                              onClick={() => { onRemove(a.id); setConfirmId(null); }}
                              className="text-xs text-red-600 hover:underline font-medium"
                            >Yes</button>
                            <button
                              onClick={() => setConfirmId(null)}
                              className="text-xs text-muted-foreground hover:underline"
                            >No</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmId(a.id)}
                            className="text-muted-foreground hover:text-red-500 transition-colors"
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

// ─── Main component ──────────────────────────────────────────────────────────
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
  const localRoles = useMemo(() => buildLocalRoles(roles), [roles]);

  // Members with mutable capacity
  const [members, setMembers] = useState<LocalMember[]>(PLACEHOLDER_MEMBERS);
  const [selectedMember, setSelectedMember] = useState<LocalMember | null>(null);
  const [expandedRoleId, setExpandedRoleId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<LocalAssignment[]>([]);
  const [saveState, setSaveState] = useState<SaveState>(null);
  const [pendingSave, setPendingSave] = useState<{ chairId: string; chairName: string; workload: number } | null>(null);
  const [memberSearch, setMemberSearch] = useState("");
  const debouncedSearch = useDebounce(memberSearch, 300);

  // Expand first member group in table by default
  useEffect(() => {
    if (members.length > 0) {
      // auto-expand nothing — let users control
    }
  }, []);

  const filteredMembers = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q)
    );
  }, [members, debouncedSearch]);

  const memberAssignmentCount = useCallback(
    (memberId: string) => assignments.filter((a) => a.memberId === memberId).length,
    [assignments]
  );

  const handleSelectMember = (member: LocalMember) => {
    setSelectedMember(member);
    setExpandedRoleId(null);
    setSaveState(null);
    setPendingSave(null);
  };

  const handleToggleRole = (roleId: string) => {
    setSaveState(null);
    setPendingSave(null);
    setExpandedRoleId((prev) => (prev === roleId ? null : roleId));
  };

  const executeSave = useCallback(
    async (chairId: string, chairName: string, workload: number) => {
      if (!selectedMember || !expandedRoleId) return;
      const role = localRoles.find((r) => r.roleId === expandedRoleId);
      if (!role) return;

      setSaveState("saving");

      // Simulate async save
      await new Promise((res) => setTimeout(res, 700));

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

      // Update selectedMember ref too
      setSelectedMember((prev) =>
        prev ? { ...prev, availableCapacity: Math.max(0, prev.availableCapacity - workload) } : prev
      );

      // Persist to parent
      const assignmentData: AssignmentData = {
        roleId: role.roleId,
        roleName: role.roleName,
        selectedPerson: { id: selectedMember.id, name: selectedMember.name, role: selectedMember.title, capacity: selectedMember.availableCapacity },
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
    [selectedMember, expandedRoleId, localRoles, existingAssignments, onComplete]
  );

  const handleSave = useCallback(
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

  const totalRequired = roles.length;
  const rolesWithPrimaryChair = new Set(
    assignments.filter((a) => a.chairName.toLowerCase().includes("primary")).map((a) => a.roleId)
  ).size;

  return (
    <div className="flex gap-6 min-w-0">
      {/* ── LEFT: Team Members (40%) ── */}
      <div className="w-[40%] flex-shrink-0 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Team Members</h3>
          <span className="text-xs text-muted-foreground">{members.length} members</span>
        </div>
        <div className="h-px bg-[hsl(var(--wq-border))]" />

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search members..."
            value={memberSearch}
            onChange={(e) => setMemberSearch(e.target.value)}
            className="w-full h-9 pl-8 pr-8 text-sm border border-[hsl(var(--wq-border))] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
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

        {/* Member list */}
        <div className="space-y-2 overflow-y-auto max-h-[520px] pr-0.5">
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

      {/* ── RIGHT: Role Assignment + Table (60%) ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">

        {/* Available Roles Section */}
        <div className="rounded-lg border border-[hsl(var(--wq-border))] overflow-hidden">
          {/* Section header */}
          <div className="px-4 py-3 bg-[hsl(var(--wq-bg-muted))] border-b border-[hsl(var(--wq-border))]">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
              Available Roles
            </h3>
            {selectedMember ? (
              <p className="text-sm text-foreground">
                Assigning roles to:{" "}
                <span className="font-semibold text-primary">{selectedMember.name}</span>
                {" "}
                <span className={cn("text-xs font-medium", getCapacityColor(selectedMember.availableCapacity))}>
                  ({selectedMember.availableCapacity}% capacity)
                </span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Select a team member on the left to begin assigning roles
              </p>
            )}
          </div>

          {/* Role cards grid */}
          <div className="p-4 grid grid-cols-2 gap-3">
            {localRoles.map((role) => (
              <RoleCard
                key={role.roleId}
                role={role}
                assignments={assignments}
                isExpanded={expandedRoleId === role.roleId}
                onToggle={selectedMember && !isReadOnly ? () => handleToggleRole(role.roleId) : () => {}}
                selectedMember={selectedMember}
                saveState={expandedRoleId === role.roleId ? saveState : null}
                onSave={handleSave}
                onRetry={handleRetry}
              />
            ))}
          </div>
        </div>

        {/* Live Assignments Table */}
        <div className="rounded-lg border border-[hsl(var(--wq-border))] overflow-hidden">
          <div className="px-4 py-3 bg-[hsl(var(--wq-bg-muted))] border-b border-[hsl(var(--wq-border))]">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Live Assignments
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {assignments.length} assignment{assignments.length !== 1 ? "s" : ""} across {new Set(assignments.map(a => a.memberId)).size} member{new Set(assignments.map(a => a.memberId)).size !== 1 ? "s" : ""}
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
