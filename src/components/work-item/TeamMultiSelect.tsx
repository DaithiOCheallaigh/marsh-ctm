import React, { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, X, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useTeams } from '@/context/TeamsContext';
import { Team } from '@/data/teams';

export interface SelectedTeam {
  id: string;
  teamName: string;
  memberCount: number;
  totalRoles: number;
  roles: { roleName: string; chairCount: number }[];
}

interface TeamMultiSelectProps {
  selectedTeams: SelectedTeam[];
  onTeamsChange: (teams: SelectedTeam[]) => void;
  placeholder?: string;
  disabled?: boolean;
  maxTeams?: number;
  className?: string;
}

export const TeamMultiSelect: React.FC<TeamMultiSelectProps> = ({
  selectedTeams,
  onTeamsChange,
  placeholder = "Select teams...",
  disabled = false,
  maxTeams,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const { teams } = useTeams();

  // Transform teams from context into selectable options
  const teamOptions = useMemo(() => {
    return teams.map((team: Team) => {
      // Group roles by roleName to get unique roles with chair counts
      const roleGroups = team.roles.reduce((acc, role) => {
        if (!acc[role.roleName]) {
          acc[role.roleName] = 0;
        }
        acc[role.roleName]++;
        return acc;
      }, {} as Record<string, number>);

      const roles = Object.entries(roleGroups).map(([roleName, chairCount]) => ({
        roleName,
        chairCount,
      }));

      return {
        id: team.id,
        teamName: team.name,
        memberCount: team.roles.length, // Using roles count as proxy for member count
        totalRoles: team.roles.length,
        roles,
        primaryManager: team.primaryManager,
      };
    });
  }, [teams]);

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!searchValue) return teamOptions;
    const lowerSearch = searchValue.toLowerCase();
    return teamOptions.filter(team => 
      team.teamName.toLowerCase().includes(lowerSearch)
    );
  }, [teamOptions, searchValue]);

  const selectedIds = new Set(selectedTeams.map(t => t.id));

  const handleSelect = (team: typeof teamOptions[0]) => {
    if (selectedIds.has(team.id)) {
      // Deselect
      onTeamsChange(selectedTeams.filter(t => t.id !== team.id));
    } else {
      // Check max limit
      if (maxTeams && selectedTeams.length >= maxTeams) {
        return;
      }
      // Select
      const newTeam: SelectedTeam = {
        id: team.id,
        teamName: team.teamName,
        memberCount: team.memberCount,
        totalRoles: team.totalRoles,
        roles: team.roles,
      };
      onTeamsChange([...selectedTeams, newTeam]);
    }
  };

  const handleRemove = (teamId: string) => {
    onTeamsChange(selectedTeams.filter(t => t.id !== teamId));
  };

  // Calculate total roles across all selected teams
  const totalRolesCount = selectedTeams.reduce((sum, team) => sum + team.totalRoles, 0);

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between min-h-[40px] h-auto",
              !selectedTeams.length && "text-muted-foreground"
            )}
          >
            {selectedTeams.length > 0 ? (
              <span className="text-sm">
                {selectedTeams.length} team{selectedTeams.length > 1 ? 's' : ''} selected
              </span>
            ) : (
              placeholder
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Search teams..." 
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>
                {teams.length === 0 ? (
                  <div className="py-6 text-center text-sm">
                    <p className="text-muted-foreground">No teams assigned to you.</p>
                    <p className="text-xs text-muted-foreground mt-1">Contact your administrator.</p>
                  </div>
                ) : (
                  <p className="py-6 text-center text-sm text-muted-foreground">No teams found.</p>
                )}
              </CommandEmpty>
              <CommandGroup>
                {filteredOptions.map((team) => {
                  const isSelected = selectedIds.has(team.id);
                  const isDisabled = !isSelected && maxTeams !== undefined && selectedTeams.length >= maxTeams;
                  
                  return (
                    <CommandItem
                      key={team.id}
                      value={team.teamName}
                      onSelect={() => handleSelect(team)}
                      disabled={isDisabled}
                      className={cn(
                        "cursor-pointer",
                        isDisabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className={cn(
                          "flex h-4 w-4 items-center justify-center rounded border",
                          isSelected 
                            ? "bg-primary border-primary text-primary-foreground" 
                            : "border-muted-foreground/30"
                        )}>
                          {isSelected && <Check className="h-3 w-3" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium text-foreground truncate">
                              {team.teamName}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {team.memberCount} Members · {team.roles.length} Roles
                          </p>
                        </div>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Teams as Chips */}
      {selectedTeams.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTeams.map((team) => (
            <Badge
              key={team.id}
              variant="secondary"
              className="flex items-center gap-1 py-1 px-2 bg-primary/10 text-primary hover:bg-primary/20"
            >
              <span className="text-sm">{team.teamName}</span>
              <span className="text-xs text-muted-foreground">({team.totalRoles} roles)</span>
              <button
                type="button"
                onClick={() => handleRemove(team.id)}
                className="ml-1 rounded-full hover:bg-primary/20 p-0.5"
                aria-label={`Remove ${team.teamName}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Roles Summary */}
      {selectedTeams.length > 0 && (
        <div className="bg-[hsl(var(--wq-bg-header))] border border-[hsl(var(--wq-border))] rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[hsl(var(--wq-primary))]">
              Roles Assigned Summary
            </span>
            <span className="text-sm text-muted-foreground">
              0 / {totalRolesCount} Completed
            </span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {selectedTeams.map((team) => (
              <div key={team.id} className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{team.teamName}:</span> {team.totalRoles} roles
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMultiSelect;
