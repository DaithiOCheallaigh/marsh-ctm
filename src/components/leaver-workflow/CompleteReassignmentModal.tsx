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
}

export const CompleteReassignmentModal: React.FC<CompleteReassignmentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-primary">
            Complete Reassignment(s)
          </DialogTitle>
          <DialogDescription className="text-center text-[hsl(var(--wq-text-secondary))]">
            You acknowledge the completion, this action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-center gap-4 sm:justify-center">
          <Button variant="outline" onClick={onClose} className="min-w-24">
            No
          </Button>
          <Button onClick={onConfirm} className="min-w-24 bg-primary hover:bg-primary/90">
            Yes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
