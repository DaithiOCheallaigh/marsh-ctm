// Shared types for all three assignment concept components

import { TeamMember } from "@/data/teamMembers";

export interface RoleDefinition {
  roleId: string;
  roleName: string;
  teamName?: string;
  description?: string;
  chairCount?: number; // Number of chairs configured for this role (from work item setup)
}

export interface AssignmentData {
  roleId: string;
  roleName: string;
  teamName?: string;
  selectedPerson?: TeamMember;
  chairType: 'Primary' | 'Secondary';
  workloadPercentage: number;
  notes?: string;
}

export interface AssignmentConceptProps {
  roles: RoleDefinition[];
  onAssign: (assignment: AssignmentData) => void;
  onUnassign: (roleId: string) => void;
  assignments: AssignmentData[];
  isReadOnly?: boolean;
  getMemberTotalWorkload?: (memberId: string) => number;
  checkDuplicateAssignment?: (member: TeamMember) => { isAssigned: boolean; roleName?: string };
}

export const MIN_WORKLOAD = 1;
export const MAX_WORKLOAD = 40;
export const DEFAULT_WORKLOAD = 20;
export const MAX_CAPACITY = 100;

// Match score color helper
export const getMatchScoreColor = (score: number): string => {
  if (score >= 90) return "text-green-600";
  if (score >= 70) return "text-amber-600";
  return "text-gray-500";
};

// Match score badge helper
export const getMatchBadge = (score: number): { label: string; className: string } => {
  if (score >= 90) return { label: "Best Match", className: "bg-green-100 text-green-700 border-green-200" };
  if (score >= 70) return { label: "Good Match", className: "bg-amber-100 text-amber-700 border-amber-200" };
  return { label: "", className: "" };
};

// Capacity color helper
export const getCapacityColor = (available: number): string => {
  if (available > 30) return "text-green-600";
  if (available >= 10) return "text-amber-600";
  return "text-red-600";
};

// Capacity bar color helper
export const getCapacityBarColor = (workload: number): string => {
  if (workload >= 90) return "bg-red-500";
  if (workload >= 70) return "bg-amber-500";
  return "bg-green-500";
};
