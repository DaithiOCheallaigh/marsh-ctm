import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CancelWorkItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes: string) => void;
}

export const CancelWorkItemModal: React.FC<CancelWorkItemModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [notes, setNotes] = useState("");

  const isValid = notes.trim().length >= 10;

  const handleConfirm = () => {
    if (isValid) {
      onConfirm(notes.trim());
      setNotes("");
    }
  };

  const handleClose = () => {
    setNotes("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-primary">
            Cancel Work Item?
          </DialogTitle>
          <DialogDescription className="text-center text-[hsl(var(--wq-text-secondary))]">
            Are you sure you want to cancel this work item? This action cannot be undone
            and will permanently remove the work item from the work queue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="cancel-notes" className="text-sm font-medium text-primary">
            Reason for cancellation <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="cancel-notes"
            placeholder="Please provide a reason for cancelling this work item (min 10 characters)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[100px]"
          />
          {notes.length > 0 && notes.trim().length < 10 && (
            <p className="text-xs text-destructive">
              Please enter at least 10 characters ({notes.trim().length}/10)
            </p>
          )}
        </div>

        <DialogFooter className="flex flex-row gap-3 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isValid}
            variant="destructive"
            className="flex-1"
          >
            Cancel Work Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
