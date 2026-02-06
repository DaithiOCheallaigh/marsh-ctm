import React from "react";
import { Trash2 } from "lucide-react";
import { Reassignment, LeaverClient } from "@/data/leaverClients";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ClientWithCapacity extends LeaverClient {
  capacityRequirement?: number;
}

interface EnhancedReassignmentsTableProps {
  reassignments: Reassignment[];
  onRemoveReassignment?: (id: string) => void;
  isReadOnly?: boolean;
  clients?: ClientWithCapacity[];
}

export const EnhancedReassignmentsTable: React.FC<EnhancedReassignmentsTableProps> = ({
  reassignments,
  onRemoveReassignment,
  isReadOnly = false,
  clients = [],
}) => {
  // Get capacity for a client - prefer reassignment record, fallback to clients list
  const getClientCapacity = (reassignment: Reassignment) => {
    if (reassignment.capacityRequirement != null) return reassignment.capacityRequirement;
    const client = clients.find((c) => c.id === reassignment.clientId);
    return client?.capacityRequirement || 1.0;
  };

  // Calculate totals
  const totalCapacityReassigned = reassignments.reduce(
    (sum, r) => sum + getClientCapacity(r),
    0
  );

  return (
    <div className="bg-white rounded-lg border border-[hsl(var(--wq-border))] overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--wq-border))]">
        <h3 className="text-primary font-bold text-base">Reassignments</h3>
        {reassignments.length > 0 && (
          <span className="text-sm text-[hsl(var(--wq-text-secondary))]">
            Total: {reassignments.length} clients | {totalCapacityReassigned.toFixed(1)} capacity
          </span>
        )}
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-[hsl(var(--wq-bg-header))]">
            <TableHead className="text-primary font-semibold text-sm">Client</TableHead>
            <TableHead className="text-primary font-semibold text-sm">Industry</TableHead>
            <TableHead className="text-primary font-semibold text-sm">Capacity</TableHead>
            <TableHead className="text-primary font-semibold text-sm">Reassigned To</TableHead>
            <TableHead className="text-primary font-semibold text-sm">Role</TableHead>
            <TableHead className="text-primary font-semibold text-sm">Location</TableHead>
            {!isReadOnly && <TableHead className="w-12"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {reassignments.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={isReadOnly ? 6 : 7}
                className="text-center py-8 text-[hsl(var(--wq-text-muted))]"
              >
                {isReadOnly
                  ? "No reassignments were recorded for this work item."
                  : "No reassignments yet. Select a team member and clients to begin."}
              </TableCell>
            </TableRow>
          ) : (
            reassignments.map((reassignment) => (
              <TableRow key={reassignment.id}>
                <TableCell className="text-primary font-medium text-sm">
                  {reassignment.clientName}
                </TableCell>
                <TableCell className="text-primary text-sm">{reassignment.industry}</TableCell>
                <TableCell className="text-primary text-sm">
                  <span className="bg-[hsl(var(--wq-bg-muted))] px-2 py-0.5 rounded text-xs">
                    {getClientCapacity(reassignment.clientId).toFixed(1)} chair
                  </span>
                </TableCell>
                <TableCell className="text-primary text-sm font-medium">
                  {reassignment.reassignedToName}
                </TableCell>
                <TableCell className="text-primary text-sm">{reassignment.role}</TableCell>
                <TableCell className="text-primary text-sm">{reassignment.location}</TableCell>
                {!isReadOnly && onRemoveReassignment && (
                  <TableCell>
                    <button
                      onClick={() => onRemoveReassignment(reassignment.id)}
                      className="p-1.5 text-[hsl(var(--wq-text-muted))] hover:text-destructive transition-colors"
                      aria-label="Remove reassignment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
