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
        p-4 border-b border-[hsl(0,0%,89%)] last:border-b-0
        hover:bg-[hsl(210,20%,98%)] transition-colors cursor-pointer
        ${isSelected ? 'bg-[hsl(197,100%,44%,0.05)]' : ''}
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
              ? 'bg-[hsl(197,100%,44%)] border-[hsl(197,100%,44%)]' 
              : 'border-[hsl(0,0%,75%)] bg-white'
            }
          `}
        >
          {isSelected && <Check className="w-3 h-3 text-white" />}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[hsl(220,100%,24%)] font-semibold text-sm">{member.name}</p>
              <p className="text-[hsl(0,0%,45%)] text-xs">{member.role}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[hsl(0,0%,45%)] text-xs">Match Score: {member.matchScore}</span>
              {showBestMatch && (
                <span className="px-2 py-0.5 bg-[hsl(136,70%,90%)] text-[hsl(120,100%,27%)] text-xs font-medium rounded-full border border-[hsl(120,100%,27%)]">
                  Best Match
                </span>
              )}
            </div>
          </div>

          {/* Match indicators */}
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-[hsl(120,100%,35%)]" />
              <span className="text-[hsl(120,100%,35%)] text-xs">Location match</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-[hsl(120,100%,35%)]" />
              <span className="text-[hsl(120,100%,35%)] text-xs">Expertise match</span>
            </div>
            {member.hasCapacity ? (
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-[hsl(120,100%,35%)]" />
                <span className="text-[hsl(120,100%,35%)] text-xs">Has capacity</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-[hsl(0,100%,45%)]" />
                <span className="text-[hsl(0,100%,45%)] text-xs">Different location</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex items-center gap-6 mt-2 text-xs text-[hsl(0,0%,35%)]">
            <span>Location: {member.location}</span>
            <span>Expertise: {member.expertise.join(', ')}</span>
            <span>
              Capacity: <span className="px-1.5 py-0.5 bg-[hsl(0,0%,91%)] rounded text-[hsl(0,0%,25%)]">{member.capacity}%</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
