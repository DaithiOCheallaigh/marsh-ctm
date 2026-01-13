import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TeamSetupBreadcrumb } from '@/components/team-setup/TeamSetupBreadcrumb';
import { TeamTimestamp } from '@/components/team-setup/TeamTimestamp';
import { useTeams } from '@/context/TeamsContext';

export default function EditTeamAccesses() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTeamById, updateTeam } = useTeams();
  
  const team = getTeamById(id || '');
  
  const [primaryManager, setPrimaryManager] = useState('');
  const [oversiteManager, setOversiteManager] = useState('');

  useEffect(() => {
    if (team) {
      setPrimaryManager(team.primaryManager);
      setOversiteManager(team.oversiteManager);
    }
  }, [team]);

  if (!team) {
    return (
      <div className="min-h-screen bg-[hsl(var(--wq-bg-page))] flex items-center justify-center">
        <p className="text-lg text-[hsl(var(--wq-text-secondary))]">Team not found</p>
      </div>
    );
  }

  const handleSave = () => {
    updateTeam(id || '', {
      primaryManager,
      oversiteManager,
    });
    navigate(`/team-setup/${id}`);
  };

  const handleCancel = () => {
    navigate(`/team-setup/${id}`);
  };

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
                { label: 'Edit Accesses', isActive: true },
              ]}
            />

            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-[hsl(var(--wq-primary))]">
                Edit Accesses
              </h1>
              <TeamTimestamp />
            </div>

            {/* Separator */}
            <div className="w-full h-px bg-[hsl(var(--wq-border))] mb-8" />

            {/* Form */}
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Primary Manager */}
              <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                <label className="text-sm text-[hsl(var(--wq-text-secondary))] text-right">
                  Primary Manager
                </label>
                <Input
                  value={primaryManager}
                  onChange={(e) => setPrimaryManager(e.target.value)}
                  placeholder="[Primary Manager]"
                  className="
                    border-[hsl(var(--wq-accent))]
                    focus:border-[hsl(var(--wq-accent))]
                    focus:ring-[hsl(var(--wq-accent))]
                  "
                />
              </div>

              {/* Oversite Manager */}
              <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                <label className="text-sm text-[hsl(var(--wq-text-secondary))] text-right">
                  Oversite Manager
                </label>
                <Input
                  value={oversiteManager}
                  onChange={(e) => setOversiteManager(e.target.value)}
                  placeholder="[Oversite Manager]"
                  className="
                    border-[hsl(var(--wq-accent))]
                    focus:border-[hsl(var(--wq-accent))]
                    focus:ring-[hsl(var(--wq-accent))]
                  "
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-4 pt-6">
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
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
