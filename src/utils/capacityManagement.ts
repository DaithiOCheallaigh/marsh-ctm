/**
 * Capacity Management System
 * 
 * Core capacity concepts:
 * - Total Capacity: 100% represents a team member's full working capacity
 * - Available Capacity: The percentage of capacity NOT currently allocated (what's free to assign)
 * - Workload Percentage: The amount of capacity consumed by a single assignment
 * - Current Workload: Total percentage of capacity already allocated (inverse of available capacity)
 * 
 * Key Formula:
 * Available Capacity = 100% - Sum of all current assignments
 */

import { TeamMember } from "@/data/teamMembers";

// ============= CONFIGURATION =============

export interface CapacityConfig {
  /** Default percentage per assignment (pre-populated in form) */
  DEFAULT_ASSIGNMENT_WORKLOAD: number;
  /** Allow assignments that exceed 100%? (Option B = true, Option A = false) */
  ALLOW_OVER_ALLOCATION: boolean;
  /** Show warning at this % capacity used */
  HIGH_CAPACITY_WARNING_THRESHOLD: number;
  /** Maximum capacity (100%) */
  FULL_CAPACITY_THRESHOLD: number;
  /** Decimal places to display */
  DECIMAL_PRECISION: number;
  /** Minimum workload percentage allowed per assignment */
  MIN_WORKLOAD_PERCENTAGE: number;
  /** Maximum workload percentage allowed per single assignment */
  MAX_WORKLOAD_PERCENTAGE: number;
}

export const CAPACITY_CONFIG: CapacityConfig = {
  DEFAULT_ASSIGNMENT_WORKLOAD: 20,
  ALLOW_OVER_ALLOCATION: true, // Default to Option B (allow with warning) - PENDING FINAL DECISION
  HIGH_CAPACITY_WARNING_THRESHOLD: 80,
  FULL_CAPACITY_THRESHOLD: 100,
  DECIMAL_PRECISION: 1,
  MIN_WORKLOAD_PERCENTAGE: 1,
  MAX_WORKLOAD_PERCENTAGE: 40,
};

// ============= STATUS TYPES =============

export type CapacityStatus = 
  | 'fully_available'    // 100% available
  | 'available'          // >= 50% available
  | 'limited'            // 20-49% available
  | 'low'                // 1-19% available
  | 'at_capacity'        // 0% available
  | 'over_assigned';     // < 0% available (negative)

export type CapacityColor = 'green' | 'amber' | 'orange' | 'gray' | 'red';

export interface CapacityStatusInfo {
  status: CapacityStatus;
  statusText: string;
  color: CapacityColor;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  isDisabled: boolean;
  showWarningIcon: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
  warningMessage?: string;
  requiresConfirmation: boolean;
  projectedAvailable: number;
  isOverCapacity: boolean;
  isNearingCapacity: boolean;
}

// ============= CALCULATION FUNCTIONS =============

/**
 * Calculate the available capacity for a team member
 * CRITICAL: This returns AVAILABLE capacity, not workload
 * 
 * @param member - Team member with capacity property (which represents available %)
 * @param additionalWorkload - Optional: workload from assignments in current work item
 * @returns Available capacity percentage
 */
export function calculateAvailableCapacity(
  member: TeamMember,
  additionalWorkload: number = 0
): number {
  // member.capacity already represents available capacity in the current data model
  const available = member.capacity - additionalWorkload;
  return Math.round(available * Math.pow(10, CAPACITY_CONFIG.DECIMAL_PRECISION)) / Math.pow(10, CAPACITY_CONFIG.DECIMAL_PRECISION);
}

/**
 * Calculate base workload (what's already assigned outside this work item)
 * Formula: Base Workload = 100% - member.capacity
 */
export function calculateBaseWorkload(member: TeamMember): number {
  return 100 - member.capacity;
}

/**
 * Calculate total workload including base and work item assignments
 */
export function calculateTotalWorkload(
  member: TeamMember,
  workItemAssignmentWorkload: number = 0
): number {
  const baseWorkload = calculateBaseWorkload(member);
  return baseWorkload + workItemAssignmentWorkload;
}

/**
 * Calculate projected available capacity after an assignment
 */
export function calculateProjectedAvailable(
  currentAvailable: number,
  assignmentWorkload: number
): number {
  return currentAvailable - assignmentWorkload;
}

// ============= STATUS FUNCTIONS =============

