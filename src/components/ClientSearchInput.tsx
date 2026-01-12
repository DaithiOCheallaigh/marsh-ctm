import { useState, useRef, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { searchClients, Client } from "@/data/clients";
import { cn } from "@/lib/utils";
import { useFormDirtyContext, getFieldStateClasses } from "@/components/form/FormDirtyContext";

interface ClientSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  fieldName?: string;
}

const ClientSearchInput = ({
  value,
  onChange,
  placeholder = "Search by client name or CN number",
  className,
  fieldName,
}: ClientSearchInputProps) => {
  const dirtyContext = useFormDirtyContext();
  const isDirty = fieldName && dirtyContext ? dirtyContext.isDirty(fieldName) : false;
  const [isOpen, setIsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);

    if (newValue.trim()) {
      const results = searchClients(newValue);
      setSearchResults(results);
      setIsOpen(true);
    } else {
      setSearchResults([]);
      setIsOpen(false);
    }
  };

  const handleSelectClient = (client: Client) => {
    const selectedValue = `${client.name} (${client.cnNumber})`;
    setInputValue(selectedValue);
    onChange(selectedValue);
    setIsOpen(false);
  };

  const handleAddNew = () => {
    onChange(inputValue);
    setIsOpen(false);
  };

  const showAddNewOption = inputValue.trim() && searchResults.length === 0;
  const showDropdown = isOpen && (searchResults.length > 0 || showAddNewOption);

  return (
    <div ref={containerRef} className={cn("relative max-w-md", className)}>
      <input
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => {
          if (inputValue.trim()) {
            const results = searchClients(inputValue);
            setSearchResults(results);
            setIsOpen(true);
          }
        }}
        placeholder={placeholder}
        className={cn(
          "flex h-10 w-full rounded-md px-3 py-2 pr-10 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200",
          getFieldStateClasses(isDirty)
        )}
      />
      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-border-primary rounded-md shadow-lg max-h-60 overflow-auto">
          {searchResults.length > 0 ? (
            <>
              {searchResults.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => handleSelectClient(client)}
                  className="w-full px-4 py-2 text-left hover:bg-muted/50 focus:bg-muted/50 focus:outline-none flex flex-col"
                >
                  <span className="font-medium text-primary">{client.name}</span>
                  <span className="text-sm text-muted-foreground">{client.cnNumber}</span>
                </button>
              ))}
              <div className="border-t border-border-primary">
                <button
                  type="button"
                  onClick={handleAddNew}
                  className="w-full px-4 py-2 text-left hover:bg-muted/50 focus:bg-muted/50 focus:outline-none flex items-center gap-2 text-primary"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add "{inputValue}" as new client</span>
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={handleAddNew}
              className="w-full px-4 py-2 text-left hover:bg-muted/50 focus:bg-muted/50 focus:outline-none flex items-center gap-2 text-primary"
            >
              <Plus className="h-4 w-4" />
              <span>Add "{inputValue}" as new client</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientSearchInput;
