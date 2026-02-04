import React from "react";
import { Trash2 } from "lucide-react";
import { Reassignment } from "@/data/leaverClients";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ReassignmentsTableProps {
  reassignments: Reassignment[];
  onRemoveReassignment: (id: string) => void;
}

export const ReassignmentsTable: React.FC<ReassignmentsTableProps> = ({
  reassignments,
  onRemoveReassignment,
}) => {
  return (
    <div className="bg-white rounded-lg border border-[hsl(var(--wq-border))] overflow-hidden">
      <div className="px-6 py-4 border-b border-[hsl(var(--wq-border))]">
        <h3 className="text-primary font-bold text-base">Reassignments</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-[hsl(var(--wq-bg-header))]">
            <TableHead className="text-primary font-semibold text-sm">Client</TableHead>
            <TableHead className="text-primary font-semibold text-sm">Industry</TableHead>
            <TableHead className="text-primary font-semibold text-sm">Reassigned To</TableHead>
            <TableHead className="text-primary font-semibold text-sm">Role</TableHead>
            <TableHead className="text-primary font-semibold text-sm">Location</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reassignments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-[hsl(var(--wq-text-muted))]">
                No reassignments yet. Select a team member and clients to begin.
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
                  {reassignment.reassignedToName}
                </TableCell>
                <TableCell className="text-primary text-sm">{reassignment.role}</TableCell>
                <TableCell className="text-primary text-sm">{reassignment.location}</TableCell>
                <TableCell>
                  <button
                    onClick={() => onRemoveReassignment(reassignment.id)}
                    className="p-1.5 text-[hsl(var(--wq-text-muted))] hover:text-destructive transition-colors"
                    aria-label="Remove reassignment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
