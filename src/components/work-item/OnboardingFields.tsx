import { useState, useRef, DragEvent } from "react";
import { Link } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Paperclip, X, FileText, Image, File, AlertCircle } from "lucide-react";
import ClientSearchInput from "@/components/ClientSearchInput";
import { useFormDirtyContext, getFieldStateClasses } from "@/components/form/FormDirtyContext";
import { cn } from "@/lib/utils";
import { Client } from "@/data/clients";
import TeamAssignmentConfiguration from "./TeamAssignmentConfiguration";
import { WorkItemTeamConfig, DEFAULT_ATTACHMENT_LIMITS } from "@/types/teamAssignment";

export interface OnboardingAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

interface WorkItemBasic {
  id: string;
  workType: string;
  clientName: string;
  cnNumber?: string;
  status: string;
  dueDate?: string;
  assignee?: string;
}

interface OnboardingFieldsProps {
  clientName: string;
  setClientName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  selectedClient?: Client | null;
  setSelectedClient?: (client: Client | null) => void;
  showTeamConfig?: boolean;
  showClientSearch?: boolean;
  attachments?: OnboardingAttachment[];
  setAttachments?: (attachments: OnboardingAttachment[]) => void;
  existingWorkItems?: WorkItemBasic[];
  currentWorkType?: string;
  // New team assignment props
  assignedToManagerId?: string;
  primaryTeam?: WorkItemTeamConfig | null;
  additionalTeams?: WorkItemTeamConfig[];
  onPrimaryTeamChange?: (team: WorkItemTeamConfig | null) => void;
  onAdditionalTeamsChange?: (teams: WorkItemTeamConfig[]) => void;
}

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

