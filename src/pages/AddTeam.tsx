import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronDown } from 'lucide-react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TeamSetupBreadcrumb } from '@/components/team-setup/TeamSetupBreadcrumb';
import { useTeams } from '@/context/TeamsContext';
import { availableQualifiers } from '@/data/teams';

export default function AddTeam() {
  const navigate = useNavigate();
  const { addTeam } = useTeams();
  
  const [teamName, setTeamName] = useState('');
  const [qualifiers, setQualifiers] = useState<string[]>([]);
  const [teamBase, setTeamBase] = useState<'Workday' | 'Manual Select'>('Workday');
  const [isQualifierDropdownOpen, setIsQualifierDropdownOpen] = useState(false);

  const availableToAdd = availableQualifiers.filter(q => !qualifiers.includes(q));

  const handleAddQualifier = (qualifier: string) => {
    setQualifiers(prev => [...prev, qualifier]);
    setIsQualifierDropdownOpen(false);
  };

  const handleRemoveQualifier = (qualifier: string) => {
    setQualifiers(prev => prev.filter(q => q !== qualifier));
  };

  const handleSave = () => {
    if (!teamName.trim()) return;
    
    const newTeam = addTeam({
      name: teamName,
      qualifiers,
      teamBase,
      roles: [],
      primaryManager: '',
      oversiteManager: '',
    });
    
    navigate(`/team-setup/${newTeam.id}`);
  };

  const handleCancel = () => {
    navigate('/team-setup');
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
                { label: 'Add Team', isActive: true },
              ]}
            />

            {/* Page Header */}
            <h1 className="text-2xl font-bold text-[hsl(var(--wq-primary))] mb-6">
              Add Team
            </h1>

            {/* Separator */}
            <div className="w-full h-px bg-[hsl(var(--wq-border))] mb-8" />

            {/* Form */}
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Team Name */}
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                <label className="text-sm text-[hsl(var(--wq-text-secondary))] text-right">
                  Team Name
                </label>
                <Input
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Team Name"
                  className="
                    border-[hsl(var(--wq-accent))]
                    focus:border-[hsl(var(--wq-accent))]
                    focus:ring-[hsl(var(--wq-accent))]
                  "
                />
              </div>

              {/* Qualifier */}
              <div className="grid grid-cols-[140px_1fr] items-start gap-4">
                <label className="text-sm text-[hsl(var(--wq-text-secondary))] text-right pt-2">
                  Qualifier
                </label>
                <div className="space-y-3">
                  {/* Selected Qualifiers */}
                  {qualifiers.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {qualifiers.map(qualifier => (
                        <span
                          key={qualifier}
                          className="
                            inline-flex items-center gap-1.5
                            px-3 py-1
                            rounded-full
                            text-sm font-medium
                            border border-[hsl(var(--wq-accent))]
                            text-[hsl(var(--wq-accent))]
                            bg-white
                          "
                        >
                          {qualifier}
                          <button
                            type="button"
                            onClick={() => handleRemoveQualifier(qualifier)}
                            className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-[hsl(var(--wq-accent))]/10"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsQualifierDropdownOpen(!isQualifierDropdownOpen)}
                      className="
                        w-full px-4 py-2.5
                        flex items-center justify-between
                        border border-[hsl(var(--wq-accent))] rounded-lg
                        text-left text-sm
                        text-[hsl(var(--wq-text-muted))]
                        hover:border-[hsl(var(--wq-accent))]
                        transition-colors bg-white
                      "
                    >
                      [New Qualifier]
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    {isQualifierDropdownOpen && availableToAdd.length > 0 && (
                      <div className="
                        absolute top-full left-0 right-0 mt-1
                        bg-white border border-[hsl(var(--wq-border))] rounded-lg
                        shadow-lg z-50
                        max-h-48 overflow-y-auto
                      ">
                        {availableToAdd.map(qualifier => (
                          <button
                            key={qualifier}
                            type="button"
                            onClick={() => handleAddQualifier(qualifier)}
                            className="
                              w-full px-4 py-2.5
                              text-left text-sm
                              text-[hsl(var(--wq-text-secondary))]
                              hover:bg-[hsl(197,100%,95%)]
                              transition-colors
                            "
                          >
                            [{qualifier}]
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Team Base */}
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                <label className="text-sm text-[hsl(var(--wq-text-secondary))] text-right">
                  Team Base
                </label>
                <div className="relative">
                  <select
                    value={teamBase}
                    onChange={(e) => setTeamBase(e.target.value as 'Workday' | 'Manual Select')}
                    className="
                      w-full px-4 py-2.5
                      border border-[hsl(var(--wq-accent))] rounded-lg
                      text-sm text-[hsl(var(--wq-text-secondary))]
                      focus:outline-none focus:ring-2 focus:ring-[hsl(var(--wq-accent))]
                      bg-white appearance-none
                    "
                  >
                    <option value="Workday">Workday</option>
                    <option value="Manual Select">Manual Select</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--wq-text-muted))] pointer-events-none" />
                </div>
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
                  disabled={!teamName.trim()}
                  className="px-8 bg-[hsl(var(--wq-primary))] text-white hover:bg-[hsl(var(--wq-primary-dark))] disabled:opacity-50"
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
