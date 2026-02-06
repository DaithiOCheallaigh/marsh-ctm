import React, { useMemo } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { LeaverClient } from "@/data/leaverClients";
import { LeaverClientCard } from "./LeaverClientCard";
import { EnhancedTeamMemberSearch, LeaverTeamMember } from "./EnhancedTeamMemberSearch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
interface ClientWithCapacity extends LeaverClient {
  capacityRequirement?: number;
}
interface EnhancedAssignmentPanelProps {
  leaverName: string;
  leaverTeam: string;
  totalCapacity: number;
  clients: ClientWithCapacity[];
  assignedClientIds: string[];
  selectedMember: LeaverTeamMember | null;
  onSelectMember: (member: LeaverTeamMember | null) => void;
  selectedClientIds: string[];
  onToggleClient: (clientId: string) => void;
  pendingClients: ClientWithCapacity[];
  onMoveToPending: () => void;
  onRemoveFromPending: () => void;
  onConfirmAssign: () => void;
  pendingSelectedClientIds: string[];
  onTogglePendingClient: (clientId: string) => void;
  teamId?: string;
  excludeMemberIds?: string[];
}
export const EnhancedAssignmentPanel: React.FC<EnhancedAssignmentPanelProps> = ({
  leaverName,
  leaverTeam,
  totalCapacity,
  clients,
  assignedClientIds,
  selectedMember,
  onSelectMember,
  selectedClientIds,
  onToggleClient,
  pendingClients,
  onMoveToPending,
  onRemoveFromPending,
  onConfirmAssign,
  pendingSelectedClientIds,
  onTogglePendingClient,
  teamId,
  excludeMemberIds = []
}) => {
  // Available clients = not assigned AND not in pending staging
  const pendingClientIds = useMemo(() => pendingClients.map(c => c.id), [pendingClients]);
  const availableClients = useMemo(() => clients.filter(client => !assignedClientIds.includes(client.id) && !pendingClientIds.includes(client.id)), [clients, assignedClientIds, pendingClientIds]);
  const assignedCount = assignedClientIds.length;
  const remainingCount = clients.length - assignedCount - pendingClients.length;

  // Calculate selected clients capacity for projection
  const selectedClientsCapacity = useMemo(() => {
    return clients.filter(c => selectedClientIds.includes(c.id)).reduce((sum, c) => sum + (c.capacityRequirement || 1) * 20, 0);
  }, [clients, selectedClientIds]);
  const canMoveToPending = selectedMember && selectedClientIds.length > 0;
  const canRemoveFromPending = pendingSelectedClientIds.length > 0;
  const canAssign = selectedMember && pendingClients.length > 0;
  return <div className="space-y-4">
      {/* Two-Panel Layout */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-6">
        {/* LEFT PANEL: Available Workload */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-primary font-bold text-sm">From: {leaverName}</h4>
              <p className="text-[hsl(var(--wq-text-secondary))] text-xs">
                {leaverTeam} | Total: {totalCapacity.toFixed(1)} chairs
              </p>
            </div>
          </div>

          {/* Remaining warning */}
          {remainingCount > 0 && assignedCount > 0}

          {/* Client List */}
          <div className="space-y-2 max-h-[400px] overflow-auto">
            {availableClients.map(client => <LeaverClientCard key={client.id} client={client} showCheckbox={!!selectedMember} isChecked={selectedClientIds.includes(client.id)} onCheckChange={() => onToggleClient(client.id)} capacityRequirement={client.capacityRequirement} />)}
            {availableClients.length === 0 && pendingClients.length === 0 && <div className="flex items-center justify-center py-8 text-[hsl(var(--wq-status-completed-text))]">
                <span className="text-sm font-medium">
                  ✓ All clients have been reassigned
                </span>
              </div>}
            {availableClients.length === 0 && pendingClients.length > 0 && <div className="flex items-center justify-center py-8 text-[hsl(var(--wq-text-muted))]">
                <span className="text-sm">
                  All remaining clients are in the pending list
                </span>
              </div>}
          </div>
        </div>

        {/* CENTER: Arrow Buttons */}
        <div className="flex flex-col items-center justify-center gap-2 py-8">
          <button onClick={onMoveToPending} disabled={!canMoveToPending} className={cn("w-10 h-10 rounded-lg flex items-center justify-center transition-all", canMoveToPending ? "bg-primary text-white hover:bg-primary/90 shadow-md" : "bg-[hsl(var(--wq-bg-muted))] text-[hsl(var(--wq-text-muted))] cursor-not-allowed")} aria-label="Move selected clients to pending">
            <ArrowRight className="w-5 h-5" />
          </button>
          <button onClick={onRemoveFromPending} disabled={!canRemoveFromPending} className={cn("w-10 h-10 rounded-lg flex items-center justify-center transition-all", canRemoveFromPending ? "bg-[hsl(var(--wq-bg-muted))] text-primary hover:bg-[hsl(var(--wq-border))]" : "bg-[hsl(var(--wq-bg-muted))] text-[hsl(var(--wq-text-muted))] cursor-not-allowed")} aria-label="Remove selected clients from pending">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* RIGHT PANEL: Assign To */}
        <div className="space-y-4">
          <div>
            <h4 className="text-primary font-bold text-sm mb-3">Assign To:</h4>
            <EnhancedTeamMemberSearch selectedMember={selectedMember} onSelectMember={onSelectMember} selectedClientsCapacity={selectedClientsCapacity} teamId={teamId} excludeMemberIds={excludeMemberIds} />
          </div>

          {/* Pending clients for this member */}
          {selectedMember && pendingClients.length > 0 && <div className="space-y-2 max-h-[300px] overflow-auto">
              <p className="text-xs text-[hsl(var(--wq-text-muted))]">
                Pending reassignment ({pendingClients.length}):
              </p>
              {pendingClients.map(client => <div key={client.id} onClick={() => onTogglePendingClient(client.id)} className={cn("flex items-center gap-3 p-3 border rounded-lg transition-colors cursor-pointer", pendingSelectedClientIds.includes(client.id) ? "bg-accent/5 border-accent" : "border-[hsl(var(--wq-border))] hover:bg-[hsl(var(--wq-bg-hover))]")}>
                  <Checkbox checked={pendingSelectedClientIds.includes(client.id)} onCheckedChange={() => onTogglePendingClient(client.id)} className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                  <div className="flex-1">
                    <p className="text-primary font-semibold text-sm">
                      {client.name}
                    </p>
                    <p className="text-[hsl(var(--wq-text-secondary))] text-xs">
                      {client.role}
                      {client.chairName && <> · {client.chairName}</>}
                    </p>
                    {client.workload !== undefined && <p className="text-[hsl(var(--wq-text-muted))] text-xs">
                        Workload: {client.workload}%
                      </p>}
                  </div>
                </div>)}
            </div>}
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end pt-4 border-t border-[hsl(var(--wq-border))]">
        <Button onClick={onConfirmAssign} disabled={!canAssign} className="bg-primary hover:bg-primary/90">
          Assign{pendingClients.length > 0 ? ` (${pendingClients.length})` : ""}
        </Button>
      </div>
    </div>;
};