import React, { useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Search, 
  UserPlus, 
  ChevronRight as ChevronRightIcon, 
  ChevronDown, 
  Pencil,
  Clock,
  ChevronsLeft,
  ChevronLeft,
  ChevronsRight,
  Eye
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useTeamAssignments } from '@/context/TeamAssignmentsContext';
import { CapacityBadge } from '@/components/team-assignment/CapacityBadge';
import { ExpertiseTagList } from '@/components/team-assignment/ExpertiseTag';
import { ScopesBadge } from '@/components/team-assignment/ScopesBadge';
import { AddTeamMemberModal } from '@/components/team-assignment/AddTeamMemberModal';
import { calculateAvailableCapacity } from '@/data/teamAssignments';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import reportingManagerIcon from '@/assets/reporting-manager-icon.png';

const TeamMemberDetails: React.FC = () => {
  const navigate = useNavigate();
  const { teamName } = useParams<{ teamName: string }>();
  const { getTeamByName } = useTeamAssignments();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMembers, setExpandedMembers] = useState<Set<string>>(new Set());
  const [memberSearchQueries, setMemberSearchQueries] = useState<Record<string, string>>({});
  const [memberPages, setMemberPages] = useState<Record<string, number>>({});
  const [memberResultsPerPage] = useState(15);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 15;

  // Convert URL param back to team name
  const actualTeamName = teamName?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '';
  const team = getTeamByName(actualTeamName);

  const filteredMembers = useMemo(() => {
    if (!team) return [];
    if (!searchQuery) return team.members;
    const lowerQuery = searchQuery.toLowerCase();
    return team.members.filter(member => 
      member.firstName.toLowerCase().includes(lowerQuery) ||
      member.lastName.toLowerCase().includes(lowerQuery) ||
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(lowerQuery)
    );
  }, [team, searchQuery]);

  const totalPages = Math.ceil(filteredMembers.length / resultsPerPage);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  const toggleMemberExpanded = (memberId: string) => {
    setExpandedMembers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(memberId)) {
        newSet.delete(memberId);
      } else {
        newSet.add(memberId);
      }
      return newSet;
    });
  };

  const getMemberAssignmentSearch = (memberId: string) => memberSearchQueries[memberId] || '';
  const getMemberPage = (memberId: string) => memberPages[memberId] || 1;

  const setMemberAssignmentSearch = (memberId: string, query: string) => {
    setMemberSearchQueries(prev => ({ ...prev, [memberId]: query }));
    setMemberPages(prev => ({ ...prev, [memberId]: 1 }));
  };

  const setMemberPage = (memberId: string, page: number) => {
    setMemberPages(prev => ({ ...prev, [memberId]: page }));
  };

  if (!team) {
    return (
      <div className="min-h-screen bg-[hsl(210,20%,98%)]">
        <Header />
        <Sidebar activeItem="team-assignment" />
        <main className="pl-[300px] pt-[100px] pr-6 pb-8">
          <div className="text-center py-12">
            <p className="text-gray-500">Team not found.</p>
            <Link to="/my-team-assignment" className="text-[hsl(220,100%,40%)] underline mt-2 inline-block">
              Back to My Team Assignment
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(210,20%,98%)]">
      <Header />
      <Sidebar activeItem="team-assignment" />
      
      <main className="pl-[300px] pt-[100px] pr-6 pb-8">
        <div className="max-w-[1200px]">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-4">
            <Link to="/my-team-assignment" className="text-gray-500 hover:text-[hsl(220,100%,40%)]">
              My Team Assignment
            </Link>
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
            <span className="text-[hsl(220,100%,40%)] font-medium">{team.teamName}</span>
          </nav>

          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold text-[hsl(220,100%,24%)]">
                {team.teamName}
              </h1>
              <span className="text-gray-500">{team.members.length} Members</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[hsl(220,100%,24%)] text-white px-4 py-2 rounded-lg text-sm">
                <Clock className="w-4 h-4" />
                <span>26 Feb 2024 13:42 EST</span>
              </div>
              <Button 
                onClick={() => setShowAddModal(true)}
                className="bg-[hsl(220,100%,24%)] hover:bg-[hsl(220,100%,20%)] text-white"
              >
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(197,100%,44%)]" />
            <Input
              type="text"
              placeholder="Search Team Members"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 border-[hsl(197,100%,44%)] focus:ring-[hsl(197,100%,44%)] placeholder:text-[hsl(197,100%,44%)]"
            />
          </div>

          {/* Team Member Cards */}
          <div className="space-y-4">
            {paginatedMembers.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
                No team members found.
              </div>
            ) : (
              paginatedMembers.map((member) => {
                const isExpanded = expandedMembers.has(member.id);
                const availableCapacity = calculateAvailableCapacity(member.clientAssignments);
                const assignmentSearch = getMemberAssignmentSearch(member.id);
                const assignmentPage = getMemberPage(member.id);

                // Filter assignments based on search
                const filteredAssignments = assignmentSearch
                  ? member.clientAssignments.filter(a => 
                      a.clientName.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
                      a.cnNumber.includes(assignmentSearch)
                    )
                  : member.clientAssignments;

                const assignmentTotalPages = Math.ceil(filteredAssignments.length / memberResultsPerPage);
                const paginatedAssignments = filteredAssignments.slice(
                  (assignmentPage - 1) * memberResultsPerPage,
                  assignmentPage * memberResultsPerPage
                );

                return (
                  <div key={member.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {/* Member Header */}
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-[hsl(var(--wq-primary))]">
                            {member.firstName}, {member.lastName}
                          </h3>
                          {member.isManualAdd && member.workdayManager && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <img 
                                    src={reportingManagerIcon} 
                                    alt="Reporting Manager" 
                                    className="w-6 h-6 cursor-pointer"
                                  />
                                </TooltipTrigger>
                                <TooltipContent className="bg-[hsl(220,100%,24%)] text-white p-3 rounded-lg">
                                  <p className="font-medium">Reporting Manager</p>
                                  <p className="text-sm">{member.workdayManager}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/my-team-assignment/${teamName}/member/${member.id}/edit`)}
                          className="text-[hsl(220,100%,40%)]"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Member Details Grid */}
                      <div className="grid grid-cols-2 gap-x-8 gap-y-3 mt-4">
                        <div className="flex items-center gap-4">
                          <span className="text-gray-500 text-sm w-32">Title</span>
                          <span className="text-[hsl(var(--wq-primary))]">{member.title}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-500 text-sm w-32">Start Date</span>
                          <span className="text-[hsl(var(--wq-primary))]">{member.startDate}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-500 text-sm w-32">Location</span>
                          <span className="text-[hsl(var(--wq-primary))]">{member.location}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-500 text-sm w-32">Expertise</span>
                          <ExpertiseTagList expertise={member.expertise} maxVisible={2} />
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-500 text-sm w-32">Available Capacity</span>
                          <CapacityBadge capacity={availableCapacity} />
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-500 text-sm w-32">Clients Assigned</span>
                          <span className="text-[hsl(var(--wq-primary))]">{member.clientAssignments.length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Client Assignments Collapsible */}
                    <Collapsible open={isExpanded} onOpenChange={() => toggleMemberExpanded(member.id)}>
                      <CollapsibleTrigger asChild>
                        <button className="w-full flex items-center justify-between px-4 py-3 bg-[hsl(210,40%,96%)] hover:bg-[hsl(210,40%,92%)] transition-colors">
                          <span className="text-[hsl(220,100%,24%)] font-medium">Client Assignments</span>
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronRightIcon className="w-5 h-5 text-gray-500" />
                          )}
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="p-4 border-t border-gray-200">
                          {/* Assignment Search */}
                          <div className="relative mb-4 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(197,100%,44%)]" />
                            <Input
                              type="text"
                              placeholder="Search Clients, CN"
                              value={assignmentSearch}
                              onChange={(e) => setMemberAssignmentSearch(member.id, e.target.value)}
                              className="pl-10 border-[hsl(197,100%,44%)] focus:ring-[hsl(197,100%,44%)] placeholder:text-[hsl(197,100%,44%)]"
                            />
                          </div>

                          {/* Assignments Table */}
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-gray-50">
                                <TableHead className="text-[hsl(220,100%,24%)] font-semibold">Client Name</TableHead>
                                <TableHead className="text-[hsl(220,100%,24%)] font-semibold">CN Number</TableHead>
                                <TableHead className="text-[hsl(220,100%,24%)] font-semibold">Servicing Country</TableHead>
                                <TableHead className="text-[hsl(220,100%,24%)] font-semibold">Assignment Date</TableHead>
                                <TableHead className="text-[hsl(220,100%,24%)] font-semibold">Assignment Role</TableHead>
                                <TableHead className="text-[hsl(220,100%,24%)] font-semibold">Chair Name</TableHead>
                                <TableHead className="text-[hsl(220,100%,24%)] font-semibold">Scopes</TableHead>
                                <TableHead className="text-[hsl(220,100%,24%)] font-semibold">Workload</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {paginatedAssignments.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                                    No assignments found.
                                  </TableCell>
                                </TableRow>
                              ) : (
                                paginatedAssignments.map((assignment) => (
                                  <TableRow key={assignment.id}>
                                    <TableCell className="text-[hsl(var(--wq-primary))] max-w-[150px] truncate" title={assignment.clientName}>
                                      {assignment.clientName.substring(0, 15)}...
                                    </TableCell>
                                    <TableCell className="text-[hsl(var(--wq-primary))]">{assignment.cnNumber}</TableCell>
                                    <TableCell className="text-[hsl(var(--wq-primary))]">{assignment.servicingCountry}</TableCell>
                                    <TableCell className="text-[hsl(var(--wq-primary))]">{assignment.assignmentDate}</TableCell>
                                    <TableCell className="text-[hsl(var(--wq-primary))]">{assignment.assignmentRole}</TableCell>
                                    <TableCell className="text-[hsl(var(--wq-primary))]">{assignment.chairName}</TableCell>
                                    <TableCell>
                                      <ScopesBadge scopes={assignment.scopes} />
                                    </TableCell>
                                    <TableCell className="text-[hsl(var(--wq-primary))]">{assignment.workload}%</TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>

                          {/* Assignment Pagination */}
                          {filteredAssignments.length > 0 && (
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setMemberPage(member.id, 1)}
                                  disabled={assignmentPage === 1}
                                  className="h-8 w-8 p-0"
                                >
                                  <ChevronsLeft className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setMemberPage(member.id, Math.max(1, assignmentPage - 1))}
                                  disabled={assignmentPage === 1}
                                  className="h-8 w-8 p-0"
                                >
                                  <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <span className="text-sm text-gray-600 mx-2">
                                  Page{' '}
                                  <Select 
                                    value={String(assignmentPage)} 
                                    onValueChange={(v) => setMemberPage(member.id, Number(v))}
                                  >
                                    <SelectTrigger className="inline-flex h-8 w-16 mx-1">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                      {Array.from({ length: assignmentTotalPages }, (_, i) => (
                                        <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  of {assignmentTotalPages}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setMemberPage(member.id, Math.min(assignmentTotalPages, assignmentPage + 1))}
                                  disabled={assignmentPage === assignmentTotalPages}
                                  className="h-8 w-8 p-0"
                                >
                                  <ChevronRightIcon className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setMemberPage(member.id, assignmentTotalPages)}
                                  disabled={assignmentPage === assignmentTotalPages}
                                  className="h-8 w-8 p-0"
                                >
                                  <ChevronsRight className="w-4 h-4" />
                                </Button>
                              </div>
                              <span className="text-sm text-gray-500">
                                Results per page <span className="font-medium">15</span>
                              </span>
                            </div>
                          )}

                          <p className="text-sm text-gray-500 mt-4 italic">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                          </p>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                );
              })
            )}
          </div>

          {/* Main Pagination */}
          {filteredMembers.length > resultsPerPage && (
            <div className="flex items-center justify-between mt-6 p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600 mx-2">
                  Page{' '}
                  <Select value={String(currentPage)} onValueChange={(v) => setCurrentPage(Number(v))}>
                    <SelectTrigger className="inline-flex h-8 w-16 mx-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Results per page</span>
                <span className="text-sm font-medium">15</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Team Member Modal */}
      <AddTeamMemberModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        teamId={team.id}
        onSuccess={() => {}}
      />
    </div>
  );
};

export default TeamMemberDetails;
