import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronRight, X } from 'lucide-react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTeamAssignments } from '@/context/TeamAssignmentsContext';
import { ExpertiseTag } from '@/components/team-assignment/ExpertiseTag';

const EditTeamMemberDetails: React.FC = () => {
  const navigate = useNavigate();
  const { teamName, memberId } = useParams<{ teamName: string; memberId: string }>();
  const { getTeamByName, getMemberById, updateMember, expertiseList, addExpertise } = useTeamAssignments();

  // Convert URL param back to team name
  const actualTeamName = teamName?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '';
  const team = getTeamByName(actualTeamName);
  const member = team && memberId ? getMemberById(team.id, memberId) : undefined;

  const [expertise, setExpertise] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (member) {
      setExpertise(member.expertise);
    }
  }, [member]);

  const filteredSuggestions = useMemo(() => {
    if (!newTag) return [];
    const lowerQuery = newTag.toLowerCase();
    return expertiseList
      .filter(exp => 
        exp.toLowerCase().includes(lowerQuery) && 
        !expertise.includes(exp)
      )
      .slice(0, 5);
  }, [newTag, expertiseList, expertise]);

  const handleAddTag = (tag: string) => {
    if (tag && !expertise.includes(tag)) {
      setExpertise([...expertise, tag]);
      addExpertise(tag); // Add to master list if new
    }
    setNewTag('');
    setShowDropdown(false);
  };

  const handleRemoveTag = (index: number) => {
    setExpertise(expertise.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (team && member) {
      updateMember(team.id, member.id, { expertise });
      navigate(`/my-team-assignment/${teamName}`);
    }
  };

  const handleCancel = () => {
    navigate(`/my-team-assignment/${teamName}`);
  };

  if (!team || !member) {
    return (
      <div className="min-h-screen bg-[hsl(210,20%,98%)]">
        <Header />
        <Sidebar activeItem="team-assignment" />
        <main className="pl-[300px] pt-[100px] pr-6 pb-8">
          <div className="text-center py-12">
            <p className="text-gray-500">Team member not found.</p>
            <Link to="/my-team-assignment" className="text-[hsl(220,100%,40%)] underline mt-2 inline-block">
              Back to My Team Assignment
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const availableCapacity = Math.max(0, 100 - member.clientAssignments.reduce((sum, a) => sum + a.workload, 0));

  return (
    <div className="min-h-screen bg-[hsl(210,20%,98%)]">
      <Header />
      <Sidebar activeItem="team-assignment" />
      
      <main className="pl-[300px] pt-[100px] pr-6 pb-8">
        <div className="max-w-[800px]">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-4">
            <Link to="/my-team-assignment" className="text-gray-500 hover:text-[hsl(220,100%,40%)]">
              My Team Assignment
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link to={`/my-team-assignment/${teamName}`} className="text-gray-500 hover:text-[hsl(220,100%,40%)]">
              {team.teamName}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-[hsl(220,100%,40%)] font-medium">Edit Team Member Details</span>
          </nav>

          {/* Header */}
          <h1 className="text-2xl font-semibold text-[hsl(220,100%,24%)] mb-6">
            Edit Team Member Details
          </h1>

          <div className="h-px bg-gray-200 mb-8" />

          {/* Form */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <label className="text-sm text-gray-600 w-40 text-right">First Name</label>
                <Input
                  value={member.firstName}
                  disabled
                  className="flex-1 bg-[hsl(210,40%,96%)] border-[hsl(197,100%,44%)] text-[hsl(220,100%,40%)]"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="text-sm text-gray-600 w-40 text-right">Middle Name <span className="text-gray-400">(Optional)</span></label>
                <Input
                  value={member.middleName || ''}
                  disabled
                  placeholder="Middle Name"
                  className="flex-1 bg-[hsl(210,40%,96%)] border-[hsl(197,100%,44%)] text-[hsl(220,100%,40%)] placeholder:text-gray-400"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="text-sm text-gray-600 w-40 text-right">Last Name</label>
                <Input
                  value={member.lastName}
                  disabled
                  className="flex-1 bg-[hsl(210,40%,96%)] border-[hsl(197,100%,44%)] text-[hsl(220,100%,40%)]"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="text-sm text-gray-600 w-40 text-right">Title</label>
                <Input
                  value={member.title}
                  disabled
                  className="flex-1 bg-[hsl(210,40%,96%)] border-[hsl(197,100%,44%)] text-[hsl(220,100%,40%)]"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="text-sm text-gray-600 w-40 text-right">Start Date</label>
                <Input
                  value={member.startDate}
                  disabled
                  className="flex-1 bg-[hsl(210,40%,96%)] border-[hsl(197,100%,44%)] text-[hsl(220,100%,40%)]"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <label className="text-sm text-gray-600 w-40 text-right">Location</label>
                <Input
                  value={member.location}
                  disabled
                  className="flex-1 bg-[hsl(210,40%,96%)] border-[hsl(197,100%,44%)] text-[hsl(220,100%,40%)]"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="text-sm text-gray-600 w-40 text-right">Available Capacity</label>
                <Input
                  value={`${availableCapacity}%`}
                  disabled
                  className="flex-1 bg-[hsl(210,40%,96%)] border-[hsl(197,100%,44%)] text-[hsl(220,100%,40%)]"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="text-sm text-gray-600 w-40 text-right">Clients Assigned</label>
                <Input
                  value={member.clientAssignments.length.toString()}
                  disabled
                  className="flex-1 bg-[hsl(210,40%,96%)] border-[hsl(197,100%,44%)] text-[hsl(220,100%,40%)]"
                />
              </div>

              {/* Expertise - Editable */}
              <div className="flex items-start gap-4">
                <label className="text-sm text-gray-600 w-40 text-right pt-2">Expertise</label>
                <div className="flex-1 space-y-2">
                  {/* Current Tags */}
                  <div className="flex flex-wrap gap-2 min-h-[32px]">
                    {expertise.map((tag, index) => (
                      <ExpertiseTag 
                        key={index} 
                        label={tag} 
                        onRemove={() => handleRemoveTag(index)} 
                      />
                    ))}
                  </div>

                  {/* Add New Tag */}
                  <div className="relative">
                    <Input
                      value={newTag}
                      onChange={(e) => {
                        setNewTag(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newTag) {
                          e.preventDefault();
                          handleAddTag(newTag);
                        }
                      }}
                      placeholder="[New Tag]"
                      className="border-[hsl(197,100%,44%)] focus:ring-[hsl(197,100%,44%)] placeholder:text-gray-400"
                    />

                    {/* Suggestions Dropdown */}
                    {showDropdown && filteredSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        {filteredSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleAddTag(suggestion)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 text-[hsl(220,100%,40%)]"
                          >
                            [{suggestion}]
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4 mt-12">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="px-8 border-[hsl(220,100%,24%)] text-[hsl(220,100%,24%)]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="px-8 bg-[hsl(220,100%,24%)] hover:bg-[hsl(220,100%,20%)] text-white"
            >
              Save
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditTeamMemberDetails;
