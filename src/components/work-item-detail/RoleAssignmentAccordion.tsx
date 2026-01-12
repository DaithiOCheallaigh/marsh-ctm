import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, RotateCcw } from 'lucide-react';
import { TeamMemberCard } from './TeamMemberCard';
import { TeamMember, teamMembers, searchTeamMembers } from '@/data/teamMembers';
import { Button } from '@/components/ui/button';

interface RoleAssignment {
  chairLabel: string;
  assignedMember?: TeamMember;
  assignmentNotes?: string;
}

interface RoleAssignmentAccordionProps {
  roleTitle: string;
  rolesCount: { current: number; total: number };
  chairs: RoleAssignment[];
  onAssign: (chairIndex: number, member: TeamMember, notes: string) => void;
  defaultExpanded?: boolean;
}

export const RoleAssignmentAccordion: React.FC<RoleAssignmentAccordionProps> = ({
  roleTitle,
  rolesCount,
  chairs,
  onAssign,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [displayCount, setDisplayCount] = useState(3);

  const filteredMembers = searchTeamMembers(searchQuery);
  const displayedMembers = filteredMembers.slice(0, displayCount);

  const handleShowMore = () => {
    setDisplayCount((prev) => Math.min(prev + 3, filteredMembers.length));
  };

  const handleAssign = (chairIndex: number) => {
    if (selectedMember) {
      onAssign(chairIndex, selectedMember, assignmentNotes);
      setSelectedMember(null);
      setAssignmentNotes('');
    }
  };

  // Check if there's an assigned member for any chair
  const hasAssignment = chairs.some(chair => chair.assignedMember);

  return (
    <div className="bg-white rounded-lg border border-[hsl(0,0%,89%)] overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-[hsl(210,20%,98%)] transition-colors"
      >
        <h4 className="text-[hsl(220,100%,24%)] font-bold text-sm">{roleTitle}</h4>
        <div className="flex items-center gap-3">
          <span className="text-[hsl(197,100%,44%)] text-sm font-medium">
            {rolesCount.current}/{rolesCount.total} Roles Assigned
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-[hsl(0,0%,45%)]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[hsl(0,0%,45%)]" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-[hsl(0,0%,89%)]">
          {chairs.map((chair, chairIndex) => (
            <div key={chairIndex} className="p-4 border-b border-[hsl(0,0%,89%)] last:border-b-0">
              {chair.assignedMember ? (
                // Show assigned member
                <div className="bg-[hsl(197,100%,44%,0.08)] border border-[hsl(197,100%,44%,0.3)] rounded-lg p-4">
                  <p className="text-[hsl(0,0%,35%)] text-xs font-medium mb-3">[{chair.chairLabel}]</p>
                  <div className="bg-white rounded-lg p-4 border border-[hsl(0,0%,89%)]">
                    <p className="text-[hsl(197,100%,44%)] font-semibold text-sm">{chair.assignedMember.name}</p>
                    <p className="text-[hsl(0,0%,45%)] text-xs">{chair.assignedMember.role}</p>
                  </div>
                  {chair.assignmentNotes && (
                    <div className="mt-3 bg-white rounded-lg p-3 border border-[hsl(0,0%,89%)]">
                      <p className="text-[hsl(197,100%,44%)] text-xs font-medium mb-1">Assignment Notes</p>
                      <p className="text-[hsl(0,0%,45%)] text-sm">{chair.assignmentNotes}</p>
                    </div>
                  )}
                </div>
              ) : (
                // Show selection UI
                <div className="bg-[hsl(197,100%,44%,0.08)] border border-[hsl(197,100%,44%,0.3)] rounded-lg p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <p className="text-[hsl(0,0%,35%)] text-xs font-medium">[{chair.chairLabel}] | Select Team Member</p>
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(0,100%,50%)]" />
                      <input
                        type="text"
                        placeholder="Search Team Member"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-[hsl(0,100%,50%,0.5)] rounded-lg text-sm placeholder:text-[hsl(0,100%,50%)] focus:outline-none focus:ring-2 focus:ring-[hsl(197,100%,44%)]"
                      />
                    </div>
                    <button className="p-2 bg-[hsl(220,100%,24%)] rounded-lg hover:bg-[hsl(220,100%,18%)] transition-colors">
                      <RotateCcw className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  {/* Team members list */}
                  <div className="bg-white rounded-lg border border-[hsl(0,0%,89%)] overflow-hidden">
                    {displayedMembers.map((member, index) => (
                      <TeamMemberCard
                        key={member.id}
                        member={member}
                        isSelected={selectedMember?.id === member.id}
                        onSelect={setSelectedMember}
                        showBestMatch={index === 0 && member.matchScore === 100}
                      />
                    ))}
                  </div>

                  {/* Show more */}
                  <div className="flex items-center justify-between mt-3">
                    {displayCount < filteredMembers.length && (
                      <button
                        onClick={handleShowMore}
                        className="text-[hsl(220,100%,24%)] text-sm font-medium hover:underline"
                      >
                        Show More
                      </button>
                    )}
                    <span className="text-[hsl(0,0%,45%)] text-xs ml-auto">
                      Displaying: {displayedMembers.length} of {filteredMembers.length.toString().padStart(4, '0')} Members
                    </span>
                  </div>

                  {/* Assignment Notes */}
                  <div className="mt-4 bg-white rounded-lg border border-[hsl(0,0%,89%)] p-3">
                    <p className="text-[hsl(0,0%,35%)] text-xs font-medium mb-2">
                      Assignment Notes <span className="text-[hsl(0,0%,60%)]">(Optional)</span>
                    </p>
                    <textarea
                      placeholder="Add text"
                      value={assignmentNotes}
                      onChange={(e) => setAssignmentNotes(e.target.value)}
                      className="w-full p-2 text-sm border-none resize-none focus:outline-none placeholder:text-[hsl(0,0%,70%)]"
                      rows={2}
                    />
                  </div>

                  {/* Assign button */}
                  <div className="flex justify-end mt-3">
                    <Button
                      variant="outline"
                      onClick={() => handleAssign(chairIndex)}
                      disabled={!selectedMember}
                      className="px-6 border-[hsl(197,100%,44%)] text-[hsl(197,100%,44%)] hover:bg-[hsl(197,100%,44%,0.1)] disabled:opacity-50"
                    >
                      Assign
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
