import { useState, useMemo } from "react";
import {
  Search, User, CheckCircle2, AlertCircle, X, ChevronDown, ChevronUp,
  Save, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { RoleDefinition, AssignmentData, getMatchBadge } from "./types";

// Placeholder team members per spec
interface PlaceholderMember {
  id: string;
  name: string;
  title: string;
  matchScore: number;
  location: string;
  available: number;
  locationMatch: boolean;
  expertiseMatch: boolean;
  capacityMatch: boolean;
}

const PLACEHOLDER_MEMBERS: PlaceholderMember[] = [
  { id: "ph-1", name: "Jennifer Walsh", title: "Claims Specialist", matchScore: 92, location: "Miami, USA", available: 100, locationMatch: true, expertiseMatch: true, capacityMatch: true },
  { id: "ph-2", name: "Lisa Park", title: "Underwriter", matchScore: 89, location: "Chicago, USA", available: 85, locationMatch: true, expertiseMatch: true, capacityMatch: true },
  { id: "ph-3", name: "Robert Wilson", title: "Account Executive", matchScore: 76, location: "Houston, USA", available: 100, locationMatch: true, expertiseMatch: true, capacityMatch: true },
  { id: "ph-4", name: "Emily Richardson", title: "Senior Underwriter", matchScore: 74, location: "Boston, USA", available: 100, locationMatch: false, expertiseMatch: true, capacityMatch: true },
  { id: "ph-5", name: "Marcus Chen", title: "Risk Analyst", matchScore: 68, location: "New York, USA", available: 60, locationMatch: true, expertiseMatch: false, capacityMatch: true },
];

// Placeholder roles per spec
const PLACEHOLDER_ROLES = [
  { roleId: "sr-acct-mgr", roleName: "Senior Account Manager", category: "Property Risk", chairCount: 5 },
  { roleId: "risk-eng", roleName: "Risk Engineer", category: "Property Risk", chairCount: 4 },
  { roleId: "claims-spec", roleName: "Claims Specialist", category: "General Liability", chairCount: 4 },
];

// Chairs for Senior Account Manager per spec
const ROLE_CHAIRS: Record<string, { id: string; name: string; description: string }[]> = {
  "sr-acct-mgr": [
    { id: "c1", name: "Account Lead", description: "Primary client relationship owner, strategic decisions, contract negotiations" },
    { id: "c2", name: "Strategic Advisor", description: "Long-term risk strategy, portfolio optimisation, executive stakeholder management" },
    { id: "c3", name: "Renewal Coordinator", description: "Policy renewal management, terms negotiation, documentation oversight" },
    { id: "c4", name: "Client Service Lead", description: "Day-to-day client communication, issue resolution, service delivery" },
    { id: "c5", name: "Technical Specialist", description: "Complex risk analysis, specialised property coverage design" },
  ],
  "risk-eng": [
    { id: "c6", name: "Lead Engineer", description: "Primary risk assessment lead, inspection scheduling" },
    { id: "c7", name: "Field Engineer", description: "On-site inspections, data collection" },
    { id: "c8", name: "Technical Reviewer", description: "Report quality assurance, technical accuracy" },
    { id: "c9", name: "CAT Specialist", description: "Catastrophe modeling, natural disaster risk" },
  ],
  "claims-spec": [
    { id: "c10", name: "Lead Adjuster", description: "Primary claims handler, settlement authority" },
    { id: "c11", name: "Investigation Lead", description: "Claims investigation, evidence gathering" },
    { id: "c12", name: "Subrogation Specialist", description: "Recovery actions, third-party pursuit" },
    { id: "c13", name: "Documentation Analyst", description: "Claims file management, compliance" },
  ],
};

interface ConfigRow {
  memberId: string;
  memberName: string;
  memberTitle: string;
  roleId: string;
  chairId: string;
  workload: number;
  matchScore?: number;
  isComplete: boolean;
}

interface BulkAssignConceptProps {
  availableRoles: RoleDefinition[];
  existingAssignments?: AssignmentData[];
  onComplete: (assignments: AssignmentData[]) => void;
  isReadOnly?: boolean;
}

export const BulkAssignConcept = ({
  availableRoles,
  existingAssignments = [],
  onComplete,
  isReadOnly = false,
}: BulkAssignConceptProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const [configRows, setConfigRows] = useState<ConfigRow[]>([]);
  const [completedMemberIds, setCompletedMemberIds] = useState<Set<string>>(new Set());

  // Use placeholder or real roles
  const roles = availableRoles.length > 0
    ? availableRoles.map(r => ({
        roleId: r.roleId,
        roleName: r.roleName,
        category: r.teamName || "",
        chairCount: r.chairCount || 5,
      }))
    : PLACEHOLDER_ROLES;

  const members = PLACEHOLDER_MEMBERS;

  const filteredMembers = useMemo(() => {
    if (!debouncedSearch) return members;
    const q = debouncedSearch.toLowerCase();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q) ||
        m.location.toLowerCase().includes(q)
    );
  }, [debouncedSearch, members]);

  const handleToggleMember = (memberId: string) => {
    if (isReadOnly) return;
    const next = new Set(selectedMemberIds);
    if (next.has(memberId)) {
      next.delete(memberId);
      setConfigRows((prev) => prev.filter((r) => r.memberId !== memberId));
    } else {
      next.add(memberId);
      const member = members.find((m) => m.id === memberId)!;
      setConfigRows((prev) => [
        ...prev,
        {
          memberId,
          memberName: member.name,
          memberTitle: member.title,
          roleId: "",
          chairId: "",
          workload: 20,
          isComplete: false,
        },
      ]);
    }
    setSelectedMemberIds(next);
  };

  const handleSelectAll = () => {
    if (isReadOnly) return;
    if (selectedMemberIds.size === filteredMembers.length) {
      setSelectedMemberIds(new Set());
      setConfigRows([]);
    } else {
      const allIds = new Set(filteredMembers.map((m) => m.id));
      setSelectedMemberIds(allIds);
      const existingIds = new Set(configRows.map((r) => r.memberId));
      const newRows = filteredMembers
        .filter((m) => !existingIds.has(m.id))
        .map((m) => ({
          memberId: m.id,
          memberName: m.name,
          memberTitle: m.title,
          roleId: "",
          chairId: "",
          workload: 20,
          isComplete: false,
        }));
      setConfigRows((prev) => [...prev, ...newRows]);
    }
  };

  const updateConfigRow = (memberId: string, updates: Partial<ConfigRow>) => {
    setConfigRows((prev) =>
      prev.map((r) => (r.memberId === memberId ? { ...r, ...updates } : r))
    );
  };

  const removeConfigRow = (memberId: string) => {
    setConfigRows((prev) => prev.filter((r) => r.memberId !== memberId));
    const next = new Set(selectedMemberIds);
    next.delete(memberId);
    setSelectedMemberIds(next);
  };

  const getChairsForRole = (roleId: string) => {
    return ROLE_CHAIRS[roleId] || [];
  };

  const assignedCount = configRows.filter(
    (r) => r.roleId && r.chairId && r.workload > 0
  ).length;

  const incompleteCount = configRows.filter(
    (r) => !r.roleId || !r.chairId || r.workload <= 0
  ).length;

  const handleCompleteAll = () => {
    const validRows = configRows.filter((r) => r.roleId && r.chairId && r.workload > 0);
    const assignments: AssignmentData[] = validRows.map((row) => {
      const chair = getChairsForRole(row.roleId).find((c) => c.id === row.chairId);
      return {
        roleId: row.roleId,
        roleName: roles.find((r) => r.roleId === row.roleId)?.roleName || "",
        selectedPerson: { id: row.memberId, name: row.memberName, role: row.memberTitle },
        chairType: "Primary",
        workloadPercentage: row.workload,
        notes: chair?.name || "",
      };
    });
    onComplete(assignments);
  };

  return (
    <div className="space-y-4">
      {/* Resume banner */}
      {incompleteCount > 0 && assignedCount > 0 && (
        <div className="p-3 bg-[hsl(var(--wq-status-warning-bg))] border border-[hsl(var(--wq-status-warning-border))] rounded-lg text-sm text-[hsl(var(--wq-status-warning-text))]">
          You have {incompleteCount} incomplete assignment{incompleteCount > 1 ? "s" : ""}. Resume below.
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Left Column — Team Member List */}
        <div className="border border-[hsl(var(--wq-border))] rounded-xl bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-[hsl(220,50%,20%)]">Team Members</h4>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={selectedMemberIds.size === filteredMembers.length && filteredMembers.length > 0}
                onCheckedChange={handleSelectAll}
                disabled={isReadOnly}
              />
              Select All
            </label>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, role, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Member Cards */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredMembers.map((member) => {
              const isSelected = selectedMemberIds.has(member.id);
              const isAssigned = completedMemberIds.has(member.id);
              const row = configRows.find((r) => r.memberId === member.id);
              const showMatchScore = row?.roleId;
              const matchBadge = getMatchBadge(member.matchScore);

              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => handleToggleMember(member.id)}
                  disabled={isReadOnly}
                  className={cn(
                    "w-full p-4 rounded-lg border text-left transition-all",
                    isSelected
                      ? "border-primary ring-2 ring-primary/20 bg-white"
                      : "border-[hsl(var(--wq-border))] hover:border-primary/50 bg-white",
                    isAssigned && "border-[hsl(var(--wq-status-completed-text))] bg-[hsl(var(--wq-status-completed-bg))]"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isSelected}
                      className="mt-1"
                      disabled={isReadOnly}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-[hsl(220,50%,20%)]">{member.name}</span>
                          <p className="text-sm text-[hsl(var(--wq-text-secondary))]">{member.title}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {isAssigned && (
                            <Badge className="bg-[hsl(var(--wq-status-completed-bg))] text-[hsl(var(--wq-status-completed-text))] border-[hsl(var(--wq-status-completed-text))]">
                              <Check className="w-3 h-3 mr-1" /> Assigned
                            </Badge>
                          )}
                          {showMatchScore && (
                            <div className="text-right">
                              <span className="text-sm font-semibold text-primary">
                                Match: {member.matchScore}
                              </span>
                              {matchBadge.label && (
                                <Badge className={cn("text-xs ml-1", matchBadge.className)}>
                                  {matchBadge.label}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className={cn("flex items-center gap-1", member.locationMatch ? "text-[hsl(var(--wq-status-completed-text))]" : "text-muted-foreground")}>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Location
                        </span>
                        <span className={cn("flex items-center gap-1", member.expertiseMatch ? "text-[hsl(var(--wq-status-completed-text))]" : "text-muted-foreground")}>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Expertise
                        </span>
                        <span className={cn("flex items-center gap-1", member.capacityMatch ? "text-[hsl(var(--wq-status-completed-text))]" : "text-muted-foreground")}>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Capacity
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mt-1 text-xs text-[hsl(var(--wq-text-secondary))]">
                        <span>{member.location}</span>
                        <span>Available: {member.available}%</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column — Configuration Cards */}
        <div className="border border-[hsl(var(--wq-border))] rounded-xl bg-[hsl(var(--wq-bg-page))] p-4 space-y-4">
          {configRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
              <User className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">Select one or more team members to begin assigning roles</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
              {configRows.map((row) => {
                const member = members.find((m) => m.id === row.memberId);
                const chairs = getChairsForRole(row.roleId);
                const matchBadge = member ? getMatchBadge(member.matchScore) : null;

                return (
                  <div
                    key={row.memberId}
                    className={cn(
                      "p-4 rounded-lg border bg-white space-y-3",
                      row.roleId && row.chairId && row.workload > 0
                        ? "border-[hsl(var(--wq-status-completed-text))]"
                        : "border-[hsl(var(--wq-border))]"
                    )}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[hsl(220,50%,20%)] text-white flex items-center justify-center text-sm font-semibold">
                          {row.memberName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-[hsl(220,50%,20%)]">{row.memberName}</p>
                          <p className="text-xs text-[hsl(var(--wq-text-secondary))]">{row.memberTitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {row.roleId && matchBadge?.label && (
                          <Badge className={cn("text-xs", matchBadge.className)}>
                            Match: {member?.matchScore} — {matchBadge.label}
                          </Badge>
                        )}
                        <button
                          onClick={() => removeConfigRow(row.memberId)}
                          className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Role + Chair + Workload */}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-medium text-[hsl(var(--wq-text-secondary))] mb-1 block">Role</label>
                        <Select
                          value={row.roleId || undefined}
                          onValueChange={(val) =>
                            updateConfigRow(row.memberId, { roleId: val, chairId: "" })
                          }
                          disabled={isReadOnly}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent className="z-[100]">
                            {roles.map((r) => (
                              <SelectItem key={r.roleId} value={r.roleId}>
                                {r.roleName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[hsl(var(--wq-text-secondary))] mb-1 block">Chair</label>
                        <Select
                          value={row.chairId || undefined}
                          onValueChange={(val) =>
                            updateConfigRow(row.memberId, { chairId: val })
                          }
                          disabled={isReadOnly || !row.roleId}
                        >
                          <SelectTrigger className="bg-white" aria-label="Select chair">
                            <SelectValue placeholder="Select chair" />
                          </SelectTrigger>
                          <SelectContent className="z-[100]">
                            {chairs.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[hsl(var(--wq-text-secondary))] mb-1 block">Workload %</label>
                        <Input
                          type="number"
                          min={1}
                          max={100}
                          value={row.workload}
                          onChange={(e) =>
                            updateConfigRow(row.memberId, {
                              workload: parseFloat(e.target.value) || 0,
                            })
                          }
                          onFocus={(e) => e.target.select()}
                          disabled={isReadOnly}
                          className="bg-white"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sticky Bottom */}
          {configRows.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t border-[hsl(var(--wq-border))]">
              <span className="text-sm text-[hsl(var(--wq-text-secondary))]">
                {assignedCount} of {configRows.length} members assigned
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="border-[hsl(220,50%,20%)] text-[hsl(220,50%,20%)]"
                  disabled={isReadOnly || assignedCount === 0}
                >
                  <Save className="w-4 h-4 mr-1" /> Save Progress
                </Button>
                <Button
                  onClick={handleCompleteAll}
                  disabled={isReadOnly || assignedCount === 0}
                  className="bg-[hsl(120,50%,35%)] hover:bg-[hsl(120,50%,30%)] text-white"
                >
                  <Check className="w-4 h-4 mr-1" /> Complete All Assignments
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
