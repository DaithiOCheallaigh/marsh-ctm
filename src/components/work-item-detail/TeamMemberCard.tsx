import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Check, AlertTriangle } from 'lucide-react';
import { TeamMember } from '@/data/teamMembers';

interface TeamMemberCardProps {
  member: TeamMember;
  isSelected: boolean;
  onSelect: (member: TeamMember) => void;
  showBestMatch?: boolean;
  isDisabled?: boolean;
  disabledReason?: string;
  capacityIncrease?: number;
  onCapacityChange?: (newCapacity: number) => void;
}

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  member,
  isSelected,
  onSelect,
  showBestMatch = false,
  isDisabled = false,
  disabledReason,
  capacityIncrease = 20,
  onCapacityChange,
}) => {
  // Calculate projected capacity when selected
  const projectedCapacity = isSelected ? member.capacity + capacityIncrease : member.capacity;
  const [editableCapacity, setEditableCapacity] = useState(projectedCapacity);
  const [isEditing, setIsEditing] = useState(false);

  // Update editable capacity when selection changes or member changes
  useEffect(() => {
    setEditableCapacity(isSelected ? member.capacity + capacityIncrease : member.capacity);
  }, [isSelected, member.capacity, capacityIncrease]);

  const isOverCapacity = isSelected && editableCapacity > 100;

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-[hsl(var(--wq-status-completed-text))] bg-[hsl(var(--wq-status-completed-bg))]';
    if (score >= 60) return 'text-[hsl(var(--wq-status-pending-text))] bg-[hsl(var(--wq-status-pending-bg))]';
    return 'text-[hsl(var(--wq-text-secondary))] bg-[hsl(var(--wq-bg-muted))]';
  };

  const handleCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0 && value <= 200) {
      setEditableCapacity(value);
      onCapacityChange?.(value);
    }
  };

  const handleCapacityBlur = () => {
    setIsEditing(false);
  };

  const handleCapacityKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
    }
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
            {member.hasCapacity ? (
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[hsl(var(--wq-status-completed-text))]" />
                <span className="text-[hsl(var(--wq-status-completed-text))] text-xs">Has capacity</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="text-destructive text-xs">No capacity</span>
              </div>
            )}
          </div>

          {/* Details row */}
          <div className="flex items-center gap-8 mt-2 text-xs text-[hsl(var(--wq-text-secondary))]">
            <span>Location: {member.location}</span>
            <span>Expertise: {member.expertise.join(', ')}</span>
            <span className="flex items-center gap-1">
              Capacity: 
              {isSelected ? (
                <span className="flex items-center gap-1.5">
                  <span className="text-[hsl(var(--wq-text-muted))] line-through">{member.capacity}%</span>
                  <span className="text-[hsl(var(--wq-text-secondary))]">→</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editableCapacity}
                      onChange={handleCapacityChange}
                      onBlur={handleCapacityBlur}
                      onKeyDown={handleCapacityKeyDown}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                      min={0}
                      max={200}
                      className={`w-14 px-1.5 py-0.5 rounded text-center text-xs font-medium border focus:outline-none focus:ring-1 ${
                        isOverCapacity
                          ? 'bg-[hsl(var(--wq-status-pending-bg))] text-[hsl(var(--wq-status-pending-text))] border-[hsl(var(--wq-status-pending-text))] focus:ring-[hsl(var(--wq-status-pending-text))]'
                          : 'bg-[hsl(var(--wq-bg-muted))] text-[hsl(var(--wq-text-secondary))] border-[hsl(var(--wq-border))] focus:ring-accent'
                      }`}
                    />
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditing(true);
                      }}
                      className={`px-1.5 py-0.5 rounded text-xs font-medium hover:ring-1 hover:ring-accent transition-all ${
                        isOverCapacity
                          ? 'bg-[hsl(var(--wq-status-pending-bg))] text-[hsl(var(--wq-status-pending-text))]'
                          : 'bg-[hsl(var(--wq-bg-muted))] text-[hsl(var(--wq-text-secondary))]'
                      }`}
                      title="Click to edit capacity"
                    >
                      {editableCapacity}%
                    </button>
                  )}
                  {isOverCapacity && (
                    <span className="flex items-center gap-1 text-[hsl(var(--wq-status-pending-text))]">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span className="text-xs">Over capacity</span>
                    </span>
                  )}
                </span>
              ) : (
                <span className={`px-1.5 py-0.5 rounded ${
                  member.hasCapacity 
                    ? 'bg-[hsl(var(--wq-bg-muted))] text-[hsl(var(--wq-text-secondary))]'
                    : 'bg-destructive/10 text-destructive'
                }`}>
                  {member.capacity}%
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
