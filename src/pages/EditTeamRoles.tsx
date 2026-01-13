import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TeamSetupBreadcrumb } from '@/components/team-setup/TeamSetupBreadcrumb';
import { RoleEditorCard } from '@/components/team-setup/RoleEditorCard';
import { AddRolesModal } from '@/components/team-setup/AddRolesModal';
import { useTeams } from '@/context/TeamsContext';
import { TeamRole } from '@/data/teams';

interface RoleGroup {
  roleName: string;
  chairs: {
    id: string;
    chairName: string;
    chairType: 'Primary' | 'Secondary';
    order: number;
  }[];
}

export default function EditTeamRoles() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTeamById, updateTeam } = useTeams();
  
  const team = getTeamById(id || '');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [roleGroups, setRoleGroups] = useState<RoleGroup[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    if (team) {
      // Group roles by roleName
      const grouped = team.roles.reduce((acc, role) => {
        const existing = acc.find(g => g.roleName === role.roleName);
        if (existing) {
          existing.chairs.push({
            id: role.id,
            chairName: role.chairName,
            chairType: role.chairType,
            order: role.order,
          });
        } else {
          acc.push({
            roleName: role.roleName,
            chairs: [{
              id: role.id,
              chairName: role.chairName,
              chairType: role.chairType,
              order: role.order,
            }],
          });
        }
        return acc;
      }, [] as RoleGroup[]);
      setRoleGroups(grouped);
    }
  }, [team]);

  if (!team) {
    return (
      <div className="min-h-screen bg-[hsl(var(--wq-bg-page))] flex items-center justify-center">
        <p className="text-lg text-[hsl(var(--wq-text-secondary))]">Team not found</p>
      </div>
    );
  }

  const filteredGroups = roleGroups.filter(group =>
    group.roleName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteRole = (roleName: string) => {
    setRoleGroups(prev => prev.filter(g => g.roleName !== roleName));
  };

  const handleUpdateChair = (roleName: string, chairId: string, updates: Partial<TeamRole>) => {
    setRoleGroups(prev => prev.map(group => {
      if (group.roleName === roleName) {
        return {
          ...group,
          chairs: group.chairs.map(chair => 
            chair.id === chairId ? { ...chair, ...updates } : chair
          ),
        };
      }
      return group;
    }));
  };

  const handleDeleteChair = (roleName: string, chairId: string) => {
    setRoleGroups(prev => prev.map(group => {
      if (group.roleName === roleName) {
        return {
          ...group,
          chairs: group.chairs.filter(chair => chair.id !== chairId),
        };
      }
      return group;
    }).filter(group => group.chairs.length > 0));
  };

  const handleAddChair = (roleName: string) => {
    setRoleGroups(prev => prev.map(group => {
      if (group.roleName === roleName) {
        const maxOrder = Math.max(...group.chairs.map(c => c.order), 0);
        return {
          ...group,
          chairs: [...group.chairs, {
            id: `new-${Date.now()}`,
            chairName: 'Chair Name',
            chairType: 'Primary' as const,
            order: maxOrder + 1,
          }],
        };
      }
      return group;
    }));
  };

  const handleAddRoles = (newRoles: string[]) => {
    const newGroups = newRoles.map(roleName => ({
      roleName,
      chairs: [{
        id: `new-${Date.now()}-${roleName}`,
        chairName: 'Chair Name',
        chairType: 'Primary' as const,
        order: 1,
      }],
    }));
    setRoleGroups(prev => [...prev, ...newGroups]);
  };

  const handleSave = () => {
    // Convert role groups back to flat roles array
    const roles: TeamRole[] = roleGroups.flatMap(group =>
      group.chairs.map(chair => ({
        id: chair.id.startsWith('new-') ? `role-${Date.now()}-${Math.random()}` : chair.id,
        roleName: group.roleName,
        chairName: chair.chairName,
        chairType: chair.chairType,
        order: chair.order,
      }))
    );
    
    updateTeam(id || '', { roles });
    navigate(`/team-setup/${id}`);
  };

  const handleCancel = () => {
    navigate(`/team-setup/${id}`);
  };

  const existingRoleNames = roleGroups.map(g => g.roleName);

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
                { label: team.name, href: `/team-setup/${id}` },
                { label: 'Edit Roles', isActive: true },
              ]}
            />

            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-[hsl(var(--wq-primary))]">
                Edit Roles
              </h1>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="
                  bg-[hsl(var(--wq-primary))] text-white
                  hover:bg-[hsl(var(--wq-primary-dark))]
                  flex items-center gap-2
                "
              >
                Add Roles
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--wq-accent))]" />
              <Input
                type="text"
                placeholder="Search Roles"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="
                  pl-10 pr-4 py-2
                  border-[hsl(var(--wq-border))]
                  focus:border-[hsl(var(--wq-accent))]
                  focus:ring-[hsl(var(--wq-accent))]
                  rounded-lg
                "
              />
            </div>

            {/* Role Editor Cards */}
            <div className="space-y-4 mb-8">
              {filteredGroups.map(group => (
                <RoleEditorCard
                  key={group.roleName}
                  roleName={group.roleName}
                  chairs={group.chairs}
                  onDeleteRole={() => handleDeleteRole(group.roleName)}
                  onUpdateChair={(chairId, updates) => handleUpdateChair(group.roleName, chairId, updates)}
                  onDeleteChair={(chairId) => handleDeleteChair(group.roleName, chairId)}
                  onAddChair={() => handleAddChair(group.roleName)}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-[hsl(var(--wq-border))]">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="px-8 border-[hsl(var(--wq-primary))] text-[hsl(var(--wq-primary))]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                className="px-8 bg-[hsl(var(--wq-primary))] text-white hover:bg-[hsl(var(--wq-primary-dark))]"
              >
                Save
              </Button>
            </div>
          </main>
        </div>
      </div>

      {/* Add Roles Modal */}
      <AddRolesModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddRoles}
        existingRoles={existingRoleNames}
      />
    </div>
  );
}
