import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronUp, ChevronDown, Trash2, Plus } from "lucide-react";
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

interface TeamRole {
  id: string;
  teamType: string;
  numberOfRoles: number;
  roles: string[];
}

interface OnboardingFieldsProps {
  clientName: string;
  setClientName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  teamConfigurations: TeamRole[];
  setTeamConfigurations: (configs: TeamRole[]) => void;
}

const teamTypes = [
  "Accounts",
  "Claims",
  "Cyber Security",
  "Management",
  "Risk",
  "Operations",
  "Finance",
];

const OnboardingFields = ({
  clientName,
  setClientName,
  description,
  setDescription,
  teamConfigurations,
  setTeamConfigurations,
}: OnboardingFieldsProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const dirtyContext = useFormDirtyContext();
  
  const isFieldDirty = (fieldName: string) => {
    return dirtyContext ? dirtyContext.isDirty(fieldName) : false;
  };

  const addTeamConfiguration = () => {
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
      <h3 className="text-lg font-semibold text-primary">Onboarding Details</h3>

      {/* Client Name Search */}
      <div className="grid grid-cols-[180px_1fr] items-center gap-4">
        <Label className="text-right text-sm font-medium text-text-secondary">
          Client Name or CN Number<span className="text-[hsl(0,100%,50%)]">*</span>
        </Label>
        <ClientSearchInput
          value={clientName}
          onChange={setClientName}
          placeholder="Search by client name or CN number"
          fieldName="onboardingClientName"
        />
      </div>

      {/* Team Role & Configuration */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border border-border-primary rounded-lg">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50">
          <span className="font-semibold text-primary">Team Role & Configuration</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="px-4 pb-4 space-y-4">
          {/* Description Notes */}
          <div className="bg-[#009DE0]/10 rounded-lg p-4 space-y-2 border border-[#009DE0]/30">
            <Label className="text-sm font-medium text-text-secondary">
              Description Notes (Optional)
            </Label>
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-primary">Task Description</Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add text"
                className={cn(
                  "flex min-h-[60px] w-full rounded-md px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all duration-200",
                  getFieldStateClasses(isFieldDirty("onboardingDescription"))
                )}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {description.length}/500
              </p>
            </div>
          </div>

          {/* Team Configurations */}
          {teamConfigurations.map((config, configIndex) => (
            <div key={config.id} className="bg-[#009DE0]/10 rounded-lg p-4 space-y-4 border border-[#009DE0]/30">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-primary">Team Configuration</span>
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
                      {teamTypes.map((team) => (
                        <FormSelectItem key={team} value={team}>
                          {team}
                        </FormSelectItem>
                      ))}
                    </FormSelectContent>
                  </FormSelect>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-text-secondary">
                    Number of Roles<span className="text-[hsl(0,100%,50%)]">*</span>
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

              {/* Dynamic Roles */}
              <div className="space-y-3">
                {config.roles.map((role, roleIndex) => (
                  <div key={roleIndex} className="flex items-center gap-3">
                    <Label className="w-16 text-sm font-medium text-text-secondary">
                      Role {roleIndex + 1}<span className="text-[hsl(0,100%,50%)]">*</span>
                    </Label>
                    <input
                      value={role}
                      onChange={(e) => updateRole(config.id, roleIndex, e.target.value)}
                      placeholder={`Chair ${roleIndex + 1}`}
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

          {/* Add Row Button */}
          <Button
            type="button"
            variant="ghost"
            onClick={addTeamConfiguration}
            className="w-full text-primary font-semibold hover:bg-primary/5"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Row
          </Button>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default OnboardingFields;
