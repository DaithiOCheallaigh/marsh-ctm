// Leaver Workflow Types with Capacity Management

export interface LeaverClient {
  id: string;
  name: string;
  industry: string;
  role: string;
  capacityRequirement: number; // chairs or FTE
  currentOwner: string;
  reassignedTo?: string;
  reassignedDate?: string;
}

export interface LeaverEmployee {
  id: string;
  name: string;
  email: string;
  location: string;
  teamId: string;
  teamName: string;
  totalClients: number;
  totalCapacity: number;
}

export interface LeaverTeamMember {
  id: string;
  name: string;
  role: string;
  location: string;
  teamId: string;
  currentCapacity: number; // currently used
  maxCapacity: number; // always 100
  availableCapacity: number; // maxCapacity - currentCapacity
  utilizationPercent: number;
  projectedCapacity?: number; // calculated when assigning
}

export interface LeaverReassignment {
  id: string;
  workItemId: string;
  clientId: string;
  clientName: string;
  industry: string;
  clientRole: string;
  capacityRequirement: number;
  fromEmployeeId: string;
  fromEmployeeName: string;
  toTeamMemberId: string;
  toTeamMemberName: string;
  toTeamMemberRole: string;
  toTeamMemberLocation: string;
  newCapacityPercent: number;
  reassignedDate: string;
  status: 'Draft' | 'Completed';
}

export interface LeaverWorkItemDetails {
  id: string;
  employeeId: string;
  employeeName: string;
  email: string;
  location: string;
  leavingDate: string;
  teamId: string;
  teamName: string;
  managers: string[];
  managerNames: string[];
  status: 'In Progress' | 'Completed';
  createdDate: string;
  completedDate?: string;
  completedBy?: string;
  totalClients: number;
  totalCapacity: number;
  assignedClients: number;
  assignedCapacity: number;
  reassignments: LeaverReassignment[];
}

// Capacity calculation utilities
export interface CapacityCalculation {
  current: number;
  additional: number;
  projected: number;
  max: number;
  utilization: number;
  status: 'ok' | 'warning' | 'over';
}

export const calculateProjectedCapacity = (
  currentUsed: number,
  additionalCapacity: number,
  maxCapacity: number = 100
): CapacityCalculation => {
  const projected = currentUsed + additionalCapacity;
  const utilization = (projected / maxCapacity) * 100;
  
  return {
    current: currentUsed,
    additional: additionalCapacity,
    projected,
    max: maxCapacity,
    utilization,
    status: utilization < 85 ? 'ok' : utilization <= 100 ? 'warning' : 'over'
  };
};

export const getCapacityStatusColor = (status: CapacityCalculation['status']) => {
  switch (status) {
    case 'ok':
      return 'text-[hsl(var(--wq-status-completed-text))]';
    case 'warning':
      return 'text-[hsl(var(--wq-priority-medium))]';
    case 'over':
      return 'text-destructive';
  }
};

export const getCapacityStatusBgColor = (status: CapacityCalculation['status']) => {
  switch (status) {
    case 'ok':
      return 'bg-[hsl(var(--wq-status-completed-bg))]';
    case 'warning':
      return 'bg-amber-50';
    case 'over':
      return 'bg-red-50';
  }
};
