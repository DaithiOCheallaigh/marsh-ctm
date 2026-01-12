import React, { useState } from 'react';

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
      className={`flex w-[295px] h-8 items-center gap-2 bg-white pl-2 pr-4 py-2.5 rounded-lg border-[0.5px] border-solid border-[#009DE0] ${className}`}
    >
      <button type="submit" aria-label="Search">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
          <path d="M23 23L19.6221 19.6221M19.6221 19.6221C20.1999 19.0444 20.6583 18.3584 20.971 17.6035C21.2837 16.8486 21.4446 16.0394 21.4446 15.2223C21.4446 14.4052 21.2837 13.5961 20.971 12.8411C20.6583 12.0862 20.1999 11.4003 19.6221 10.8225C19.0444 10.2447 18.3584 9.78635 17.6035 9.47365C16.8486 9.16094 16.0394 9 15.2223 9C14.4052 9 13.5961 9.16094 12.8411 9.47365C12.0862 9.78635 11.4003 10.2447 10.8225 10.8225C9.65556 11.9894 9 13.5721 9 15.2223C9 16.8726 9.65556 18.4552 10.8225 19.6221C11.9894 20.7891 13.5721 21.4446 15.2223 21.4446C16.8726 21.4446 18.4552 20.7891 19.6221 19.6221Z" stroke="#009DE0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <input
        type="text"
        value={searchQuery}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="text-[#009DE0] text-right text-sm font-normal bg-transparent border-none outline-none flex-1 placeholder:text-[#009DE0]"
      />
    </form>
  );
};
