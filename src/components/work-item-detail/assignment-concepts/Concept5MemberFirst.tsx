import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { Search, X, Check, User, AlertTriangle, Loader2, CheckCircle2, XCircle, RefreshCw, ChevronDown, MessageSquare } from "lucide-react";
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

// ─── Pending assignment per role (for the single Assign button) ────────────────

interface RolePending {
  chairId: string;
  chairName: string;
  workload: number;
  notes: string;
}

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
      isSelected ? "border-l-primary bg-primary/5" : "border-l-transparent hover:bg-accent/20"
    )}
  >
    <div
      className={cn(
        "flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center",
        isSelected ? "border-primary" : "border-muted-foreground/40"
      )}
    >
      {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
    </div>

    <div
      className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold",
        isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
      )}
    >
      {getInitials(member.name)}
    </div>

    <div className="flex-1 min-w-0">
      <p className={cn("text-sm font-medium truncate leading-tight", isSelected ? "text-primary" : "text-foreground")}>
        {member.name}
      </p>
      <p className="text-xs text-muted-foreground truncate leading-tight">{member.title}</p>
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

// ─── RoleCard (no per-role Assign button; exposes pending state upward) ────────

interface RoleCardProps {
  role: LocalRole;
  assignmentMap: AssignmentMap;
  selectedMember: LocalMember | null;
  isLocked: boolean;
  pending: RolePending | null;
  onPendingChange: (p: RolePending | null) => void;
}

