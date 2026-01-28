// Concept 1: Hybrid Table View with Progressive Panels
// A table-based overview that expands inline to show candidate selection

import React, { useState, useMemo } from "react";
import { Check, ChevronDown, ChevronUp, MapPin, Briefcase, Gauge, X, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { TeamMember, teamMembers } from "@/data/teamMembers";
import { useDebounce } from "@/hooks/useDebounce";
import {
  AssignmentConceptProps,
  AssignmentData,
  AssignedPerson,
  DEFAULT_WORKLOAD,
  MIN_WORKLOAD,
  MAX_WORKLOAD,
  MAX_CAPACITY,
  getMatchScoreColor,
  getMatchBadge,
  getCapacityColor,
  getCapacityBarColor,
} from "./types";

interface ExpandedState {
  roleId: string;
  selectedMember?: AssignedPerson;
  chairType: 'Primary' | 'Secondary';
  workload: number;
  notes: string;
}

export const Concept1TableView: React.FC<AssignmentConceptProps> = ({
  roles,
  onAssign,
  onUnassign,
  assignments,
  isReadOnly = false,
  getMemberTotalWorkload,
  checkDuplicateAssignment,
}) => {
  const [expandedRole, setExpandedRole] = useState<ExpandedState | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Get assignment for a role
  const getAssignment = (roleId: string): AssignmentData | undefined => {
    return assignments.find(a => a.roleId === roleId);
  };

  // Filter candidates
  const filteredCandidates = useMemo(() => {
    let candidates = teamMembers.filter(m => {
      // Exclude already assigned members
      const isDuplicate = checkDuplicateAssignment?.(m);
      if (isDuplicate?.isAssigned) return false;
      return true;
    });

    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      candidates = candidates.filter(m =>
        m.name.toLowerCase().includes(query) ||
        m.role.toLowerCase().includes(query) ||
        m.expertise.some(e => e.toLowerCase().includes(query))
      );
    }

    return candidates.sort((a, b) => b.matchScore - a.matchScore).slice(0, 8);
  }, [debouncedSearch, checkDuplicateAssignment]);

  const handleExpand = (roleId: string) => {
    if (isReadOnly) return;
    if (expandedRole?.roleId === roleId) {
      setExpandedRole(null);
    } else {
      setExpandedRole({
        roleId,
        selectedMember: undefined,
        chairType: 'Primary',
        workload: DEFAULT_WORKLOAD,
        notes: '',
      });
      setSearchQuery("");
    }
  };

  const handleSelectMember = (member: TeamMember) => {
    if (!expandedRole) return;
    setExpandedRole({
      ...expandedRole,
      selectedMember: member,
    });
  };

  const handleSaveAssignment = () => {
    if (!expandedRole?.selectedMember) return;
    
    const role = roles.find(r => r.roleId === expandedRole.roleId);
    if (!role) return;

    onAssign({
      roleId: expandedRole.roleId,
      roleName: role.roleName,
      teamName: role.teamName,
      selectedPerson: expandedRole.selectedMember,
      chairType: expandedRole.chairType,
      workloadPercentage: expandedRole.workload,
      notes: expandedRole.notes,
    });

    setExpandedRole(null);
    setSearchQuery("");
  };

  const handleEdit = (roleId: string) => {
    const assignment = getAssignment(roleId);
    if (!assignment || isReadOnly) return;
    
    setExpandedRole({
      roleId,
      selectedMember: assignment.selectedPerson,
      chairType: assignment.chairType,
      workload: assignment.workloadPercentage,
      notes: assignment.notes || '',
    });
  };

  // Progress calculation
  const assignedCount = assignments.length;
  const totalCount = roles.length;
  const progressPercent = totalCount > 0 ? (assignedCount / totalCount) * 100 : 0;

  return (
    <div className="bg-white rounded-lg border border-[hsl(var(--wq-border))] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[hsl(var(--wq-border))] bg-[hsl(var(--wq-bg-muted))]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-primary">Concept 1: Table View</h3>
            <Badge variant="outline" className="text-xs">
              {assignedCount}/{totalCount} Assigned
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs text-[hsl(var(--wq-text-secondary))]">
              {Math.round(progressPercent)}%
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="divide-y divide-[hsl(var(--wq-border))]">
        {/* Table Header */}
        <div className="grid grid-cols-[2fr_2fr_1fr_1fr_120px] gap-4 px-4 py-2 bg-gray-50 text-xs font-medium text-[hsl(var(--wq-text-secondary))] uppercase tracking-wide">
          <div>Role</div>
          <div>Assigned To</div>
          <div>Chair</div>
          <div>Capacity</div>
          <div className="text-right">Action</div>
        </div>

        {/* Table Rows */}
        {roles.map((role) => {
          const assignment = getAssignment(role.roleId);
          const isExpanded = expandedRole?.roleId === role.roleId;
          const member = assignment?.selectedPerson;

          return (
            <div key={role.roleId}>
              {/* Main Row */}
              <div
                className={`grid grid-cols-[2fr_2fr_1fr_1fr_120px] gap-4 px-4 py-3 items-center transition-colors ${
                  isExpanded ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                {/* Role */}
                <div>
                  <div className="font-medium text-primary">{role.roleName}</div>
                  {role.teamName && (
                    <div className="text-xs text-[hsl(var(--wq-text-secondary))]">{role.teamName}</div>
                  )}
                  <div className="flex items-center gap-1 mt-1">
                    {assignment ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                        ✓ Complete
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-gray-500">
                        ○ Not Started
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Assigned To */}
                <div>
                  {member ? (
                    <div>
                      <div className="font-medium text-primary">{member.name}</div>
                      <div className="text-xs text-[hsl(var(--wq-text-secondary))]">{member.role}</div>
                    </div>
                  ) : (
                    <span className="text-[hsl(var(--wq-text-secondary))]">—</span>
                  )}
                </div>

                {/* Chair */}
                <div>
                  {assignment ? (
                    <Badge
                      className={
                        assignment.chairType === 'Primary'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-gray-200 text-gray-700'
                      }
                    >
                      {assignment.chairType}
                    </Badge>
                  ) : (
                    <span className="text-[hsl(var(--wq-text-secondary))]">—</span>
                  )}
                </div>

                {/* Capacity */}
                <div>
                  {member && assignment ? (
                    <div className="text-sm">
                      <span className="text-[hsl(var(--wq-text-secondary))]">
                        {100 - member.capacity}%
                      </span>
                      <span className="mx-1">→</span>
                      <span className={getCapacityColor(member.capacity - assignment.workloadPercentage)}>
                        {100 - member.capacity + assignment.workloadPercentage}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-[hsl(var(--wq-text-secondary))]">—</span>
                  )}
                </div>

                {/* Action */}
                <div className="flex justify-end">
                  {!isReadOnly && (
                    assignment ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(role.roleId)}
                        className="text-xs"
                      >
                        Edit
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleExpand(role.roleId)}
                        className="text-xs bg-primary"
                      >
                        {isExpanded ? (
                          <>Cancel <ChevronUp className="w-3 h-3 ml-1" /></>
                        ) : (
                          <>Assign <ChevronDown className="w-3 h-3 ml-1" /></>
                        )}
                      </Button>
                    )
                  )}
                </div>
              </div>

              {/* Expanded Panel */}
              {isExpanded && (
                <div className="px-4 py-4 bg-blue-50 border-t border-blue-100">
                  {/* Search */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search team members..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-white"
                      />
                    </div>
                  </div>

                  {/* Candidates Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {filteredCandidates.map((candidate) => {
                      const isSelected = expandedRole.selectedMember?.id === candidate.id;
                      const matchBadge = getMatchBadge(candidate.matchScore);
                      const currentWorkload = getMemberTotalWorkload?.(candidate.id) || (100 - candidate.capacity);
                      const projectedWorkload = currentWorkload + expandedRole.workload;
                      const isOverCapacity = projectedWorkload > MAX_CAPACITY;

                      return (
                        <div
                          key={candidate.id}
                          onClick={() => handleSelectMember(candidate)}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-primary bg-white shadow-md'
                              : 'border-transparent bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  isSelected ? 'bg-primary border-primary' : 'border-gray-300'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <div>
                                <div className="font-medium text-primary text-sm">{candidate.name}</div>
                                <div className="text-xs text-[hsl(var(--wq-text-secondary))]">{candidate.role}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`font-semibold text-sm ${getMatchScoreColor(candidate.matchScore)}`}>
                                {candidate.matchScore}
                              </div>
                              {matchBadge.label && (
                                <Badge className={`text-[10px] ${matchBadge.className}`}>
                                  {matchBadge.label}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Match Indicators */}
                          <div className="flex items-center gap-3 text-xs mb-2">
                            <span className={candidate.locationMatch ? 'text-green-600' : 'text-gray-400'}>
                              <MapPin className="w-3 h-3 inline mr-1" />
                              {candidate.locationMatch ? '✓' : '○'}
                            </span>
                            <span className={candidate.expertiseMatch ? 'text-green-600' : 'text-gray-400'}>
                              <Briefcase className="w-3 h-3 inline mr-1" />
                              {candidate.expertiseMatch ? '✓' : '○'}
                            </span>
                            <span className={candidate.hasCapacity ? 'text-green-600' : 'text-amber-500'}>
                              <Gauge className="w-3 h-3 inline mr-1" />
                              {candidate.capacity}%
                            </span>
                          </div>

                          {/* Capacity Bar */}
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${getCapacityBarColor(currentWorkload)}`}
                              style={{ width: `${currentWorkload}%` }}
                            />
                          </div>
                          {isSelected && isOverCapacity && (
                            <div className="text-xs text-red-600 mt-1">⚠ May exceed capacity</div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Configuration (shown when member selected) */}
                  {expandedRole.selectedMember && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="grid grid-cols-3 gap-4">
                        {/* Chair Type */}
                        <div>
                          <label className="block text-xs font-medium text-[hsl(var(--wq-text-secondary))] mb-2">
                            Chair Type
                          </label>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={expandedRole.chairType === 'Primary' ? 'default' : 'outline'}
                              onClick={() => setExpandedRole({ ...expandedRole, chairType: 'Primary' })}
                              className="flex-1"
                            >
                              Primary
                            </Button>
                            <Button
                              size="sm"
                              variant={expandedRole.chairType === 'Secondary' ? 'default' : 'outline'}
                              onClick={() => setExpandedRole({ ...expandedRole, chairType: 'Secondary' })}
                              className="flex-1"
                            >
                              Secondary
                            </Button>
                          </div>
                        </div>

                        {/* Workload */}
                        <div>
                          <label className="block text-xs font-medium text-[hsl(var(--wq-text-secondary))] mb-2">
                            Workload: {expandedRole.workload}%
                          </label>
                          <Slider
                            value={[expandedRole.workload]}
                            onValueChange={([val]) => setExpandedRole({ ...expandedRole, workload: val })}
                            min={MIN_WORKLOAD}
                            max={MAX_WORKLOAD}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                            <span>{MIN_WORKLOAD}%</span>
                            <span>{MAX_WORKLOAD}%</span>
                          </div>
                        </div>

                        {/* Capacity Impact */}
                        <div>
                          <label className="block text-xs font-medium text-[hsl(var(--wq-text-secondary))] mb-2">
                            Capacity Impact
                          </label>
                          <div className="text-sm">
                            <span>{100 - expandedRole.selectedMember.capacity}%</span>
                            <span className="mx-2">→</span>
                            <span className="font-semibold">
                              {100 - expandedRole.selectedMember.capacity + expandedRole.workload}%
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full ${getCapacityBarColor(100 - expandedRole.selectedMember.capacity + expandedRole.workload)}`}
                              style={{ width: `${100 - expandedRole.selectedMember.capacity + expandedRole.workload}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-[hsl(var(--wq-text-secondary))] mb-1">
                          Notes (optional)
                        </label>
                        <Textarea
                          value={expandedRole.notes}
                          onChange={(e) => setExpandedRole({ ...expandedRole, notes: e.target.value })}
                          placeholder="Add assignment notes..."
                          className="h-16 text-sm"
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setExpandedRole(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveAssignment}
                          className="bg-primary"
                        >
                          Save Assignment
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
