import { useState, useRef, DragEvent } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronUp, ChevronDown, Trash2, Plus, Paperclip, X, FileText, Image, File } from "lucide-react";
import ClientSearchInput from "@/components/ClientSearchInput";
import { useFormDirtyContext, getFieldStateClasses } from "@/components/form/FormDirtyContext";
import { 
  FormSelect, 
  FormSelectContent, 
  FormSelectItem, 
  FormSelectTrigger, 
  FormSelectValue 
} from "@/components/form/FormSelect";
import { cn } from "@/lib/utils";
import { Client } from "@/data/clients";

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

interface TeamRole {
  id: string;
  teamType: string;
  numberOfRoles: number;
  roles: string[];
}

export interface OnboardingAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

interface OnboardingFieldsProps {
  clientName: string;
  setClientName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  teamConfigurations: TeamRole[];
  setTeamConfigurations: (configs: TeamRole[]) => void;
  selectedClient?: Client | null;
  setSelectedClient?: (client: Client | null) => void;
  showTeamConfig?: boolean;
  showClientSearch?: boolean;
  attachments?: OnboardingAttachment[];
  setAttachments?: (attachments: OnboardingAttachment[]) => void;
}

// B2B Insurance Industry Teams
const teamTypes = [
  "Property Risk",
  "General Liability",
  "Professional Liability",
  "D&O (Directors & Officers)",
  "E&O (Errors & Omissions)",
  "Cyber Risk",
  "Marine & Cargo",
  "Aviation",
  "Energy",
  "Construction",
  "Healthcare",
  "Financial Institutions",
  "Environmental",
  "Workers Compensation",
  "Surety Bonds",
  "Fleet & Auto",
];

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return Image;
  if (type.includes('pdf') || type.includes('document')) return FileText;
  return File;
};

interface DescriptionNotesWithAttachmentsProps {
  description: string;
  setDescription: (value: string) => void;
  isFieldDirty: (fieldName: string) => boolean;
  attachments: OnboardingAttachment[];
  setAttachments: (attachments: OnboardingAttachment[]) => void;
}

