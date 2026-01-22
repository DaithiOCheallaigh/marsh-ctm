// Concept 3: Kanban-Style Assignment Board
// Visual board with columns for each role and draggable candidate cards

import React, { useState, useMemo } from "react";
import { Check, X, MapPin, Briefcase, Gauge, Search, Users, GripVertical, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TeamMember, teamMembers } from "@/data/teamMembers";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AssignmentConceptProps,
  AssignmentData,
  DEFAULT_WORKLOAD,
  MIN_WORKLOAD,
  MAX_WORKLOAD,
  MAX_CAPACITY,
  getMatchScoreColor,
  getMatchBadge,
  getCapacityBarColor,
} from "./types";

interface DragState {
  member: TeamMember;
  sourceId: 'pool';
}

interface DropConfig {
  roleId: string;
  member: TeamMember;
  chairType: 'Primary' | 'Secondary';
  workload: number;
}

export const Concept3KanbanBoard: React.FC<AssignmentConceptProps> = ({
  roles,
  onAssign,
  onUnassign,
  assignments,
  isReadOnly = false,
  getMemberTotalWorkload,
  checkDuplicateAssignment,
}) => {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);
  const [dropConfig, setDropConfig] = useState<DropConfig | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Get assignment for a role
  const getAssignment = (roleId: string): AssignmentData | undefined => {
    return assignments.find(a => a.roleId === roleId);
  };

  // Filter available candidates (not assigned anywhere)
  const availableCandidates = useMemo(() => {
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

  const handleDragStart = (member: TeamMember) => {
    if (isReadOnly) return;
    setDragState({ member, sourceId: 'pool' });
  };

  const handleDragEnd = () => {
    setDragState(null);
    setHoveredColumn(null);
  };

  const handleDrop = (roleId: string) => {
    if (!dragState || isReadOnly) return;

    const role = roles.find(r => r.roleId === roleId);
    if (!role) return;

    // Open config dialog
    setDropConfig({
      roleId,
      member: dragState.member,
      chairType: 'Primary',
      workload: DEFAULT_WORKLOAD,
    });

    handleDragEnd();
  };

  const handleConfirmDrop = () => {
    if (!dropConfig) return;

    const role = roles.find(r => r.roleId === dropConfig.roleId);
    if (!role) return;

    onAssign({
      roleId: dropConfig.roleId,
      roleName: role.roleName,
      teamName: role.teamName,
      selectedPerson: dropConfig.member,
      chairType: dropConfig.chairType,
      workloadPercentage: dropConfig.workload,
    });

    setDropConfig(null);
  };

  const handleTapToAssign = (member: TeamMember, roleId: string) => {
    if (isReadOnly) return;

    const role = roles.find(r => r.roleId === roleId);
    if (!role) return;

    setDropConfig({
      roleId,
      member,
      chairType: 'Primary',
      workload: DEFAULT_WORKLOAD,
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
            <h3 className="font-semibold text-primary">Concept 3: Kanban Board</h3>
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

      {/* Kanban Board */}
      <div className="p-4">
        {/* Role Columns */}
        <div className="flex gap-4 mb-4 overflow-x-auto pb-2">
          {roles.map((role) => {
            const assignment = getAssignment(role.roleId);
            const isHovered = hoveredColumn === role.roleId && dragState !== null;

            return (
              <div
                key={role.roleId}
                className={`flex-shrink-0 w-64 rounded-lg border-2 transition-all ${
                  isHovered
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : assignment
                    ? 'border-green-200 bg-green-50'
                    : 'border-dashed border-gray-300 bg-gray-50'
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (!assignment) setHoveredColumn(role.roleId);
                }}
                onDragLeave={() => setHoveredColumn(null)}
                onDrop={() => !assignment && handleDrop(role.roleId)}
              >
                {/* Column Header */}
                <div className="px-3 py-2 border-b border-gray-200">
                  <div className="font-medium text-sm text-primary truncate">{role.roleName}</div>
                  <div className="text-xs text-[hsl(var(--wq-text-secondary))]">
                    {assignment ? '✓ Assigned' : '○ Drop here'}
                  </div>
                </div>

                {/* Column Content */}
                <div className="p-3 min-h-[120px]">
                  {assignment ? (
                    /* Assigned Card */
                    <div className="bg-white rounded-lg border border-green-200 p-3 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium text-sm text-primary">{assignment.selectedPerson?.name}</div>
                          <div className="text-xs text-[hsl(var(--wq-text-secondary))]">
                            {assignment.selectedPerson?.role}
                          </div>
                        </div>
                        {!isReadOnly && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                            onClick={() => onUnassign(role.roleId)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge
                          className={
                            assignment.chairType === 'Primary'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-gray-200 text-gray-700'
                          }
                        >
                          {assignment.chairType}
                        </Badge>
                        <span className="text-[hsl(var(--wq-text-secondary))]">
                          {assignment.workloadPercentage}%
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={getCapacityBarColor(
                              100 - (assignment.selectedPerson?.capacity || 0) + assignment.workloadPercentage
                            )}
                            style={{
                              width: `${100 - (assignment.selectedPerson?.capacity || 0) + assignment.workloadPercentage}%`,
                              height: '100%',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : isHovered ? (
                    /* Drop Preview */
                    <div className="border-2 border-dashed border-primary rounded-lg p-3 bg-white/50">
                      <div className="text-center">
                        <div className="font-medium text-sm text-primary">{dragState?.member.name}</div>
                        <div className="text-xs text-[hsl(var(--wq-text-secondary))]">
                          +{DEFAULT_WORKLOAD}% workload
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Empty Drop Zone */
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                      {dragState ? 'Drop here' : 'Drag to assign'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs font-medium text-[hsl(var(--wq-text-secondary))] uppercase tracking-wide">
            Available Team Members
          </span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="text-xs text-[hsl(var(--wq-text-secondary))]">
            Drag to assign • Click for mobile
          </div>
        </div>

        {/* Candidate Pool */}
        <ScrollArea className="h-[200px]">
          <div className="flex gap-3 pb-2">
            {availableCandidates.map((candidate) => {
              const matchBadge = getMatchBadge(candidate.matchScore);
              const currentWorkload = getMemberTotalWorkload?.(candidate.id) || (100 - candidate.capacity);
              const isDragging = dragState?.member.id === candidate.id;

              return (
                <div
                  key={candidate.id}
                  draggable={!isReadOnly}
                  onDragStart={() => handleDragStart(candidate)}
                  onDragEnd={handleDragEnd}
                  className={`flex-shrink-0 w-48 p-3 bg-white border rounded-lg cursor-grab active:cursor-grabbing transition-all ${
                    isDragging
                      ? 'opacity-50 border-primary shadow-lg scale-105'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-primary truncate">{candidate.name}</div>
                      <div className="text-xs text-[hsl(var(--wq-text-secondary))] truncate">{candidate.role}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-semibold text-sm ${getMatchScoreColor(candidate.matchScore)}`}>
                      {candidate.matchScore}
                    </span>
                    {matchBadge.label && (
                      <Badge className={`text-[10px] ${matchBadge.className}`}>
                        {matchBadge.label}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[10px] mb-2">
                    <span className={candidate.locationMatch ? 'text-green-600' : 'text-gray-400'}>
                      <MapPin className="w-2.5 h-2.5 inline" />
                    </span>
                    <span className={candidate.expertiseMatch ? 'text-green-600' : 'text-gray-400'}>
                      <Briefcase className="w-2.5 h-2.5 inline" />
                    </span>
                    <span className={candidate.hasCapacity ? 'text-green-600' : 'text-amber-500'}>
                      <Gauge className="w-2.5 h-2.5 inline" /> {candidate.capacity}%
                    </span>
                  </div>

                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden mb-2">
                    <div
                      className={getCapacityBarColor(currentWorkload)}
                      style={{ width: `${currentWorkload}%`, height: '100%' }}
                    />
                  </div>

                  {/* Mobile: Tap to assign dropdown */}
                  <div className="flex flex-wrap gap-1">
                    {roles
                      .filter(r => !getAssignment(r.roleId))
                      .slice(0, 2)
                      .map(role => (
                        <Button
                          key={role.roleId}
                          variant="ghost"
                          size="sm"
                          className="h-5 px-1.5 text-[10px] text-primary hover:bg-primary/10"
                          onClick={() => handleTapToAssign(candidate, role.roleId)}
                        >
                          + {role.roleName.split(' ')[0]}
                        </Button>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Configuration Dialog */}
      <Dialog open={dropConfig !== null} onOpenChange={() => setDropConfig(null)}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Configure Assignment</DialogTitle>
          </DialogHeader>

          {dropConfig && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {dropConfig.member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-medium text-primary">{dropConfig.member.name}</div>
                  <div className="text-xs text-[hsl(var(--wq-text-secondary))]">
                    → {roles.find(r => r.roleId === dropConfig.roleId)?.roleName}
                  </div>
                </div>
              </div>

              {/* Chair Type */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">Chair Type</label>
                <div className="flex gap-2">
                  <Button
                    variant={dropConfig.chairType === 'Primary' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setDropConfig({ ...dropConfig, chairType: 'Primary' })}
                  >
                    Primary
                  </Button>
                  <Button
                    variant={dropConfig.chairType === 'Secondary' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setDropConfig({ ...dropConfig, chairType: 'Secondary' })}
                  >
                    Secondary
                  </Button>
                </div>
              </div>

              {/* Workload */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Workload: {dropConfig.workload}%
                </label>
                <Slider
                  value={[dropConfig.workload]}
                  onValueChange={([val]) => setDropConfig({ ...dropConfig, workload: val })}
                  min={MIN_WORKLOAD}
                  max={MAX_WORKLOAD}
                  step={1}
                />
              </div>

              {/* Capacity Preview */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Capacity Impact</span>
                  <span>
                    {100 - dropConfig.member.capacity}% →{' '}
                    <span className="font-semibold">
                      {100 - dropConfig.member.capacity + dropConfig.workload}%
                    </span>
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={getCapacityBarColor(100 - dropConfig.member.capacity + dropConfig.workload)}
                    style={{ width: `${100 - dropConfig.member.capacity + dropConfig.workload}%`, height: '100%' }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setDropConfig(null)}>
                  Cancel
                </Button>
                <Button onClick={handleConfirmDrop}>
                  <Check className="w-4 h-4 mr-1" /> Confirm
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
