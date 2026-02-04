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

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAndExit: () => void;
  onExitWithoutSaving: () => void;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  onClose,
  onSaveAndExit,
  onExitWithoutSaving,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-primary">
            Unsaved Changes
          </DialogTitle>
          <DialogDescription className="text-center text-[hsl(var(--wq-text-secondary))]">
            You have unsaved reassignments. What would you like to do?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-3 sm:flex-col">
          <Button 
            onClick={onSaveAndExit} 
            className="w-full bg-primary hover:bg-primary/90"
          >
            Save & Exit
          </Button>
          <Button
            variant="outline"
            onClick={onExitWithoutSaving}
            className="w-full"
          >
            Exit Without Saving
          </Button>
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full text-[hsl(var(--wq-text-secondary))]"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
