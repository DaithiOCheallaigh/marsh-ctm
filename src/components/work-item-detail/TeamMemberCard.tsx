import React from 'react';
import { CheckCircle2, AlertCircle, Check, AlertTriangle } from 'lucide-react';
import { TeamMember } from '@/data/teamMembers';
import { getCapacityColor, getCapacityColorClasses } from './WorkloadInput';

interface TeamMemberCardProps {
  member: TeamMember;
  isSelected: boolean;
  onSelect: (member: TeamMember) => void;
  showBestMatch?: boolean;
  isDisabled?: boolean;
  disabledReason?: string;
  projectedWorkload?: number;
}

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  member,
  isSelected,
  onSelect,
  showBestMatch = false,
  isDisabled = false,
  disabledReason,
  projectedWorkload,
}) => {
  // Current workload is 100 - capacity (capacity represents available %)
  const currentWorkload = 100 - member.capacity;
  const availableCapacity = member.capacity;
  
  // Calculate display values
  const displayWorkload = projectedWorkload !== undefined ? projectedWorkload : currentWorkload;
  const displayAvailable = 100 - displayWorkload;
  const isOverCapacity = displayWorkload > 100;
  const isHighUtilization = displayWorkload >= 86 && displayWorkload <= 100;
  
  const capacityColor = getCapacityColor(displayAvailable);
  const colorClasses = getCapacityColorClasses(capacityColor);

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-[hsl(var(--wq-status-completed-text))] bg-[hsl(var(--wq-status-completed-bg))]';
    if (score >= 60) return 'text-[hsl(var(--wq-status-pending-text))] bg-[hsl(var(--wq-status-pending-bg))]';
    return 'text-[hsl(var(--wq-text-secondary))] bg-[hsl(var(--wq-bg-muted))]';
  };

  // Render 10-dot capacity visualization
  const renderCapacityDots = () => {
    const dots = [];
    const totalDots = 10;
    const filledDots = Math.ceil(displayWorkload / 10);
    const currentFilledDots = Math.ceil(currentWorkload / 10);
    
    for (let i = 0; i < totalDots; i++) {
      const isFilled = i < filledDots;
      const isNew = isSelected && projectedWorkload !== undefined && i >= currentFilledDots && i < filledDots;
      
      dots.push(
        <div
          key={i}
          className={`w-2 h-2 rounded-full transition-all ${
            isFilled
              ? isNew
                ? `${colorClasses.bar} ring-1 ring-offset-1 ring-primary/50`
                : colorClasses.bar
              : 'bg-[hsl(var(--wq-bg-muted))]'
          }`}
        />
      );
    }
    return dots;
  };

  return (
    <div
      className={`
        p-4 border-b border-[hsl(var(--wq-border))] last:border-b-0
        transition-colors
        ${isDisabled 
          ? 'opacity-50 cursor-not-allowed bg-[hsl(var(--wq-bg-muted))]' 
          : 'hover:bg-[hsl(var(--wq-bg-hover))] cursor-pointer'
        }
        ${isSelected ? 'bg-accent/5' : ''}
      `}
      onClick={() => !isDisabled && onSelect(member)}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <div
          className={`
            w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5
            transition-colors
            ${isDisabled
              ? 'border-[hsl(var(--wq-border))] bg-[hsl(var(--wq-bg-muted))]'
              : isSelected 
                ? 'bg-accent border-accent' 
                : 'border-[hsl(var(--wq-border-light))] bg-card'
            }
          `}
        >
          {isSelected && !isDisabled && <Check className="w-3 h-3 text-white" />}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-primary font-semibold text-sm">{member.name}</p>
              <p className="text-[hsl(var(--wq-text-secondary))] text-xs">{member.role}</p>
              {isDisabled && disabledReason && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-destructive/10 text-destructive text-xs font-medium rounded-full">
                  {disabledReason}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getMatchScoreColor(member.matchScore)}`}>
                Match: {member.matchScore}
              </span>
              {showBestMatch && (
                <span className="px-2.5 py-1 bg-[hsl(var(--wq-status-completed-bg))] text-[hsl(var(--wq-status-completed-text))] text-xs font-medium rounded-full border border-[hsl(var(--wq-status-completed-text))]">
                  Best Match
                </span>
              )}
            </div>
          </div>

          {/* Match indicators */}
          <div className="flex items-center gap-5 mt-2.5">
            {member.locationMatch ? (
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[hsl(var(--wq-status-completed-text))]" />
                <span className="text-[hsl(var(--wq-status-completed-text))] text-xs">Location match</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-[hsl(var(--wq-status-pending-text))]" />
                <span className="text-[hsl(var(--wq-status-pending-text))] text-xs">Location mismatch</span>
              </div>
            )}
            {member.expertiseMatch ? (
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[hsl(var(--wq-status-completed-text))]" />
                <span className="text-[hsl(var(--wq-status-completed-text))] text-xs">Expertise match</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-[hsl(var(--wq-status-pending-text))]" />
                <span className="text-[hsl(var(--wq-status-pending-text))] text-xs">Expertise mismatch</span>
              </div>
            )}
            {availableCapacity >= 30 ? (
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[hsl(var(--wq-status-completed-text))]" />
                <span className="text-[hsl(var(--wq-status-completed-text))] text-xs">Has capacity</span>
              </div>
            ) : availableCapacity > 0 ? (
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[hsl(var(--wq-status-pending-text))]" />
                <span className="text-[hsl(var(--wq-status-pending-text))] text-xs">Limited capacity</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="text-destructive text-xs">No capacity</span>
              </div>
            )}
          </div>

          {/* Details row with capacity visualization */}
          <div className="flex items-center gap-4 mt-3 text-xs text-[hsl(var(--wq-text-secondary))]">
            <span>Location: {member.location}</span>
            <span>Expertise: {member.expertise.slice(0, 2).join(', ')}{member.expertise.length > 2 ? '...' : ''}</span>
          </div>

          {/* Capacity bar */}
          <div className="mt-3 p-2 rounded-lg bg-[hsl(var(--wq-bg-muted))]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-[hsl(var(--wq-text-muted))]">Workload</span>
              <div className="flex items-center gap-2">
                {isSelected && projectedWorkload !== undefined ? (
                  <>
                    <span className="text-xs text-[hsl(var(--wq-text-muted))] line-through">{currentWorkload}%</span>
                    <span className="text-[hsl(var(--wq-text-secondary))]">→</span>
                    <span className={`text-xs font-bold ${colorClasses.text}`}>{displayWorkload}%</span>
                    {isOverCapacity && (
                      <span className="flex items-center gap-1 text-destructive">
                        <AlertTriangle className="w-3 h-3" />
                        <span className="text-xs">Over capacity</span>
                      </span>
                    )}
                    {isHighUtilization && !isOverCapacity && (
                      <span className="flex items-center gap-1 text-[hsl(var(--wq-status-pending-text))]">
                        <AlertTriangle className="w-3 h-3" />
                        <span className="text-xs">High utilization</span>
                      </span>
                    )}
                  </>
                ) : (
                  <span className={`text-xs font-medium ${colorClasses.text}`}>{currentWorkload}%</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {renderCapacityDots()}
              <span className={`ml-2 text-xs ${colorClasses.text}`}>
                {displayAvailable}% available
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
