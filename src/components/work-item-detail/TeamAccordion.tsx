import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Users } from 'lucide-react';
import { RoleAssignmentAccordion } from './RoleAssignmentAccordion';
import { TeamMember } from '@/data/teamMembers';

interface RoleAssignment {
  chairLabel: string;
  assignedMember?: TeamMember;
  assignmentNotes?: string;
}

interface TeamRole {
  roleId: string;
  roleName: string;
  chairs: RoleAssignment[];
  totalRoles: number;
}

interface TeamAccordionProps {
  teamId: string;
  teamName: string;
  isPrimary: boolean;
  roles: TeamRole[];
  onAssign: (roleId: string, chairIndex: number, member: TeamMember, notes: string) => void;
  onUnassign: (roleId: string, chairIndex: number) => void;
  expandedRoleId: string | null;
  onToggleRole: (roleId: string) => void;
  checkDuplicateAssignment: (member: TeamMember, roleId: string) => { isAssigned: boolean; roleName?: string };
  isReadOnly?: boolean;
}

export const TeamAccordion: React.FC<TeamAccordionProps> = ({
  teamId,
  teamName,
  isPrimary,
  roles,
  onAssign,
  onUnassign,
  expandedRoleId,
  onToggleRole,
  checkDuplicateAssignment,
  isReadOnly = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Calculate team-level assignment stats
  const teamStats = useMemo(() => {
    const totalRoles = roles.reduce((sum, role) => sum + role.totalRoles, 0);
    const assignedRoles = roles.reduce(
      (sum, role) => sum + role.chairs.filter(c => c.assignedMember).length,
      0
    );
    return { assigned: assignedRoles, total: totalRoles };
  }, [roles]);

  const isFullyAssigned = teamStats.assigned === teamStats.total;

  return (
    <div className="bg-card rounded-lg border border-[hsl(var(--wq-border))] overflow-hidden">
      {/* Team Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-[hsl(var(--wq-bg-hover))] transition-colors"
      >
        <div className="flex items-center gap-3">
          <Users className={`w-5 h-5 ${isExpanded ? 'text-primary' : 'text-[hsl(var(--wq-text-secondary))]'}`} />
          <div className="flex items-center gap-2">
            <h3 className="text-primary font-bold text-base">{teamName}</h3>
            {isPrimary && (
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20">
                Primary
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[hsl(var(--wq-text-secondary))] text-sm">Roles Assigned:</span>
          <span className={`text-sm font-bold ${isFullyAssigned ? 'text-primary' : 'text-accent'}`}>
            {teamStats.assigned}/{teamStats.total}
          </span>
          <div className="w-24 h-2 bg-[hsl(var(--wq-bg-muted))] rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                isFullyAssigned 
                  ? 'bg-[hsl(var(--wq-status-completed-text))]' 
                  : 'bg-accent'
              }`}
              style={{ width: `${teamStats.total > 0 ? (teamStats.assigned / teamStats.total) * 100 : 0}%` }}
            />
          </div>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-[hsl(var(--wq-text-secondary))]" />
          ) : (
            <ChevronRight className="w-5 h-5 text-[hsl(var(--wq-text-secondary))]" />
          )}
        </div>
      </button>

      {/* Team Content - Role Accordions */}
      <div 
        className={`border-t border-[hsl(var(--wq-border))] overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0 border-t-0'
        }`}
      >
        <div className="p-4 space-y-3">
          {roles.map((role, roleIndex) => (
            <RoleAssignmentAccordion
              key={role.roleId}
              roleTitle={role.roleName}
              rolesCount={{
                current: role.chairs.filter(c => c.assignedMember).length,
                total: role.totalRoles,
              }}
              chairs={role.chairs}
              onAssign={(chairIndex, member, notes) => onAssign(role.roleId, chairIndex, member, notes)}
              onUnassign={(chairIndex) => onUnassign(role.roleId, chairIndex)}
              isExpanded={expandedRoleId === role.roleId && !isReadOnly}
              onToggleExpand={() => !isReadOnly && onToggleRole(role.roleId)}
              roleIndex={roleIndex}
              checkDuplicateAssignment={(member) => checkDuplicateAssignment(member, role.roleId)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
