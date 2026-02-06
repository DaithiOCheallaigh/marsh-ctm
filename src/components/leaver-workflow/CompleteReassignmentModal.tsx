import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CompleteReassignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  totalClients?: number;
  teamMembersAffected?: number;
  leaverName?: string;
}

export const CompleteReassignmentModal: React.FC<CompleteReassignmentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  totalClients,
  teamMembersAffected,
  leaverName,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-primary">
            Complete Reassignment
          </DialogTitle>
          <DialogDescription className="text-center text-[hsl(var(--wq-text-secondary))] space-y-3">
            <p>
              You are about to finalize all reassignments{leaverName ? ` for ${leaverName}` : ""}.
              This action cannot be undone. All team members will be notified of their new assignments.
            </p>
            {(totalClients !== undefined || teamMembersAffected !== undefined) && (
              <div className="flex justify-center gap-6 pt-2">
                {totalClients !== undefined && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{totalClients}</p>
                    <p className="text-xs text-[hsl(var(--wq-text-muted))]">Clients Reassigned</p>
                  </div>
                )}
                {teamMembersAffected !== undefined && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{teamMembersAffected}</p>
                    <p className="text-xs text-[hsl(var(--wq-text-muted))]">Team Members Affected</p>
                  </div>
                )}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-center gap-4 sm:justify-center">
          <Button variant="outline" onClick={onClose} className="min-w-24">
            Cancel
          </Button>
          <Button onClick={onConfirm} className="min-w-24 bg-primary hover:bg-primary/90">
            Confirm & Complete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
