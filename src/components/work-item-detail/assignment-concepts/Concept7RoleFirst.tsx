import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import {
  Search, X, Check, User, AlertTriangle, Loader2, CheckCircle2, XCircle,
  ChevronLeft, ChevronRight, Trash2, MessageSquare, Info, Lock
} from "lucide-react";
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
  teamId: string;
}

interface LocalChair {
  id: string;
  name: string;
  description: string;
  typicalWorkload: string;
  isRequired: boolean;
}

interface LocalRole {
  roleId: string;
  roleName: string;
  teamName?: string;
  teamId?: string;
  chairs: LocalChair[];
}

interface PendingAssignment {
  memberId: string;
  memberName: string;
  chairId: string;
  chairName: string;
  workload: number;
  notes: string;
}

type Screen = "role-list" | "member-select" | "configure" | "pending-review";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

const getCapacityColor = (cap: number) => {
  if (cap >= 50) return "text-[hsl(142,71%,45%)]";
  if (cap >= 20) return "text-[hsl(38,92%,50%)]";
  return "text-[hsl(0,84%,60%)]";
};

const getCapacityBadgeCls = (cap: number) => {
  if (cap >= 50) return "bg-[hsl(142,76%,95%)] text-[hsl(142,71%,35%)] border-[hsl(142,76%,80%)]";
  if (cap >= 20) return "bg-[hsl(38,100%,95%)] text-[hsl(38,92%,40%)] border-[hsl(38,100%,80%)]";
  return "bg-[hsl(0,86%,95%)] text-[hsl(0,84%,45%)] border-[hsl(0,86%,80%)]";
};

const buildChairsForRole = (roleName: string): LocalChair[] => {
  const found = rolesData.find((r) => r.name.toLowerCase() === roleName.toLowerCase());
  if (found && found.chairs.length > 0) {
    return found.chairs.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      typicalWorkload: c.typicalWorkload,
      isRequired: c.isRequired,
    }));
  }
  return [
    { id: `${roleName}-c1`, name: "Primary Chair", description: "", typicalWorkload: "20-30%", isRequired: true },
    { id: `${roleName}-c2`, name: "Secondary Chair", description: "", typicalWorkload: "20-30%", isRequired: false },
  ];
};

// ─── Exports ──────────────────────────────────────────────────────────────────

export interface Concept7RoleFirstProps {
  roles: RoleDefinition[];
  existingAssignments?: AssignmentData[];
  onComplete: (assignments: AssignmentData[]) => void;
  onCompleteWorkItem?: () => void;
  isReadOnly?: boolean;
}

