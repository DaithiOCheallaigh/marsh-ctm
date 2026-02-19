import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import {
  Search, X, Check, User, AlertTriangle, Loader2, CheckCircle2, XCircle,
  RefreshCw, ChevronDown, ChevronRight, MessageSquare, Trash2, Info, Lock } from
"lucide-react";
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
}

interface LocalRole {
  roleId: string;
  roleName: string;
  teamName?: string;
  teamId?: string;
  chairs: LocalChair[];
}

/** roleId+chairId → assignment */
type AssignmentMap = Record<string, {memberId: string;memberName: string;workload: number;notes?: string;}>;

type SaveState = null | "saving" | "success" | "error";

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
  { id: `${roleName}-c2`, name: "Secondary Chair" }];

};

const assignmentKey = (roleId: string, chairId: string) => `${roleId}::${chairId}`;

// ─── MemberCard ───────────────────────────────────────────────────────────────

interface MemberCardProps {
  member: LocalMember;
  isSelected: boolean;
  onSelect: () => void;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, isSelected, onSelect }) =>
<div
  role="radio"
  aria-checked={isSelected}
  tabIndex={0}
  onClick={onSelect}
  onKeyDown={(e) => (e.key === " " || e.key === "Enter") && onSelect()}
  className={cn(
    "flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all duration-150 select-none border-l-2",
    isSelected ? "border-l-primary bg-primary/5" : "border-l-transparent hover:bg-accent/20"
  )}>

    <div
    className={cn(
      "flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center",
      isSelected ? "border-primary" : "border-muted-foreground/40"
    )}>

      {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
    </div>

    <div
    className={cn(
      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold",
      isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
    )}>

      {getInitials(member.name)}
    </div>

    <div className="flex-1 min-w-0">
      <p className={cn("text-sm font-medium truncate leading-tight", isSelected ? "text-primary" : "text-foreground")}>
        {member.name}
      </p>
      <p className="text-xs text-muted-foreground truncate leading-tight">{member.title}</p>
    </div>

    <div className="flex-shrink-0">
      <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", getCapacityBadgeCls(member.availableCapacity))}>
        Capacity {member.availableCapacity}%
      </span>
    </div>
  </div>;


// ─── RoleCard ─────────────────────────────────────────────────────────────────

interface RoleCardProps {
  role: LocalRole;
  assignmentMap: AssignmentMap;
  selectedMember: LocalMember | null;
  isLocked: boolean;
  pending: RolePending | null;
  onPendingChange: (p: RolePending | null) => void;
  onDeleteAssignment: (roleId: string, chairId: string) => void;
  selectedMemberId: string | null;
}

const RoleCard: React.FC<RoleCardProps> = ({
  role,
  assignmentMap,
  selectedMember,
  isLocked,
  pending,
  onPendingChange,
  onDeleteAssignment,
  selectedMemberId
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [deleteConfirm, setDeleteConfirm] = useState<{chairId: string;chairName: string;memberName: string;} | null>(null);

  const openDropdown = () => {
    if (isLocked) return;
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999
      });
    }
    setDropdownOpen(true);
  };

  const assignedInRole = role.chairs.filter((c) => !!assignmentMap[assignmentKey(role.roleId, c.id)]);
  const allFilled = assignedInRole.length >= role.chairs.length;

  const selectedMemberAlreadyInRole = selectedMember ?
  role.chairs.some((c) => assignmentMap[assignmentKey(role.roleId, c.id)]?.memberId === selectedMember.id) :
  false;

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
    <div className={cn(
      "border rounded-lg transition-all duration-200 relative",
      "border-[hsl(var(--wq-border))] bg-card"
    )}>
      {/* Role header — no team name, no chair count */}
      <div className="px-4 py-3 border-b border-[hsl(var(--wq-border))]">
        <p className="text-sm font-semibold text-primary leading-tight">{role.roleName}</p>
      </div>

      {/* Assigned chairs summary */}
      {assignedInRole.length > 0 &&
      <div className="divide-y divide-[hsl(var(--wq-border))]">
          {assignedInRole.map((chair) => {
          const existing = assignmentMap[assignmentKey(role.roleId, chair.id)];
          const isCurrentMember = existing?.memberId === selectedMemberId;

          return (
            <div
              key={chair.id}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 border-b border-[hsl(var(--wq-border))] last:border-b-0",
                "bg-primary/5"
              )}>

                {/* Chair name */}
                <span className="text-xs text-muted-foreground w-28 flex-shrink-0">{chair.name}</span>

                {/* Assigned member avatar + name */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0",
                  isCurrentMember ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20 text-muted-foreground"
                )}>
                    {getInitials(existing?.memberName ?? "")}
                  </div>
                  <span className={cn(
                  "text-sm font-medium truncate",
                  isCurrentMember ? "text-primary" : "text-foreground"
                )}>
                    {existing?.memberName}
                  </span>
                </div>

                {/* Workload */}
                <span className="text-xs font-medium text-muted-foreground flex-shrink-0">
                  {existing?.workload}%
                </span>

                {/* Trash icon — always active */}
                <button
                type="button"
                onClick={() => setDeleteConfirm({ chairId: chair.id, chairName: chair.name, memberName: existing?.memberName ?? "" })}
                className="flex-shrink-0 transition-colors p-1 rounded text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                title="Remove assignment">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>);

        })}
        </div>
      }

      {/* Delete confirmation overlay */}
      {deleteConfirm && ReactDOM.createPortal(
        <>
          <div className="fixed inset-0 z-[9997] bg-black/40" onClick={() => setDeleteConfirm(null)} />
          <div className="fixed left-1/2 top-1/2 z-[9998] -translate-x-1/2 -translate-y-1/2 bg-card border border-[hsl(var(--wq-border))] rounded-xl shadow-xl p-6 w-80">
            <h4 className="font-semibold text-foreground mb-2">Remove assignment?</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Remove <span className="font-medium text-foreground">{deleteConfirm.memberName}</span> from <span className="font-medium text-foreground">{deleteConfirm.chairName}</span> in <span className="font-medium text-foreground">{role.roleName}</span>? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  onDeleteAssignment(role.roleId, deleteConfirm.chairId);
                  setDeleteConfirm(null);
                }}>

                Remove
              </Button>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* "Member already in this role" notice */}
      {!allFilled && selectedMemberAlreadyInRole &&
      <div className="px-4 py-3 flex items-center gap-2 text-xs text-[hsl(var(--wq-text-secondary))] border-t border-[hsl(var(--wq-border))] bg-primary-foreground">
          
          



        </div>
      }

      {/* Chair selection row — shown when there are available chairs and selected member not already in role */}
      {!allFilled && !selectedMemberAlreadyInRole &&
      <div className="px-4 py-3">
          {/* Label clarifying this is additional chair selection */}
          {assignedInRole.length > 0 &&
        <p className="text-[10px] text-muted-foreground mb-2 italic">
              Additional chair selection available
            </p>
        }
          <div className="flex items-center gap-3 flex-wrap">
            {/* Chair dropdown */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <label className="text-xs font-medium text-[hsl(var(--wq-text-secondary))] whitespace-nowrap">
                Chair
              </label>
              <div className="relative flex-1">
                <button
                ref={triggerRef}
                type="button"
                onClick={() => dropdownOpen ? setDropdownOpen(false) : openDropdown()}
                disabled={isLocked}
                className={cn(
                  "w-full h-9 px-3 pr-8 border border-[hsl(var(--wq-border))] rounded-md text-sm text-left bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center",
                  selectedChairId ? "text-foreground" : "text-muted-foreground"
                )}>

                  <span className="flex-1 truncate">{selectedChairId ? selectedChairName : "Select Chair"}</span>
                </button>

                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                  {selectedChairId ?
                <button
                  type="button"
                  onClick={handleClearChair}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear chair selection">

                      <X className="w-3.5 h-3.5" />
                    </button> :

                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                }
                </div>

                {dropdownOpen && ReactDOM.createPortal(
                <>
                    <div className="fixed inset-0 z-[9998]" onClick={() => setDropdownOpen(false)} />
                    <div style={dropdownStyle} className="bg-card border border-[hsl(var(--wq-border))] rounded-md shadow-lg overflow-hidden">
                      {availableChairs.length === 0 ?
                    <p className="px-3 py-2 text-xs text-muted-foreground">No chairs available</p> :

                    availableChairs.map((chair) =>
                    <button
                      key={chair.id}
                      type="button"
                      onClick={() => handleChairSelect(chair.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm hover:bg-accent/30 transition-colors",
                        chair.id === selectedChairId ? "text-primary font-medium bg-primary/5" : "text-foreground"
                      )}>

                            {chair.name}
                          </button>
                    )
                    }
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
              className="w-16 h-9 px-2 border border-[hsl(var(--wq-border))] rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30 bg-card disabled:opacity-50" />

              <span className="text-sm text-[hsl(var(--wq-text-secondary))]">%</span>
            </div>

            {/* Notes toggle button */}
            <button
            type="button"
            disabled={isLocked || !pending}
            onClick={() => setNoteExpanded((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 h-9 rounded-md border text-xs transition-colors flex-shrink-0",
              pending?.notes ?
              "text-primary bg-primary/5 border-primary/20 hover:bg-primary/10" :
              "text-muted-foreground border-[hsl(var(--wq-border))] hover:bg-muted hover:text-foreground",
              (!pending || isLocked) && "opacity-40 cursor-not-allowed"
            )}
            title={!pending ? "Select a chair first" : pending.notes ? "View/edit notes" : "Add notes"}>

              <MessageSquare className="w-3.5 h-3.5" />
              <span className={pending?.notes ? "" : "italic opacity-60"}>Notes</span>
            </button>

            {/* Capacity warning */}
            {exceedsCapacity && !isLocked &&
          <span className="text-xs text-[hsl(38,92%,50%)] flex items-center gap-1 w-full">
                <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                Exceeds {selectedMember?.name.split(" ")[0]}'s remaining capacity ({remaining}%)
              </span>
          }

            {/* Inline notes input */}
            {noteExpanded &&
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
              }} />

              </div>
          }
          </div>
        </div>
      }
    </div>);

};

