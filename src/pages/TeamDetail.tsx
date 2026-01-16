import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, ChevronsUpDown } from 'lucide-react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Input } from '@/components/ui/input';
import { TeamSetupBreadcrumb } from '@/components/team-setup/TeamSetupBreadcrumb';
import { CollapsibleSection } from '@/components/team-setup/CollapsibleSection';
import { QualifierBadge } from '@/components/team-setup/QualifierBadge';
import { TeamTimestamp } from '@/components/team-setup/TeamTimestamp';
import { useTeams } from '@/context/TeamsContext';

export default function TeamDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTeamById } = useTeams();
  const [rolesSearchQuery, setRolesSearchQuery] = useState('');
  const [rolesCurrentPage, setRolesCurrentPage] = useState(1);
  const [rolesPerPage, setRolesPerPage] = useState(15);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const team = getTeamById(id || '');

  if (!team) {
    return (
      <div className="min-h-screen bg-[hsl(var(--wq-bg-page))] flex items-center justify-center">
        <p className="text-lg text-[hsl(var(--wq-text-secondary))]">Team not found</p>
      </div>
    );
  }

  // Filter and sort roles
  const filteredRoles = team.roles.filter(role =>
    role.roleName.toLowerCase().includes(rolesSearchQuery.toLowerCase()) ||
    role.chairName.toLowerCase().includes(rolesSearchQuery.toLowerCase())
  );

  const sortedRoles = [...filteredRoles].sort((a, b) => {
    if (!sortConfig) return 0;
    const aValue = a[sortConfig.key as keyof typeof a];
    const bValue = b[sortConfig.key as keyof typeof b];
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const totalRolesPages = Math.ceil(sortedRoles.length / rolesPerPage);
  const paginatedRoles = sortedRoles.slice(
    (rolesCurrentPage - 1) * rolesPerPage,
    rolesCurrentPage * rolesPerPage
  );

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const displayQualifiers = team.qualifiers.slice(0, 2);
  const remainingQualifiersCount = team.qualifiers.length - 2;

  return (
    <div className="min-h-screen bg-[hsl(var(--wq-bg-page))]">
      <div className="p-6">
        <Header userName="[First Name]" />
        
        <div className="flex gap-6">
          <Sidebar activeItem="team-setup" />
          
          <main className="flex-1 ml-[288px]">
            {/* Breadcrumb */}
            <TeamSetupBreadcrumb 
              items={[
                { label: 'Team Setup', href: '/team-setup' },
                { label: team.name, isActive: true },
              ]}
            />

            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-[hsl(var(--wq-primary))]">
                {team.name}
              </h1>
              <TeamTimestamp />
            </div>

            {/* Details Section */}
            <div className="mb-4">
              <CollapsibleSection 
                title="Details" 
                onEdit={() => navigate(`/team-setup/${id}/edit-details`)}
              >
                <div className="grid grid-cols-2 gap-8">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-[hsl(var(--wq-text-secondary))]">Team Name</span>
                    <span className="text-[hsl(var(--wq-primary))] font-medium">{team.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-[hsl(var(--wq-text-secondary))]">Qualifiers</span>
                    <div className="flex items-center gap-2">
                      {displayQualifiers.map((qualifier, idx) => (
                        <QualifierBadge key={idx} label={qualifier} />
                      ))}
                      {remainingQualifiersCount > 0 && (
                        <span className="text-sm text-[hsl(var(--wq-text-muted))]">
                          +{remainingQualifiersCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-[hsl(var(--wq-text-secondary))]">Team Base</span>
                    <span className="text-[hsl(var(--wq-primary))]">{team.teamBase}</span>
                  </div>
                </div>
              </CollapsibleSection>
            </div>

            {/* Roles Section - Only show if roles are configured */}
            {team.roles.length > 0 && (
              <div className="mb-4">
                <CollapsibleSection 
                  title="Roles" 
                  onEdit={() => navigate(`/team-setup/${id}/edit-roles`)}
                >
                  {/* Search */}
                  <div className="relative mb-4 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--wq-accent))]" />
                    <Input
                      type="text"
                      placeholder="Search Roles"
                      value={rolesSearchQuery}
                      onChange={(e) => setRolesSearchQuery(e.target.value)}
                      className="
                        pl-10 pr-4 py-2
                        border-[hsl(var(--wq-accent))]
                        focus:border-[hsl(var(--wq-accent))]
                        focus:ring-[hsl(var(--wq-accent))]
                        rounded-lg
                      "
                    />
                  </div>

                  {/* Roles Table */}
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[hsl(216,100%,97%)] border-b border-[hsl(var(--wq-border))]">
                        {['roleName', 'chairName', 'chairType', 'order'].map((key) => (
                          <th 
                            key={key}
                            className="px-4 py-3 text-left text-sm font-semibold text-[hsl(var(--wq-primary))]"
                          >
                            <button 
                              onClick={() => handleSort(key)}
                              className="flex items-center gap-1 hover:text-[hsl(var(--wq-accent))]"
                            >
                              {key === 'roleName' && 'Role Name'}
                              {key === 'chairName' && 'Chair Name'}
                              {key === 'chairType' && 'Chair Type'}
                              {key === 'order' && 'Order'}
                              <ChevronsUpDown className="w-4 h-4" />
                            </button>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRoles.map((role) => (
                        <tr 
                          key={role.id}
                          className="border-b border-[hsl(var(--wq-border))] last:border-b-0"
                        >
                          <td className="px-4 py-3 text-[hsl(var(--wq-primary))]">{role.roleName}</td>
                          <td className="px-4 py-3 text-[hsl(var(--wq-primary))]">{role.chairName}</td>
                          <td className="px-4 py-3 text-[hsl(var(--wq-primary))]">{role.chairType}</td>
                          <td className="px-4 py-3 text-[hsl(var(--wq-primary))]">{role.order}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[hsl(var(--wq-border))]">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setRolesCurrentPage(1)}
                        disabled={rolesCurrentPage === 1}
                        className="p-1 text-[hsl(var(--wq-text-muted))] hover:text-[hsl(var(--wq-primary))] disabled:opacity-50"
                      >
                        ⟨⟨
                      </button>
                      <button
                        onClick={() => setRolesCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={rolesCurrentPage === 1}
                        className="p-1 text-[hsl(var(--wq-text-muted))] hover:text-[hsl(var(--wq-primary))] disabled:opacity-50"
                      >
                        ⟨
                      </button>
                      <span className="text-sm text-[hsl(var(--wq-text-secondary))]">
                        Page{' '}
                        <select
                          value={rolesCurrentPage}
                          onChange={(e) => setRolesCurrentPage(parseInt(e.target.value))}
                          className="mx-1 px-2 py-1 border border-[hsl(var(--wq-border))] rounded bg-white"
                        >
                          {Array.from({ length: totalRolesPages }, (_, i) => i + 1).map(page => (
                            <option key={page} value={page}>{page}</option>
                          ))}
                        </select>
                        {' '}of {totalRolesPages || 1}
                      </span>
                      <button
                        onClick={() => setRolesCurrentPage(prev => Math.min(totalRolesPages, prev + 1))}
                        disabled={rolesCurrentPage === totalRolesPages}
                        className="p-1 text-[hsl(var(--wq-text-muted))] hover:text-[hsl(var(--wq-primary))] disabled:opacity-50"
                      >
                        ⟩
                      </button>
                      <button
                        onClick={() => setRolesCurrentPage(totalRolesPages)}
                        disabled={rolesCurrentPage === totalRolesPages}
                        className="p-1 text-[hsl(var(--wq-text-muted))] hover:text-[hsl(var(--wq-primary))] disabled:opacity-50"
                      >
                        ⟩⟩
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[hsl(var(--wq-text-secondary))]">
                        Results per page
                      </span>
                      <select
                        value={rolesPerPage}
                        onChange={(e) => {
                          setRolesPerPage(parseInt(e.target.value));
                          setRolesCurrentPage(1);
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
                </CollapsibleSection>
              </div>
            )}

            {/* Accesses Section - Only show if managers are configured */}
            {(team.primaryManager || team.oversiteManager) && (
              <div className="mb-4">
                <CollapsibleSection 
                  title="Accesses" 
                  onEdit={() => navigate(`/team-setup/${id}/edit-accesses`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-[hsl(var(--wq-text-secondary))]">Primary Manager</span>
                      <a 
                        href="#" 
                        className="text-[hsl(var(--wq-primary))] font-medium hover:underline"
                      >
                        {team.primaryManager}
                      </a>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-[hsl(var(--wq-text-secondary))]">Oversite Manager</span>
                      <a 
                        href="#" 
                        className="text-[hsl(var(--wq-primary))] font-medium hover:underline"
                      >
                        {team.oversiteManager}
                      </a>
                    </div>
                  </div>
                </CollapsibleSection>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
