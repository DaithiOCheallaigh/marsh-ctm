export interface Assignment {
  assignmentId: string;
  workItemId: string;
  teamMemberId: string;
  workloadPercentage: number;
  assignedDate: string;
}

export interface TeamMemberWorkload {
  id: string;
  name: string;
  totalWorkload: number;
  availableCapacity: number;
  assignments: Assignment[];
}

export const MIN_WORKLOAD_PERCENTAGE = 1;
export const MAX_WORKLOAD_PERCENTAGE = 40;
export const DEFAULT_WORKLOAD_PERCENTAGE = 20;
export const MAX_CAPACITY = 100;
