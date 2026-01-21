import { useState, useMemo } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, AlertCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { FormSelect, FormSelectContent, FormSelectItem, FormSelectTrigger, FormSelectValue } from "@/components/form/FormSelect";
import { WorkItemTeamConfig, RoleConfig } from "@/types/teamAssignment";
import { getTeamsForManager, getUniqueRolesForTeam, managerHasTeams, getManagerById } from "@/data/managerTeamMappings";

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
  teams.forEach(team => {
    team.roles.forEach(role => {
      allRoles.add(role.roleName);
    });
  });

  // Calculate capacity (simplified: mock 70% capacity)
  const capacityPercentage = 70;

  return (
    <div className="bg-[hsl(var(--wq-bg-header))] rounded-lg p-4 mb-4 border border-[hsl(var(--wq-border))]">
      <div className="flex items-center justify-between">
        {/* Manager Info */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary">Assigned To: {manager.name}</p>
            <p className="text-xs text-muted-foreground">{manager.role}</p>
          </div>
        </div>

        {/* Teams & Capacity */}
        <div className="flex items-center gap-6">
          {/* Teams */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Teams: {teams.length}</span>
            <div className="flex gap-1 flex-wrap max-w-[300px]">
              {teams.map(team => (
                <span 
                  key={team.id} 
                  className="text-[11px] px-2 py-0.5 rounded bg-[hsl(195,100%,95%)] text-[hsl(195,100%,35%)] font-medium truncate max-w-[100px]"
                  title={team.name}
                >
                  {team.name}
                </span>
              ))}
            </div>
          </div>

          {/* Capacity */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Overall Team Capacity:</span>
            <span className={cn(
              "text-sm font-semibold",
              capacityPercentage >= 80 ? "text-[hsl(var(--wq-status-pending-text))]" : 
              capacityPercentage >= 50 ? "text-[hsl(var(--wq-priority-medium))]" : 
              "text-[hsl(var(--wq-status-completed-text))]"
            )}>
              {capacityPercentage}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface RoleWithId {
  id: string;
  roleName: string;
}

const TeamCard = ({
  config,
  isPrimary,
  availableRoles,
  onUpdate,
  onRemove,
  canRemove,
}: {
  config: WorkItemTeamConfig;
  isPrimary: boolean;
  availableRoles: RoleWithId[];
  onUpdate: (updates: Partial<WorkItemTeamConfig>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleRoleToggle = (role: RoleWithId, checked: boolean) => {
    let updatedRoles: RoleConfig[];
    if (checked) {
      // Add role (simplified - no chair requirement in V1)
      updatedRoles = [...config.roles, {
        roleId: role.id,
        roleName: role.roleName,
      }];
    } else {
      // Remove role
      updatedRoles = config.roles.filter(r => r.roleId !== role.id);
    }
    onUpdate({ roles: updatedRoles });
  };

  const isRoleSelected = (roleId: string) => config.roles.some(r => r.roleId === roleId);

  return (
    <div className={cn(
      "rounded-lg border overflow-hidden",
      isPrimary ? "border-primary/30" : "border-[hsl(var(--wq-border))]"
    )}>
      {/* Team Header */}
      <div className="flex items-center justify-between bg-[hsl(220,60%,97%)] px-4 py-3 border-b border-[hsl(var(--wq-border))]">
        <div className="flex items-center gap-2">
          {isPrimary && (
            <Badge variant="default" className="bg-primary text-primary-foreground text-xs">
              Primary
            </Badge>
          )}
          <span 
            className="font-semibold text-primary truncate max-w-[200px]"
            title={config.teamName}
          >
            {config.teamName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {config.roles.length} role{config.roles.length !== 1 ? 's' : ''}
          </Badge>
          {canRemove && (
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={onRemove} 
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="p-4 bg-white space-y-4">
        {/* Collapsible Role Configuration */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--wq-text-secondary))] hover:text-primary transition-colors">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Role Selection
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4">
            {availableRoles.length === 0 ? (
              <div className="text-sm text-muted-foreground italic py-2">
                No roles configured for this team
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Select roles for this team:
                </p>
                {availableRoles.map(role => {
                  const isSelected = isRoleSelected(role.id);
                  return (
                    <div 
                      key={role.id} 
                      className={cn(
                        "flex items-center gap-4 p-3 rounded-lg border transition-all",
                        isSelected 
                          ? "bg-background border-primary/30" 
                          : "bg-muted/30 border-transparent"
                      )}
                    >
                      <Checkbox 
                        id={`role-${role.id}`} 
                        checked={isSelected} 
                        onCheckedChange={checked => handleRoleToggle(role, checked as boolean)} 
                      />
                      <Label 
                        htmlFor={`role-${role.id}`} 
                        className={cn(
                          "flex-1 cursor-pointer text-sm",
                          isSelected ? "text-primary font-medium" : "text-muted-foreground"
                        )}
                      >
                        {role.roleName}
                      </Label>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Validation Warning */}
            {config.roles.length === 0 && (
              <div className="flex items-center gap-2 mt-3 p-2 bg-destructive/10 text-destructive text-xs rounded-md">
                <AlertCircle className="h-4 w-4" />
                Please select at least one role for this work item
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

const TeamAssignmentConfiguration = ({
  assignedToManagerId,
  primaryTeam,
  additionalTeams,
  onPrimaryTeamChange,
  onAdditionalTeamsChange,
}: TeamAssignmentConfigurationProps) => {
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
    onAdditionalTeamsChange(additionalTeams.map(t => 
      t.teamId === teamId ? { ...t, ...updates } : t
    ));
  };

  // Handle removing additional team
  const handleRemoveAdditionalTeam = (teamId: string) => {
    onAdditionalTeamsChange(additionalTeams.filter(t => t.teamId !== teamId));
  };

  // Get unique roles for a team (simplified - no maxChairs)
  const getSimplifiedRolesForTeam = (teamId: string): RoleWithId[] => {
    const roles = getUniqueRolesForTeam(teamId);
    return roles.map(r => ({ id: r.id, roleName: r.roleName }));
  };

  // No manager selected state
  if (!assignedToManagerId) {
    return (
      <div className="rounded-lg border border-border-primary p-6 bg-muted/30">
        <div className="flex items-center gap-3 text-muted-foreground">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">
            Please select an "Assigned To" manager first to configure team assignments.
          </p>
        </div>
      </div>
    );
  }

  // Manager has no teams mapped
  if (!hasTeams) {
    return (
      <div className="rounded-lg border border-destructive/30 p-6 bg-destructive/5">
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
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Manager Synopsis */}
      <ManagerSynopsis managerId={assignedToManagerId} />

      {/* Primary Team Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-primary">
          Primary Team<span className="text-destructive">*</span>
        </Label>
        
        {!primaryTeam ? (
          <FormSelect onValueChange={handlePrimaryTeamSelect}>
            <FormSelectTrigger 
              fieldName="primaryTeam" 
              className={cn("max-w-md hover:bg-[#E5EEFF]/30 transition-colors", !primaryTeam && "border-dashed")}
            >
              <FormSelectValue placeholder="Select primary team..." />
            </FormSelectTrigger>
            <FormSelectContent>
              {availableTeams.map(team => (
                <FormSelectItem key={team.id} value={team.id}>
                  <div className="flex items-center gap-2">
                    <span className="truncate max-w-[180px]" title={team.name}>{team.name}</span>
                    <span className="text-xs text-black data-[highlighted]:text-white group-data-[highlighted]:text-white">
                      ({team.roles.length} roles)
                    </span>
                  </div>
                </FormSelectItem>
              ))}
            </FormSelectContent>
          </FormSelect>
        ) : (
          <TeamCard 
            config={primaryTeam} 
            isPrimary={true} 
            availableRoles={getSimplifiedRolesForTeam(primaryTeam.teamId)} 
            onUpdate={handleUpdatePrimaryTeam} 
            onRemove={() => onPrimaryTeamChange(null)} 
            canRemove={true} 
          />
        )}
      </div>

      {/* Additional Teams Section */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-[hsl(var(--wq-text-secondary))]">
          Additional Teams (Optional)
        </Label>

        {/* Existing Additional Teams */}
        {additionalTeams.map(team => (
          <TeamCard 
            key={team.teamId} 
            config={team} 
            isPrimary={false} 
            availableRoles={getSimplifiedRolesForTeam(team.teamId)} 
            onUpdate={updates => handleUpdateAdditionalTeam(team.teamId, updates)} 
            onRemove={() => handleRemoveAdditionalTeam(team.teamId)} 
            canRemove={true} 
          />
        ))}

        {/* Add Team Button/Dropdown */}
        {unselectedTeams.length > 0 && (
          <div className="flex items-center gap-3">
            <FormSelect onValueChange={handleAddAdditionalTeam}>
              <FormSelectTrigger 
                fieldName="additionalTeam" 
                className="max-w-md border-dashed hover:bg-[#E5EEFF]/30 transition-colors"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Plus className="h-4 w-4" />
                  <span>Add another team...</span>
                </div>
              </FormSelectTrigger>
              <FormSelectContent>
                {unselectedTeams.map(team => (
                  <FormSelectItem key={team.id} value={team.id}>
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-[180px]" title={team.name}>{team.name}</span>
                      <span className="text-xs text-black data-[highlighted]:text-white group-data-[highlighted]:text-white">
                        ({team.roles.length} roles)
                      </span>
                    </div>
                  </FormSelectItem>
                ))}
              </FormSelectContent>
            </FormSelect>
          </div>
        )}

        {unselectedTeams.length === 0 && selectedTeamIds.length > 0 && (
          <p className="text-xs text-muted-foreground italic">
            All available teams have been added
          </p>
        )}
      </div>

      {/* Validation Summary */}
      {primaryTeam && primaryTeam.roles.length === 0 && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <span>Primary team must have at least one role selected</span>
        </div>
      )}
    </div>
  );
};

export default TeamAssignmentConfiguration;
