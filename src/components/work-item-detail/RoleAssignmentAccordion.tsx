import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, RotateCcw } from 'lucide-react';
import { TeamMemberCard } from './TeamMemberCard';
import { TeamMember, teamMembers, searchTeamMembers } from '@/data/teamMembers';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

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
  const [showTable, setShowTable] = useState(false);

  const filteredMembers = searchTeamMembers(searchQuery);
  const displayedMembers = filteredMembers.slice(0, displayCount);

  const handleShowMore = () => {
    setShowTable(true);
  };

  const handleAssign = (chairIndex: number) => {
    if (selectedMember) {
      onAssign(chairIndex, selectedMember, assignmentNotes);
      setSelectedMember(null);
      setAssignmentNotes('');
      setShowTable(false);
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedMember(null);
    setDisplayCount(3);
    setShowTable(false);
  };

  return (
    <div className="bg-card rounded-lg border border-[hsl(var(--wq-border))] overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-[hsl(var(--wq-bg-hover))] transition-colors"
      >
        <h4 className="text-primary font-bold text-sm">{roleTitle}</h4>
        <div className="flex items-center gap-3">
          <span className="text-accent text-sm">
            {rolesCount.current}/{rolesCount.total} Roles Assigned
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-[hsl(var(--wq-text-secondary))]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[hsl(var(--wq-text-secondary))]" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-[hsl(var(--wq-border))]">
          {chairs.map((chair, chairIndex) => (
            <div key={chairIndex} className="p-5">
              {chair.assignedMember ? (
                // Show assigned member
                <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
                  <p className="text-[hsl(var(--wq-text-secondary))] text-xs font-medium mb-3">[{chair.chairLabel}]</p>
                  <div className="bg-card rounded-lg p-4 border border-[hsl(var(--wq-border))]">
                    <p className="text-accent font-semibold text-sm">{chair.assignedMember.name}</p>
                    <p className="text-[hsl(var(--wq-text-secondary))] text-xs">{chair.assignedMember.role}</p>
                  </div>
                  {chair.assignmentNotes && (
                    <div className="mt-3 bg-card rounded-lg p-3 border border-[hsl(var(--wq-border))]">
                      <p className="text-accent text-xs font-medium mb-1">Assignment Notes</p>
                      <p className="text-[hsl(var(--wq-text-secondary))] text-sm">{chair.assignmentNotes}</p>
                    </div>
                  )}
                </div>
              ) : (
                // Show selection UI
                <div className="bg-accent/5 border border-accent/20 rounded-lg p-5">
                  {/* Header row with chair label, search, and reset */}
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-[hsl(var(--wq-text-secondary))] text-sm font-medium whitespace-nowrap">
                      [{chair.chairLabel}] | Select Team Member
                    </span>
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                      <input
                        type="text"
                        placeholder="Search Team Member"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-accent/40 rounded-lg text-sm placeholder:text-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent bg-card"
                      />
                    </div>
                    <button 
                      onClick={handleReset}
                      className="p-2.5 bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                      title="Reset"
                    >
                      <RotateCcw className="w-4 h-4 text-primary-foreground" />
                    </button>
                  </div>

                  {/* Team members list or table */}
                  {showTable ? (
                    <div className="bg-card rounded-lg border border-[hsl(var(--wq-border))] overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-[hsl(var(--wq-bg-header))] hover:bg-[hsl(var(--wq-bg-header))]">
                            <TableHead className="w-12 py-3 px-4 text-xs font-bold uppercase text-primary">Select</TableHead>
                            <TableHead className="py-3 px-4 text-xs font-bold uppercase text-primary">Name</TableHead>
                            <TableHead className="py-3 px-4 text-xs font-bold uppercase text-primary">Role</TableHead>
                            <TableHead className="py-3 px-4 text-xs font-bold uppercase text-primary">Location</TableHead>
                            <TableHead className="py-3 px-4 text-xs font-bold uppercase text-primary">Expertise</TableHead>
                            <TableHead className="py-3 px-4 text-xs font-bold uppercase text-primary">Capacity</TableHead>
                            <TableHead className="py-3 px-4 text-xs font-bold uppercase text-primary">Match Score</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredMembers.map((member, index) => (
                            <TableRow 
                              key={member.id}
                              className={`hover:bg-[hsl(var(--wq-bg-hover))] cursor-pointer ${selectedMember?.id === member.id ? 'bg-accent/5' : ''}`}
                              onClick={() => setSelectedMember(member)}
                            >
                              <TableCell className="py-3 px-4">
                                <Checkbox 
                                  checked={selectedMember?.id === member.id}
                                  onCheckedChange={() => setSelectedMember(member)}
                                  className="border-[hsl(var(--wq-border))]"
                                />
                              </TableCell>
                              <TableCell className="py-3 px-4">
                                <div>
                                  <p className="text-primary font-medium text-sm">{member.name}</p>
                                  {index === 0 && member.matchScore === 100 && (
                                    <span className="inline-block mt-1 px-2 py-0.5 bg-[hsl(var(--wq-status-completed-bg))] text-[hsl(var(--wq-status-completed-text))] text-xs font-medium rounded-full border border-[hsl(var(--wq-status-completed-text))]">
                                      Best Match
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="py-3 px-4 text-[hsl(var(--wq-text-secondary))] text-sm">{member.role}</TableCell>
                              <TableCell className="py-3 px-4 text-[hsl(var(--wq-text-secondary))] text-sm">{member.location}</TableCell>
                              <TableCell className="py-3 px-4 text-[hsl(var(--wq-text-secondary))] text-sm">{member.expertise.join(', ')}</TableCell>
                              <TableCell className="py-3 px-4">
                                <span className="px-2 py-1 bg-[hsl(var(--wq-bg-muted))] rounded text-[hsl(var(--wq-text-secondary))] text-sm">
                                  {member.capacity}%
                                </span>
                              </TableCell>
                              <TableCell className="py-3 px-4 text-[hsl(var(--wq-text-secondary))] text-sm">{member.matchScore}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <>
                      {/* Selected member card */}
                      {selectedMember && (
                        <div className="bg-card rounded-lg border border-[hsl(var(--wq-border))] overflow-hidden mb-3">
                          <TeamMemberCard
                            member={selectedMember}
                            isSelected={true}
                            onSelect={setSelectedMember}
                            showBestMatch={selectedMember.matchScore === 100}
                          />
                        </div>
                      )}
                      
                      {/* Other members when no selection */}
                      {!selectedMember && (
                        <div className="bg-card rounded-lg border border-[hsl(var(--wq-border))] overflow-hidden">
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
                      )}
                    </>
                  )}

                  {/* Show more / Show less */}
                  {!selectedMember && (
                    <div className="flex items-center justify-between mt-3">
                      {!showTable && displayCount < filteredMembers.length && (
                        <button
                          onClick={handleShowMore}
                          className="text-primary text-sm font-medium hover:underline"
                        >
                          Show More
                        </button>
                      )}
                      {showTable && (
                        <button
                          onClick={() => setShowTable(false)}
                          className="text-primary text-sm font-medium hover:underline"
                        >
                          Show Less
                        </button>
                      )}
                      <span className="text-[hsl(var(--wq-text-secondary))] text-xs ml-auto">
                        Displaying: {showTable ? filteredMembers.length : displayedMembers.length} of {filteredMembers.length.toString().padStart(4, '0')} Members
                      </span>
                    </div>
                  )}

                  {/* Assignment Notes */}
                  <div className="mt-4 bg-card rounded-lg border border-[hsl(var(--wq-border))] p-4">
                    <p className="text-[hsl(var(--wq-text-secondary))] text-sm font-medium mb-2">
                      Assignment Notes <span className="text-[hsl(var(--wq-text-muted))]">(Optional)</span>
                    </p>
                    <textarea
                      placeholder="Add text"
                      value={assignmentNotes}
                      onChange={(e) => setAssignmentNotes(e.target.value)}
                      className="w-full p-2 text-sm border-none resize-none focus:outline-none placeholder:text-[hsl(var(--wq-text-muted))] bg-transparent"
                      rows={2}
                    />
                  </div>

                  {/* Assign button */}
                  <div className="flex justify-end mt-4">
                    <Button
                      variant="outline"
                      onClick={() => handleAssign(chairIndex)}
                      disabled={!selectedMember}
                      className="px-8 border-accent text-accent hover:bg-accent/10 disabled:opacity-50 disabled:cursor-not-allowed"
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