const RoleCard: React.FC<RoleCardProps> = ({
  role,
  assignmentMap,
  selectedMember,
  isLocked,
  pending,
  onPendingChange,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const openDropdown = () => {
    if (isLocked) return;
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
    setDropdownOpen(true);
  };

  const assignedInRole = role.chairs.filter((c) => !!assignmentMap[assignmentKey(role.roleId, c.id)]);
  const allFilled = assignedInRole.length >= role.chairs.length;

  const selectedMemberAlreadyInRole = selectedMember
    ? role.chairs.some((c) => assignmentMap[assignmentKey(role.roleId, c.id)]?.memberId === selectedMember.id)
    : false;

  const availableChairs = role.chairs.filter((c) => !assignmentMap[assignmentKey(role.roleId, c.id)]);

  const selectedChairId = pending?.chairId ?? "";
  const selectedChairName = availableChairs.find((c) => c.id === selectedChairId)?.name ?? "";
  const workloadStr = pending ? String(pending.workload) : "20";

  const [noteExpanded, setNoteExpanded] = useState(false);

  const handleChairSelect = (chairId: string) => {
    const chair = availableChairs.find((c) => c.id === chairId);
    if (!chair) return;
    onPendingChange({ chairId: chair.id, chairName: chair.name, workload: pending?.workload ?? 20, notes: pending?.notes ?? "" });
    setDropdownOpen(false);
  };

  const handleClearChair = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPendingChange(null);
    setNoteExpanded(false);
  };

  const handleWorkloadChange = (val: string) => {
    if (!pending) return;
    const parsed = parseFloat(val) || 0;
    onPendingChange({ ...pending, workload: parsed });
  };

  const handleNotesChange = (val: string) => {
    if (!pending) return;
    onPendingChange({ ...pending, notes: val });
  };

  const workload = pending?.workload ?? 0;
  const remaining = selectedMember?.availableCapacity ?? 100;
  const exceedsCapacity = workload > remaining;

  return (
    <div
      className={cn(
        "border rounded-lg transition-all duration-200 relative",
        allFilled
          ? "border-[hsl(var(--wq-border))] bg-[hsl(var(--wq-bg-muted))] opacity-60"
          : "border-[hsl(var(--wq-border))] bg-card"
      )}
    >
      {/* Role header */}
      <div className="px-4 py-3 border-b border-[hsl(var(--wq-border))]">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-primary leading-tight">{role.roleName}</p>
            {role.teamName && (
              <p className="text-xs text-[hsl(var(--wq-text-secondary))] mt-0.5">{role.teamName}</p>
            )}
          </div>
          <span className="text-xs text-[hsl(var(--wq-text-secondary))] whitespace-nowrap flex-shrink-0">
            {assignedInRole.length} of {role.chairs.length} chairs assigned
          </span>
        </div>
      </div>

      {/* Assigned chairs summary */}
      {assignedInRole.length > 0 && (
        <div className="divide-y divide-[hsl(var(--wq-border))]">
          {assignedInRole.map((chair) => {
            const existing = assignmentMap[assignmentKey(role.roleId, chair.id)];
            const isCurrentMember = existing?.memberId === selectedMember?.id;
            return (
              <div key={chair.id} className="flex items-center gap-3 px-4 py-2 bg-[hsl(var(--wq-bg-muted))]">
                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 [background-color:hsl(142,71%,45%)]">
                  <Check className="w-2.5 h-2.5 text-primary-foreground" />
                </div>
                <span className="text-sm text-[hsl(var(--wq-text-secondary))] flex-1">
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
      )}

      {/* "Member already in this role" notice */}
      {!allFilled && selectedMemberAlreadyInRole && (
        <div className="px-4 py-3 flex items-center gap-2 text-xs text-[hsl(var(--wq-text-secondary))] bg-muted/40 border-t border-[hsl(var(--wq-border))]">
          <CheckCircle2 className="w-3.5 h-3.5 text-[hsl(142,71%,45%)] flex-shrink-0" />
          <span>
            <span className="font-medium text-foreground">{selectedMember?.name.split(" ")[0]}</span>
            {" "}is already assigned to this role. Select another member to fill remaining chairs.
          </span>
        </div>
      )}

      {/* Chair dropdown + workload — no Assign button here */}
      {!allFilled && !selectedMemberAlreadyInRole && (
        <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
          {/* Custom clearable chair dropdown */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <label className="text-xs font-medium text-[hsl(var(--wq-text-secondary))] whitespace-nowrap">
              Chair
            </label>
            <div className="relative flex-1">
              {/* Trigger */}
              <button
                ref={triggerRef}
                type="button"
                onClick={() => dropdownOpen ? setDropdownOpen(false) : openDropdown()}
                disabled={isLocked}
                className={cn(
                  "w-full h-9 px-3 pr-8 border border-[hsl(var(--wq-border))] rounded-md text-sm text-left bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center",
                  selectedChairId ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <span className="flex-1 truncate">{selectedChairId ? selectedChairName : "Select Chair"}</span>
              </button>

              {/* Right icon: X to clear if selected, chevron otherwise */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                {selectedChairId ? (
                  <button
                    type="button"
                    onClick={handleClearChair}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Clear chair selection"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                )}
              </div>

              {/* Dropdown list — portalled to body to escape overflow constraints */}
              {dropdownOpen && ReactDOM.createPortal(
                <>
                  <div className="fixed inset-0 z-[9998]" onClick={() => setDropdownOpen(false)} />
                  <div style={dropdownStyle} className="bg-card border border-[hsl(var(--wq-border))] rounded-md shadow-lg overflow-hidden">
                    {availableChairs.length === 0 ? (
                      <p className="px-3 py-2 text-xs text-muted-foreground">No chairs available</p>
                    ) : (
                      availableChairs.map((chair) => (
                        <button
                          key={chair.id}
                          type="button"
                          onClick={() => handleChairSelect(chair.id)}
                          className={cn(
                            "w-full text-left px-3 py-2 text-sm hover:bg-accent/30 transition-colors",
                            chair.id === selectedChairId ? "text-primary font-medium bg-primary/5" : "text-foreground"
                          )}
                        >
                          {chair.name}
                        </button>
                      ))
                    )}
                  </div>
                </>,
                document.body
              )}
            </div>
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
              onChange={(e) => handleWorkloadChange(e.target.value)}
              onFocus={(e) => e.target.select()}
              disabled={isLocked}
              className="w-16 h-9 px-2 border border-[hsl(var(--wq-border))] rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30 bg-card disabled:opacity-50"
            />
          <span className="text-sm text-[hsl(var(--wq-text-secondary))]">%</span>
          </div>

          {/* Notes toggle button */}
          <button
            type="button"
            disabled={isLocked || !pending}
            onClick={() => setNoteExpanded((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 h-9 rounded-md border text-xs transition-colors flex-shrink-0",
              pending?.notes
                ? "text-primary bg-primary/5 border-primary/20 hover:bg-primary/10"
                : "text-muted-foreground border-[hsl(var(--wq-border))] hover:bg-muted hover:text-foreground",
              (!pending || isLocked) && "opacity-40 cursor-not-allowed"
            )}
            title={!pending ? "Select a chair first" : pending.notes ? "View/edit notes" : "Add notes"}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className={pending?.notes ? "" : "italic opacity-60"}>Notes</span>
          </button>

          {/* Capacity warning */}
          {exceedsCapacity && !isLocked && (
            <span className="text-xs text-[hsl(38,92%,50%)] flex items-center gap-1 w-full">
              <AlertTriangle className="w-3 h-3 flex-shrink-0" />
              Exceeds {selectedMember?.name.split(" ")[0]}'s remaining capacity ({remaining}%)
            </span>
          )}

          {/* Inline notes input */}
          {noteExpanded && (
            <div className="flex items-start gap-2 w-full">
              <MessageSquare className="w-3.5 h-3.5 text-muted-foreground mt-2 flex-shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Add assignment notes..."
                value={pending?.notes ?? ""}
                onChange={(e) => handleNotesChange(e.target.value)}
                disabled={isLocked}
                className="flex-1 h-8 px-2 border border-[hsl(var(--wq-border))] rounded-md text-xs bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setNoteExpanded(false);
                  }
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

export interface Concept5MemberFirstProps {
  roles: RoleDefinition[];
  existingAssignments?: AssignmentData[];
  onComplete: (assignments: AssignmentData[]) => void;
  onCompleteWorkItem?: () => void;
  isReadOnly?: boolean;
}

export const Concept5MemberFirst: React.FC<Concept5MemberFirstProps> = ({
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

  // Per-role pending selections (chair + workload chosen but not yet submitted)
  const [rolePendings, setRolePendings] = useState<Record<string, RolePending | null>>({});

  // Global save state for the single Assign button
  const [saveState, setSaveState] = useState<SaveState>(null);

  const [memberSearch, setMemberSearch] = useState("");
  const debouncedSearch = useDebounce(memberSearch, 300);

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

  const selectedMember = useMemo(
    () => members.find((m) => m.id === selectedMemberId) ?? null,
    [members, selectedMemberId]
  );

  const filteredMembers = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    const filtered = q
      ? members.filter((m) => m.name.toLowerCase().includes(q) || m.title.toLowerCase().includes(q))
      : [...members];
    // Pin the selected member to the top
    if (selectedMemberId) {
      const selectedIdx = filtered.findIndex((m) => m.id === selectedMemberId);
      if (selectedIdx > 0) {
        const [selected] = filtered.splice(selectedIdx, 1);
        filtered.unshift(selected);
      }
    }
    return filtered;
  }, [members, debouncedSearch, selectedMemberId]);

  const memberAssignmentCount = useCallback(
    (memberId: string) => Object.values(assignmentMap).filter((a) => a.memberId === memberId).length,
    [assignmentMap]
  );

  const handleSelectMember = (memberId: string) => {
    if (isReadOnly) return;
    // Re-sort whenever selection changes (including deselect)
    setMembers((prev) => [...prev].sort((a, b) => b.availableCapacity - a.availableCapacity));
    setSaveState(null);
    setRolePendings({});
    // Clicking the selected member again deselects (unpins) it
    setSelectedMemberId(memberId === selectedMemberId ? null : memberId);
  };

  // Collect all roles that have a pending chair selected
  const pendingRoles = useMemo(() => {
    return localRoles.filter((r) => {
      const p = rolePendings[r.roleId];
      return p && p.chairId && p.workload >= 1 && p.workload <= 100;
    });
  }, [localRoles, rolePendings]);

  const canAssignAll = selectedMember !== null && pendingRoles.length > 0 && saveState !== "saving";

  const handleAssignAll = useCallback(async () => {
    if (!selectedMember || pendingRoles.length === 0) return;

    setSaveState("saving");
    await new Promise((res) => setTimeout(res, 700));

    let newMap = { ...assignmentMap };
    const newAssignments: AssignmentData[] = [];

    for (const role of pendingRoles) {
      const p = rolePendings[role.roleId]!;
      const key = assignmentKey(role.roleId, p.chairId);
      if (newMap[key]?.memberId === selectedMember.id) continue;

      newMap[key] = { memberId: selectedMember.id, memberName: selectedMember.name, workload: p.workload };

      newAssignments.push({
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
        workloadPercentage: p.workload,
        notes: p.notes || p.chairName,
      });
    }

    setAssignmentMap(newMap);

    // Deduct total workload from member capacity
    const totalDeducted = pendingRoles.reduce((sum, r) => sum + (rolePendings[r.roleId]?.workload ?? 0), 0);
    setMembers((prev) =>
      prev.map((m) =>
        m.id === selectedMember.id
          ? { ...m, availableCapacity: Math.max(0, m.availableCapacity - totalDeducted) }
          : m
      )
    );

    if (newAssignments.length > 0) {
      onComplete([...existingAssignments, ...newAssignments]);
    }

    // Clear pending selections for assigned roles
    setRolePendings((prev) => {
      const updated = { ...prev };
      pendingRoles.forEach((r) => { updated[r.roleId] = null; });
      return updated;
    });

    setSaveState("success");
    setTimeout(() => setSaveState(null), 1500);
  }, [selectedMember, pendingRoles, rolePendings, assignmentMap, existingAssignments, onComplete]);

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

      {/* ── RIGHT: Role Assignments (60%) ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-0">
        <div className="bg-card rounded-lg border border-[hsl(var(--wq-border))] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--wq-border))]">
            <div className="min-w-0">
              <h3 className="text-primary font-bold text-sm">Role Assignments</h3>
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

          <div className={cn("p-4 flex flex-col gap-3", !selectedMember && "opacity-50 pointer-events-none")}>
            {localRoles.map((role) => (
              <RoleCard
                key={role.roleId}
                role={role}
                assignmentMap={assignmentMap}
                selectedMember={selectedMember}
                isLocked={!selectedMember}
                pending={rolePendings[role.roleId] ?? null}
                onPendingChange={(p) =>
                  setRolePendings((prev) => ({ ...prev, [role.roleId]: p }))
                }
              />
            ))}
            {localRoles.length === 0 && (
              <p className="text-sm text-[hsl(var(--wq-text-secondary))] text-center py-8">
                No roles configured for this work item.
              </p>
            )}
          </div>

          {/* ── Single Assign button at the bottom ── */}
          <div className="px-4 pb-4 pt-1 border-t border-[hsl(var(--wq-border))] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              {saveState === "saving" && (
                <span className="text-[hsl(var(--wq-text-secondary))] flex items-center gap-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…
                </span>
              )}
              {saveState === "success" && (
                <span className="text-[hsl(142,71%,45%)] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                </span>
              )}
              {saveState === "error" && (
                <button
                  onClick={handleAssignAll}
                  className="text-destructive flex items-center gap-1 hover:underline"
                >
                  <XCircle className="w-3.5 h-3.5" /> Failed —{" "}
                  <RefreshCw className="w-3.5 h-3.5" /> Retry
                </button>
              )}
              {pendingRoles.length > 0 && saveState === null && (
                <span className="text-[hsl(var(--wq-text-secondary))]">
                  {pendingRoles.length} role{pendingRoles.length > 1 ? "s" : ""} ready to assign
                </span>
              )}
            </div>

            <Button
              disabled={!canAssignAll || isReadOnly}
              onClick={handleAssignAll}
              className="h-9 px-6"
            >
              {saveState === "saving" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                "Assign"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
