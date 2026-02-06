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
  pendingCount?: number;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  onClose,
  onSaveAndExit,
  onExitWithoutSaving,
  pendingCount,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-primary">
            Unsaved Changes
          </DialogTitle>
          <DialogDescription className="text-center text-[hsl(var(--wq-text-secondary))]">
            <p>
              You are exiting the page and all unsaved data will be lost.
            </p>
            {pendingCount !== undefined && pendingCount > 0 && (
              <p className="text-xs text-[hsl(var(--wq-text-muted))] mt-2">
                You have {pendingCount} unsaved reassignment{pendingCount !== 1 ? "s" : ""} that will be permanently removed.
              </p>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-3 sm:flex-col">
          <Button 
            onClick={onSaveAndExit} 
            className="w-full bg-primary hover:bg-primary/90"
          >
            Save as Draft
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
