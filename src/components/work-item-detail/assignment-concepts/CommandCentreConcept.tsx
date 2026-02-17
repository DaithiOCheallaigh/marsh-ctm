import { useState, useMemo, useCallback } from "react";
import {
  Search, X, Check, AlertTriangle, Zap, Trash2, ArrowUpDown,
  Users, Table2, Info } from
"lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from
"@/components/ui/select";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from
"@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { useToast } from "@/hooks/use-toast";
import { RoleDefinition, AssignmentData, getMatchBadge } from "./types";

// ─── Placeholder data ───────────────────────────────────────────────
interface PlaceholderMember {
  id: string;
  name: string;
  title: string;
  matchScores: Record<string, number>; // roleId → score
  location: string;
  available: number;
  locationMatch: boolean;
  expertiseMatch: boolean;
  capacityMatch: boolean;
}

const PLACEHOLDER_MEMBERS: PlaceholderMember[] = [
{ id: "ph-1", name: "Jennifer Walsh", title: "Claims Specialist", matchScores: { "sr-acct-mgr": 92, "risk-eng": 70, "claims-spec": 95 }, location: "Miami, USA", available: 100, locationMatch: true, expertiseMatch: true, capacityMatch: true },
{ id: "ph-2", name: "Lisa Park", title: "Underwriter", matchScores: { "sr-acct-mgr": 89, "risk-eng": 80, "claims-spec": 72 }, location: "Chicago, USA", available: 85, locationMatch: true, expertiseMatch: true, capacityMatch: true },
{ id: "ph-3", name: "Robert Wilson", title: "Account Executive", matchScores: { "sr-acct-mgr": 76, "risk-eng": 85, "claims-spec": 60 }, location: "Houston, USA", available: 100, locationMatch: true, expertiseMatch: true, capacityMatch: true },
{ id: "ph-4", name: "Emily Richardson", title: "Senior Underwriter", matchScores: { "sr-acct-mgr": 74, "risk-eng": 68, "claims-spec": 78 }, location: "Boston, USA", available: 100, locationMatch: false, expertiseMatch: true, capacityMatch: true },
{ id: "ph-5", name: "Marcus Chen", title: "Risk Analyst", matchScores: { "sr-acct-mgr": 68, "risk-eng": 90, "claims-spec": 55 }, location: "New York, USA", available: 60, locationMatch: true, expertiseMatch: false, capacityMatch: true }];


interface RoleWithChairs {
  roleId: string;
  roleName: string;
  category: string;
  chairCount: number;
  chairs: {id: string;name: string;description: string;}[];
}

const PLACEHOLDER_ROLES: RoleWithChairs[] = [
{
  roleId: "sr-acct-mgr", roleName: "Senior Account Manager", category: "Property Risk", chairCount: 5,
  chairs: [
  { id: "c1", name: "Account Lead", description: "Primary client relationship owner, strategic decisions, contract negotiations" },
  { id: "c2", name: "Strategic Advisor", description: "Long-term risk strategy, portfolio optimisation, executive stakeholder management" },
  { id: "c3", name: "Renewal Coordinator", description: "Policy renewal management, terms negotiation, documentation oversight" },
  { id: "c4", name: "Client Service Lead", description: "Day-to-day client communication, issue resolution, service delivery" },
  { id: "c5", name: "Technical Specialist", description: "Complex risk analysis, specialised property coverage design" }]

},
{
  roleId: "risk-eng", roleName: "Risk Engineer", category: "Property Risk", chairCount: 4,
  chairs: [
  { id: "c6", name: "Lead Engineer", description: "Primary risk assessment lead, inspection scheduling" },
  { id: "c7", name: "Field Engineer", description: "On-site inspections, data collection" },
  { id: "c8", name: "Technical Reviewer", description: "Report quality assurance, technical accuracy" },
  { id: "c9", name: "CAT Specialist", description: "Catastrophe modeling, natural disaster risk" }]

},
{
  roleId: "claims-spec", roleName: "Claims Specialist", category: "General Liability", chairCount: 4,
  chairs: [
  { id: "c10", name: "Lead Adjuster", description: "Primary claims handler, settlement authority" },
  { id: "c11", name: "Investigation Lead", description: "Claims investigation, evidence gathering" },
  { id: "c12", name: "Subrogation Specialist", description: "Recovery actions, third-party pursuit" },
  { id: "c13", name: "Documentation Analyst", description: "Claims file management, compliance" }]

}];


