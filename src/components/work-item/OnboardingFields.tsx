import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, ChevronUp, ChevronDown, Trash2, Plus } from "lucide-react";

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
        <div className="relative max-w-md">
          <Input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Search or Add Client"
            className="pr-10 border-border-primary focus:border-accent focus:ring-accent"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Team Role & Configuration */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border border-border-primary rounded-lg">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50">
          <span className="font-semibold text-primary">Team Role & Configuration</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="px-4 pb-4 space-y-4">
          {/* Description Notes */}
          <div className="bg-[hsl(210,40%,98%)] rounded-lg p-4 space-y-2">
            <Label className="text-sm font-medium text-text-secondary">
              Description Notes (Optional)
            </Label>
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-primary">Task Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add text"
                className="min-h-[60px] border-border-primary resize-none"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {description.length}/500
              </p>
            </div>
          </div>

          {/* Team Configurations */}
          {teamConfigurations.map((config, configIndex) => (
            <div key={config.id} className="bg-[hsl(197,100%,97%)] rounded-lg p-4 space-y-4 border border-[hsl(197,50%,90%)]">
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
                  <Select
                    value={config.teamType}
                    onValueChange={(value) => updateTeamConfiguration(config.id, "teamType", value)}
                  >
                    <SelectTrigger className="border-border-primary">
                      <SelectValue placeholder="Select Team Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50">
                      {teamTypes.map((team) => (
                        <SelectItem key={team} value={team}>
                          {team}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-text-secondary">
                    Number of Roles<span className="text-[hsl(0,100%,50%)]">*</span>
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={config.numberOfRoles}
                    onChange={(e) =>
                      updateTeamConfiguration(config.id, "numberOfRoles", parseInt(e.target.value) || 1)
                    }
                    className="border-border-primary"
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
                    <Input
                      value={role}
                      onChange={(e) => updateRole(config.id, roleIndex, e.target.value)}
                      placeholder={`Chair ${roleIndex + 1}`}
                      className="flex-1 border-border-primary"
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
