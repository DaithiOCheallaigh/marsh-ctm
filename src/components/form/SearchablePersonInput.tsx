import React, { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchablePerson {
  id: string;
  name: string;
  role?: string;
  location?: string;
}

interface SearchablePersonInputProps {
  value: string;
  onChange: (id: string, person: SearchablePerson | null) => void;
  placeholder?: string;
  persons: SearchablePerson[];
  className?: string;
  isDirty?: boolean;
}

const SearchablePersonInput: React.FC<SearchablePersonInputProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  persons,
  className,
  isDirty = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredPersons, setFilteredPersons] = useState<SearchablePerson[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find selected person
  const selectedPerson = persons.find((p) => p.id === value);

  // Filter persons based on search query
  useEffect(() => {
    if (searchQuery === "") {
      setFilteredPersons(persons);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = persons.filter(
        (person) =>
          person.name.toLowerCase().includes(query) ||
          (person.role && person.role.toLowerCase().includes(query)) ||
          (person.location && person.location.toLowerCase().includes(query))
      );
      setFilteredPersons(filtered);
    }
  }, [searchQuery, persons]);

  // Close dropdown when clicking outside
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

  const handleSelectPerson = (person: SearchablePerson) => {
    onChange(person.id, person);
    setSearchQuery("");
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange("", null);
    setSearchQuery("");
  };

  // Format name as "Last, First" for display in dropdown
  const formatNameLastFirst = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      const lastName = parts[parts.length - 1];
      const firstName = parts.slice(0, -1).join(" ");
      return `${lastName}, ${firstName}`;
    }
    return name;
  };

  return (
    <div className={cn("relative max-w-md", className)}>
      {/* Selected State */}
      {selectedPerson ? (
        <div
          className={cn(
            "flex items-center justify-between px-3 py-2.5 border rounded-lg bg-white transition-all duration-200",
            isDirty
              ? "border-[hsl(var(--wq-accent))] bg-[hsl(220,60%,97%)]"
              : "border-[hsl(var(--wq-border))]"
          )}
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[hsl(var(--wq-accent))]" />
            <span className="text-sm text-primary font-medium">
              {selectedPerson.name}
              {selectedPerson.role && (
                <span className="text-[hsl(var(--wq-text-secondary))] font-normal">
                  {" "}
                  - {selectedPerson.role}
                </span>
              )}
            </span>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-[hsl(var(--wq-text-muted))] hover:text-destructive transition-colors"
            aria-label="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Search Input State */
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--wq-accent))]" />
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className={cn(
              "w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm placeholder:text-[hsl(var(--wq-text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--wq-accent))]/20 bg-white transition-all duration-200",
              isDirty
                ? "border-[hsl(var(--wq-accent))] bg-[hsl(220,60%,97%)]"
                : "border-[hsl(var(--wq-border))]"
            )}
          />
        </div>
      )}

      {/* Dropdown */}
      {isOpen && !selectedPerson && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-[hsl(var(--wq-border))] rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {filteredPersons.length > 0 ? (
            filteredPersons.map((person) => (
              <div
                key={person.id}
                onClick={() => handleSelectPerson(person)}
                className="flex items-center gap-2 px-3 py-2.5 hover:bg-[hsl(var(--wq-bg-hover))] cursor-pointer transition-colors"
              >
                <Search className="w-4 h-4 text-[hsl(var(--wq-accent))]" />
                <div className="flex-1">
                  <span className="text-primary font-medium text-sm">
                    {formatNameLastFirst(person.name)}
                  </span>
                  {person.role && (
                    <span className="text-[hsl(var(--wq-text-secondary))] text-xs ml-2">
                      {person.role}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="px-3 py-4 text-center text-[hsl(var(--wq-text-muted))] text-sm">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchablePersonInput;
