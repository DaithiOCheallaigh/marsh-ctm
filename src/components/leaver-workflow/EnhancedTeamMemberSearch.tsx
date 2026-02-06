import React, { useState, useMemo } from "react";
import { Search, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { teamMembers, getMemberById } from "@/data/teamMembers";
import { CapacityIndicator } from "./CapacityIndicator";
import { calculateProjectedCapacity, CapacityCalculation } from "@/types/leaver";

export interface LeaverTeamMember {
  id: string;
  name: string;
  role: string;
  location: string;
  expertise: string[];
  currentCapacity: number;
  maxCapacity: number;
  availableCapacity: number;
}

interface EnhancedTeamMemberSearchProps {
  selectedMember: LeaverTeamMember | null;
  onSelectMember: (member: LeaverTeamMember | null) => void;
  selectedClientsCapacity?: number;
  teamId?: string;
  excludeMemberIds?: string[];
}

export const EnhancedTeamMemberSearch: React.FC<EnhancedTeamMemberSearchProps> = ({
  selectedMember,
  onSelectMember,
  selectedClientsCapacity = 0,
  teamId,
  excludeMemberIds = [],
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Get team members with capacity info, sorted by available capacity (highest first)
  const availableMembers = useMemo(() => {
    let members = teamMembers;
    
    // Filter by team
    if (teamId) {
      members = members.filter(m => m.teamId === teamId);
    }

    // Exclude already-assigned members
    if (excludeMemberIds.length > 0) {
      members = members.filter(m => !excludeMemberIds.includes(m.id));
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      members = members.filter(
        m =>
          m.name.toLowerCase().includes(query) ||
          m.role.toLowerCase().includes(query) ||
          m.location.toLowerCase().includes(query)
      );
    }

    // Map to LeaverTeamMember format with capacity
    return members
      .map(m => {
        const totalWorkload = m.currentAssignments?.reduce((sum, a) => sum + a.workload, 0) || 0;
        return {
          id: m.id,
          name: m.name,
          role: m.role,
          location: m.location,
          expertise: m.expertise || [],
          currentCapacity: totalWorkload,
          maxCapacity: 100,
          availableCapacity: 100 - totalWorkload,
        };
      })
      .sort((a, b) => b.availableCapacity - a.availableCapacity);
  }, [searchQuery, teamId, excludeMemberIds]);

  const handleSelect = (member: LeaverTeamMember) => {
    onSelectMember(member);
    setSearchQuery("");
    setIsOpen(false);
  };

  const handleRemove = () => {
    onSelectMember(null);
  };

  // Calculate projected capacity for selected member
  const projectedCapacity = useMemo(() => {
    if (!selectedMember) return null;
    return calculateProjectedCapacity(
      selectedMember.currentCapacity,
      selectedClientsCapacity,
      selectedMember.maxCapacity
    );
  }, [selectedMember, selectedClientsCapacity]);

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--wq-accent))]" />
          <input
            type="text"
            placeholder="Search Team Member"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="w-full pl-10 pr-4 py-2.5 border border-[hsl(var(--wq-accent))] rounded-lg text-sm text-[hsl(var(--wq-accent))] placeholder:text-[hsl(var(--wq-accent))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--wq-accent))]/20 bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--wq-text-muted))] hover:text-primary"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {isOpen && availableMembers.length > 0 && (
          <div
            className="absolute z-50 w-full mt-1 bg-white border border-[hsl(var(--wq-border))] rounded-lg shadow-lg max-h-80 overflow-auto"
            onMouseDown={(e) => e.preventDefault()}
          >
            {availableMembers.map((member) => {
              const isDisabled = member.availableCapacity <= 0;
              return (
                <div
                  key={member.id}
                  onClick={() => !isDisabled && handleSelect(member)}
                  className={cn(
                    "px-3 py-3 transition-colors border-b border-[hsl(var(--wq-border))] last:border-b-0",
                    isDisabled
                      ? "bg-[hsl(var(--wq-bg-muted))] cursor-not-allowed opacity-60"
                      : "hover:bg-[hsl(var(--wq-bg-hover))] cursor-pointer"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-primary font-semibold text-sm truncate">
                        {member.name}
                      </p>
                      <p className="text-[hsl(var(--wq-text-secondary))] text-xs truncate">
                        {member.role}
                      </p>
                      <p className="text-[hsl(var(--wq-text-muted))] text-xs">
                        {member.location}
                      </p>
                    </div>
                    <div className="flex-shrink-0 w-24">
                      <CapacityIndicator
                        current={member.currentCapacity}
                        max={member.maxCapacity}
                        compact
                      />
                      <p className="text-[10px] text-[hsl(var(--wq-text-muted))] mt-0.5 text-right">
                        {member.availableCapacity.toFixed(0)}% available
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Member Card with Capacity */}
      {selectedMember && (
        <div className="p-4 bg-[hsl(var(--wq-bg-header))] rounded-lg border border-[hsl(var(--wq-border))]">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-primary font-semibold text-sm">{selectedMember.name}</p>
              {selectedMember.expertise.length > 0 && (
                <p className="text-[hsl(var(--wq-text-secondary))] text-xs">
                  {selectedMember.expertise.join(", ")}
                </p>
              )}
              <p className="text-[hsl(var(--wq-text-muted))] text-xs">{selectedMember.location}</p>
            </div>
            <button
              onClick={handleRemove}
              className="p-1.5 text-[hsl(var(--wq-text-muted))] hover:text-destructive transition-colors"
              aria-label="Remove team member"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Capacity Indicator */}
          <CapacityIndicator
            current={selectedMember.currentCapacity}
            max={selectedMember.maxCapacity}
            additional={selectedClientsCapacity}
            showProjected={selectedClientsCapacity > 0}
          />
        </div>
      )}
    </div>
  );
};