export const Concept7RoleFirst: React.FC<Concept7RoleFirstProps> = ({
  roles,
  existingAssignments = [],
  onComplete,
  onCompleteWorkItem,
  isReadOnly = false,
}) => {
  // ── Build local role data ──
  const localRoles: LocalRole[] = useMemo(
    () =>
      roles.map((r) => {
        const roleData = rolesData.find((rd) => rd.name.toLowerCase() === r.roleName.toLowerCase());
        return {
          roleId: r.roleId,
          roleName: r.roleName,
          teamName: r.teamName,
          teamId: roleData?.teamId ?? "",
          chairs: buildChairsForRole(r.roleName),
        };
      }),
    [roles]
  );

  // ── Build local member data ──
  const initialMembers: LocalMember[] = useMemo(() => {
    return teamMembers
      .map((m) => {
        const baseWorkload = (m.currentAssignments || []).reduce((s, a) => s + a.workload, 0);
        return {
          id: m.id,
          name: m.name,
          title: m.title,
          availableCapacity: Math.max(0, 100 - baseWorkload),
          teamId: m.teamId,
        };
      })
      .sort((a, b) => b.availableCapacity - a.availableCapacity);
  }, []);

  const [members, setMembers] = useState<LocalMember[]>(initialMembers);

  // ── State ──
  const [screen, setScreen] = useState<Screen>("role-list");
  const [activeRoleId, setActiveRoleId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [memberSearch, setMemberSearch] = useState("");
  const debouncedSearch = useDebounce(memberSearch, 300);

  // Configure screen state
  const [selectedChairId, setSelectedChairId] = useState<string | null>(null);
  const [workloadValue, setWorkloadValue] = useState("20");
  const [notesValue, setNotesValue] = useState("");

  // Pending assignments per role: roleId → PendingAssignment[]
  const [pendingByRole, setPendingByRole] = useState<Record<string, PendingAssignment[]>>({});

  // Completed (persisted) assignments per role: roleId → PendingAssignment[]
  const [completedByRole, setCompletedByRole] = useState<Record<string, PendingAssignment[]>>({});

  // Modals
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [discardTarget, setDiscardTarget] = useState<(() => void) | null>(null);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [showSuccessInline, setShowSuccessInline] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ roleId: string; idx: number; memberName: string; chairName: string } | null>(null);

  // ── Derived ──
  const activeRole = useMemo(() => localRoles.find((r) => r.roleId === activeRoleId) ?? null, [localRoles, activeRoleId]);
  const selectedMember = useMemo(() => members.find((m) => m.id === selectedMemberId) ?? null, [members, selectedMemberId]);

  const currentPending = activeRoleId ? (pendingByRole[activeRoleId] ?? []) : [];

  // Role completion status
  const getRoleStatus = useCallback((roleId: string): "pending" | "completed" => {
    return (completedByRole[roleId] ?? []).length > 0 ? "completed" : "pending";
  }, [completedByRole]);

  const completedRolesCount = useMemo(
    () => localRoles.filter((r) => getRoleStatus(r.roleId) === "completed").length,
    [localRoles, getRoleStatus]
  );

  const totalAssignments = useMemo(
    () => Object.values(completedByRole).reduce((s, arr) => s + arr.length, 0),
    [completedByRole]
  );

  // Filtered members for selection screen — scoped to active role's team
  const filteredMembers = useMemo(() => {
    if (!activeRole) return [];
    const q = debouncedSearch.toLowerCase();
    let list = members;
    // Filter by team
    if (activeRole.teamId) {
      list = list.filter((m) => m.teamId === activeRole.teamId);
    }
    if (q) {
      list = list.filter((m) => m.name.toLowerCase().includes(q) || m.title.toLowerCase().includes(q));
    }
    return list.sort((a, b) => b.availableCapacity - a.availableCapacity);
  }, [members, activeRole, debouncedSearch]);

  // Chairs already used (by pending + completed in this role)
  const usedChairIds = useMemo(() => {
    if (!activeRoleId) return new Set<string>();
    const pending = pendingByRole[activeRoleId] ?? [];
    const completed = completedByRole[activeRoleId] ?? [];
    return new Set([...pending, ...completed].map((a) => a.chairId));
  }, [activeRoleId, pendingByRole, completedByRole]);

  // Check if member already assigned in this role (pending or completed)
  const isMemberInRole = useCallback((memberId: string, roleId: string): boolean => {
    const pending = pendingByRole[roleId] ?? [];
    const completed = completedByRole[roleId] ?? [];
    return [...pending, ...completed].some((a) => a.memberId === memberId);
  }, [pendingByRole, completedByRole]);

  // Available chairs for the config screen
  const availableChairs = useMemo(() => {
    if (!activeRole) return [];
    return activeRole.chairs.filter((c) => !usedChairIds.has(c.id));
  }, [activeRole, usedChairIds]);

  // ── Auto-persist on unmount ──
  const completedByRoleRef = useRef(completedByRole);
  const localRolesRef = useRef(localRoles);
  const existingAssignmentsRef = useRef(existingAssignments);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => { completedByRoleRef.current = completedByRole; }, [completedByRole]);
  useEffect(() => { localRolesRef.current = localRoles; }, [localRoles]);
  useEffect(() => { existingAssignmentsRef.current = existingAssignments; }, [existingAssignments]);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    return () => {
      const completed = completedByRoleRef.current;
      const roles = localRolesRef.current;
      const existing = existingAssignmentsRef.current;
      const newAssignments: AssignmentData[] = [];
      for (const [roleId, assignments] of Object.entries(completed)) {
        const role = roles.find((r) => r.roleId === roleId);
        for (const a of assignments) {
          newAssignments.push({
            roleId,
            roleName: role?.roleName ?? roleId,
            teamName: role?.teamName,
            selectedPerson: { id: a.memberId, name: a.memberName },
            chairType: "Primary",
            workloadPercentage: a.workload,
            notes: a.notes || a.chairName,
          });
        }
      }
      if (newAssignments.length > 0) {
        onCompleteRef.current([...existing, ...newAssignments]);
      }
    };
  }, []);

  // ── Navigation handlers ──
  const navigateToRoleList = useCallback(() => {
    setScreen("role-list");
    setActiveRoleId(null);
    setSelectedMemberId(null);
    setSelectedChairId(null);
    setWorkloadValue("20");
    setNotesValue("");
    setMemberSearch("");
  }, []);

  const handleRoleClick = useCallback((roleId: string) => {
    if (isReadOnly) return;
    const status = getRoleStatus(roleId);
    setActiveRoleId(roleId);
    if (status === "completed") {
      // Go to pending review to show completed assignments
      setScreen("pending-review");
    } else {
      setScreen("member-select");
    }
    setSelectedMemberId(null);
    setSelectedChairId(null);
    setWorkloadValue("20");
    setNotesValue("");
    setMemberSearch("");
  }, [isReadOnly, getRoleStatus]);

  const handleMemberSelect = useCallback((memberId: string) => {
    if (!activeRoleId) return;
    // Check duplicate
    if (isMemberInRole(memberId, activeRoleId)) return;
    setSelectedMemberId(memberId);
    setSelectedChairId(null);
    setWorkloadValue("20");
    setNotesValue("");
    setScreen("configure");
  }, [activeRoleId, isMemberInRole]);

  const handleBackFromConfigure = useCallback(() => {
    setSelectedMemberId(null);
    setSelectedChairId(null);
    setWorkloadValue("20");
    setNotesValue("");
    setScreen("member-select");
  }, []);

  const handleBackFromMembers = useCallback(() => {
    if (!activeRoleId) { navigateToRoleList(); return; }
    const pending = pendingByRole[activeRoleId] ?? [];
    if (pending.length > 0) {
      // Ask to discard
      setDiscardTarget(() => () => {
        setPendingByRole((prev) => { const u = { ...prev }; delete u[activeRoleId]; return u; });
        navigateToRoleList();
      });
      setShowDiscardDialog(true);
    } else {
      navigateToRoleList();
    }
  }, [activeRoleId, pendingByRole, navigateToRoleList]);

  // ── Assignment handlers ──
  const handleAddPending = useCallback(() => {
    if (!activeRoleId || !selectedMember || !selectedChairId) return;
    const workload = parseFloat(workloadValue) || 0;
    if (workload <= 0 || workload > selectedMember.availableCapacity) return;

    const chair = activeRole?.chairs.find((c) => c.id === selectedChairId);
    if (!chair) return;

    const newPending: PendingAssignment = {
      memberId: selectedMember.id,
      memberName: selectedMember.name,
      chairId: selectedChairId,
      chairName: chair.name,
      workload,
      notes: notesValue,
    };

    setPendingByRole((prev) => ({
      ...prev,
      [activeRoleId]: [...(prev[activeRoleId] ?? []), newPending],
    }));

    // Deduct capacity
    setMembers((prev) =>
      prev.map((m) =>
        m.id === selectedMember.id
          ? { ...m, availableCapacity: Math.max(0, m.availableCapacity - workload) }
          : m
      )
    );

    // Go back to member select for another assignment or to pending view
    setSelectedMemberId(null);
    setSelectedChairId(null);
    setWorkloadValue("20");
    setNotesValue("");
    setScreen("pending-review");
  }, [activeRoleId, selectedMember, selectedChairId, workloadValue, notesValue, activeRole]);

  const handleRemovePending = useCallback((roleId: string, idx: number) => {
    const pending = pendingByRole[roleId] ?? [];
    const removed = pending[idx];
    if (!removed) return;

    // Restore capacity
    setMembers((prev) =>
      prev.map((m) =>
        m.id === removed.memberId
          ? { ...m, availableCapacity: Math.min(100, m.availableCapacity + removed.workload) }
          : m
      )
    );

    setPendingByRole((prev) => ({
      ...prev,
      [roleId]: pending.filter((_, i) => i !== idx),
    }));
  }, [pendingByRole]);

  const handleRemoveCompleted = useCallback((roleId: string, idx: number) => {
    const completed = completedByRole[roleId] ?? [];
    const removed = completed[idx];
    if (!removed) return;

    // Restore capacity
    setMembers((prev) =>
      prev.map((m) =>
        m.id === removed.memberId
          ? { ...m, availableCapacity: Math.min(100, m.availableCapacity + removed.workload) }
          : m
      )
    );

    setCompletedByRole((prev) => ({
      ...prev,
      [roleId]: completed.filter((_, i) => i !== idx),
    }));
  }, [completedByRole]);

  const handleCompleteRole = useCallback(() => {
    if (!activeRoleId) return;
    const pending = pendingByRole[activeRoleId] ?? [];
    const existing = completedByRole[activeRoleId] ?? [];

    setCompletedByRole((prev) => ({
      ...prev,
      [activeRoleId]: [...existing, ...pending],
    }));

    setPendingByRole((prev) => {
      const u = { ...prev };
      delete u[activeRoleId];
      return u;
    });

    // Persist to parent
    const allCompleted = { ...completedByRole, [activeRoleId]: [...existing, ...pending] };
    const newAssignments: AssignmentData[] = [];
    for (const [roleId, assignments] of Object.entries(allCompleted)) {
      const role = localRoles.find((r) => r.roleId === roleId);
      for (const a of assignments) {
        newAssignments.push({
          roleId,
          roleName: role?.roleName ?? roleId,
          teamName: role?.teamName,
          selectedPerson: { id: a.memberId, name: a.memberName },
          chairType: "Primary",
          workloadPercentage: a.workload,
          notes: a.notes || a.chairName,
        });
      }
    }
    onComplete([...existingAssignments, ...newAssignments]);

    // Show success then navigate
    setShowSuccessInline(true);
    setTimeout(() => {
      setShowSuccessInline(false);
      navigateToRoleList();
    }, 1500);
  }, [activeRoleId, pendingByRole, completedByRole, localRoles, existingAssignments, onComplete, navigateToRoleList]);

  const handleCompleteWorkItemClick = () => setShowCompleteConfirm(true);
  const handleConfirmComplete = () => {
    setShowCompleteConfirm(false);
    onCompleteWorkItem?.();
  };

  // ── Validation ──
  const workloadNum = parseFloat(workloadValue) || 0;
  const workloadError = useMemo(() => {
    if (!selectedMember) return null;
    if (workloadValue === "") return "Workload % is required and must be greater than 0.";
    if (workloadNum <= 0) return "Workload % is required and must be greater than 0.";
    if (workloadNum > selectedMember.availableCapacity)
      return `Workload % cannot exceed available capacity (${selectedMember.availableCapacity}%).`;
    return null;
  }, [selectedMember, workloadValue, workloadNum]);

  const canAddPending = selectedMember && selectedChairId && workloadNum > 0 && !workloadError;

  // ══════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════════

  // ── Screen 1 & 2: Role List ──
  if (screen === "role-list") {
    return (
      <div className="flex flex-col gap-4">
        {/* Progress indicator */}
        <div className="bg-card rounded-lg border border-[hsl(var(--wq-border))] p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[hsl(var(--wq-text-primary))] font-bold text-sm">Role Assignments</h3>
            <span className="text-xs font-medium text-[hsl(var(--wq-text-secondary))]">
              {completedRolesCount} of {localRoles.length} roles completed
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-[hsl(var(--wq-bg-muted))] rounded-full overflow-hidden">
            <div
              className="h-full bg-[hsl(142,71%,45%)] rounded-full transition-all duration-500"
              style={{ width: `${localRoles.length > 0 ? (completedRolesCount / localRoles.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Guidance note when nothing is completed */}
        {completedRolesCount === 0 && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[hsl(var(--wq-bg-header))] border border-[hsl(var(--wq-border))]">
            <Info className="w-4 h-4 text-[hsl(var(--wq-accent))] flex-shrink-0" />
            <p className="text-xs text-[hsl(var(--wq-text-secondary))]">
              Select a role below to begin assigning team members to chairs.
            </p>
          </div>
        )}

        {/* Role cards */}
        <div className="flex flex-col gap-3">
          {localRoles.map((role) => {
            const status = getRoleStatus(role.roleId);
            const completed = completedByRole[role.roleId] ?? [];
            const isPending = status === "pending";

            return (
              <button
                key={role.roleId}
                type="button"
                disabled={isReadOnly && isPending}
                onClick={() => handleRoleClick(role.roleId)}
                className={cn(
                  "w-full text-left border rounded-lg transition-all duration-150",
                  "border-[hsl(var(--wq-border))] bg-card",
                  isPending && !isReadOnly && "hover:border-[hsl(var(--wq-accent))] hover:shadow-sm cursor-pointer",
                  isPending && isReadOnly && "opacity-50 cursor-not-allowed",
                  status === "completed" && "cursor-pointer hover:shadow-sm"
                )}
              >
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[hsl(var(--wq-text-primary))] leading-tight">
                      {role.roleName}
                    </p>
                    {role.teamName && (
                      <p className="text-[11px] text-[hsl(var(--wq-text-secondary))] mt-0.5">{role.teamName}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {status === "completed" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[hsl(var(--wq-status-completed-bg))] text-[hsl(var(--wq-status-completed-text))]">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[hsl(var(--wq-status-pending-bg))] text-[hsl(var(--wq-status-pending-text))]">
                        Pending
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-[hsl(var(--wq-text-secondary))]" />
                  </div>
                </div>
                {/* Show completed assignments summary */}
                {completed.length > 0 && (
                  <div className="px-5 pb-3 flex flex-wrap gap-2">
                    {completed.map((a, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[hsl(var(--wq-bg-header))] text-[11px] text-[hsl(var(--wq-text-secondary))]"
                      >
                        <span className="w-5 h-5 rounded-full bg-[hsl(var(--wq-primary))] text-white flex items-center justify-center text-[8px] font-bold flex-shrink-0">
                          {getInitials(a.memberName)}
                        </span>
                        {a.chairName} — {a.memberName} — {a.workload}%
                      </span>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Complete Work Item button */}
        {!isReadOnly && totalAssignments >= 1 && (
          <div className="flex justify-end pt-2">
            <Button onClick={handleCompleteWorkItemClick} className="h-9 px-6">
              <Check className="w-3.5 h-3.5 mr-1.5" />
              Complete Work Item
            </Button>
          </div>
        )}

        {/* Complete Work Item modal */}
        {showCompleteConfirm && ReactDOM.createPortal(
          <>
            <div className="fixed inset-0 z-[9997] bg-black/40" onClick={() => setShowCompleteConfirm(false)} />
            <div className="fixed left-1/2 top-1/2 z-[9998] -translate-x-1/2 -translate-y-1/2 bg-card border border-[hsl(var(--wq-border))] rounded-xl shadow-xl p-6 w-96">
              <h4 className="font-semibold text-foreground text-base mb-2">Complete work item?</h4>
              <p className="text-sm text-muted-foreground mb-1">
                Once completed, <span className="font-medium text-foreground">no further changes</span> can be made.
              </p>
              <p className="text-sm text-muted-foreground mb-5">
                This will lock all assignments and mark the work item as complete.
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowCompleteConfirm(false)}>Cancel</Button>
                <Button
                  size="sm"
                  className="bg-[hsl(142,71%,38%)] hover:bg-[hsl(142,71%,32%)] text-white"
                  onClick={handleConfirmComplete}
                >
                  <Check className="w-3.5 h-3.5" />
                  Confirm & Complete
                </Button>
              </div>
            </div>
          </>,
          document.body
        )}

        {/* Read-only completed view */}
        {isReadOnly && totalAssignments > 0 && (
          <div className="bg-card rounded-lg border border-[hsl(var(--wq-border))] p-5 mt-2">
            <h4 className="text-sm font-semibold text-[hsl(var(--wq-text-primary))] mb-3">Completed Assignments</h4>
            <div className="flex flex-col gap-3">
              {localRoles.map((role) => {
                const completed = completedByRole[role.roleId] ?? [];
                if (completed.length === 0) return (
                  <div key={role.roleId} className="border border-[hsl(var(--wq-border))] rounded-lg bg-muted/30 opacity-50 px-4 py-3">
                    <p className="text-sm font-semibold text-muted-foreground">{role.roleName}</p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">No assignments available</p>
                  </div>
                );
                return (
                  <div key={role.roleId} className="border border-[hsl(var(--wq-border))] rounded-lg overflow-hidden">
                    <div className="px-4 py-3 bg-[hsl(var(--wq-status-completed-bg))]">
                      <p className="text-sm font-semibold text-[hsl(var(--wq-status-completed-text))]">{role.roleName}</p>
                    </div>
                    <div className="divide-y divide-[hsl(var(--wq-border))]">
                      {completed.map((a, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                          <span className="text-xs text-muted-foreground w-28 flex-shrink-0">{a.chairName}</span>
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="w-6 h-6 rounded-full bg-[hsl(var(--wq-primary))] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                              {getInitials(a.memberName)}
                            </div>
                            <span className="text-sm font-medium truncate">{a.memberName}</span>
                          </div>
                          <span className="text-xs font-medium text-muted-foreground flex-shrink-0">{a.workload}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Screen 3: Team Member Selection ──
  if (screen === "member-select") {
    return (
      <div className="flex flex-col gap-4">
        {/* Back + context */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBackFromMembers}
            className="flex items-center gap-1.5 text-sm text-[hsl(var(--wq-accent))] hover:text-[hsl(var(--wq-primary))] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Roles
          </button>
        </div>

        <div className="bg-card rounded-lg border border-[hsl(var(--wq-border))] overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-[hsl(var(--wq-border))]">
            <p className="text-xs text-[hsl(var(--wq-text-secondary))] mb-1">Assigning for role</p>
            <h3 className="text-[hsl(var(--wq-text-primary))] font-bold text-sm">{activeRole?.roleName}</h3>
            {activeRole?.teamName && (
              <p className="text-[11px] text-[hsl(var(--wq-text-secondary))] mt-0.5">{activeRole.teamName}</p>
            )}
          </div>

          {/* Guidance */}
          <div className="px-5 py-3 border-b border-[hsl(var(--wq-border))] bg-[hsl(var(--wq-bg-header))]">
            <p className="text-xs text-[hsl(var(--wq-text-secondary))]">
              Select a member to assign one or more roles
            </p>
          </div>

          {/* Search */}
          <div className="px-5 py-3 border-b border-[hsl(var(--wq-border))]">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--wq-text-secondary))] pointer-events-none" />
              <input
                type="text"
                placeholder="Search members..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full h-9 pl-8 pr-8 text-sm border border-[hsl(var(--wq-border))] rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-[hsl(var(--wq-accent))]/30"
              />
              {memberSearch && (
                <button
                  onClick={() => setMemberSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[hsl(var(--wq-text-secondary))] hover:text-[hsl(var(--wq-primary))]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Member list */}
          <div className="overflow-y-auto max-h-[480px] divide-y divide-[hsl(var(--wq-border))]">
            {filteredMembers.map((member) => {
              const isDisabled = member.availableCapacity <= 0;
              const isDuplicate = activeRoleId ? isMemberInRole(member.id, activeRoleId) : false;

              return (
                <button
                  key={member.id}
                  type="button"
                  disabled={isDisabled || isDuplicate}
                  onClick={() => handleMemberSelect(member.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-5 py-3 text-left transition-all duration-150",
                    isDisabled && "opacity-40 cursor-not-allowed",
                    isDuplicate && "opacity-50 cursor-not-allowed",
                    !isDisabled && !isDuplicate && "hover:bg-[hsl(var(--wq-bg-hover))] cursor-pointer"
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-[hsl(var(--wq-primary))] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {getInitials(member.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[hsl(var(--wq-text-primary))] truncate leading-tight">
                      {member.name}
                    </p>
                    <p className="text-[11px] text-[hsl(var(--wq-text-secondary))] truncate leading-tight">
                      {member.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isDuplicate ? (
                      <span className="text-[11px] text-[hsl(var(--wq-text-secondary))] italic">Already assigned</span>
                    ) : (
                      <span className={cn("text-xs font-semibold", getCapacityColor(member.availableCapacity))}>
                        {member.availableCapacity}% available
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
            {filteredMembers.length === 0 && (
              <p className="text-sm text-[hsl(var(--wq-text-secondary))] text-center py-8">No members found</p>
            )}
          </div>
        </div>

        {/* Pending assignments for this role */}
        {currentPending.length > 0 && (
          <div className="bg-card rounded-lg border border-[hsl(var(--wq-border))] overflow-hidden">
            <div className="px-5 py-3 border-b border-[hsl(var(--wq-border))]">
              <h4 className="text-sm font-semibold text-[hsl(var(--wq-text-primary))]">
                Pending Assignments ({currentPending.length})
              </h4>
            </div>
            <div className="divide-y divide-[hsl(var(--wq-border))]">
              {currentPending.map((a, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-2.5">
                  <div className="w-6 h-6 rounded-full bg-[hsl(var(--wq-primary))] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                    {getInitials(a.memberName)}
                  </div>
                  <span className="text-sm font-medium flex-1 truncate">{a.memberName}</span>
                  <span className="text-xs text-[hsl(var(--wq-text-secondary))]">{a.chairName}</span>
                  <span className="text-xs font-medium text-[hsl(var(--wq-text-secondary))]">{a.workload}%</span>
                  <button
                    onClick={() => handleRemovePending(activeRoleId!, i)}
                    className="text-muted-foreground/40 hover:text-destructive transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-[hsl(var(--wq-border))] flex justify-end">
              <Button onClick={handleCompleteRole} size="sm" className="h-8 px-5">
                <Check className="w-3.5 h-3.5 mr-1.5" />
                Complete Assignment
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Screen 4: Assignment Configuration ──
  if (screen === "configure") {
    return (
      <div className="flex flex-col gap-4">
        {/* Back */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBackFromConfigure}
            className="flex items-center gap-1.5 text-sm text-[hsl(var(--wq-accent))] hover:text-[hsl(var(--wq-primary))] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Members
          </button>
        </div>

        <div className="bg-card rounded-lg border border-[hsl(var(--wq-border))] overflow-hidden">
          {/* Context header */}
          <div className="px-5 py-4 border-b border-[hsl(var(--wq-border))] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[hsl(var(--wq-primary))] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
              {selectedMember ? getInitials(selectedMember.name) : ""}
            </div>
            <div>
              <p className="text-sm font-semibold text-[hsl(var(--wq-text-primary))]">{selectedMember?.name}</p>
              <p className="text-[11px] text-[hsl(var(--wq-text-secondary))]">{selectedMember?.title}</p>
            </div>
            <div className="ml-auto">
              <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border", getCapacityBadgeCls(selectedMember?.availableCapacity ?? 0))}>
                {selectedMember?.availableCapacity}% available
              </span>
            </div>
          </div>

          <div className="px-5 py-3 border-b border-[hsl(var(--wq-border))] bg-[hsl(var(--wq-bg-header))]">
            <p className="text-xs text-[hsl(var(--wq-text-secondary))]">
              Assigning for: <span className="font-medium text-[hsl(var(--wq-text-primary))]">{activeRole?.roleName}</span>
            </p>
          </div>

          <div className="p-5 flex flex-col gap-5">
            {/* Workload input */}
            <div>
              <label className="text-xs font-medium text-[hsl(var(--wq-text-primary))] block mb-1.5">
                Workload % <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={100}
                step={0.5}
                value={workloadValue}
                onChange={(e) => setWorkloadValue(e.target.value)}
                onFocus={(e) => e.target.select()}
                placeholder="Enter workload %"
                className={cn(
                  "w-full h-10 px-3 border rounded-md text-sm focus:outline-none focus:ring-2 bg-card",
                  workloadError
                    ? "border-destructive focus:ring-destructive/30"
                    : "border-[hsl(var(--wq-border))] focus:ring-[hsl(var(--wq-accent))]/30"
                )}
              />
              <p className="text-[11px] text-[hsl(var(--wq-text-secondary))] mt-1">
                Available capacity: {selectedMember?.availableCapacity}%
              </p>
              {workloadError && (
                <p className="text-[11px] text-destructive mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {workloadError}
                </p>
              )}
            </div>

            {/* Chair selection */}
            <div>
              <label className="text-xs font-medium text-[hsl(var(--wq-text-primary))] block mb-1.5">
                Chair <span className="text-destructive">*</span>
              </label>
              {availableChairs.length === 0 ? (
                <p className="text-xs text-[hsl(var(--wq-text-secondary))] italic py-2">
                  All chairs have been assigned for this role.
                </p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {availableChairs.map((chair) => (
                    <button
                      key={chair.id}
                      type="button"
                      onClick={() => setSelectedChairId(chair.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-md border text-left transition-all",
                        selectedChairId === chair.id
                          ? "border-[hsl(var(--wq-accent))] bg-[hsl(var(--wq-accent))]/5"
                          : "border-[hsl(var(--wq-border))] hover:border-[hsl(var(--wq-accent))]/50"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                        selectedChairId === chair.id ? "border-[hsl(var(--wq-accent))]" : "border-muted-foreground/40"
                      )}>
                        {selectedChairId === chair.id && <div className="w-2 h-2 rounded-full bg-[hsl(var(--wq-accent))]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[hsl(var(--wq-text-primary))]">{chair.name}</p>
                        {chair.description && (
                          <p className="text-[11px] text-[hsl(var(--wq-text-secondary))] mt-0.5 line-clamp-1">{chair.description}</p>
                        )}
                      </div>
                      <span className="text-[11px] text-[hsl(var(--wq-text-secondary))] flex-shrink-0">
                        {chair.typicalWorkload}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-medium text-[hsl(var(--wq-text-primary))] block mb-1.5">
                Notes <span className="text-[hsl(var(--wq-text-secondary))]">(optional)</span>
              </label>
              <textarea
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                placeholder="Add notes (optional)"
                rows={2}
                className="w-full px-3 py-2 border border-[hsl(var(--wq-border))] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--wq-accent))]/30 bg-card resize-none"
              />
            </div>

            {/* Add to pending */}
            <div className="flex justify-end">
              <Button
                disabled={!canAddPending}
                onClick={handleAddPending}
                className="h-9 px-6"
              >
                Add Assignment
              </Button>
            </div>
          </div>
        </div>

        {/* Duplicate member error */}
        {selectedMember && activeRoleId && isMemberInRole(selectedMember.id, activeRoleId) && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-destructive/5 border border-destructive/20">
            <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
            <p className="text-xs text-destructive">
              This team member is already assigned to another chair for this role and client.
            </p>
          </div>
        )}
      </div>
    );
  }

  // ── Screen 5: Pending Review / Complete Assignment ──
  if (screen === "pending-review") {
    const pending = activeRoleId ? (pendingByRole[activeRoleId] ?? []) : [];
    const completed = activeRoleId ? (completedByRole[activeRoleId] ?? []) : [];
    const allAssignments = [...completed, ...pending];

    return (
      <div className="flex flex-col gap-4">
        {/* Back */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBackFromMembers}
            className="flex items-center gap-1.5 text-sm text-[hsl(var(--wq-accent))] hover:text-[hsl(var(--wq-primary))] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Roles
          </button>
        </div>

        {/* Success state */}
        {showSuccessInline && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[hsl(var(--wq-status-completed-bg))] border border-[hsl(142,76%,80%)]">
            <CheckCircle2 className="w-4 h-4 text-[hsl(var(--wq-status-completed-text))]" />
            <p className="text-sm font-medium text-[hsl(var(--wq-status-completed-text))]">
              Role assignment completed. Returning to role list…
            </p>
          </div>
        )}

        <div className="bg-card rounded-lg border border-[hsl(var(--wq-border))] overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-[hsl(var(--wq-border))]">
            <p className="text-xs text-[hsl(var(--wq-text-secondary))] mb-1">Assignments for</p>
            <h3 className="text-[hsl(var(--wq-text-primary))] font-bold text-sm">{activeRole?.roleName}</h3>
          </div>

          {/* Assignment rows */}
          {allAssignments.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <User className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-[hsl(var(--wq-text-secondary))]">No assignments yet</p>
              <p className="text-xs text-[hsl(var(--wq-text-secondary))] mt-1">Select a member to begin</p>
            </div>
          ) : (
            <div className="divide-y divide-[hsl(var(--wq-border))]">
              {allAssignments.map((a, i) => {
                const isCompleted = i < completed.length;
                return (
                  <div key={i} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-7 h-7 rounded-full bg-[hsl(var(--wq-primary))] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      {getInitials(a.memberName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[hsl(var(--wq-text-primary))] truncate">{a.memberName}</p>
                      <p className="text-[11px] text-[hsl(var(--wq-text-secondary))]">{a.chairName}</p>
                    </div>
                    <span className="text-xs font-medium text-[hsl(var(--wq-text-secondary))] flex-shrink-0">{a.workload}%</span>
                    {a.notes && (
                      <span title={a.notes}><MessageSquare className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" /></span>
                    )}
                    {!isReadOnly && (
                      <button
                        onClick={() => {
                          setDeleteConfirm({ roleId: activeRoleId!, idx: i, memberName: a.memberName, chairName: a.chairName });
                        }}
                        className="text-muted-foreground/40 hover:text-destructive transition-colors p-1 flex-shrink-0"
                        title="Remove assignment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Actions */}
          {!isReadOnly && !showSuccessInline && (
            <div className="px-5 py-3 border-t border-[hsl(var(--wq-border))] flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setScreen("member-select");
                  setSelectedMemberId(null);
                  setSelectedChairId(null);
                  setWorkloadValue("20");
                  setNotesValue("");
                }}
                className="h-8"
              >
                <User className="w-3.5 h-3.5 mr-1.5" />
                Add Another Member
              </Button>

              {pending.length > 0 && (
                <Button onClick={handleCompleteRole} size="sm" className="h-8 px-5">
                  <Check className="w-3.5 h-3.5 mr-1.5" />
                  Complete Assignment
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Delete confirmation */}
        {deleteConfirm && ReactDOM.createPortal(
          <>
            <div className="fixed inset-0 z-[9997] bg-black/40" onClick={() => setDeleteConfirm(null)} />
            <div className="fixed left-1/2 top-1/2 z-[9998] -translate-x-1/2 -translate-y-1/2 bg-card border border-[hsl(var(--wq-border))] rounded-xl shadow-xl p-6 w-80">
              <h4 className="font-semibold text-foreground mb-2">Remove assignment?</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Remove <span className="font-medium text-foreground">{deleteConfirm.memberName}</span> from{" "}
                <span className="font-medium text-foreground">{deleteConfirm.chairName}</span>?
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const completed = completedByRole[deleteConfirm.roleId] ?? [];
                    if (deleteConfirm.idx < completed.length) {
                      handleRemoveCompleted(deleteConfirm.roleId, deleteConfirm.idx);
                    } else {
                      handleRemovePending(deleteConfirm.roleId, deleteConfirm.idx - completed.length);
                    }
                    setDeleteConfirm(null);
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          </>,
          document.body
        )}

        {/* Discard dialog */}
        {showDiscardDialog && ReactDOM.createPortal(
          <>
            <div className="fixed inset-0 z-[9997] bg-black/40" onClick={() => setShowDiscardDialog(false)} />
            <div className="fixed left-1/2 top-1/2 z-[9998] -translate-x-1/2 -translate-y-1/2 bg-card border border-[hsl(var(--wq-border))] rounded-xl shadow-xl p-6 w-96">
              <h4 className="font-semibold text-foreground text-base mb-2">Discard unsaved assignments?</h4>
              <p className="text-sm text-muted-foreground mb-5">
                You have pending assignments that haven't been saved. If you leave now, they will be discarded. Completed roles will not be affected.
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowDiscardDialog(false)}>
                  Stay and continue
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setShowDiscardDialog(false);
                    discardTarget?.();
                  }}
                >
                  Discard and exit
                </Button>
              </div>
            </div>
          </>,
          document.body
        )}
      </div>
    );
  }

  return null;
};