// ─── Main component ───────────────────────────────────────────────────────────

export interface Concept6MemberFirstProps {
  roles: RoleDefinition[];
  existingAssignments?: AssignmentData[];
  onComplete: (assignments: AssignmentData[]) => void;
  onCompleteWorkItem?: () => void;
  isReadOnly?: boolean;
}

export const Concept6MemberFirst: React.FC<Concept6MemberFirstProps> = ({
  roles,
  existingAssignments = [],
  onComplete,
  onCompleteWorkItem,
  isReadOnly = false
}) => {
  const localRoles: LocalRole[] = useMemo(
    () =>
    roles.map((r) => {
      // Try to find matching teamId from rolesData by teamName
      const roleData = rolesData.find((rd) => rd.name.toLowerCase() === r.roleName.toLowerCase());
      return {
        roleId: r.roleId,
        roleName: r.roleName,
        teamName: r.teamName,
        teamId: roleData?.teamId ?? "",
        chairs: buildChairsForRole(r.roleName)
      };
    }),
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
        availableCapacity: Math.max(0, 100 - baseWorkload),
        teamId: m.teamId
      };
    }).
    sort((a, b) => b.availableCapacity - a.availableCapacity);
  }, []);

  const [members, setMembers] = useState<LocalMember[]>(initialMembers);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [assignmentMap, setAssignmentMap] = useState<AssignmentMap>({});
  const [rolePendings, setRolePendings] = useState<Record<string, RolePending | null>>({});
  const [saveState, setSaveState] = useState<SaveState>(null);
  const [memberSearch, setMemberSearch] = useState("");
  const debouncedSearch = useDebounce(memberSearch, 300);
  // For the "Complete Work Item" confirmation modal
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);

  // Accordion state for greyed-out roles section (collapsed by default when > 5 roles)
  const [greyedAccordionOpen, setGreyedAccordionOpen] = useState(false);

  // Keep refs up-to-date so the unmount effect always reads the latest values
  const assignmentMapRef = useRef(assignmentMap);
  const localRolesRef = useRef(localRoles);
  const existingAssignmentsRef = useRef(existingAssignments);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {assignmentMapRef.current = assignmentMap;}, [assignmentMap]);
  useEffect(() => {localRolesRef.current = localRoles;}, [localRoles]);
  useEffect(() => {existingAssignmentsRef.current = existingAssignments;}, [existingAssignments]);
  useEffect(() => {onCompleteRef.current = onComplete;}, [onComplete]);

  // Auto-save on unmount
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
          notes: chairId
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

  // Sort roles: member's team roles first (enabled), others after (greyed)
  const { memberTeamRoles, otherRoles } = useMemo(() => {
    if (!selectedMember) {
      return { memberTeamRoles: localRoles, otherRoles: [] };
    }
    const memberTeam = selectedMember.teamId;
    const applicable = localRoles.filter((r) => !r.teamId || r.teamId === memberTeam || r.teamId === "");
    const inapplicable = localRoles.filter((r) => r.teamId && r.teamId !== memberTeam && r.teamId !== "");
    return { memberTeamRoles: applicable, otherRoles: inapplicable };
  }, [localRoles, selectedMember]);

  const useAccordion = localRoles.length > 5;

  const filteredMembers = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    const filtered = q ?
    members.filter((m) => m.name.toLowerCase().includes(q) || m.title.toLowerCase().includes(q)) :
    [...members];
    // Pin selected member to top
    if (selectedMemberId) {
      const selectedIdx = filtered.findIndex((m) => m.id === selectedMemberId);
      if (selectedIdx > 0) {
        const [selected] = filtered.splice(selectedIdx, 1);
        filtered.unshift(selected);
      }
    }
    return filtered;
  }, [members, debouncedSearch, selectedMemberId]);

  const handleSelectMember = (memberId: string) => {
    if (isReadOnly) return;
    setSaveState(null);
    setRolePendings({});
    setSelectedMemberId(memberId === selectedMemberId ? null : memberId);
  };

  const pendingRoles = useMemo(() => {
    return localRoles.filter((r) => {
      const p = rolePendings[r.roleId];
      return p && p.chairId && p.workload >= 1 && p.workload <= 100;
    });
  }, [localRoles, rolePendings]);

  const canAssignAll = selectedMember !== null && pendingRoles.length > 0 && saveState !== "saving";

  // Total assigned chairs across all roles (for progress + complete button gate)
  const totalAssignedChairs = useMemo(() => Object.keys(assignmentMap).length, [assignmentMap]);
  const totalRoles = localRoles.length;
  const assignedRolesCount = useMemo(() => {
    const roleIds = new Set(Object.keys(assignmentMap).map((k) => k.split("::")[0]));
    return roleIds.size;
  }, [assignmentMap]);

  const canCompleteWorkItem = totalAssignedChairs >= 1;

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

      newMap[key] = { memberId: selectedMember.id, memberName: selectedMember.name, workload: p.workload, notes: p.notes };

      newAssignments.push({
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
        workloadPercentage: p.workload,
        notes: p.notes || p.chairName
      });
    }

    setAssignmentMap(newMap);

    // Deduct workload from member capacity, then re-sort (assigned member moves toward bottom)
    const totalDeducted = pendingRoles.reduce((sum, r) => sum + (rolePendings[r.roleId]?.workload ?? 0), 0);
    setMembers((prev) => {
      const updated = prev.map((m) =>
      m.id === selectedMember.id ?
      { ...m, availableCapacity: Math.max(0, m.availableCapacity - totalDeducted) } :
      m
      );
      // Re-sort by capacity: most available first; member who just got assigned naturally moves down
      return [...updated].sort((a, b) => {
        // Keep selected pinned at top for now; resort will happen on next selection
        if (a.id === selectedMember.id) return -1;
        if (b.id === selectedMember.id) return 1;
        return b.availableCapacity - a.availableCapacity;
      });
    });

    if (newAssignments.length > 0) {
      onComplete([...existingAssignments, ...newAssignments]);
    }

    setRolePendings((prev) => {
      const updated = { ...prev };
      pendingRoles.forEach((r) => {updated[r.roleId] = null;});
      return updated;
    });

    setSaveState("success");
    // After success, deselect member so list re-sorts properly
    setTimeout(() => {
      setSaveState(null);
      setSelectedMemberId(null);
      setMembers((prev) =>
      [...prev].sort((a, b) => b.availableCapacity - a.availableCapacity)
      );
    }, 1500);
  }, [selectedMember, pendingRoles, rolePendings, assignmentMap, existingAssignments, onComplete]);

  const handleDeleteAssignment = useCallback((roleId: string, chairId: string) => {
    const key = assignmentKey(roleId, chairId);
    const existing = assignmentMap[key];
    if (!existing) return;
    // Restore capacity to the member
    setMembers((prev) =>
    prev.map((m) =>
    m.id === existing.memberId ?
    { ...m, availableCapacity: Math.min(100, m.availableCapacity + existing.workload) } :
    m
    )
    );
    setAssignmentMap((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  }, [assignmentMap]);

  const handleCompleteWorkItemClick = () => {
    setShowCompleteConfirm(true);
  };

  const handleConfirmComplete = () => {
    setShowCompleteConfirm(false);
    onCompleteWorkItem?.();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ── Instruction callout ── */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-[hsl(var(--wq-border))] bg-card text-xs text-muted-foreground">
        <Info className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span>Assign at least one role and chair to complete this work item.</span>
      </div>

      <div className="flex gap-6 min-w-0">
        {/* ── LEFT: Team Members (40%) ── */}
        <div className="w-[40%] flex-shrink-0">
          <div className="bg-card rounded-lg border border-[hsl(var(--wq-border))] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--wq-border))]">
              <div>
                <h3 className="text-primary font-bold text-sm">Team Members</h3>
                <p className="text-xs text-[hsl(var(--wq-text-secondary))] mt-0.5">
                  {members.length} members · sorted by availability
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
                onSelect={() => handleSelectMember(member.id)} />

              )}
              {filteredMembers.length === 0 &&
              <p className="text-sm text-[hsl(var(--wq-text-secondary))] text-center py-8">No members found</p>
              }
            </div>
          </div>
        </div>

        {/* ── RIGHT: Role Assignments (60%) ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-0">
          <div className="bg-card rounded-lg border border-[hsl(var(--wq-border))] overflow-hidden flex flex-col">
            {/* Right panel header — member context moved here, not as section title */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--wq-border))]">
              <div className="min-w-0">
                <h3 className="text-primary font-bold text-sm">Role Assignments</h3>
                <p className="text-xs text-[hsl(var(--wq-text-secondary))] mt-0.5">
                  All roles across this work item
                </p>
              </div>
            </div>

            {/* Minimum requirement note */}
            {totalAssignedChairs === 0




            }

            <div className={cn("p-4 flex flex-col gap-3", !selectedMember && "opacity-50 pointer-events-none")}>
              {!selectedMember &&
              <div className="flex items-center gap-2 py-6 justify-center text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  Select a team member on the left to begin assigning roles
                </div>
              }

              {selectedMember &&
              <>
                  {/* Applicable roles for selected member's team */}
                  {memberTeamRoles.map((role) =>
                <RoleCard
                  key={role.roleId}
                  role={role}
                  assignmentMap={assignmentMap}
                  selectedMember={selectedMember}
                  isLocked={false}
                  pending={rolePendings[role.roleId] ?? null}
                  onPendingChange={(p) =>
                  setRolePendings((prev) => ({ ...prev, [role.roleId]: p }))
                  }
                  onDeleteAssignment={handleDeleteAssignment}
                  selectedMemberId={selectedMemberId} />

                )}

                  {/* Greyed-out roles not applicable to member's team */}
                  {otherRoles.length > 0 &&
                <div className="mt-1">
                      {useAccordion ?
                  <button
                    type="button"
                    onClick={() => setGreyedAccordionOpen((v) => !v)}
                    className="flex items-center gap-2 text-xs text-muted-foreground mb-2 hover:text-foreground transition-colors">

                          {greyedAccordionOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          <span className="font-medium">{otherRoles.length} role{otherRoles.length !== 1 ? "s" : ""} not available for this member</span>
                          <Info className="w-3 h-3" />
                        </button> :

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                          <Info className="w-3 h-3 flex-shrink-0" />
                          <span>The following roles are not associated with this member's team and cannot be assigned.</span>
                        </div>
                  }

                      {(!useAccordion || greyedAccordionOpen) &&
                  <div className="flex flex-col gap-3">
                          {otherRoles.map((role) =>
                    <div
                      key={role.roleId}
                      className="border border-[hsl(var(--wq-border))] rounded-lg bg-muted/30 opacity-50 pointer-events-none">

                              <div className="px-4 py-3">
                                <p className="text-sm font-semibold text-muted-foreground leading-tight">{role.roleName}</p>
                              </div>
                            </div>
                    )}
                        </div>
                  }
                    </div>
                }
                </>
              }

              {localRoles.length === 0 &&
              <p className="text-sm text-[hsl(var(--wq-text-secondary))] text-center py-8">
                  No roles configured for this work item.
                </p>
              }
            </div>

            {/* ── Single Assign button at the bottom ── */}
            <div className="px-4 pb-4 pt-1 border-t border-[hsl(var(--wq-border))] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs">
                {saveState === "saving" &&
                <span className="text-[hsl(var(--wq-text-secondary))] flex items-center gap-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…
                  </span>
                }
                {saveState === "success" &&
                <span className="text-[hsl(142,71%,45%)] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                  </span>
                }
                {saveState === "error" &&
                <button
                  onClick={handleAssignAll}
                  className="text-destructive flex items-center gap-1 hover:underline">

                    <XCircle className="w-3.5 h-3.5" /> Failed —{" "}
                    <RefreshCw className="w-3.5 h-3.5" /> Retry
                  </button>
                }
                {pendingRoles.length > 0 && saveState === null &&
                <span className="text-[hsl(var(--wq-text-secondary))]">
                    {pendingRoles.length} role{pendingRoles.length > 1 ? "s" : ""} ready to assign
                  </span>
                }
              </div>

              <Button
                disabled={!canAssignAll || isReadOnly}
                onClick={handleAssignAll}
                className="h-9 px-6">

                {saveState === "saving" ?
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> :

                "Assign"
                }
              </Button>
            </div>
          </div>

          {/* Complete Work Item section */}
          <div className="mt-4 flex flex-col gap-2">
          </div>
        </div>
      </div>

      {/* ── Confirmation modal for Complete Work Item ── */}
      {showCompleteConfirm && ReactDOM.createPortal(
        <>
          <div className="fixed inset-0 z-[9997] bg-black/40" onClick={() => setShowCompleteConfirm(false)} />
          <div className="fixed left-1/2 top-1/2 z-[9998] -translate-x-1/2 -translate-y-1/2 bg-card border border-[hsl(var(--wq-border))] rounded-xl shadow-xl p-6 w-96">
            <h4 className="font-semibold text-foreground text-base mb-2">Complete work item?</h4>
            <p className="text-sm text-muted-foreground mb-1">
              Once completed, <span className="font-medium text-foreground">no further changes</span> can be made to this work item.
            </p>
            <p className="text-sm text-muted-foreground mb-5">
              This will lock all assignments and mark the work item as complete.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowCompleteConfirm(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-[hsl(142,71%,38%)] hover:bg-[hsl(142,71%,32%)] text-white"
                onClick={handleConfirmComplete}>

                <Check className="w-3.5 h-3.5" />
                Confirm & Complete
              </Button>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>);

};