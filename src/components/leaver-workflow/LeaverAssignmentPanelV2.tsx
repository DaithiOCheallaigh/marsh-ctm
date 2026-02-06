import React, { useState, useMemo } from "react";
import { Search, X, User, CheckCircle2, AlertCircle, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { LeaverClient } from "@/data/leaverClients";
import { teamMembers } from "@/data/teamMembers";
import { useDebounce } from "@/hooks/useDebounce";
import {
  getCapacityStatus,
  formatAvailableCapacity,
  CAPACITY_CONFIG,
} from "@/utils/capacityManagement";

export interface LeaverTeamMemberV2 {
  id: string;
  name: string;
  role: string;
  location: string;
  expertise: string[];
  currentCapacity: number;
  maxCapacity: number;
  availableCapacity: number;
  matchScore: number;
  locationMatch: boolean;
  expertiseMatch: boolean;
}

interface ClientWithCapacity extends LeaverClient {
  capacityRequirement?: number;
}

// Reuse LeaverTeamMember type for parent compatibility
export type { LeaverTeamMember } from "./EnhancedTeamMemberSearch";

function getMatchBadge(score: number) {
  if (score >= 90)
    return {
      label: "Best Match",
      className: "bg-green-100 text-green-800 border-green-300",
    };
  if (score >= 70)
    return {
      label: "Good Match",
      className: "bg-amber-100 text-amber-800 border-amber-300",
    };
  return { label: "", className: "" };
}

// ---- Team Member Card ----
const TeamMemberCard = ({
  member,
  isSelected,
  onSelect,
}: {
  member: LeaverTeamMemberV2;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const matchBadge = getMatchBadge(member.matchScore);
  const statusInfo = getCapacityStatus(member.availableCapacity);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full p-4 rounded-lg border text-left transition-all bg-white",
        isSelected
          ? "border-primary ring-2 ring-primary/20"
          : "border-[hsl(var(--wq-border))] hover:border-primary/50"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-semibold text-primary">{member.name}</div>
          <div className="text-sm text-[hsl(var(--wq-text-secondary))]">
            {member.role}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-sm text-[hsl(var(--wq-text-secondary))]">
            Match Score:{" "}
            <span className="font-semibold text-primary">
              {member.matchScore}
            </span>
          </div>
          {matchBadge.label && (
            <Badge className={cn("text-xs mt-1", matchBadge.className)}>
              {matchBadge.label}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-3 text-sm">
        <span
          className={cn(
            "flex items-center gap-1",
            member.locationMatch
              ? "text-[hsl(var(--wq-status-completed-text))]"
              : "text-muted-foreground"
          )}
        >
          <CheckCircle2
            className={cn(
              "w-4 h-4",
              member.locationMatch
                ? "text-[hsl(var(--wq-status-completed-text))]"
                : "text-muted-foreground"
            )}
          />
          Location
        </span>
        <span
          className={cn(
            "flex items-center gap-1",
            member.expertiseMatch
              ? "text-[hsl(var(--wq-status-completed-text))]"
              : "text-muted-foreground"
          )}
        >
          <CheckCircle2
            className={cn(
              "w-4 h-4",
              member.expertiseMatch
                ? "text-[hsl(var(--wq-status-completed-text))]"
                : "text-muted-foreground"
            )}
          />
          Expertise
        </span>
        <span className={cn("flex items-center gap-1", statusInfo.colorClass)}>
          {member.availableCapacity <= 0 ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          Capacity
        </span>
      </div>

      <div className="flex items-center gap-6 text-sm text-[hsl(var(--wq-text-secondary))]">
        <span>
          <span className="font-medium">Location:</span> {member.location}
        </span>
        <span>
          <span className="font-medium">Expertise:</span>{" "}
          {member.expertise?.slice(0, 3).join(", ") || "N/A"}
        </span>
        <span className="flex items-center gap-1">
          <span className="font-medium">Available:</span>
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-semibold",
              statusInfo.colorClass,
              statusInfo.bgClass,
              statusInfo.borderClass
            )}
          >
            {formatAvailableCapacity(member.availableCapacity)}
          </Badge>
        </span>
      </div>
    </button>
  );
};

// ---- Client Card (styled like a chair card) ----
const ClientChairCard = ({
  client,
  isSelected,
  onSelect,
}: {
  client: ClientWithCapacity;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full px-4 py-3 rounded-lg border text-left transition-all flex items-center justify-between",
        isSelected
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background border-[hsl(var(--wq-border))] hover:border-primary/50 hover:bg-[hsl(var(--wq-bg-muted))]"
      )}
    >
      <div>
        <span className="font-medium">{client.name}</span>
        <p
          className={cn(
            "text-xs",
            isSelected
              ? "text-primary-foreground/80"
              : "text-[hsl(var(--wq-text-secondary))]"
          )}
        >
          {client.role}
          {client.chairName && <> · {client.chairName}</>}
          {client.workload !== undefined && <> · Workload: {client.workload}%</>}
        </p>
      </div>
      {isSelected && <Check className="w-4 h-4 flex-shrink-0" />}
    </button>
  );
};

