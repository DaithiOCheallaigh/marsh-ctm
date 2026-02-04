import React from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { LeaverClient, ReassignableTeamMember } from "@/data/leaverClients";
import { LeaverClientCard } from "./LeaverClientCard";
import { TeamMemberSearch } from "./TeamMemberSearch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AssignmentPanelProps {
  leaverName: string;
  leaverTeam: string;
  clients: LeaverClient[];
  assignedClientIds: string[];
  selectedMember: ReassignableTeamMember | null;
  onSelectMember: (member: ReassignableTeamMember | null) => void;
  selectedClientIds: string[];
  onToggleClient: (clientId: string) => void;
  pendingClients: LeaverClient[];
  onAssign: () => void;
  onUnassign: () => void;
  pendingSelectedClientIds: string[];
  onTogglePendingClient: (clientId: string) => void;
}

export const AssignmentPanel: React.FC<AssignmentPanelProps> = ({
  leaverName,
  leaverTeam,
  clients,
  assignedClientIds,
  selectedMember,
  onSelectMember,
  selectedClientIds,
  onToggleClient,
  pendingClients,
  onAssign,
  onUnassign,
  pendingSelectedClientIds,
  onTogglePendingClient,
}) => {
  const availableClients = clients.filter(
    (client) => !assignedClientIds.includes(client.id)
  );

  const canAssign = selectedMember && selectedClientIds.length > 0;
  const canUnassign = pendingSelectedClientIds.length > 0;

  return (
    <div className="bg-white rounded-lg border border-[hsl(var(--wq-border))] p-6">
      <div className="grid grid-cols-[1fr_auto_1fr] gap-6">
        {/* From Section - Left */}
        <div className="space-y-4">
          <div>
            <h4 className="text-primary font-bold text-sm mb-1">From:</h4>
            <p className="text-primary font-semibold text-base">{leaverName}</p>
            <p className="text-[hsl(var(--wq-text-secondary))] text-xs">{leaverTeam}</p>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {availableClients.map((client) => (
              <LeaverClientCard
                key={client.id}
                client={client}
                showCheckbox={!!selectedMember}
                isChecked={selectedClientIds.includes(client.id)}
                onCheckChange={() => onToggleClient(client.id)}
              />
            ))}
            {availableClients.length === 0 && (
              <p className="text-[hsl(var(--wq-text-muted))] text-sm text-center py-4">
                All clients have been reassigned.
              </p>
            )}
          </div>
        </div>

        {/* Arrow Buttons - Center */}
        <div className="flex flex-col items-center justify-center gap-2">
          <button
            onClick={onAssign}
            disabled={!canAssign}
            className={cn(
              "w-8 h-8 rounded-md flex items-center justify-center transition-colors",
              canAssign
                ? "bg-primary text-white hover:bg-primary/90"
                : "bg-[hsl(var(--wq-bg-muted))] text-[hsl(var(--wq-text-muted))] cursor-not-allowed"
            )}
            aria-label="Assign selected clients"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onUnassign}
            disabled={!canUnassign}
            className={cn(
              "w-8 h-8 rounded-md flex items-center justify-center transition-colors",
              canUnassign
                ? "bg-[hsl(var(--wq-bg-muted))] text-primary hover:bg-[hsl(var(--wq-border))]"
                : "bg-[hsl(var(--wq-bg-muted))] text-[hsl(var(--wq-text-muted))] cursor-not-allowed"
            )}
            aria-label="Unassign selected clients"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* To Section - Right */}
        <div className="space-y-4">
          <div>
            <h4 className="text-primary font-bold text-sm mb-3">To:</h4>
            <TeamMemberSearch
              selectedMember={selectedMember}
              onSelectMember={onSelectMember}
            />
          </div>

          {/* Pending clients for this member */}
          {selectedMember && pendingClients.length > 0 && (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {pendingClients.map((client) => (
                <div
                  key={client.id}
                  className={cn(
                    "flex items-center gap-3 p-3 border border-[hsl(var(--wq-border))] rounded-lg transition-colors hover:bg-[hsl(var(--wq-bg-hover))] cursor-pointer",
                    pendingSelectedClientIds.includes(client.id) && "bg-accent/5 border-accent"
                  )}
                  onClick={() => onTogglePendingClient(client.id)}
                >
                  <Checkbox
                    checked={pendingSelectedClientIds.includes(client.id)}
                    onCheckedChange={() => onTogglePendingClient(client.id)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <div className="flex-1">
                    <p className="text-primary font-semibold text-sm">{client.name}</p>
                    <p className="text-[hsl(var(--wq-text-secondary))] text-xs">
                      {client.industry} | {client.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Assign Button */}
      <div className="flex justify-end mt-6">
        <Button
          variant="outline"
          onClick={onAssign}
          disabled={!canAssign}
          className="text-primary"
        >
          Assign
        </Button>
      </div>
    </div>
  );
};
