// Team Assignment Types for Work Item Creation

/**
 * Role configuration with chair requirement for a team
 */
export interface RoleChairConfig {
  roleId: string;
  roleName: string;
  chairRequirement: number;
}

/**
 * Team configuration within a work item
 */
export interface WorkItemTeamConfig {
  teamId: string;
  teamName: string;
  isPrimary: boolean;
  roles: RoleChairConfig[];
}

/**
 * Complete team assignment data structure for work item
 */
export interface WorkItemTeamAssignment {
  assignedToManagerId: string;
  teams: WorkItemTeamConfig[];
}

/**
 * Manager to Team mapping - represents which teams a manager oversees
 */
export interface ManagerTeamMapping {
  managerId: string;
  managerName: string;
  teamIds: string[];
}

/**
 * Role definition from Team Setup
 */
export interface TeamRoleDefinition {
  id: string;
  roleName: string;
  chairName: string;
  chairType: 'Primary' | 'Secondary';
  maxChairs?: number; // Optional: maximum chairs allowed for this role
}

/**
 * Team with its available roles from Team Setup
 */
export interface TeamWithRoles {
  id: string;
  name: string;
  teamBase: 'Workday' | 'Manual Select';
  qualifiers: string[];
  roles: TeamRoleDefinition[];
  primaryManager: string;
  oversiteManager: string;
}

/**
 * Validation error for team assignment
 */
export interface TeamAssignmentValidationError {
  type: 'primary_team_missing' | 'no_roles_selected' | 'missing_chair_requirement' | 'duplicate_team' | 'manager_not_selected';
  teamId?: string;
  roleId?: string;
  message: string;
}

/**
 * Team assignment state for the form
 */
export interface TeamAssignmentFormState {
  primaryTeam: WorkItemTeamConfig | null;
  additionalTeams: WorkItemTeamConfig[];
  isValid: boolean;
  errors: TeamAssignmentValidationError[];
}