/**
 * Get the capacity status based on available capacity
 * Returns status enum with display information
 */
export function getCapacityStatus(availableCapacity: number): CapacityStatusInfo {
  const { ALLOW_OVER_ALLOCATION } = CAPACITY_CONFIG;

  if (availableCapacity >= 100) {
    return {
      status: 'fully_available',
      statusText: 'Fully Available',
      color: 'green',
      colorClass: 'text-green-600',
      bgClass: 'bg-green-50',
      borderClass: 'border-green-200',
      isDisabled: false,
      showWarningIcon: false,
    };
  }

  if (availableCapacity >= 50) {
    return {
      status: 'available',
      statusText: 'Available',
      color: 'green',
      colorClass: 'text-green-600',
      bgClass: 'bg-green-50',
      borderClass: 'border-green-200',
      isDisabled: false,
      showWarningIcon: false,
    };
  }

  if (availableCapacity >= 20) {
    return {
      status: 'limited',
      statusText: 'Limited Availability',
      color: 'amber',
      colorClass: 'text-amber-600',
      bgClass: 'bg-amber-50',
      borderClass: 'border-amber-200',
      isDisabled: false,
      showWarningIcon: false,
    };
  }

  if (availableCapacity > 0) {
    return {
      status: 'low',
      statusText: 'Low Availability',
      color: 'orange',
      colorClass: 'text-orange-600',
      bgClass: 'bg-orange-50',
      borderClass: 'border-orange-200',
      isDisabled: false,
      showWarningIcon: false,
    };
  }

  if (availableCapacity === 0) {
    return {
      status: 'at_capacity',
      statusText: 'At Capacity',
      color: ALLOW_OVER_ALLOCATION ? 'red' : 'gray',
      colorClass: ALLOW_OVER_ALLOCATION ? 'text-red-600' : 'text-gray-500',
      bgClass: ALLOW_OVER_ALLOCATION ? 'bg-red-50' : 'bg-gray-100',
      borderClass: ALLOW_OVER_ALLOCATION ? 'border-red-200' : 'border-gray-300',
      isDisabled: !ALLOW_OVER_ALLOCATION,
      showWarningIcon: false,
    };
  }

  // availableCapacity < 0 (over-assigned)
  return {
    status: 'over_assigned',
    statusText: 'Over Assigned',
    color: 'red',
    colorClass: 'text-red-600',
    bgClass: 'bg-red-50',
    borderClass: 'border-red-200',
    isDisabled: !ALLOW_OVER_ALLOCATION,
    showWarningIcon: true,
  };
}

/**
 * Get capacity color indicator for UI display
 */
export function getCapacityColorIndicator(availableCapacity: number): CapacityColor {
  return getCapacityStatus(availableCapacity).color;
}

/**
 * Get CSS classes for capacity display
 */
export function getCapacityColorClasses(availableCapacity: number): {
  text: string;
  bg: string;
  border: string;
} {
  const status = getCapacityStatus(availableCapacity);
  return {
    text: status.colorClass,
    bg: status.bgClass,
    border: status.borderClass,
  };
}

// ============= VALIDATION FUNCTIONS =============

/**
 * Validate assignment workload
 * Returns validation result with errors, warnings, and confirmation requirements
 */
