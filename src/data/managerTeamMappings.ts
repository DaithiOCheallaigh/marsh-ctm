import { ManagerTeamMapping } from '@/types/teamAssignment';
import { teamsData } from './teams';
import { managers } from './teamMembers';

/**
 * Manager to Team mappings
 * This defines which teams each manager has access to for work item assignment.
 * In a real system, this would come from Team Setup configuration.
 */
export const managerTeamMappings: ManagerTeamMapping[] = [
  {
    managerId: 'tm1', // David Chen
    managerName: 'David Chen',
    teamIds: ['1', '4'], // Accounts, Management
  },
  {
    managerId: 'tm2', // Jennifer Walsh
    managerName: 'Jennifer Walsh',
    teamIds: ['2', '5'], // Claims, Risk
  },
  {
    managerId: 'tm3', // Colin Masterson
    managerName: 'Colin Masterson',
    teamIds: ['1', '2', '3'], // Accounts, Claims, Cyber Security
  },
  {
    managerId: 'tm4', // Amanda Foster
    managerName: 'Amanda Foster',
    teamIds: ['2', '4', '5'], // Claims, Management, Risk
  },
  {
    managerId: 'tm5', // Patricia Morrison
    managerName: 'Patricia Morrison',
    teamIds: ['3', '5'], // Cyber Security, Risk
  },
  {
    managerId: 'tm6', // Michael Santos
    managerName: 'Michael Santos',
    teamIds: ['1', '3', '4'], // Accounts, Cyber Security, Management
  },
];

/**
 * Get teams available for a specific manager
 * Only returns teams that have at least one role configured
 * @param managerId The ID of the manager
 * @returns Array of teams the manager has access to (with roles)
 */
export const getTeamsForManager = (managerId: string) => {
  const mapping = managerTeamMappings.find(m => m.managerId === managerId);
  if (!mapping) return [];
  
  // Filter to only include teams that have roles configured
  return teamsData.filter(team => 
    mapping.teamIds.includes(team.id) && team.roles.length > 0
  );
};

/**
 * Get unique roles for a specific team
 * Roles are grouped by roleName to avoid duplicates
 * @param teamId The ID of the team
 * @returns Array of unique role names with their details
 */
export const getUniqueRolesForTeam = (teamId: string) => {
  const team = teamsData.find(t => t.id === teamId);
  if (!team) return [];
  
  // Group roles by roleName to get unique roles
  const roleMap = new Map<string, { roleName: string; maxChairs: number }>();
  
  team.roles.forEach(role => {
    const existing = roleMap.get(role.roleName);
    if (!existing) {
      roleMap.set(role.roleName, {
        roleName: role.roleName,
        maxChairs: 1,
      });
    } else {
      roleMap.set(role.roleName, {
        ...existing,
        maxChairs: existing.maxChairs + 1,
      });
    }
  });
  
  return Array.from(roleMap.values()).map((role, index) => ({
    id: `${teamId}-role-${index}`,
    roleName: role.roleName,
    maxChairs: role.maxChairs,
  }));
};

/**
 * Check if a manager has any teams mapped
 * @param managerId The ID of the manager
 * @returns True if manager has at least one team mapped
 */
export const managerHasTeams = (managerId: string): boolean => {
  const mapping = managerTeamMappings.find(m => m.managerId === managerId);
  return !!mapping && mapping.teamIds.length > 0;
};

/**
 * Get manager info by ID
 * @param managerId The ID of the manager
 * @returns Manager object or undefined
 */
export const getManagerById = (managerId: string) => {
  return managers.find(m => m.id === managerId);
};
