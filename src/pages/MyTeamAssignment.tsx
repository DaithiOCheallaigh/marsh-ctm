import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, ChevronRight, Clock, ChevronsLeft, ChevronLeft, ChevronRight as ChevronRightIcon, ChevronsRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getTeamOverviewData } from '@/data/teamAssignments';

const MyTeamAssignment: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(15);

  const allTeams = getTeamOverviewData();

  const filteredTeams = useMemo(() => {
    if (!searchQuery) return allTeams;
    const lowerQuery = searchQuery.toLowerCase();
    return allTeams.filter(team => team.teamName.toLowerCase().includes(lowerQuery));
  }, [allTeams, searchQuery]);

  const totalPages = Math.ceil(filteredTeams.length / resultsPerPage);
  const paginatedTeams = filteredTeams.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  const handleTeamClick = (teamName: string) => {
    // Navigate using team name (lowercase, hyphenated)
    navigate(`/my-team-assignment/${teamName.toLowerCase().replace(/\s+/g, '-')}`);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[hsl(0,0%,97%)]">
      {/* Header - Full Width */}
      <div className="w-full px-6 pt-6">
        <Header userName="[First Name]" />
      </div>
      
      {/* Content Area with Sidebar */}
      <div className="flex flex-1">
        <Sidebar activeItem="team-assignment" />
        
        <main className="flex-1 ml-[300px] px-8 pt-6 pb-10">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[hsl(197,100%,44%,0.1)] flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-[hsl(197,100%,44%)]" />
              </div>
              <h2 className="text-[hsl(220,100%,24%)] text-lg font-bold">My Team Assignment</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-[hsl(0,0%,91%)] rounded-lg">
                <Clock className="w-4 h-4 text-[hsl(0,0%,25%)]" />
                <span className="text-[hsl(0,0%,25%)] text-xs font-medium">26 Feb 2024 13:42 EST</span>
              </div>
              <Button className="bg-[hsl(220,100%,24%)] hover:bg-[hsl(220,100%,20%)] text-white">
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Divider */}
          <div className="w-full h-px bg-[hsl(220,100%,24%)] opacity-20 mb-6" />

          {/* Search Bar */}
          <div className="relative mb-6 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(197,100%,44%)]" />
            <Input
              type="text"
              placeholder="Search Team"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 border-[hsl(197,100%,44%)] focus:ring-[hsl(197,100%,44%)] placeholder:text-[hsl(197,100%,44%)]"
            />
          </div>

          {/* Teams Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[hsl(210,40%,96%)]">
                  <TableHead className="text-[hsl(220,100%,24%)] font-semibold">Team Name</TableHead>
                  <TableHead className="text-[hsl(220,100%,24%)] font-semibold">No. of Members</TableHead>
                  <TableHead className="text-[hsl(220,100%,24%)] font-semibold">No. of Assignments</TableHead>
                  <TableHead className="text-[hsl(220,100%,24%)] font-semibold">No. of Clients</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTeams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No teams available under My Team Assignment.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTeams.map((team) => (
                    <TableRow 
                      key={team.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleTeamClick(team.teamName)}
                    >
                      <TableCell className="text-[hsl(220,100%,40%)] font-medium">
                        {team.teamName}
                      </TableCell>
                      <TableCell className="text-[hsl(220,100%,40%)]">{team.memberCount}</TableCell>
                      <TableCell className="text-[hsl(220,100%,40%)]">{team.assignmentCount}</TableCell>
                      <TableCell className="text-[hsl(220,100%,40%)]">{team.clientCount}</TableCell>
                      <TableCell>
                        <ChevronRight className="w-5 h-5 text-[hsl(220,100%,40%)]" />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {filteredTeams.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
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
                  <Select value={String(resultsPerPage)} onValueChange={(v) => {
                    setResultsPerPage(Number(v));
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger className="h-8 w-16">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="15">15</SelectItem>
                      <SelectItem value="30">30</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyTeamAssignment;
