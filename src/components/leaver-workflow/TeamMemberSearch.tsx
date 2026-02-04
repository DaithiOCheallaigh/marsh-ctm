import React, { useState, useRef, useEffect } from "react";
import { Search, X, Trash2 } from "lucide-react";
import { ReassignableTeamMember, reassignableTeamMembers } from "@/data/leaverClients";
import { cn } from "@/lib/utils";

interface TeamMemberSearchProps {
  selectedMember: ReassignableTeamMember | null;
  onSelectMember: (member: ReassignableTeamMember | null) => void;
  excludeIds?: string[];
}

export const TeamMemberSearch: React.FC<TeamMemberSearchProps> = ({
  selectedMember,
  onSelectMember,
  excludeIds = [],
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredMembers, setFilteredMembers] = useState<ReassignableTeamMember[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const filtered = reassignableTeamMembers.filter((member) => {
      const matchesSearch =
        searchQuery === "" ||
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase());
      const notExcluded = !excludeIds.includes(member.id);
      return matchesSearch && notExcluded;
    });
    setFilteredMembers(filtered);
  }, [searchQuery, excludeIds]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectMember = (member: ReassignableTeamMember) => {
    onSelectMember(member);
    setSearchQuery("");
    setIsOpen(false);
  };

  const handleRemoveMember = () => {
    onSelectMember(null);
  };

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--wq-accent))]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search Team Member"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="w-full pl-10 pr-4 py-2.5 border border-[hsl(var(--wq-accent))] rounded-lg text-sm text-[hsl(var(--wq-accent))] placeholder:text-[hsl(var(--wq-accent))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--wq-accent))]/20 bg-white"
          />
        </div>

        {/* Dropdown */}
        {isOpen && filteredMembers.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border border-[hsl(var(--wq-accent))] rounded-lg shadow-lg max-h-60 overflow-auto"
          >
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                onClick={() => handleSelectMember(member)}
                className="flex items-center gap-2 px-3 py-2.5 hover:bg-[hsl(var(--wq-bg-hover))] cursor-pointer transition-colors"
              >
                <Search className="w-4 h-4 text-[hsl(var(--wq-accent))]" />
                <span className="text-primary font-medium text-sm">
                  {member.name.split(" ").reverse().join(", ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Member Card */}
      {selectedMember && (
        <div className="p-4 bg-[hsl(var(--wq-bg-header))] rounded-lg border border-[hsl(var(--wq-border))]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-primary font-semibold text-sm">{selectedMember.name}</p>
              <p className="text-[hsl(var(--wq-text-secondary))] text-xs">{selectedMember.role}</p>
              <p className="text-[hsl(var(--wq-text-secondary))] text-xs">{selectedMember.location}</p>
            </div>
            <button
              onClick={handleRemoveMember}
              className="p-1.5 text-[hsl(var(--wq-text-muted))] hover:text-destructive transition-colors"
              aria-label="Remove team member"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
