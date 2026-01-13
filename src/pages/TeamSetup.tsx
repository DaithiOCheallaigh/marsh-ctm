import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ChevronRight, Users, Clock } from 'lucide-react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QualifierBadge } from '@/components/team-setup/QualifierBadge';
import { TeamTimestamp } from '@/components/team-setup/TeamTimestamp';
import { useTeams } from '@/context/TeamsContext';

export default function TeamSetup() {
  const navigate = useNavigate();
  const { teams } = useTeams();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(15);

  // Filter teams based on search
  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.qualifiers.some(q => q.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination
  const totalPages = Math.ceil(filteredTeams.length / resultsPerPage);
  const paginatedTeams = filteredTeams.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  const handleTeamClick = (teamId: string) => {
    navigate(`/team-setup/${teamId}`);
  };

  const handleAddTeam = () => {
    navigate('/team-setup/new');
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[hsl(0,0%,97%)]">
      {/* Header - Full Width */}
      <div className="w-full px-6 pt-6">
        <Header userName="[First Name]" />
      </div>
      
      {/* Content Area with Sidebar */}
      <div className="flex flex-1">
        <Sidebar activeItem="team-setup" />
        
        <main className="flex-1 ml-[300px] px-8 pt-6 pb-10">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[hsl(197,100%,44%,0.1)] flex items-center justify-center">
                <Users className="w-5 h-5 text-[hsl(197,100%,44%)]" />
              </div>
              <h2 className="text-[hsl(220,100%,24%)] text-lg font-bold">Team Setup</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-[hsl(0,0%,91%)] rounded-lg">
                <Clock className="w-4 h-4 text-[hsl(0,0%,25%)]" />
                <span className="text-[hsl(0,0%,25%)] text-xs font-medium">26 Feb 2024 13:42 EST</span>
              </div>
              <Button
                onClick={handleAddTeam}
                className="
                  bg-[hsl(220,100%,24%)] text-white
                  hover:bg-[hsl(220,100%,18%)]
                  flex items-center gap-2
                "
              >
                Add Team
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Divider */}
          <div className="w-full h-px bg-[hsl(220,100%,24%)] opacity-20 mb-6" />

          {/* Search Bar */}
          <div className="relative mb-6 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--wq-accent))]" />
            <Input
              type="text"
              placeholder="Search Team Members"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                pl-10 pr-4 py-2.5
                border-[hsl(var(--wq-accent))] 
                focus:border-[hsl(var(--wq-accent))]
                focus:ring-[hsl(var(--wq-accent))]
                rounded-lg
              "
            />
            </div>

            {/* Teams Table */}
            <div className="bg-white rounded-xl border border-[hsl(var(--wq-border))] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[hsl(216,100%,97%)] border-b border-[hsl(var(--wq-border))]">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[hsl(var(--wq-primary))]">
                      Team Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[hsl(var(--wq-primary))]">
                      Team Base
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[hsl(var(--wq-primary))]">
                      Qualifiers
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[hsl(var(--wq-primary))]">
                      Roles
                    </th>
                    <th className="px-4 py-4 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTeams.map((team) => {
                    const displayQualifiers = team.qualifiers.slice(0, 2);
                    const remainingCount = team.qualifiers.length - 2;
                    
                    return (
                      <tr
                        key={team.id}
                        onClick={() => handleTeamClick(team.id)}
                        className="
                          border-b border-[hsl(var(--wq-border))] last:border-b-0
                          hover:bg-[hsl(var(--wq-bg-hover))] cursor-pointer
                          transition-colors
                        "
                      >
                        <td className="px-6 py-4">
                          <span className="text-[hsl(var(--wq-primary))] font-medium">
                            {team.name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[hsl(var(--wq-primary))]">
                            {team.teamBase}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            {displayQualifiers.map((qualifier, idx) => (
                              <QualifierBadge key={idx} label={qualifier} />
                            ))}
                            {remainingCount > 0 && (
                              <span className="text-sm text-[hsl(var(--wq-text-muted))]">
                                +{remainingCount}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[hsl(var(--wq-primary))] font-medium">
                            {team.roles.length}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <ChevronRight className="w-5 h-5 text-[hsl(var(--wq-text-muted))]" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-[hsl(var(--wq-border))]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="p-1 text-[hsl(var(--wq-text-muted))] hover:text-[hsl(var(--wq-primary))] disabled:opacity-50"
                    aria-label="First page"
                  >
                    ⟨⟨
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-1 text-[hsl(var(--wq-text-muted))] hover:text-[hsl(var(--wq-primary))] disabled:opacity-50"
                    aria-label="Previous page"
                  >
                    ⟨
                  </button>
                  <span className="text-sm text-[hsl(var(--wq-text-secondary))]">
                    Page{' '}
                    <select
                      value={currentPage}
                      onChange={(e) => setCurrentPage(parseInt(e.target.value))}
                      className="mx-1 px-2 py-1 border border-[hsl(var(--wq-border))] rounded bg-white"
                    >
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <option key={page} value={page}>{page}</option>
                      ))}
                    </select>
                    {' '}of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 text-[hsl(var(--wq-text-muted))] hover:text-[hsl(var(--wq-primary))] disabled:opacity-50"
                    aria-label="Next page"
                  >
                    ⟩
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-1 text-[hsl(var(--wq-text-muted))] hover:text-[hsl(var(--wq-primary))] disabled:opacity-50"
                    aria-label="Last page"
                  >
                    ⟩⟩
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[hsl(var(--wq-text-secondary))]">
                    Results per page
                  </span>
                  <select
                    value={resultsPerPage}
                    onChange={(e) => {
                      setResultsPerPage(parseInt(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 border border-[hsl(var(--wq-border))] rounded bg-white text-sm"
                  >
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </div>
        </main>
      </div>
    </div>
  );
}