// Attachment limits info component
const AttachmentLimitsInfo = () => {
  const limits = DEFAULT_ATTACHMENT_LIMITS;
  
  return (
    <div className="text-xs text-muted-foreground bg-muted/30 rounded-md px-3 py-2 mt-2">
      <div className="flex items-center gap-1 mb-1">
        <AlertCircle className="h-3 w-3" />
        <span className="font-medium">Attachment Limits (TBC)</span>
      </div>
      <ul className="list-disc list-inside space-y-0.5 ml-1">
        <li>File types: {limits.allowedTypes.join(', ').toUpperCase()}</li>
        <li>Max file size: {formatFileSize(limits.maxFileSize)}</li>
        <li>Max files: {limits.maxFiles}</li>
      </ul>
    </div>
  );
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
  const limits = DEFAULT_ATTACHMENT_LIMITS;

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

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file size
    if (file.size > limits.maxFileSize) {
      return { valid: false, error: `File too large: ${file.name}` };
    }
    
    // Check file count
    if (attachments.length >= limits.maxFiles) {
      return { valid: false, error: `Maximum ${limits.maxFiles} files allowed` };
    }
    
    return { valid: true };
  };

  const addFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const validation = validateFile(file);
      if (!validation.valid) {
        console.warn(validation.error);
      }
      return validation.valid;
    });

    const newAttachments: OnboardingAttachment[] = validFiles.map((file) => ({
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
    <div className="space-y-4">
      {/* Description field */}
      <div className="space-y-1">
        <Label className="text-sm font-semibold text-primary">Task Description</Label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter details about this onboarding request..."
          className={cn(
            "flex min-h-[100px] w-full rounded-md px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all duration-200 border",
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
          </div>
        </div>

        {/* Attachment Limits Info */}
        <AttachmentLimitsInfo />

        {/* Attached Files List */}
        {attachments.length > 0 && (
          <div className="space-y-2 mt-3">
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
  selectedClient,
  setSelectedClient,
  showTeamConfig = true,
  showClientSearch = true,
  attachments = [],
  setAttachments,
  existingWorkItems = [],
  currentWorkType = "Onboarding",
  assignedToManagerId = "",
  primaryTeam = null,
  additionalTeams = [],
  onPrimaryTeamChange,
  onAdditionalTeamsChange,
}: OnboardingFieldsProps) => {
  const dirtyContext = useFormDirtyContext();
  
  const isFieldDirty = (fieldName: string) => {
    return dirtyContext ? dirtyContext.isDirty(fieldName) : false;
  };

  // Check if client already has a pending work item (same manager only in V1)
  const getDuplicateWorkItem = (client: Client | null, name: string) => {
    const normalizeName = (raw: string) => raw.replace(/\s*\([^)]*\)\s*$/, "").trim().toLowerCase();

    const inputName = normalizeName(client?.name || name || "");
    if (!client && !inputName) return null;

    return existingWorkItems.find((item) => {
      if (item.status !== "Pending") return false;
      if (item.workType.toLowerCase() !== currentWorkType.toLowerCase()) return false;

      const itemName = normalizeName(item.clientName);

      const matchesByCn = Boolean(
        client?.cnNumber && item.cnNumber && item.cnNumber.toLowerCase() === client.cnNumber.toLowerCase()
      );

      // Prefer name match as well (CN numbers can differ between sources)
      const matchesByName = Boolean(inputName && itemName === inputName);

      return matchesByCn || matchesByName;
    });
  };

  const duplicateWorkItem = getDuplicateWorkItem(selectedClient || null, clientName);

  const handleClientSelect = (client: Client | null, name: string) => {
    setClientName(name);
    if (setSelectedClient) {
      setSelectedClient(client);
    }
  };

  return (
    <div className="space-y-6">

      {/* Client Name Search */}
      {showClientSearch && (
        <>
          <div className="grid grid-cols-[180px_1fr] items-start gap-4">
            <Label className="text-right text-sm font-medium text-text-secondary pt-2 flex flex-col">
              <span>Client Name or</span>
              <span>CN Number<span className="text-[hsl(0,100%,50%)]">*</span></span>
            </Label>
            <div className="space-y-2">
              <ClientSearchInput
                value={clientName}
                onChange={(name, client) => handleClientSelect(client || null, name)}
                placeholder="Search by client name or CN number"
                fieldName="onboardingClientName"
              />
              {selectedClient && (
                <div className={cn(
                  "p-3 rounded-lg border",
                  duplicateWorkItem 
                    ? "bg-destructive/10 border-destructive/30" 
                    : "bg-[hsl(var(--wq-bg-header))] border-[hsl(var(--wq-border))]"
                )}>
                  <p className={cn(
                    "text-sm font-medium",
                    duplicateWorkItem ? "text-destructive" : "text-primary"
                  )}>
                    {selectedClient.name}
                  </p>
                  <p className={cn(
                    "text-xs",
                    duplicateWorkItem ? "text-destructive/80" : "text-[hsl(var(--wq-text-secondary))]"
                  )}>
                    {selectedClient.cnNumber} | {selectedClient.industry} | {selectedClient.location}
                  </p>
                  {duplicateWorkItem && (
                    <div className="mt-2 pt-2 border-t border-destructive/20 space-y-1">
                      <p className="text-xs font-medium text-destructive">
                        A pending {currentWorkType} work item already exists for this client.
                      </p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-destructive/80">
                        <span>Work item ID</span>
                        <span className="font-medium text-destructive">{duplicateWorkItem.id}</span>
                        <span>Due date</span>
                        <span className="font-medium text-destructive">
                          {duplicateWorkItem.dueDate || "—"}
                        </span>
                        <span>Assignee</span>
                        <span className="font-medium text-destructive">
                          {duplicateWorkItem.assignee || "—"}
                        </span>
                      </div>
                      <p className="text-xs text-destructive/70">
                        Please complete or cancel the existing work item before creating a new one.{" "}
                        <Link 
                          to={`/work-item/${duplicateWorkItem.id}`}
                          className="underline font-medium hover:text-destructive"
                        >
                          View existing work item
                        </Link>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Description Notes with Attachments - Full Width */}
          <div className="border-t border-[hsl(var(--wq-border))] pt-6">
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

      {/* Team Assignment Configuration */}
      {showTeamConfig && onPrimaryTeamChange && onAdditionalTeamsChange && (
        <TeamAssignmentConfiguration
          assignedToManagerId={assignedToManagerId}
          primaryTeam={primaryTeam}
          additionalTeams={additionalTeams}
          onPrimaryTeamChange={onPrimaryTeamChange}
          onAdditionalTeamsChange={onAdditionalTeamsChange}
          isDirty={isFieldDirty("teamAssignment")}
        />
      )}
    </div>
  );
};

export default OnboardingFields;
