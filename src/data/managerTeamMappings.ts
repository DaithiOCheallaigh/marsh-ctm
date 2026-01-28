import { ManagerTeamMapping } from '@/types/teamAssignment';
import { teamsData } from './teams';
import { teamMembers } from './teamMembers';

/**
 * Manager to Team mappings - Insurance Industry specific
 * Maps each manager to teams based on their expertise and domain
 */
export const managerTeamMappings: ManagerTeamMapping[] = [
  {
    managerId: 'member_001', // David Chen - Managing Director Property & Casualty
    managerName: 'David Chen',
    teamIds: ['team_001', 'team_007', 'team_008'], // Property Risk, Construction, Energy
  },
  {
    managerId: 'member_002', // Jennifer Walsh - SVP Marine & Cargo
    managerName: 'Jennifer Walsh',
    teamIds: ['team_004', 'team_012', 'team_001'], // Marine Cargo, Fleet, Property Risk
  },
  {
    managerId: 'member_003', // Colin Masterson - VP Human Capital
    managerName: 'Colin Masterson',
    teamIds: ['team_001', 'team_013'], // Property Risk, Management Liability
  },
  {
    managerId: 'member_004', // Amanda Foster - Director Client Transitions
    managerName: 'Amanda Foster',
    teamIds: ['team_010', 'team_001', 'team_004'], // Aviation, Property Risk, Marine Cargo
  },
  {
    managerId: 'member_005', // Patricia Morrison - SVP Construction & Surety
    managerName: 'Patricia Morrison',
    teamIds: ['team_007', 'team_011', 'team_001'], // Construction, Environmental, Property Risk
  },
  {
    managerId: 'member_006', // Michael Santos - Director Retail & Hospitality
    managerName: 'Michael Santos',
    teamIds: ['team_001', 'team_010', 'team_004'], // Property Risk, Aviation, Marine Cargo
  },
  {
    managerId: 'member_007', // Sarah Anderson - Senior Account Manager
    managerName: 'Sarah Anderson',
    teamIds: ['team_003', 'team_014', 'team_001'], // Commercial Underwriting, Product Liability, Property Risk
  },
  {
    managerId: 'member_008', // Robert Wilson - Senior Risk Engineer
    managerName: 'Robert Wilson',
    teamIds: ['team_008', 'team_011', 'team_001'], // Energy, Environmental, Property Risk
  },
  {
    managerId: 'member_010', // Marcus Johnson - Senior Claims Analyst
    managerName: 'Marcus Johnson',
    teamIds: ['team_002', 'team_012', 'team_014'], // Casualty Claims, Fleet, Product Liability
  },
  {
    managerId: 'member_011', // Lisa Park - Account Executive Healthcare
    managerName: 'Lisa Park',
    teamIds: ['team_006', 'team_009', 'team_013'], // Healthcare, Financial Institutions, Management Liability
  },
  {
    managerId: 'member_013', // Alexandra Chen - Cyber Risk Specialist
    managerName: 'Alexandra Chen',
    teamIds: ['team_005', 'team_009', 'team_003'], // Cyber Security, Financial Institutions, Commercial Underwriting
  },
  {
    managerId: 'member_015', // Jennifer Blake - Financial Lines Specialist
    managerName: 'Jennifer Blake',
    teamIds: ['team_009', 'team_013', 'team_005'], // Financial Institutions, Management Liability, Cyber Security
  },
  {
    managerId: 'member_018', // Robert Thompson - VP Operations
    managerName: 'Robert Thompson',
    teamIds: ['team_003', 'team_013', 'team_001'], // Commercial Underwriting, Management Liability, Property Risk
  },
  {
    managerId: 'member_020', // Kumar Lee - Director
    managerName: 'Kumar Lee',
    teamIds: ['team_013', 'team_009', 'team_001'], // Management Liability, Financial Institutions, Property Risk
  },
  {
    managerId: 'member_022', // Emily Rodriguez - Operations Manager
    managerName: 'Emily Rodriguez',
    teamIds: ['team_005', 'team_011', 'team_003'], // Cyber Security, Environmental, Commercial Underwriting
  },
];

// Get all managers from teamMembers who have isManager: true
export const managers = teamMembers.filter(m => m.isManager);

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
