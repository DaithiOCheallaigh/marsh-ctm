// Concept 2: Side-by-Side Assignment Panel
// Split-screen interface with persistent role list on left and candidate details on right

import React, { useState, useMemo } from "react";
import { Check, ChevronRight, MapPin, Briefcase, Gauge, Search, Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TeamMember, teamMembers } from "@/data/teamMembers";
import { useDebounce } from "@/hooks/useDebounce";
import {
  AssignmentConceptProps,
  AssignmentData,
  DEFAULT_WORKLOAD,
  MIN_WORKLOAD,
  MAX_WORKLOAD,
  MAX_CAPACITY,
  getMatchScoreColor,
  getMatchBadge,
  getCapacityColor,
  getCapacityBarColor,
} from "./types";

type ViewState = 'browse' | 'configure';

interface ConfigState {
  member: TeamMember;
  chairType: 'Primary' | 'Secondary';
  workload: number;
  notes: string;
}

export const Concept2SplitPanel: React.FC<AssignmentConceptProps> = ({
  roles,
  onAssign,
  onUnassign,
  assignments,
  isReadOnly = false,
  getMemberTotalWorkload,
  checkDuplicateAssignment,
}) => {
  const [activeRoleId, setActiveRoleId] = useState<string | null>(roles[0]?.roleId || null);
  const [viewState, setViewState] = useState<ViewState>('browse');
  const [configState, setConfigState] = useState<ConfigState | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Get assignment for a role
  const getAssignment = (roleId: string): AssignmentData | undefined => {
    return assignments.find(a => a.roleId === roleId);
  };

  const activeRole = roles.find(r => r.roleId === activeRoleId);
  const activeAssignment = activeRoleId ? getAssignment(activeRoleId) : undefined;

  // Filter candidates
  const filteredCandidates = useMemo(() => {
    let candidates = teamMembers.filter(m => {
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

    return candidates.sort((a, b) => b.matchScore - a.matchScore);
  }, [debouncedSearch, checkDuplicateAssignment]);

  const handleSelectRole = (roleId: string) => {
    setActiveRoleId(roleId);
    setViewState('browse');
    setConfigState(null);
    setSearchQuery("");
  };

  const handleSelectMember = (member: TeamMember) => {
    if (isReadOnly) return;
    setConfigState({
      member,
      chairType: 'Primary',
      workload: DEFAULT_WORKLOAD,
      notes: '',
    });
    setViewState('configure');
  };

  const handleConfirmAssignment = () => {
    if (!configState || !activeRole) return;

    onAssign({
      roleId: activeRole.roleId,
      roleName: activeRole.roleName,
      teamName: activeRole.teamName,
      selectedPerson: configState.member,
      chairType: configState.chairType,
      workloadPercentage: configState.workload,
      notes: configState.notes,
    });

    // Move to next unassigned role
    const nextUnassigned = roles.find(r => r.roleId !== activeRole.roleId && !getAssignment(r.roleId));
    if (nextUnassigned) {
      setActiveRoleId(nextUnassigned.roleId);
    }

    setViewState('browse');
    setConfigState(null);
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
            <h3 className="font-semibold text-primary">Concept 2: Split Panel</h3>
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

      {/* Split View */}
      <div className="flex min-h-[500px]">
        {/* Left Panel - Role List (40%) */}
        <div className="w-2/5 border-r border-[hsl(var(--wq-border))] bg-gray-50">
          <div className="p-3 border-b border-[hsl(var(--wq-border))]">
            <h4 className="font-medium text-sm text-primary">Selected Roles</h4>
          </div>
          <ScrollArea className="h-[460px]">
            <div className="p-2 space-y-1">
              {roles.map((role) => {
                const assignment = getAssignment(role.roleId);
                const isActive = activeRoleId === role.roleId;

                return (
                  <div
                    key={role.roleId}
                    onClick={() => handleSelectRole(role.roleId)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs ${
                            assignment
                              ? isActive
                                ? 'bg-white text-primary border-white'
                                : 'bg-green-500 text-white border-green-500'
                              : isActive
                              ? 'border-white'
                              : 'border-gray-300'
                          }`}
                        >
                          {assignment ? '✓' : isActive ? '●' : '○'}
                        </div>
                        <span className={`font-medium text-sm ${isActive ? '' : 'text-primary'}`}>
                          {role.roleName}
                        </span>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isActive ? '' : 'text-gray-400'}`} />
                    </div>

                    {assignment && (
                      <div className={`mt-2 text-xs ${isActive ? 'text-primary-foreground/80' : 'text-[hsl(var(--wq-text-secondary))]'}`}>
                        {assignment.selectedPerson?.name} • {assignment.chairType} • {assignment.workloadPercentage}%
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Summary */}
          <div className="p-3 border-t border-[hsl(var(--wq-border))] bg-white">
            <h5 className="text-xs font-medium text-[hsl(var(--wq-text-secondary))] mb-2">Assignment Summary</h5>
            <div className="space-y-1 max-h-24 overflow-auto">
              {assignments.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No assignments yet</p>
              ) : (
                assignments.map((a) => (
                  <div key={a.roleId} className="text-xs flex items-center gap-1">
                    <span className="text-green-500">✓</span>
                    <span className="font-medium">{a.roleName}:</span>
                    <span className="text-[hsl(var(--wq-text-secondary))]">{a.selectedPerson?.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Candidates/Config (60%) */}
        <div className="w-3/5 flex flex-col">
          {activeRole ? (
            <>
              {/* Panel Header */}
              <div className="p-3 border-b border-[hsl(var(--wq-border))] bg-white">
                <div className="flex items-center gap-2">
                  {viewState === 'configure' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setViewState('browse');
                        setConfigState(null);
                      }}
                      className="p-1 h-auto"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                  )}
                  <h4 className="font-medium text-sm text-primary">
                    {viewState === 'browse'
                      ? `Assign: ${activeRole.roleName}`
                      : `Configure: ${activeRole.roleName}`}
                  </h4>
                </div>
              </div>

              {viewState === 'browse' ? (
                /* Browse Candidates View */
                <>
                  <div className="p-3 border-b border-[hsl(var(--wq-border))]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search team members..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <ScrollArea className="flex-1 p-3">
                    <div className="space-y-2">
                      {filteredCandidates.slice(0, 10).map((candidate, idx) => {
                        const matchBadge = getMatchBadge(candidate.matchScore);
                        const currentWorkload = getMemberTotalWorkload?.(candidate.id) || (100 - candidate.capacity);

                        return (
                          <div
                            key={candidate.id}
                            className="p-3 bg-white border border-gray-200 rounded-lg hover:border-primary hover:shadow-sm transition-all cursor-pointer"
                            onClick={() => handleSelectMember(candidate)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  {idx === 0 && matchBadge.label && (
                                    <Badge className={`text-[10px] ${matchBadge.className}`}>
                                      ★ {matchBadge.label}
                                    </Badge>
                                  )}
                                </div>
                                <div className="font-medium text-primary">{candidate.name}</div>
                                <div className="text-xs text-[hsl(var(--wq-text-secondary))]">{candidate.role}</div>
                              </div>
                              <div className="text-right">
                                <div className={`font-semibold ${getMatchScoreColor(candidate.matchScore)}`}>
                                  {candidate.matchScore}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 mt-2 text-xs">
                              <span className={candidate.locationMatch ? 'text-green-600' : 'text-gray-400'}>
                                <MapPin className="w-3 h-3 inline mr-1" />
                                {candidate.location}
                              </span>
                              <span className={candidate.expertiseMatch ? 'text-green-600' : 'text-gray-400'}>
                                <Briefcase className="w-3 h-3 inline mr-1" />
                                {candidate.expertiseMatch ? '✓ Expertise' : '○ Expertise'}
                              </span>
                              <span className={candidate.hasCapacity ? 'text-green-600' : 'text-amber-500'}>
                                <Gauge className="w-3 h-3 inline mr-1" />
                                {candidate.capacity}% avail
                              </span>
                            </div>

                            <div className="mt-2">
                              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${getCapacityBarColor(currentWorkload)}`}
                                  style={{ width: `${currentWorkload}%` }}
                                />
                              </div>
                            </div>

                            <div className="flex justify-end mt-2">
                              <Button size="sm" variant="ghost" className="text-xs text-primary">
                                Select <ChevronRight className="w-3 h-3 ml-1" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {filteredCandidates.length > 10 && (
                      <Button variant="ghost" className="w-full mt-2 text-sm">
                        Show {filteredCandidates.length - 10} more candidates...
                      </Button>
                    )}
                  </ScrollArea>
                </>
              ) : (
                /* Configuration View */
                <div className="flex-1 p-4 overflow-auto">
                  {configState && (
                    <div className="space-y-6">
                      {/* Selected Member Summary */}
                      <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                          {configState.member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-primary">{configState.member.name}</div>
                          <div className="text-sm text-[hsl(var(--wq-text-secondary))]">{configState.member.role}</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${getMatchScoreColor(configState.member.matchScore)}`}>
                            {configState.member.matchScore}
                          </div>
                          <div className="text-xs text-[hsl(var(--wq-text-secondary))]">Match Score</div>
                        </div>
                      </div>

                      {/* Chair Designation */}
                      <div>
                        <label className="block text-sm font-medium text-primary mb-2">Chair Designation</label>
                        <div className="grid grid-cols-2 gap-3">
                          <div
                            onClick={() => setConfigState({ ...configState, chairType: 'Primary' })}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              configState.chairType === 'Primary'
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-4 h-4 rounded-full border-2 ${
                                  configState.chairType === 'Primary'
                                    ? 'border-primary bg-primary'
                                    : 'border-gray-300'
                                }`}
                              >
                                {configState.chairType === 'Primary' && (
                                  <div className="w-full h-full rounded-full bg-white scale-50" />
                                )}
                              </div>
                              <span className="font-medium">Primary Chair</span>
                            </div>
                            <p className="text-xs text-[hsl(var(--wq-text-secondary))] mt-1">
                              Lead responsibility for this role
                            </p>
                          </div>
                          <div
                            onClick={() => setConfigState({ ...configState, chairType: 'Secondary' })}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              configState.chairType === 'Secondary'
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-4 h-4 rounded-full border-2 ${
                                  configState.chairType === 'Secondary'
                                    ? 'border-primary bg-primary'
                                    : 'border-gray-300'
                                }`}
                              >
                                {configState.chairType === 'Secondary' && (
                                  <div className="w-full h-full rounded-full bg-white scale-50" />
                                )}
                              </div>
                              <span className="font-medium">Secondary Chair</span>
                            </div>
                            <p className="text-xs text-[hsl(var(--wq-text-secondary))] mt-1">
                              Supporting role
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Workload Allocation */}
                      <div>
                        <label className="block text-sm font-medium text-primary mb-2">
                          Workload Allocation: {configState.workload}%
                        </label>
                        <Slider
                          value={[configState.workload]}
                          onValueChange={([val]) => setConfigState({ ...configState, workload: val })}
                          min={MIN_WORKLOAD}
                          max={MAX_WORKLOAD}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>Min: {MIN_WORKLOAD}%</span>
                          <span>Default: {DEFAULT_WORKLOAD}%</span>
                          <span>Max: {MAX_WORKLOAD}%</span>
                        </div>
                      </div>

                      {/* Capacity Impact */}
                      <div>
                        <label className="block text-sm font-medium text-primary mb-2">Capacity Impact</label>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm">Before</span>
                            <span className="font-medium">{100 - configState.member.capacity}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                            <div
                              className={getCapacityBarColor(100 - configState.member.capacity)}
                              style={{ width: `${100 - configState.member.capacity}%`, height: '100%' }}
                            />
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm">After</span>
                            <span className="font-semibold">
                              {100 - configState.member.capacity + configState.workload}%
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={getCapacityBarColor(100 - configState.member.capacity + configState.workload)}
                              style={{ width: `${100 - configState.member.capacity + configState.workload}%`, height: '100%' }}
                            />
                          </div>
                          {100 - configState.member.capacity + configState.workload > MAX_CAPACITY && (
                            <p className="text-xs text-red-600 mt-2">⚠ This assignment will exceed capacity</p>
                          )}
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="block text-sm font-medium text-primary mb-2">Notes (Optional)</label>
                        <Textarea
                          value={configState.notes}
                          onChange={(e) => setConfigState({ ...configState, notes: e.target.value })}
                          placeholder="Add any notes about this assignment..."
                          className="min-h-[80px]"
                        />
                      </div>

                      {/* Multi-assign option */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="rounded border-gray-300" />
                          <span className="text-sm">
                            Also assign {configState.member.name.split(' ')[0]} to other unassigned roles
                          </span>
                        </label>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end gap-3 pt-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setViewState('browse');
                            setConfigState(null);
                          }}
                        >
                          Back to Search
                        </Button>
                        <Button onClick={handleConfirmAssignment} className="bg-primary">
                          Confirm Assignment
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* No Role Selected */
            <div className="flex-1 flex items-center justify-center text-[hsl(var(--wq-text-secondary))]">
              <p>Select a role from the left panel to begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
