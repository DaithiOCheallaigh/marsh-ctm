import { useState, useMemo } from "react";
import {
  Search, User, CheckCircle2, Check, Plus, Save, Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { RoleDefinition, AssignmentData, getMatchBadge } from "./types";
import { useToast } from "@/hooks/use-toast";

// Placeholder data
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

interface RoleWithChairs {
  roleId: string;
  roleName: string;
  category: string;
  chairCount: number;
  chairs: { id: string; name: string; description: string }[];
}

const PLACEHOLDER_ROLES: RoleWithChairs[] = [
  {
    roleId: "sr-acct-mgr", roleName: "Senior Account Manager", category: "Property Risk", chairCount: 5,
    chairs: [
      { id: "c1", name: "Account Lead", description: "Primary client relationship owner, strategic decisions, contract negotiations" },
      { id: "c2", name: "Strategic Advisor", description: "Long-term risk strategy, portfolio optimisation, executive stakeholder management" },
      { id: "c3", name: "Renewal Coordinator", description: "Policy renewal management, terms negotiation, documentation oversight" },
      { id: "c4", name: "Client Service Lead", description: "Day-to-day client communication, issue resolution, service delivery" },
      { id: "c5", name: "Technical Specialist", description: "Complex risk analysis, specialised property coverage design" },
    ],
  },
  {
    roleId: "risk-eng", roleName: "Risk Engineer", category: "Property Risk", chairCount: 4,
    chairs: [
      { id: "c6", name: "Lead Engineer", description: "Primary risk assessment lead, inspection scheduling" },
      { id: "c7", name: "Field Engineer", description: "On-site inspections, data collection" },
      { id: "c8", name: "Technical Reviewer", description: "Report quality assurance" },
      { id: "c9", name: "CAT Specialist", description: "Catastrophe modeling, natural disaster risk" },
    ],
  },
  {
    roleId: "claims-spec", roleName: "Claims Specialist", category: "General Liability", chairCount: 4,
    chairs: [
      { id: "c10", name: "Lead Adjuster", description: "Primary claims handler, settlement authority" },
      { id: "c11", name: "Investigation Lead", description: "Claims investigation, evidence gathering" },
      { id: "c12", name: "Subrogation Specialist", description: "Recovery actions, third-party pursuit" },
      { id: "c13", name: "Documentation Analyst", description: "Claims file management, compliance" },
    ],
  },
];

interface RoleAssignment {
  roleId: string;
  memberId: string;
  memberName: string;
  chairId: string;
  chairName: string;
  workload: number;
  notes?: string;
}

interface RoleFirstConceptProps {
  availableRoles: RoleDefinition[];
  existingAssignments?: AssignmentData[];
  onComplete: (assignments: AssignmentData[]) => void;
  isReadOnly?: boolean;
}

export const RoleFirstConcept = ({
  availableRoles,
  existingAssignments = [],
  onComplete,
  isReadOnly = false,
}: RoleFirstConceptProps) => {
  const { toast } = useToast();
  const roles = PLACEHOLDER_ROLES;
  const members = PLACEHOLDER_MEMBERS;

  const [selectedRoleId, setSelectedRoleId] = useState<string>(roles[0]?.roleId || "");
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [selectedChairId, setSelectedChairId] = useState<string | null>(null);
  const [workload, setWorkload] = useState(20);
  const [notes, setNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [assignments, setAssignments] = useState<RoleAssignment[]>([]);

  const selectedRole = roles.find((r) => r.roleId === selectedRoleId);

  // Count assignments per role
  const getAssignedCount = (roleId: string) =>
    assignments.filter((a) => a.roleId === roleId).length;

  // Filter members for selected role
  const filteredMembers = useMemo(() => {
    let list = [...members].sort((a, b) => b.matchScore - a.matchScore);
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.title.toLowerCase().includes(q) ||
          m.location.toLowerCase().includes(q)
      );
    }
    return list;
  }, [debouncedSearch, members]);

  const assignedMemberIdsForRole = new Set(
    assignments.filter((a) => a.roleId === selectedRoleId).map((a) => a.memberId)
  );

  const assignedChairIdsForRole = new Set(
    assignments.filter((a) => a.roleId === selectedRoleId).map((a) => a.chairId)
  );

  const availableChairs = selectedRole?.chairs.filter(
    (c) => !assignedChairIdsForRole.has(c.id)
  ) || [];

  const selectedMember = members.find((m) => m.id === selectedMemberId);

  const handleAddAssignment = () => {
    if (!selectedMemberId || !selectedChairId || !selectedRole) return;
    const member = members.find((m) => m.id === selectedMemberId)!;
    const chair = selectedRole.chairs.find((c) => c.id === selectedChairId)!;

    setAssignments((prev) => [
      ...prev,
      {
        roleId: selectedRoleId,
        memberId: member.id,
        memberName: member.name,
        chairId: chair.id,
        chairName: chair.name,
        workload,
        notes: notes || undefined,
      },
    ]);

    toast({
      title: "Assignment Added",
      description: `${member.name} → ${chair.name} (${workload}%)`,
    });

    // Reset col 3
    setSelectedMemberId(null);
    setSelectedChairId(null);
    setWorkload(20);
    setNotes("");
  };

  const totalAssignments = assignments.length;
  const totalChairs = roles.reduce((sum, r) => sum + r.chairCount, 0);

  const handleCompleteAll = () => {
    const output: AssignmentData[] = assignments.map((a) => ({
      roleId: a.roleId,
      roleName: roles.find((r) => r.roleId === a.roleId)?.roleName || "",
      selectedPerson: { id: a.memberId, name: a.memberName },
      chairType: "Primary",
      workloadPercentage: a.workload,
      notes: a.chairName + (a.notes ? ` - ${a.notes}` : ""),
    }));
    onComplete(output);
  };

  return (
    <div className="space-y-4">
      {/* Resume banner */}
      {assignments.length > 0 && (
        <div className="p-3 bg-[hsl(var(--wq-status-completed-bg))] border border-[hsl(var(--wq-status-completed-text))] rounded-lg text-sm text-[hsl(var(--wq-status-completed-text))] flex items-center gap-2">
          <Check className="w-4 h-4" />
          Resuming — {assignments.length} assignment{assignments.length > 1 ? "s" : ""} saved. Continue below.
        </div>
      )}

      <div className="grid grid-cols-[240px_1fr_320px] gap-4">
        {/* Column 1 — Role List */}
        <div className="border border-[hsl(var(--wq-border))] rounded-xl bg-white p-3 space-y-2 self-start">
          <h4 className="font-semibold text-[hsl(220,50%,20%)] text-sm px-1">Roles</h4>
          {roles.map((role) => {
            const assigned = getAssignedCount(role.roleId);
            const isFullyAssigned = assigned >= role.chairCount;
            const isActive = selectedRoleId === role.roleId;
            const pct = (assigned / role.chairCount) * 100;

            return (
              <button
                key={role.roleId}
                type="button"
                onClick={() => {
                  setSelectedRoleId(role.roleId);
                  setSelectedMemberId(null);
                  setSelectedChairId(null);
                  setSearchQuery("");
                }}
                className={cn(
                  "w-full p-3 rounded-lg text-left transition-all border",
                  isActive
                    ? "border-l-4 border-l-[hsl(220,50%,20%)] border-t border-r border-b border-[hsl(var(--wq-border))] bg-[hsl(var(--wq-bg-header))]"
                    : "border-[hsl(var(--wq-border))] hover:bg-[hsl(var(--wq-bg-hover))]",
                  isFullyAssigned && !isActive && "bg-[hsl(var(--wq-status-completed-bg))]"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  {isFullyAssigned ? (
                    <div className="w-6 h-6 rounded-full bg-[hsl(var(--wq-status-completed-text))] flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Briefcase className="w-3.5 h-3.5 text-primary" />
                    </div>
                  )}
                  <span className="font-medium text-sm text-[hsl(220,50%,20%)]">{role.roleName}</span>
                </div>
                <Badge variant="secondary" className="text-[10px] mb-2">{role.category}</Badge>
                <div className="flex items-center gap-2">
                  <Progress value={pct} className="h-1.5 flex-1" />
                  <span className="text-[10px] text-[hsl(var(--wq-text-secondary))] whitespace-nowrap">
                    {assigned} of {role.chairCount}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Column 2 — Team Members */}
        <div className="border border-[hsl(var(--wq-border))] rounded-xl bg-white p-4 space-y-3 self-start">
          {!selectedRole ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
              <Briefcase className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">Select a role to see matching team members</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-[hsl(220,50%,20%)]">
                  {selectedRole.roleName}
                </h4>
                <Badge variant="outline" className="text-xs">
                  {selectedRole.chairCount - getAssignedCount(selectedRoleId)} chairs remaining
                </Badge>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {filteredMembers.map((member) => {
                  const isAssigned = assignedMemberIdsForRole.has(member.id);
                  const isSelected = selectedMemberId === member.id;
                  const matchBadge = getMatchBadge(member.matchScore);

                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => {
                        if (isAssigned) return;
                        setSelectedMemberId(member.id);
                        setSelectedChairId(null);
                        setWorkload(20);
                        setNotes("");
                      }}
                      disabled={isReadOnly}
                      className={cn(
                        "w-full p-3 rounded-lg border text-left transition-all",
                        isSelected
                          ? "border-primary ring-2 ring-primary/20 bg-white"
                          : "border-[hsl(var(--wq-border))] hover:border-primary/50 bg-white",
                        isAssigned && "opacity-60"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="font-semibold text-[hsl(220,50%,20%)]">{member.name}</span>
                          <p className="text-xs text-[hsl(var(--wq-text-secondary))]">{member.title}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {isAssigned ? (
                            <Badge className="bg-[hsl(var(--wq-status-completed-bg))] text-[hsl(var(--wq-status-completed-text))] border-[hsl(var(--wq-status-completed-text))] text-xs">
                              <Check className="w-3 h-3 mr-1" /> Assigned
                            </Badge>
                          ) : (
                            <>
                              <span className="text-xs text-[hsl(var(--wq-text-secondary))]">
                                Match: <span className="font-semibold text-primary">{member.matchScore}</span>
                              </span>
                              {matchBadge.label && (
                                <Badge className={cn("text-[10px] ml-1", matchBadge.className)}>
                                  {matchBadge.label}
                                </Badge>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <span className={cn("flex items-center gap-1", member.locationMatch ? "text-[hsl(var(--wq-status-completed-text))]" : "text-muted-foreground")}>
                          <CheckCircle2 className="w-3 h-3" /> Location
                        </span>
                        <span className={cn("flex items-center gap-1", member.expertiseMatch ? "text-[hsl(var(--wq-status-completed-text))]" : "text-muted-foreground")}>
                          <CheckCircle2 className="w-3 h-3" /> Expertise
                        </span>
                        <span className={cn("flex items-center gap-1", member.capacityMatch ? "text-[hsl(var(--wq-status-completed-text))]" : "text-muted-foreground")}>
                          <CheckCircle2 className="w-3 h-3" /> Capacity
                        </span>
                        <span className="text-[hsl(var(--wq-text-secondary))] ml-auto">{member.location}</span>
                        <span className="text-[hsl(var(--wq-text-secondary))]">{member.available}%</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Column 3 — Configure Assignment */}
        <div className="border border-[hsl(var(--wq-border))] rounded-xl bg-white p-4 space-y-4 self-start">
          {!selectedMember ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
              <User className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm text-center">Select a team member to configure their assignment</p>
            </div>
          ) : (
            <>
              <h4 className="font-semibold text-[hsl(220,50%,20%)] text-sm">Configure Assignment</h4>

              {/* Member Summary */}
              <div className="p-3 rounded-lg bg-[hsl(var(--wq-bg-page))] border border-[hsl(var(--wq-border))]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[hsl(220,50%,20%)] text-white flex items-center justify-center font-semibold">
                    {selectedMember.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[hsl(220,50%,20%)]">{selectedMember.name}</p>
                    <p className="text-xs text-[hsl(var(--wq-text-secondary))]">
                      After: {Math.max(0, selectedMember.available - workload)}% available
                    </p>
                  </div>
                </div>
              </div>

              {/* Workload */}
              <div>
                <label className="text-xs font-medium text-[hsl(var(--wq-text-secondary))] mb-1 block">
                  Workload %
                </label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={workload}
                  onChange={(e) => setWorkload(parseFloat(e.target.value) || 0)}
                  onFocus={(e) => e.target.select()}
                  disabled={isReadOnly}
                  className="bg-white"
                />
              </div>

              {/* Chair Selection */}
              <div>
                <label className="text-xs font-medium text-[hsl(var(--wq-text-secondary))] mb-1 block">
                  Select Chair
                </label>
                {availableChairs.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center border border-dashed rounded-lg">
                    All chairs assigned
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {availableChairs.map((chair) => (
                      <button
                        key={chair.id}
                        type="button"
                        onClick={() => setSelectedChairId(chair.id)}
                        disabled={isReadOnly}
                        className={cn(
                          "w-full px-3 py-2.5 rounded-lg border text-left transition-all",
                          selectedChairId === chair.id
                            ? "bg-[hsl(220,50%,20%)] text-white border-[hsl(220,50%,20%)]"
                            : "border-[hsl(var(--wq-border))] hover:border-primary/50 bg-white"
                        )}
                      >
                        <span className="font-medium text-sm">{chair.name}</span>
                        <p className={cn(
                          "text-[11px] mt-0.5",
                          selectedChairId === chair.id ? "text-white/80" : "text-muted-foreground"
                        )}>
                          {chair.description}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-medium text-[hsl(var(--wq-text-secondary))] mb-1 block">
                  Assignment Notes (optional)
                </label>
                <Textarea
                  placeholder="Add context..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isReadOnly}
                  className="bg-white min-h-[60px]"
                />
              </div>

              {/* Add Button */}
              <Button
                onClick={handleAddAssignment}
                disabled={isReadOnly || !selectedChairId || workload <= 0}
                className="w-full bg-[hsl(220,50%,20%)] hover:bg-[hsl(220,50%,15%)] text-white"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Assignment
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="flex items-center justify-between p-4 border border-[hsl(var(--wq-border))] rounded-xl bg-white mt-2">
        <span className="text-sm text-[hsl(var(--wq-text-secondary))]">
          {totalAssignments} of {totalChairs} total assignments across all roles
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-[hsl(220,50%,20%)] text-[hsl(220,50%,20%)]"
            disabled={isReadOnly || totalAssignments === 0}
          >
            <Save className="w-4 h-4 mr-1" /> Save Progress
          </Button>
          <Button
            onClick={handleCompleteAll}
            disabled={isReadOnly || totalAssignments === 0}
            className="bg-[hsl(120,50%,35%)] hover:bg-[hsl(120,50%,30%)] text-white"
          >
            <Check className="w-4 h-4 mr-1" /> Complete All Assignments
          </Button>
        </div>
      </div>
    </div>
  );
};