const DescriptionNotesWithAttachments = ({
  description,
  setDescription,
  isFieldDirty,
  attachments,
  setAttachments,
}: DescriptionNotesWithAttachmentsProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const addFiles = (files: File[]) => {
    const newAttachments: OnboardingAttachment[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      file,
    }));
    setAttachments([...attachments, ...newAttachments]);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter((att) => att.id !== id));
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-[#009DE0]/10 rounded-lg p-4 space-y-3 border border-[#009DE0]/30">
      <Label className="text-sm font-medium text-text-secondary">
        Description Notes (Optional)
      </Label>
      <div className="space-y-1">
        <Label className="text-sm font-semibold text-primary">Task Description</Label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter details about this onboarding request..."
          className={cn(
            "flex min-h-[80px] w-full rounded-md px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all duration-200",
            getFieldStateClasses(isFieldDirty("onboardingDescription"))
          )}
          maxLength={1000}
        />
        <p className="text-xs text-muted-foreground text-right">
          {description.length}/1000
        </p>
      </div>

      {/* Attachment Area */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-text-secondary" />
          <Label className="text-sm font-semibold text-primary">Attachments</Label>
        </div>
        
        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleAttachClick}
          className={cn(
            "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-200",
            isDragging
              ? "border-[#009DE0] bg-[#009DE0]/20"
              : "border-muted-foreground/30 hover:border-[#009DE0]/50 hover:bg-[#009DE0]/5"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileInputChange}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-1">
            <Paperclip className={cn(
              "h-6 w-6 transition-colors",
              isDragging ? "text-[#009DE0]" : "text-muted-foreground"
            )} />
            <p className="text-sm text-muted-foreground">
              {isDragging ? "Drop files here" : "Drag & drop files or click to browse"}
            </p>
            <p className="text-xs text-muted-foreground">
              Supports PDF, Word, Excel, and image files
            </p>
          </div>
        </div>

        {/* Attached Files List */}
        {attachments.length > 0 && (
          <div className="space-y-2">
            {attachments.map((attachment) => {
              const FileIcon = getFileIcon(attachment.type);
              return (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between bg-background rounded-md px-3 py-2 border border-border-primary"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileIcon className="h-4 w-4 text-[#009DE0] flex-shrink-0" />
                    <span className="text-sm text-primary truncate">{attachment.name}</span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      ({formatFileSize(attachment.size)})
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(attachment.id)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const OnboardingFields = ({
  clientName,
  setClientName,
  description,
  setDescription,
  teamConfigurations,
  setTeamConfigurations,
  selectedClient,
  setSelectedClient,
  showTeamConfig = true,
  showClientSearch = true,
  attachments = [],
  setAttachments,
}: OnboardingFieldsProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const dirtyContext = useFormDirtyContext();
  
  const isFieldDirty = (fieldName: string) => {
    return dirtyContext ? dirtyContext.isDirty(fieldName) : false;
  };

  const handleClientSelect = (client: Client | null, name: string) => {
    setClientName(name);
    if (setSelectedClient) {
      setSelectedClient(client);
    }
  };

  const addTeamConfiguration = () => {
    // Check if team is already added
    const existingTeams = teamConfigurations.map(tc => tc.teamType);
    const newConfig: TeamRole = {
      id: Date.now().toString(),
      teamType: "",
      numberOfRoles: 2,
      roles: ["Chair 1", "Chair 2"],
    };
    setTeamConfigurations([...teamConfigurations, newConfig]);
  };

  const removeTeamConfiguration = (id: string) => {
    setTeamConfigurations(teamConfigurations.filter((config) => config.id !== id));
  };

  const updateTeamConfiguration = (id: string, field: keyof TeamRole, value: any) => {
    // Check for duplicate team
    if (field === "teamType") {
      const isDuplicate = teamConfigurations.some(
        (config) => config.id !== id && config.teamType === value
      );
      if (isDuplicate) {
        return; // Don't allow duplicate teams
      }
    }

    setTeamConfigurations(
      teamConfigurations.map((config) => {
        if (config.id === id) {
          if (field === "numberOfRoles") {
            const numRoles = Math.max(1, Math.min(20, value));
            const roles = Array.from({ length: numRoles }, (_, i) => 
              config.roles[i] || `Chair ${i + 1}`
            );
            return { ...config, numberOfRoles: numRoles, roles };
          }
          return { ...config, [field]: value };
        }
        return config;
      })
    );
  };

  const updateRole = (configId: string, roleIndex: number, value: string) => {
    setTeamConfigurations(
      teamConfigurations.map((config) => {
        if (config.id === configId) {
          const roles = [...config.roles];
          roles[roleIndex] = value;
          return { ...config, roles };
        }
        return config;
      })
    );
  };

  const removeRole = (configId: string, roleIndex: number) => {
    setTeamConfigurations(
      teamConfigurations.map((config) => {
        if (config.id === configId && config.roles.length > 1) {
          const roles = config.roles.filter((_, i) => i !== roleIndex);
          return { ...config, roles, numberOfRoles: roles.length };
        }
        return config;
      })
    );
  };

  return (
    <div className="bg-white rounded-lg border border-border-primary p-6 space-y-6">
      <h3 className="text-lg font-semibold text-primary">
        {showClientSearch ? "Client Selection" : "Team Configuration"}
      </h3>

      {/* Client Name Search */}
      {showClientSearch && (
        <>
          <div className="grid grid-cols-[180px_1fr] items-start gap-4">
            <Label className="text-right text-sm font-medium text-text-secondary pt-2">
              Client Name or CN Number<span className="text-[hsl(0,100%,50%)]">*</span>
            </Label>
            <div className="space-y-2">
              <ClientSearchInput
                value={clientName}
                onChange={(name, client) => handleClientSelect(client || null, name)}
                placeholder="Search by client name or CN number"
                fieldName="onboardingClientName"
              />
              {selectedClient && (
                <div className="p-3 bg-[hsl(var(--wq-bg-header))] rounded-lg border border-[hsl(var(--wq-border))]">
                  <p className="text-sm font-medium text-primary">{selectedClient.name}</p>
                  <p className="text-xs text-[hsl(var(--wq-text-secondary))]">
                    CN: {selectedClient.cnNumber} | {selectedClient.industry} | {selectedClient.location}
                  </p>
                  <p className="text-xs text-[hsl(var(--wq-text-secondary))]">
                    Account Owner: {selectedClient.accountOwner}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Description Notes with Attachments */}
          <div className="grid grid-cols-[180px_1fr] items-start gap-4">
            <Label className="text-right text-sm font-medium text-text-secondary pt-2">
              Description
            </Label>
            <DescriptionNotesWithAttachments
              description={description}
              setDescription={setDescription}
              isFieldDirty={isFieldDirty}
              attachments={attachments}
              setAttachments={setAttachments || (() => {})}
            />
          </div>
        </>
      )}

      {/* Team Role & Configuration */}
      {showTeamConfig && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border border-border-primary rounded-lg">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50">
            <span className="font-semibold text-primary">Team Role & Chair Configuration</span>
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4 space-y-4">
            {/* Team Configurations */}
            {teamConfigurations.map((config, configIndex) => (
              <div key={config.id} className="bg-[#009DE0]/10 rounded-lg p-4 space-y-4 border border-[#009DE0]/30">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-primary">Team {configIndex + 1}</span>
                  {teamConfigurations.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTeamConfiguration(config.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-text-secondary">
                      Team Type<span className="text-[hsl(0,100%,50%)]">*</span>
                    </Label>
                    <FormSelect
                      value={config.teamType}
                      onValueChange={(value) => updateTeamConfiguration(config.id, "teamType", value)}
                    >
                      <FormSelectTrigger fieldName="teamConfigurations">
                        <FormSelectValue placeholder="Select Team Type" />
                      </FormSelectTrigger>
                      <FormSelectContent>
                        {teamTypes.map((team) => {
                          const isUsed = teamConfigurations.some(
                            tc => tc.id !== config.id && tc.teamType === team
                          );
                          return (
                            <FormSelectItem 
                              key={team} 
                              value={team}
                              disabled={isUsed}
                            >
                              {team} {isUsed && "(Already added)"}
                            </FormSelectItem>
                          );
                        })}
                      </FormSelectContent>
                    </FormSelect>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-text-secondary">
                      Number of Chairs<span className="text-[hsl(0,100%,50%)]">*</span>
                    </Label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={config.numberOfRoles}
                      onChange={(e) =>
                        updateTeamConfiguration(config.id, "numberOfRoles", parseInt(e.target.value) || 1)
                      }
                      className={cn(
                        "flex h-10 w-full rounded-md px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
                        getFieldStateClasses(isFieldDirty("teamConfigurations"))
                      )}
                    />
                  </div>
                </div>

                {/* Dynamic Roles/Chairs */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-text-secondary">Role Titles</Label>
                  {config.roles.map((role, roleIndex) => (
                    <div key={roleIndex} className="flex items-center gap-3">
                      <input
                        value={role}
                        onChange={(e) => updateRole(config.id, roleIndex, e.target.value)}
                        placeholder={`Chair ${roleIndex + 1} Title`}
                        className={cn(
                          "flex h-10 flex-1 rounded-md px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
                          getFieldStateClasses(isFieldDirty("teamConfigurations"))
                        )}
                      />
                      {config.roles.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRole(config.id, roleIndex)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Add Another Team Button */}
            <Button
              type="button"
              variant="ghost"
              onClick={addTeamConfiguration}
              className="w-full text-primary font-semibold hover:bg-primary/5"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Team
            </Button>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};

export default OnboardingFields;
