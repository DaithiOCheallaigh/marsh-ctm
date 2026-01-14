import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, AlertCircle, Star, Users, Briefcase, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { FormSelect, FormSelectContent, FormSelectItem, FormSelectTrigger, FormSelectValue } from "@/components/form/FormSelect";
import { getFieldStateClasses } from "@/components/form/FormDirtyContext";
import { WorkItemTeamConfig, RoleChairConfig, TeamAssignmentValidationError } from "@/types/teamAssignment";
import { getTeamsForManager, getUniqueRolesForTeam, managerHasTeams, getManagerById } from "@/data/managerTeamMappings";
import { Team } from "@/data/teams";
interface TeamAssignmentConfigurationProps {
  assignedToManagerId: string;
  primaryTeam: WorkItemTeamConfig | null;
  additionalTeams: WorkItemTeamConfig[];
  onPrimaryTeamChange: (team: WorkItemTeamConfig | null) => void;
  onAdditionalTeamsChange: (teams: WorkItemTeamConfig[]) => void;
  isDirty?: boolean;
}

// Manager Synopsis Component
const ManagerSynopsis = ({
  managerId
}: {
  managerId: string;
}) => {
  const manager = getManagerById(managerId);
  const teams = getTeamsForManager(managerId);
  if (!manager || teams.length === 0) return null;

  // Calculate total unique roles across all teams
  const allRoles = new Set<string>();
  let totalChairs = 0;
  teams.forEach(team => {
    team.roles.forEach(role => {
      allRoles.add(role.roleName);
      totalChairs++;
    });
  });

  // Calculate capacity (simplified: available chairs / total chairs)
  const capacityPercentage = Math.round(totalChairs * 0.7 / totalChairs * 100); // Mock 70% capacity

  return <div className="bg-[hsl(var(--wq-bg-header))] rounded-lg p-4 mb-4 border border-[hsl(var(--wq-border))]">
      <div className="flex items-center justify-between">
        {/* Manager Info */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary">Assigned to: {manager.name}</p>
            <p className="text-xs text-muted-foreground">{manager.role}</p>
          </div>
        </div>

        {/* Teams & Capacity */}
        <div className="flex items-center gap-6">
          {/* Teams */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Teams: {teams.length}</span>
            <div className="flex gap-1">
              {teams.map(team => <span key={team.id} className="text-[11px] px-2 py-0.5 rounded bg-[hsl(195,100%,95%)] text-[hsl(195,100%,35%)] font-medium">
                  {team.name}
                </span>)}
            </div>
          </div>

          {/* Capacity */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Overall Team Capacity:</span>
            <span className={cn("text-sm font-semibold text-primary", capacityPercentage >= 80 ? "text-[hsl(var(--wq-status-pending-text))]" : capacityPercentage >= 50 ? "text-[hsl(var(--wq-priority-medium))]" : "text-[hsl(var(--wq-status-completed-text))]")}>
              {capacityPercentage}%
            </span>
          </div>
        </div>
      </div>
    </div>;
};
interface RoleWithMaxChairs {
  id: string;
  roleName: string;
  maxChairs: number;
}
const TeamCard = ({
  config,
  isPrimary,
  availableRoles,
  onUpdate,
  onRemove,
  canRemove,
  isDirty = false
}: {
  config: WorkItemTeamConfig;
  isPrimary: boolean;
  availableRoles: RoleWithMaxChairs[];
  onUpdate: (updates: Partial<WorkItemTeamConfig>) => void;
  onRemove: () => void;
  canRemove: boolean;
  isDirty?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const handleRoleToggle = (role: RoleWithMaxChairs, checked: boolean) => {
    let updatedRoles: RoleChairConfig[];
    if (checked) {
      // Add role with default chair requirement of 1
      updatedRoles = [...config.roles, {
        roleId: role.id,
        roleName: role.roleName,
        chairRequirement: 1
      }];
    } else {
      // Remove role
      updatedRoles = config.roles.filter(r => r.roleId !== role.id);
    }
    onUpdate({
      roles: updatedRoles
    });
  };
  const handleChairRequirementChange = (roleId: string, value: number) => {
    const updatedRoles = config.roles.map(r => r.roleId === roleId ? {
      ...r,
      chairRequirement: Math.max(1, Math.min(10, value))
    } : r);
    onUpdate({
      roles: updatedRoles
    });
  };
  const isRoleSelected = (roleId: string) => config.roles.some(r => r.roleId === roleId);
  const getRoleChairRequirement = (roleId: string) => config.roles.find(r => r.roleId === roleId)?.chairRequirement || 1;
  const totalChairs = config.roles.reduce((sum, r) => sum + r.chairRequirement, 0);
  return <div className={cn("rounded-lg border p-4 space-y-4", isPrimary ? "bg-primary/5 border-primary/30" : "bg-[hsl(var(--wq-bg-header))] border-[hsl(var(--wq-border))]")}>
      {/* Team Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isPrimary && <Badge variant="default" className="bg-primary text-primary-foreground text-xs">
              <Star className="h-3 w-3 mr-1" />
              Primary
            </Badge>}
          <span className="font-semibold text-primary">{config.teamName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {config.roles.length} role{config.roles.length !== 1 ? 's' : ''} • {totalChairs} chair{totalChairs !== 1 ? 's' : ''}
          </Badge>
          {canRemove && <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="text-muted-foreground hover:text-destructive h-8 w-8 p-0">
              <Trash2 className="h-4 w-4" />
            </Button>}
        </div>
      </div>

      {/* Collapsible Role Configuration */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--wq-text-secondary))] hover:text-primary transition-colors">
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          Role & Chair Configuration
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          {availableRoles.length === 0 ? <div className="text-sm text-muted-foreground italic py-2">
              No roles configured for this team
            </div> : <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Select roles and specify chair requirements for each:
              </p>
              {availableRoles.map(role => {
            const isSelected = isRoleSelected(role.id);
            const chairValue = getRoleChairRequirement(role.id);
            return <div key={role.id} className={cn("flex items-center gap-4 p-3 rounded-lg border transition-all", isSelected ? "bg-background border-primary/30" : "bg-muted/30 border-transparent")}>
                    <Checkbox id={`role-${role.id}`} checked={isSelected} onCheckedChange={checked => handleRoleToggle(role, checked as boolean)} />
                    <Label htmlFor={`role-${role.id}`} className={cn("flex-1 cursor-pointer text-sm", isSelected ? "text-primary font-medium" : "text-muted-foreground")}>
                      {role.roleName}
                    </Label>
                    {isSelected && <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground whitespace-nowrap">
                          Chairs:
                        </Label>
                        <input type="number" min={1} max={10} value={chairValue} onChange={e => handleChairRequirementChange(role.id, parseInt(e.target.value) || 1)} className={cn("w-16 h-8 px-2 text-sm rounded-md border text-center", getFieldStateClasses(isDirty))} />
                      </div>}
                  </div>;
          })}
            </div>}

          {/* Validation Warning */}
          {config.roles.length === 0 && <div className="flex items-center gap-2 mt-3 p-2 bg-destructive/10 text-destructive text-xs rounded-md">
              <AlertCircle className="h-4 w-4" />
              At least one role must be selected
            </div>}
        </CollapsibleContent>
      </Collapsible>
    </div>;
};
const TeamAssignmentConfiguration = ({
  assignedToManagerId,
  primaryTeam,
  additionalTeams,
  onPrimaryTeamChange,
  onAdditionalTeamsChange,
  isDirty = false
}: TeamAssignmentConfigurationProps) => {
  const [isOpen, setIsOpen] = useState(true);

  // Get available teams for the selected manager
  const availableTeams = useMemo(() => {
    if (!assignedToManagerId) return [];
    return getTeamsForManager(assignedToManagerId);
  }, [assignedToManagerId]);

  // Get all selected team IDs (primary + additional)
  const selectedTeamIds = useMemo(() => {
    const ids: string[] = [];
    if (primaryTeam) ids.push(primaryTeam.teamId);
    additionalTeams.forEach(t => ids.push(t.teamId));
    return ids;
  }, [primaryTeam, additionalTeams]);

  // Filter available teams for "Add Team" dropdown
  const unselectedTeams = useMemo(() => {
    return availableTeams.filter(t => !selectedTeamIds.includes(t.id));
  }, [availableTeams, selectedTeamIds]);

  // Check if manager has teams configured
  const hasTeams = managerHasTeams(assignedToManagerId);

  // Handle primary team selection
  const handlePrimaryTeamSelect = (teamId: string) => {
    const team = availableTeams.find(t => t.id === teamId);
    if (!team) return;
    onPrimaryTeamChange({
      teamId: team.id,
      teamName: team.name,
      isPrimary: true,
      roles: []
    });
  };

  // Handle adding additional team
  const handleAddAdditionalTeam = (teamId: string) => {
    const team = availableTeams.find(t => t.id === teamId);
    if (!team) return;
    const newTeam: WorkItemTeamConfig = {
      teamId: team.id,
      teamName: team.name,
      isPrimary: false,
      roles: []
    };
    onAdditionalTeamsChange([...additionalTeams, newTeam]);
  };

  // Handle updating primary team
  const handleUpdatePrimaryTeam = (updates: Partial<WorkItemTeamConfig>) => {
    if (!primaryTeam) return;
    onPrimaryTeamChange({
      ...primaryTeam,
      ...updates
    });
  };

  // Handle updating additional team
  const handleUpdateAdditionalTeam = (teamId: string, updates: Partial<WorkItemTeamConfig>) => {
    onAdditionalTeamsChange(additionalTeams.map(t => t.teamId === teamId ? {
      ...t,
      ...updates
    } : t));
  };

  // Handle removing additional team
  const handleRemoveAdditionalTeam = (teamId: string) => {
    onAdditionalTeamsChange(additionalTeams.filter(t => t.teamId !== teamId));
  };

  // No manager selected state
  if (!assignedToManagerId) {
    return <div className="rounded-lg border border-border-primary p-6 bg-muted/30">
        <div className="flex items-center gap-3 text-muted-foreground">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">
            Please select an "Assign To" manager first to configure team assignments.
          </p>
        </div>
      </div>;
  }

  // Manager has no teams mapped
  if (!hasTeams) {
    return <div className="rounded-lg border border-destructive/30 p-6 bg-destructive/5">
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="text-sm font-medium">No teams configured for this manager</p>
            <p className="text-xs mt-1">
              The selected manager does not have any teams mapped in Team Setup. 
              Please select a different manager or configure team mappings.
            </p>
          </div>
        </div>
      </div>;
  }
  return <div className="space-y-4">
      {/* Manager Synopsis */}
      <ManagerSynopsis managerId={assignedToManagerId} />

      {/* Primary Team Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-primary">
          Primary Team<span className="text-destructive">*</span>
        </Label>
        
        {!primaryTeam ? <FormSelect onValueChange={handlePrimaryTeamSelect}>
            <FormSelectTrigger fieldName="primaryTeam" className={cn("max-w-md", !primaryTeam && "border-dashed")}>
              <FormSelectValue placeholder="Select primary team..." />
            </FormSelectTrigger>
            <FormSelectContent>
              {availableTeams.map(team => <FormSelectItem key={team.id} value={team.id}>
                  <div className="flex items-center gap-2">
                    <span>{team.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({team.roles.length} roles)
                    </span>
                  </div>
                </FormSelectItem>)}
            </FormSelectContent>
          </FormSelect> : <TeamCard config={primaryTeam} isPrimary={true} availableRoles={getUniqueRolesForTeam(primaryTeam.teamId)} onUpdate={handleUpdatePrimaryTeam} onRemove={() => onPrimaryTeamChange(null)} canRemove={true} isDirty={isDirty} />}
      </div>

      {/* Additional Teams Section */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-[hsl(var(--wq-text-secondary))]">
          Additional Teams (Optional)
        </Label>

        {/* Existing Additional Teams */}
        {additionalTeams.map(team => <TeamCard key={team.teamId} config={team} isPrimary={false} availableRoles={getUniqueRolesForTeam(team.teamId)} onUpdate={updates => handleUpdateAdditionalTeam(team.teamId, updates)} onRemove={() => handleRemoveAdditionalTeam(team.teamId)} canRemove={true} isDirty={isDirty} />)}

        {/* Add Team Button/Dropdown */}
        {unselectedTeams.length > 0 && <div className="flex items-center gap-3">
            <FormSelect onValueChange={handleAddAdditionalTeam}>
              <FormSelectTrigger fieldName="additionalTeam" className="max-w-md border-dashed">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Plus className="h-4 w-4" />
                  <span>Add another team...</span>
                </div>
              </FormSelectTrigger>
              <FormSelectContent>
                {unselectedTeams.map(team => <FormSelectItem key={team.id} value={team.id}>
                    <div className="flex items-center gap-2">
                      <span>{team.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({team.roles.length} roles)
                      </span>
                    </div>
                  </FormSelectItem>)}
              </FormSelectContent>
            </FormSelect>
          </div>}

        {unselectedTeams.length === 0 && selectedTeamIds.length > 0 && <p className="text-xs text-muted-foreground italic">
            All available teams have been added
          </p>}
      </div>

      {/* Validation Summary */}
      {primaryTeam && primaryTeam.roles.length === 0 && <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <span>Primary team must have at least one role with chair requirements defined</span>
        </div>}
    </div>;
};
export default TeamAssignmentConfiguration;