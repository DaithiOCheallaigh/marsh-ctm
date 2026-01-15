// Team Assignment Types for Work Item Creation

/**
 * Role configuration for a team (simplified - no chair management in V1)
 */
export interface RoleConfig {
  roleId: string;
  roleName: string;
}

/**
 * Legacy Role configuration with chair requirement for a team
 * @deprecated Use RoleConfig instead - chair management removed in V1
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
  roles: RoleConfig[];
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
  delegateManager?: string;
  oversiteManager: string;
}

/**
 * Validation error for team assignment
 */
export interface TeamAssignmentValidationError {
  type: 'primary_team_missing' | 'no_roles_selected' | 'duplicate_team' | 'manager_not_selected';
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

/**
 * Attachment limits configuration (TBC)
 */
export interface AttachmentLimits {
  allowedTypes: string[]; // e.g., ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg']
  maxFileSize: number; // in bytes
  maxFiles: number;
}

/**
 * Default attachment limits - TO BE CONFIRMED with product owner
 */
export const DEFAULT_ATTACHMENT_LIMITS: AttachmentLimits = {
  allowedTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg', 'gif'],
  maxFileSize: 10 * 1024 * 1024, // 10MB - TBC
  maxFiles: 10, // TBC
};
