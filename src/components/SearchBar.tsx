import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Search Table",
  className = ""
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className={`
        flex w-[295px] h-10 items-center gap-3 
        bg-white pl-3 pr-4 
        rounded-lg border
        transition-all duration-200
        ${isFocused 
          ? 'border-[hsl(197,100%,44%)] shadow-[0_0_0_3px_hsl(197,100%,44%,0.1)]' 
          : 'border-[hsl(216,16%,84%)] shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
        }
        ${className}
      `}
      role="search"
      aria-label="Search work items"
    >
      <button 
        type="submit" 
        aria-label="Submit search"
        className="flex-shrink-0 text-[hsl(197,100%,44%)] hover:text-[hsl(197,100%,35%)] transition-colors"
      >
        <Search className="w-5 h-5" />
      </button>
      <input
        type="text"
        value={searchQuery}
        onChange={handleInputChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="
          flex-1
          text-sm font-normal 
          text-[hsl(220,100%,24%)]
          bg-transparent border-none outline-none 
          placeholder:text-[hsl(220,5%,60%)]
        "
        aria-label="Search input"
      />
    </form>
  );
};