// ─── Row type ────────────────────────────────────────────────────────
interface TableRow {
  id: string;
  memberId: string;
  memberName: string;
  roleId: string;
  chairId: string;
  workload: number;
  isSuggested: boolean;
}

type RowStatus = "ready" | "incomplete" | "conflict";

// ─── Role abbreviation helper ────────────────────────────────────────
const ROLE_ABBR: Record<string, string> = {
  "sr-acct-mgr": "SAM",
  "risk-eng": "RE",
  "claims-spec": "CS"
};

// ─── Component ──────────────────────────────────────────────────────
interface CommandCentreConceptProps {
  availableRoles: RoleDefinition[];
  existingAssignments?: AssignmentData[];
  onComplete: (assignments: AssignmentData[]) => void;
  isReadOnly?: boolean;
}

export const CommandCentreConcept = ({
  existingAssignments = [],
  onComplete,
  isReadOnly = false
}: CommandCentreConceptProps) => {
  const { toast } = useToast();
  const roles = PLACEHOLDER_ROLES;
  const members = PLACEHOLDER_MEMBERS;
  const totalChairs = roles.reduce((s, r) => s + r.chairCount, 0);

  // ── State ──
  const [rows, setRows] = useState<TableRow[]>([]);
  const [activeRoleFilter, setActiveRoleFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const [batchRoleId, setBatchRoleId] = useState("");
  const [batchChairId, setBatchChairId] = useState("");
  const [batchWorkload, setBatchWorkload] = useState(20);
  const [sortAsc, setSortAsc] = useState(true);
  const [showQuickAssignBanner, setShowQuickAssignBanner] = useState(false);
  const [showConfirmBanner, setShowConfirmBanner] = useState(false);

  // ── Helpers ──
  const getChairsForRole = (roleId: string) =>
  roles.find((r) => r.roleId === roleId)?.chairs || [];

  const getRowStatus = useCallback(
    (row: TableRow): RowStatus => {
      if (!row.roleId || !row.chairId) return "incomplete";
      // conflict: member total workload > 100
      const member = members.find((m) => m.id === row.memberId);
      if (member) {
        const total = rows.
        filter((r) => r.memberId === row.memberId).
        reduce((s, r) => s + r.workload, 0);
        const projected = 100 - member.available + total;
        if (projected > 100) return "conflict";
      }
      return "ready";
    },
    [rows, members]
  );

  const filledChairs = useMemo(() => {
    return rows.filter((r) => r.roleId && r.chairId).length;
  }, [rows]);

  const assignedCountByRole = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of rows) {
      if (r.roleId && r.chairId) {
        map[r.roleId] = (map[r.roleId] || 0) + 1;
      }
    }
    return map;
  }, [rows]);

  // pill state for a role
  const getRolePillState = (roleId: string) => {
    const assigned = assignedCountByRole[roleId] || 0;
    const total = roles.find((r) => r.roleId === roleId)?.chairCount || 0;
    if (assigned >= total) return "complete";
    if (assigned > 0) return "in-progress";
    return "not-started";
  };

  // member assignment status
  const getMemberStatus = (memberId: string) => {
    const memberRows = rows.filter((r) => r.memberId === memberId);
    if (memberRows.length === 0) return "unassigned";
    const allReady = memberRows.every((r) => getRowStatus(r) === "ready");
    return allReady ? "assigned" : "partial";
  };

  // ── Filtered members ──
  const filteredMembers = useMemo(() => {
    let list = [...members];
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (m) =>
        m.name.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q) ||
        m.location.toLowerCase().includes(q)
      );
    }
    if (activeRoleFilter) {
      list.sort((a, b) => (b.matchScores[activeRoleFilter] || 0) - (a.matchScores[activeRoleFilter] || 0));
    }
    return list;
  }, [debouncedSearch, members, activeRoleFilter]);

  // ── Sorted rows ──
  const sortedRows = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const rA = roles.find((r) => r.roleId === a.roleId)?.roleName || "";
      const rB = roles.find((r) => r.roleId === b.roleId)?.roleName || "";
      return sortAsc ? rA.localeCompare(rB) : rB.localeCompare(rA);
    });
    return copy;
  }, [rows, sortAsc, roles]);

  // ── Has any issues ──
  const hasIssues = useMemo(() => {
    return rows.some((r) => {
      const s = getRowStatus(r);
      return s === "incomplete" || s === "conflict";
    });
  }, [rows, getRowStatus]);

  // ── Actions ──
  const addRow = (memberId: string, roleId = "", chairId = "", workload = 20, suggested = false) => {
    const member = members.find((m) => m.id === memberId)!;
    setRows((prev) => [
    ...prev,
    {
      id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      memberId,
      memberName: member.name,
      roleId,
      chairId,
      workload,
      isSuggested: suggested
    }]
    );
  };

  const removeRow = (id: string) => setRows((prev) => prev.filter((r) => r.id !== id));

  const updateRow = (id: string, updates: Partial<TableRow>) => {
    setRows((prev) =>
    prev.map((r) =>
    r.id === id ? { ...r, ...updates, isSuggested: false } : r
    )
    );
  };

  const clearAll = () => {
    setRows([]);
    setShowQuickAssignBanner(false);
  };

  // ── Quick Assign ──
  const handleQuickAssign = () => {
    const newRows: TableRow[] = [];
    for (const role of roles) {
      for (const chair of role.chairs) {
        // already assigned?
        const existing = rows.find((r) => r.roleId === role.roleId && r.chairId === chair.id);
        if (existing) continue;
        // find best match member not already used
        const usedIds = new Set([...rows.map((r) => r.memberId), ...newRows.map((r) => r.memberId)]);
        const best = [...members].
        filter((m) => !usedIds.has(m.id)).
        sort((a, b) => (b.matchScores[role.roleId] || 0) - (a.matchScores[role.roleId] || 0))[0];
        if (best) {
          newRows.push({
            id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            memberId: best.id,
            memberName: best.name,
            roleId: role.roleId,
            chairId: chair.id,
            workload: 20,
            isSuggested: true
          });
        }
      }
    }
    setRows((prev) => [...prev, ...newRows]);
    setShowQuickAssignBanner(true);
    toast({ title: "Quick Assign", description: `Suggested ${newRows.length} assignments based on match scores.` });
  };

  // ── Batch assign ──
  const handleBatchAssign = () => {
    if (!batchRoleId || !batchChairId) return;
    selectedMemberIds.forEach((mid) => {
      addRow(mid, batchRoleId, batchChairId, batchWorkload);
    });
    toast({ title: "Batch Assigned", description: `${selectedMemberIds.size} members assigned.` });
    setSelectedMemberIds(new Set());
    setBatchRoleId("");
    setBatchChairId("");
    setBatchWorkload(20);
  };

  const toggleMember = (id: string) => {
    const next = new Set(selectedMemberIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedMemberIds(next);
  };

  // ── Complete ──
  const handleComplete = () => {
    const output: AssignmentData[] = rows.
    filter((r) => r.roleId && r.chairId).
    map((r) => ({
      roleId: r.roleId,
      roleName: roles.find((rl) => rl.roleId === r.roleId)?.roleName || "",
      selectedPerson: { id: r.memberId, name: r.memberName },
      chairType: "Primary" as const,
      workloadPercentage: r.workload,
      notes: getChairsForRole(r.roleId).find((c) => c.id === r.chairId)?.name || ""
    }));
    onComplete(output);
    setShowConfirmBanner(false);
    toast({ title: "Assignments Complete", description: `${output.length} assignments saved.` });
  };

  // ── Conflict tooltip text ──
  const getConflictTooltip = (row: TableRow) => {
    const total = rows.filter((r) => r.memberId === row.memberId).reduce((s, r) => s + r.workload, 0);
    const member = members.find((m) => m.id === row.memberId);
    const projected = member ? 100 - member.available + total : total;
    return `${row.memberName}'s total assigned workload is ${projected}%. Adjust workload % to resolve.`;
  };

  // ── Open chairs remaining ──
  const openChairs = totalChairs - filledChairs;

  // ── Availability badge color ──
  const availColor = (pct: number) => {
    if (pct >= 80) return "bg-[hsl(var(--wq-status-completed-bg))] text-[hsl(var(--wq-status-completed-text))]";
    if (pct >= 50) return "bg-[hsl(var(--wq-status-warning-bg))] text-[hsl(var(--wq-status-warning-text))]";
    return "bg-[hsl(var(--wq-priority-high-bg))] text-[hsl(var(--wq-priority-high-text))]";
  };

  return (
    <div className="space-y-0">
      {/* ── Zone 1: Role Progress Rail ── */}
      <div className="flex items-center gap-2 p-3 bg-white border border-[hsl(var(--wq-border))] rounded-xl mb-4 flex-wrap">
        {/* All Roles pill */}
        <button
          type="button"
          onClick={() => setActiveRoleFilter(null)}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap",
            !activeRoleFilter ?
            "border-[hsl(220,50%,20%)] bg-[hsl(220,50%,20%)] text-white" :
            "border-[hsl(var(--wq-border))] text-[hsl(var(--wq-text-secondary))] hover:border-[hsl(220,50%,20%)]"
          )}>

          All Roles
        </button>
        {roles.map((role) => {
          const assigned = assignedCountByRole[role.roleId] || 0;
          const state = getRolePillState(role.roleId);
          const isActive = activeRoleFilter === role.roleId;
          return (
            <button
              key={role.roleId}
              type="button"
              onClick={() => setActiveRoleFilter(role.roleId)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap flex items-center gap-1.5",
                isActive && "border-[hsl(220,50%,20%)] ring-2 ring-[hsl(220,50%,20%)]/20",
                state === "complete" ?
                "bg-[hsl(var(--wq-status-completed-bg))] border-[hsl(var(--wq-status-completed-text))] text-[hsl(var(--wq-status-completed-text))]" :
                state === "in-progress" ?
                "bg-[hsl(var(--wq-status-warning-bg))] border-[hsl(var(--wq-status-warning-border))] text-[hsl(var(--wq-status-warning-text))]" :
                "border-[hsl(var(--wq-border))] text-[hsl(var(--wq-text-secondary))]"
              )}>

              {state === "complete" && <Check className="w-3 h-3" />}
              {role.roleName} {assigned}/{role.chairCount}
            </button>);

        })}
      </div>


      {/* ── Quick Assign banner ── */}
      {showQuickAssignBanner &&
      <div className="p-3 mb-4 bg-[hsl(var(--wq-status-warning-bg))] border border-[hsl(var(--wq-status-warning-border))] rounded-lg text-sm text-[hsl(var(--wq-status-warning-text))] flex items-center gap-2">
          <Zap className="w-4 h-4 flex-shrink-0" />
          Quick Assign has suggested {rows.filter((r) => r.isSuggested).length} assignments based on match scores. Review and edit before saving.
        </div>
      }

      {/* ── Zone 2: Main Workspace ── */}
      <div className="grid grid-cols-[2fr_3fr] gap-4">
        {/* ─ Left: Member Pool ─ */}
        <div className="border border-[hsl(var(--wq-border))] rounded-xl bg-white flex flex-col relative">
          <div className="p-4 border-b border-[hsl(var(--wq-border))]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[hsl(var(--wq-text-secondary))]" />
                <h4 className="font-semibold text-[hsl(220,50%,20%)]">Member Pool</h4>
                <Badge variant="secondary" className="text-[10px]">{filteredMembers.length} members</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, role, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm" />

              </div>
              <Select value={activeRoleFilter || "all"} onValueChange={(v) => setActiveRoleFilter(v === "all" ? null : v)}>
                <SelectTrigger className="w-[180px] h-9 text-xs">
                  <SelectValue placeholder="Best match for:" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Members</SelectItem>
                  {roles.map((r) =>
                  <SelectItem key={r.roleId} value={r.roleId}>{r.roleName}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[520px]">
            {filteredMembers.map((member) => {
              const isSelected = selectedMemberIds.has(member.id);
              const status = getMemberStatus(member.id);

              return (
                <div
                  key={member.id}
                  className={cn(
                    "px-3 py-2 rounded-lg border transition-all flex items-center gap-3",
                    isSelected ?
                    "border-primary ring-2 ring-primary/20 bg-white" :
                    "border-[hsl(var(--wq-border))] hover:border-primary/40 bg-white"
                  )}>

                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleMember(member.id)}
                    disabled={isReadOnly} />

                  <div className="flex-1 min-w-0 flex items-center justify-between">
                    <div className="truncate">
                      <span className="font-medium text-sm text-[hsl(220,50%,20%)]">{member.name}</span>
                      <p className="text-xs text-[hsl(var(--wq-text-secondary))] truncate">{member.title}</p>
                    </div>
                    <span className={cn("text-xs font-semibold flex-shrink-0 ml-2", availColor(member.available))}>
                      {member.available}% Capacity
                    </span>
                </div>
                </div>);

            })}
          </div>

          {/* Batch assign bar */}
          {selectedMemberIds.size > 0 &&
          <div className="border-t border-[hsl(var(--wq-border))] p-3 bg-[hsl(var(--wq-bg-header))] rounded-b-xl">
              <p className="text-xs font-semibold text-[hsl(220,50%,20%)] mb-2">
                {selectedMemberIds.size} member{selectedMemberIds.size > 1 ? "s" : ""} selected — Assign to:
              </p>
              <div className="flex gap-2 items-end">
                <Select value={batchRoleId} onValueChange={(v) => {setBatchRoleId(v);setBatchChairId("");}}>
                  <SelectTrigger className="h-8 text-xs flex-1"><SelectValue placeholder="Role" /></SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => <SelectItem key={r.roleId} value={r.roleId}>{r.roleName}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={batchChairId} onValueChange={setBatchChairId} disabled={!batchRoleId}>
                  <SelectTrigger className="h-8 text-xs flex-1"><SelectValue placeholder="Chair" /></SelectTrigger>
                  <SelectContent>
                    {getChairsForRole(batchRoleId).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input
                type="number" min={1} max={100} value={batchWorkload}
                onChange={(e) => setBatchWorkload(parseInt(e.target.value) || 20)}
                className="h-8 w-16 text-xs" />

                <Button
                size="sm" className="h-8 text-xs bg-[hsl(220,50%,20%)] hover:bg-[hsl(220,50%,15%)] text-white"
                onClick={handleBatchAssign}
                disabled={!batchRoleId || !batchChairId}>

                  Assign
                </Button>
              </div>
            </div>
          }
        </div>

        {/* ─ Right: Assignment Table ─ */}
        <div className="border border-[hsl(var(--wq-border))] rounded-xl bg-white flex flex-col">
          <div className="p-4 border-b border-[hsl(var(--wq-border))] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Table2 className="w-4 h-4 text-[hsl(var(--wq-text-secondary))]" />
              <h4 className="font-semibold text-[hsl(220,50%,20%)]">Assignments</h4>
              <Badge variant="secondary" className="text-[10px]">{rows.length} assignment{rows.length !== 1 ? "s" : ""}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline" size="sm"
                className="h-8 text-xs border-[hsl(220,50%,20%)] text-[hsl(220,50%,20%)]"
                onClick={handleQuickAssign}
                disabled={isReadOnly}>

                <Zap className="w-3 h-3 mr-1" /> Quick Assign
              </Button>
              {rows.length > 0 &&
              <Button
                variant="outline" size="sm"
                className="h-8 text-xs border-destructive text-destructive"
                onClick={clearAll}
                disabled={isReadOnly}>

                  <Trash2 className="w-3 h-3 mr-1" /> Clear All
                </Button>
              }
            </div>
          </div>

          {/* Confirm banner */}
          {showConfirmBanner &&
          <div className="p-3 bg-[hsl(var(--wq-status-completed-bg))] border-b border-[hsl(var(--wq-status-completed-text))] text-sm flex items-center justify-between">
              <span className="text-[hsl(var(--wq-status-completed-text))]">
                You're about to save {rows.filter((r) => r.roleId && r.chairId).length} assignments across {new Set(rows.filter((r) => r.roleId).map((r) => r.roleId)).size} roles. This cannot be undone.
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowConfirmBanner(false)}>Cancel</Button>
                <Button size="sm" className="h-7 text-xs bg-[hsl(var(--wq-status-completed-text))] hover:bg-[hsl(120,100%,22%)] text-white" onClick={handleComplete}>
                  Confirm & Complete
                </Button>
              </div>
            </div>
          }

          <div className="flex-1 overflow-y-auto max-h-[520px]">
            {rows.length === 0 ?
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                <Table2 className="w-10 h-10 mb-2 opacity-20" />
                <p className="text-sm">No assignments yet.</p>
                <p className="text-xs mt-1">Select members from the pool or use Quick Assign to get started.</p>
              </div> :

            <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--wq-border))] bg-[hsl(var(--wq-bg-header))]">
                    <th className="text-left px-3 py-2 text-xs font-semibold text-[hsl(var(--wq-text-secondary))]">Member</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-[hsl(var(--wq-text-secondary))] cursor-pointer select-none" onClick={() => setSortAsc(!sortAsc)}>
                      <span className="flex items-center gap-1">Role <ArrowUpDown className="w-3 h-3" /></span>
                    </th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-[hsl(var(--wq-text-secondary))]">Chair</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-[hsl(var(--wq-text-secondary))] w-20">Workload %</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-[hsl(var(--wq-text-secondary))]">Status</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRows.map((row) => {
                  const status = getRowStatus(row);
                  const highlighted = activeRoleFilter && row.roleId === activeRoleFilter;
                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        "border-b border-[hsl(var(--wq-border))] transition-colors",
                        highlighted ? "bg-[hsl(var(--wq-bg-header))]" : "hover:bg-[hsl(var(--wq-bg-hover))]"
                      )}>

                        {/* Member */}
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[hsl(220,50%,20%)] text-white flex items-center justify-center text-[10px] font-semibold flex-shrink-0">
                              {row.memberName.charAt(0)}
                            </div>
                            <span className="font-medium text-[hsl(220,50%,20%)] text-xs">{row.memberName}</span>
                          </div>
                        </td>
                        {/* Role */}
                        <td className="px-3 py-2">
                          <Select value={row.roleId} onValueChange={(v) => updateRow(row.id, { roleId: v, chairId: "" })} disabled={isReadOnly}>
                            <SelectTrigger className="h-7 text-xs border-dashed"><SelectValue placeholder="Select role" /></SelectTrigger>
                            <SelectContent>
                              {roles.map((r) => <SelectItem key={r.roleId} value={r.roleId}>{r.roleName}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </td>
                        {/* Chair */}
                        <td className="px-3 py-2">
                          <Select value={row.chairId} onValueChange={(v) => updateRow(row.id, { chairId: v })} disabled={isReadOnly || !row.roleId}>
                            <SelectTrigger className="h-7 text-xs border-dashed"><SelectValue placeholder="Select chair" /></SelectTrigger>
                            <SelectContent>
                              {getChairsForRole(row.roleId).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </td>
                        {/* Workload */}
                        <td className="px-3 py-2">
                          <Input
                          type="number" min={1} max={100}
                          value={row.workload}
                          onChange={(e) => updateRow(row.id, { workload: parseInt(e.target.value) || 0 })}
                          onFocus={(e) => e.target.select()}
                          disabled={isReadOnly}
                          className="h-7 w-16 text-xs" />

                        </td>
                        {/* Status */}
                        <td className="px-3 py-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1">
                                  {row.isSuggested ?
                                <Badge className="text-[10px] bg-[hsl(var(--wq-status-warning-bg))] text-[hsl(var(--wq-status-warning-text))] border-[hsl(var(--wq-status-warning-border))]">
                                      Suggested
                                    </Badge> :
                                status === "ready" ?
                                <Badge className="text-[10px] bg-[hsl(var(--wq-status-completed-bg))] text-[hsl(var(--wq-status-completed-text))] border-[hsl(var(--wq-status-completed-text))]">
                                      <Check className="w-3 h-3 mr-0.5" /> Ready
                                    </Badge> :
                                status === "conflict" ?
                                <Badge className="text-[10px] bg-[hsl(var(--wq-priority-high-bg))] text-[hsl(var(--wq-priority-high-text))] border-[hsl(var(--wq-priority-high-text))]">
                                      <AlertTriangle className="w-3 h-3 mr-0.5" /> Conflict
                                    </Badge> :

                                <Badge className="text-[10px] bg-[hsl(var(--wq-status-warning-bg))] text-[hsl(var(--wq-status-warning-text))] border-[hsl(var(--wq-status-warning-border))]">
                                      Incomplete
                                    </Badge>
                                }
                                </div>
                              </TooltipTrigger>
                              {status === "conflict" &&
                            <TooltipContent><p className="text-xs max-w-[200px]">{getConflictTooltip(row)}</p></TooltipContent>
                            }
                            </Tooltip>
                          </TooltipProvider>
                        </td>
                        {/* Remove */}
                        <td className="px-2 py-2">
                          <button
                          onClick={() => removeRow(row.id)}
                          disabled={isReadOnly}
                          className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-destructive transition-colors">

                            <X className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>);

                })}
                </tbody>
              </table>
            }
          </div>
        </div>
      </div>

      {/* ── Zone 3: Sticky Bottom Bar ── */}
      <div className="mt-4 p-4 bg-white border border-[hsl(var(--wq-border))] rounded-xl flex items-center justify-between my-[24px]">
        <span className="text-sm text-[hsl(var(--wq-text-secondary))]">
          <span className="font-semibold text-[hsl(220,50%,20%)]">{filledChairs} of {totalChairs}</span> total chairs filled across {roles.length} roles
        </span>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary/5"
            onClick={() => {
              toast({ title: "Progress Saved", description: `${filledChairs} assignments saved.` });
            }}
            disabled={isReadOnly || rows.length === 0}>

            Save Progress
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    className={cn(
                      "bg-[hsl(var(--wq-status-completed-text))] hover:bg-[hsl(120,100%,22%)] text-white",
                      hasIssues && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => !hasIssues && setShowConfirmBanner(true)}
                    disabled={isReadOnly || rows.length === 0 || hasIssues}>

                    Complete All Assignments
                  </Button>
                </span>
              </TooltipTrigger>
              {hasIssues &&
              <TooltipContent>
                  <p className="text-xs">Resolve all incomplete or conflicting rows to continue.</p>
                </TooltipContent>
              }
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>);

};