import React from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CapacityWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  teamMemberName: string;
  projectedCapacity: number;
}

export const CapacityWarningModal: React.FC<CapacityWarningModalProps> = ({
  isOpen,
  onClose,
  onProceed,
  teamMemberName,
  projectedCapacity,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[hsl(var(--wq-priority-medium))]">
            <AlertTriangle className="w-5 h-5" />
            Capacity Warning
          </DialogTitle>
          <DialogDescription className="pt-4 text-sm">
            Assigning these clients will put <strong>{teamMemberName}</strong> at{" "}
            <strong className="text-destructive">{projectedCapacity.toFixed(0)}%</strong> capacity,
            exceeding their recommended workload limit.
            <br />
            <br />
            Do you want to proceed?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onProceed}
            className="bg-[hsl(var(--wq-priority-medium))] hover:bg-[hsl(var(--wq-priority-medium))]/90"
          >
            Proceed Anyway
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
