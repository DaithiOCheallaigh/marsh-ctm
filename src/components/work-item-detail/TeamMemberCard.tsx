import React from 'react';
import { CheckCircle2, AlertCircle, Check } from 'lucide-react';
import { TeamMember } from '@/data/teamMembers';

interface TeamMemberCardProps {
  member: TeamMember;
  isSelected: boolean;
  onSelect: (member: TeamMember) => void;
  showBestMatch?: boolean;
}

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  member,
  isSelected,
  onSelect,
  showBestMatch = false,
}) => {
  return (
    <div
      className={`
        p-4 border-b border-[hsl(var(--wq-border))] last:border-b-0
        hover:bg-[hsl(var(--wq-bg-hover))] transition-colors cursor-pointer
        ${isSelected ? 'bg-accent/5' : ''}
      `}
      onClick={() => onSelect(member)}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <div
          className={`
            w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5
            transition-colors
            ${isSelected 
              ? 'bg-accent border-accent' 
              : 'border-[hsl(var(--wq-border-light))] bg-card'
            }
          `}
        >
          {isSelected && <Check className="w-3 h-3 text-accent-foreground" />}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary font-semibold text-sm">{member.name}</p>
              <p className="text-muted-foreground text-xs">{member.role}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs">Match Score: {member.matchScore}</span>
              {showBestMatch && (
                <span className="px-2 py-0.5 bg-[hsl(var(--wq-status-completed-bg))] text-[hsl(var(--wq-status-completed-text))] text-xs font-medium rounded-full border border-[hsl(var(--wq-status-completed-text))]">
                  Best Match
                </span>
              )}
            </div>
          </div>

          {/* Match indicators */}
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-[hsl(var(--wq-status-completed-text))]" />
              <span className="text-[hsl(var(--wq-status-completed-text))] text-xs">Location match</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-[hsl(var(--wq-status-completed-text))]" />
              <span className="text-[hsl(var(--wq-status-completed-text))] text-xs">Expertise match</span>
            </div>
            {member.hasCapacity ? (
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-[hsl(var(--wq-status-completed-text))]" />
                <span className="text-[hsl(var(--wq-status-completed-text))] text-xs">Has capacity</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="text-destructive text-xs">Different location</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex items-center gap-6 mt-2 text-xs text-[hsl(var(--wq-text-secondary))]">
            <span>Location: {member.location}</span>
            <span>Expertise: {member.expertise.join(', ')}</span>
            <span>
              Capacity: <span className="px-1.5 py-0.5 bg-[hsl(var(--wq-bg-muted))] rounded text-[hsl(var(--wq-text-secondary))]">{member.capacity}%</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
