import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronDown } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  const [newQualifierInput, setNewQualifierInput] = useState('');

  const availableToAdd = availableQualifiers.filter(q => !qualifiers.includes(q));

  const handleAddCustomQualifier = () => {
    const trimmed = newQualifierInput.trim();
    if (trimmed && !qualifiers.includes(trimmed)) {
      setQualifiers(prev => [...prev, trimmed]);
      setNewQualifierInput('');
    }
  };

  const handleQualifierKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomQualifier();
    }
  };

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
      department: teamName, // Default to team name
      qualifiers,
      teamBase,
      roles: [],
      primaryManager: '',
      primaryManagerId: '',
      oversiteManager: '',
      oversiteManagerId: '',
      memberCount: 0,
    });
    
    navigate('/team-setup');
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

                  {/* Custom Input with Dropdown */}
                  <div className="relative">
                    <div className="relative">
                      <Input
                        value={newQualifierInput}
                        onChange={(e) => setNewQualifierInput(e.target.value)}
                        onKeyDown={handleQualifierKeyDown}
                        onFocus={() => setIsQualifierDropdownOpen(true)}
                        placeholder="Type or select a qualifier"
                        className="border-[hsl(var(--wq-accent))] focus:border-[hsl(var(--wq-accent))] focus:ring-[hsl(var(--wq-accent))] pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setIsQualifierDropdownOpen(!isQualifierDropdownOpen)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        <ChevronDown className="w-4 h-4 text-[hsl(var(--wq-text-muted))]" />
                      </button>
                    </div>
                    
                    {isQualifierDropdownOpen && availableToAdd.length > 0 && (
                      <div className="
                        absolute top-full left-0 right-0 mt-1
                        bg-white border border-[hsl(var(--wq-border))] rounded-lg
                        shadow-lg z-50
                        max-h-48 overflow-y-auto
                      ">
                        {availableToAdd
                          .filter(q => q.toLowerCase().includes(newQualifierInput.toLowerCase()))
                          .map(qualifier => (
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
                            {qualifier}
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
                <RadioGroup
                  value={teamBase}
                  onValueChange={(value) => setTeamBase(value as 'Workday' | 'Manual Select')}
                  className="flex items-center gap-6"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="Workday" id="team-base-workday" />
                    <label htmlFor="team-base-workday" className="text-sm text-[hsl(var(--wq-text-secondary))] cursor-pointer">
                      Workday
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="Manual Select" id="team-base-manual" />
                    <label htmlFor="team-base-manual" className="text-sm text-[hsl(var(--wq-text-secondary))] cursor-pointer">
                      Manual Select
                    </label>
                  </div>
                </RadioGroup>
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