// ---- Main Component ----
interface LeaverAssignmentPanelV2Props {
  leaverName: string;
  leaverTeam: string;
  totalCapacity: number;
  clients: ClientWithCapacity[];
  assignedClientIds: string[];
  onAssign: (
    member: { id: string; name: string; role: string; location: string },
    clientIds: string[]
  ) => void;
  teamId?: string;
  excludeMemberIds?: string[];
}

export const LeaverAssignmentPanelV2: React.FC<LeaverAssignmentPanelV2Props> = ({
  leaverName,
  leaverTeam,
  totalCapacity,
  clients,
  assignedClientIds,
  onAssign,
  teamId,
  excludeMemberIds = [],
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [selectedMember, setSelectedMember] = useState<LeaverTeamMemberV2 | null>(null);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [workloadPercentage, setWorkloadPercentage] = useState(
    CAPACITY_CONFIG.DEFAULT_ASSIGNMENT_WORKLOAD
  );
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Available clients (not yet assigned)
  const availableClients = useMemo(
    () => clients.filter((c) => !assignedClientIds.includes(c.id)),
    [clients, assignedClientIds]
  );

  // Build team member list with match scores
  const allMembers = useMemo((): LeaverTeamMemberV2[] => {
    let members = teamMembers;

    if (teamId) {
      members = members.filter((m) => m.teamId === teamId);
    }
    if (excludeMemberIds.length > 0) {
      members = members.filter((m) => !excludeMemberIds.includes(m.id));
    }

    return members
      .map((m) => {
        const totalWorkload =
          m.currentAssignments?.reduce((sum, a) => sum + a.workload, 0) || 0;
        return {
          id: m.id,
          name: m.name,
          role: m.role,
          location: m.location,
          expertise: m.expertise || [],
          currentCapacity: totalWorkload,
          maxCapacity: 100,
          availableCapacity: 100 - totalWorkload,
          matchScore: Math.floor(Math.random() * 30) + 70,
          locationMatch: true,
          expertiseMatch: (m.expertise || []).length > 0,
        };
      })
      .sort((a, b) => b.availableCapacity - a.availableCapacity);
  }, [teamId, excludeMemberIds]);

  // Filter by search
  const filteredMembers = useMemo(() => {
    let members = allMembers;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      members = members.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.role.toLowerCase().includes(q) ||
          m.location.toLowerCase().includes(q)
      );
    }
    if (!showAll && !debouncedSearch) {
      return members.slice(0, 6);
    }
    return members;
  }, [allMembers, debouncedSearch, showAll]);

  const handleMemberSelect = (member: LeaverTeamMemberV2) => {
    setSelectedMember(member);
    setSelectedClientIds([]);
    setWorkloadPercentage(CAPACITY_CONFIG.DEFAULT_ASSIGNMENT_WORKLOAD);
  };

  const handleToggleClient = (clientId: string) => {
    setSelectedClientIds((prev) =>
      prev.includes(clientId)
        ? prev.filter((id) => id !== clientId)
        : [...prev, clientId]
    );
  };

  const projectedCapacity = selectedMember
    ? Math.max(0, selectedMember.availableCapacity - workloadPercentage)
    : 0;

  const canAssign =
    selectedMember && selectedClientIds.length > 0 && workloadPercentage > 0;

  const handleAddAssignment = () => {
    if (!selectedMember || selectedClientIds.length === 0) return;
    onAssign(
      {
        id: selectedMember.id,
        name: selectedMember.name,
        role: selectedMember.role,
        location: selectedMember.location,
      },
      selectedClientIds
    );
    // Reset
    setSelectedMember(null);
    setSelectedClientIds([]);
    setWorkloadPercentage(CAPACITY_CONFIG.DEFAULT_ASSIGNMENT_WORKLOAD);
  };

  const assignedCount = assignedClientIds.length;
  const remainingCount = clients.length - assignedCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="secondary" className="text-xs">
            {leaverName}
          </Badge>
          <Badge
            variant="outline"
            className="text-xs border-primary/30 text-primary"
          >
            {remainingCount} of {clients.length} client
            {clients.length !== 1 ? "s" : ""} remaining
          </Badge>
        </div>
        <h4 className="font-medium text-primary">
          Assign Team Members to Clients
        </h4>
        <p className="text-sm text-[hsl(var(--wq-text-secondary))]">
          Select a team member, then choose clients to reassign.
        </p>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-2 gap-6 items-start">
        {/* Left: Team Member Selection */}
        <div className="border border-[hsl(var(--wq-border))] rounded-lg bg-[hsl(var(--wq-bg-muted))]/30 p-4 space-y-3">
          <h6 className="text-sm font-medium text-primary">
            Select Team Member
          </h6>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--wq-text-muted))]" />
            <Input
              placeholder="Search by name, role, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>

          {/* Member Cards */}
          <div className="space-y-2">
            {filteredMembers.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-sm text-[hsl(var(--wq-text-muted))]">
                  {debouncedSearch
                    ? "No members match your search"
                    : "No team members available"}
                </p>
              </div>
            ) : (
              filteredMembers.map((member) => (
                <TeamMemberCard
                  key={member.id}
                  member={member}
                  isSelected={selectedMember?.id === member.id}
                  onSelect={() => handleMemberSelect(member)}
                />
              ))
            )}
          </div>

          {/* Show All */}
          {!showAll && !debouncedSearch && allMembers.length > 6 && (
            <Button
              variant="link"
              onClick={() => setShowAll(true)}
              className="text-primary font-semibold w-full"
            >
              Show All Members
            </Button>
          )}
        </div>

        {/* Right: Configure Assignment */}
        <div className="border border-[hsl(var(--wq-border))] rounded-lg bg-[hsl(var(--wq-bg-muted))]/30 p-4 space-y-4">
          {selectedMember ? (
            <>
              <div className="flex items-center justify-between">
                <h6 className="text-sm font-medium text-primary">
                  Configure Assignment
                </h6>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedMember(null);
                    setSelectedClientIds([]);
                  }}
                  className="h-8 px-2 text-[hsl(var(--wq-text-muted))]"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Selected Member Summary with Workload */}
              <div className="p-3 bg-white rounded-lg border border-[hsl(var(--wq-border))]">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-primary">
                        {selectedMember.name}
                      </p>
                      <p className="text-xs text-[hsl(var(--wq-text-secondary))]">
                        After assignment:{" "}
                        {formatAvailableCapacity(projectedCapacity)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <label className="text-sm font-medium text-primary">
                      Workload
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      step={0.5}
                      value={workloadPercentage}
                      onChange={(e) =>
                        setWorkloadPercentage(parseFloat(e.target.value) || 0)
                      }
                      onFocus={(e) => e.target.select()}
                      className="w-20 bg-white"
                    />
                    <span className="text-sm text-[hsl(var(--wq-text-muted))]">
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* Client Selection (styled like chair cards) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-primary">
                  Select Clients
                </label>
                {availableClients.length === 0 ? (
                  <div className="py-6 text-center border border-dashed border-[hsl(var(--wq-border))] rounded-lg">
                    <p className="text-sm text-[hsl(var(--wq-text-muted))]">
                      All clients have been assigned
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availableClients.map((client) => (
                      <ClientChairCard
                        key={client.id}
                        client={client}
                        isSelected={selectedClientIds.includes(client.id)}
                        onSelect={() => handleToggleClient(client.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Add Assignment Button */}
              <Button
                onClick={handleAddAssignment}
                disabled={!canAssign}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Assign{selectedClientIds.length > 0
                  ? ` (${selectedClientIds.length})`
                  : ""}
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-[hsl(var(--wq-text-muted))] text-sm">
              <User className="w-8 h-8 mb-2 opacity-50" />
              <p>Select a team member to configure assignment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