export function validateAssignmentWorkload(
  workloadPercentage: number,
  availableCapacity: number
): ValidationResult {
  const {
    ALLOW_OVER_ALLOCATION,
    HIGH_CAPACITY_WARNING_THRESHOLD,
    FULL_CAPACITY_THRESHOLD,
    MIN_WORKLOAD_PERCENTAGE,
    MAX_WORKLOAD_PERCENTAGE,
  } = CAPACITY_CONFIG;

  const projectedAvailable = availableCapacity - workloadPercentage;
  const projectedWorkload = FULL_CAPACITY_THRESHOLD - projectedAvailable;
  const isOverCapacity = projectedAvailable < 0;
  const isNearingCapacity = projectedWorkload >= HIGH_CAPACITY_WARNING_THRESHOLD && projectedWorkload <= FULL_CAPACITY_THRESHOLD;

  // Rule 1: Minimum workload validation
  if (workloadPercentage <= 0) {
    return {
      isValid: false,
      errorMessage: 'Assignment workload must be greater than 0%',
      requiresConfirmation: false,
      projectedAvailable,
      isOverCapacity,
      isNearingCapacity,
    };
  }

  if (workloadPercentage < MIN_WORKLOAD_PERCENTAGE) {
    return {
      isValid: false,
      errorMessage: `Workload must be at least ${MIN_WORKLOAD_PERCENTAGE}%`,
      requiresConfirmation: false,
      projectedAvailable,
      isOverCapacity,
      isNearingCapacity,
    };
  }

  // Rule: Maximum single assignment workload
  if (workloadPercentage > MAX_WORKLOAD_PERCENTAGE) {
    return {
      isValid: false,
      errorMessage: `Single assignment cannot exceed ${MAX_WORKLOAD_PERCENTAGE}%`,
      requiresConfirmation: false,
      projectedAvailable,
      isOverCapacity,
      isNearingCapacity,
    };
  }

  // Rule 2: Over capacity handling
  if (isOverCapacity) {
    if (!ALLOW_OVER_ALLOCATION) {
      // Option A: Hard block
      return {
        isValid: false,
        errorMessage: `Cannot assign ${workloadPercentage}%. Team member has only ${availableCapacity}% available capacity.`,
        requiresConfirmation: false,
        projectedAvailable,
        isOverCapacity,
        isNearingCapacity,
      };
    } else {
      // Option B: Allow with warning and confirmation
      return {
        isValid: true,
        warningMessage: `This assignment exceeds 100% capacity. Team member will be marked as over-assigned.`,
        requiresConfirmation: true,
        projectedAvailable,
        isOverCapacity,
        isNearingCapacity,
      };
    }
  }

  // Rule 3: Nearing capacity warning (80-100%)
  if (isNearingCapacity) {
    return {
      isValid: true,
      warningMessage: `Warning: This will bring team member to ${projectedWorkload.toFixed(0)}% capacity (high utilization)`,
      requiresConfirmation: false,
      projectedAvailable,
      isOverCapacity,
      isNearingCapacity,
    };
  }

  // Valid assignment
  return {
    isValid: true,
    requiresConfirmation: false,
    projectedAvailable,
    isOverCapacity,
    isNearingCapacity,
  };
}

/**
 * Check if team member can accept new assignments
 */
export function canAcceptAssignment(
  member: TeamMember,
  workItemAssignmentWorkload: number = 0
): boolean {
  const available = calculateAvailableCapacity(member, workItemAssignmentWorkload);
  
  if (CAPACITY_CONFIG.ALLOW_OVER_ALLOCATION) {
    // With Option B, always allow (even if at/over capacity)
    return true;
  }
  
  // With Option A, block if at or over capacity
  return available > 0;
}

/**
 * Get display text for available capacity
 * CRITICAL: This always shows "Available Capacity", never "Workload"
 */
export function formatAvailableCapacity(availableCapacity: number): string {
  if (availableCapacity < 0) {
    return `${Math.abs(availableCapacity).toFixed(CAPACITY_CONFIG.DECIMAL_PRECISION)}% over`;
  }
  return `${availableCapacity.toFixed(CAPACITY_CONFIG.DECIMAL_PRECISION)}%`;
}

/**
 * Get the available capacity label for display
 */
export function getAvailableCapacityLabel(): string {
  return 'Available Capacity';
}

// ============= SUCCESS/ERROR MESSAGES =============

export function getAssignmentSuccessMessage(
  memberName: string,
  newAvailableCapacity: number
): string {
  return `Assignment completed. ${memberName} now has ${formatAvailableCapacity(newAvailableCapacity)} available capacity.`;
}

export function getOverCapacityConfirmationMessage(): string {
  return 'This assignment exceeds 100% capacity. Team member will be marked as over-assigned. Are you sure you want to proceed?';
}

// ============= HELPER FOR MY TEAM ASSIGNMENTS SYNC =============

export interface MemberCapacitySummary {
  memberId: string;
  memberName: string;
  availableCapacity: number;
  status: CapacityStatus;
  statusInfo: CapacityStatusInfo;
  formattedCapacity: string;
}

export function getMemberCapacitySummary(
  member: TeamMember,
  workItemAssignmentWorkload: number = 0
): MemberCapacitySummary {
  const availableCapacity = calculateAvailableCapacity(member, workItemAssignmentWorkload);
  const statusInfo = getCapacityStatus(availableCapacity);
  
  return {
    memberId: member.id,
    memberName: member.name,
    availableCapacity,
    status: statusInfo.status,
    statusInfo,
    formattedCapacity: formatAvailableCapacity(availableCapacity),
  };
}
