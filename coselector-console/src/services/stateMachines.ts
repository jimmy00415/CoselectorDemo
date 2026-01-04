import { 
  LeadStatus, 
  EarningsState, 
  PayoutStatus, 
  DisputeStatus,
  ActorType,
  LeadReviewReason,
  ReversalReason
} from '../types/enums';
import { TimelineEvent } from '../types';
import { generateId } from '../utils';

/**
 * State Machines for Co-selector Console
 * 
 * Implements deterministic state transitions for:
 * - Lead lifecycle (Draft → Submitted → Under Review → Approved/Rejected)
 * - Earnings lifecycle (Pending → Locked → Payable → Paid + Reversals)
 * - Payout lifecycle (Requested → Approved → Paid/Failed)
 * - Dispute lifecycle (Open → Waiting → Resolved)
 * 
 * All transitions create timeline events with actor/reason tracking
 */

// ============================================================================
// LEAD STATE MACHINE
// ============================================================================

export interface LeadTransitionContext {
  currentStatus: LeadStatus;
  actorType: ActorType;
  actorName: string;
  reasonCode?: LeadReviewReason;
  reasonNote?: string;
}

export interface LeadTransitionResult {
  newStatus: LeadStatus;
  event: TimelineEvent;
  isValid: boolean;
  error?: string;
}

/**
 * Lead State Machine Transitions:
 * 
 * Draft → Submitted (CO_SELECTOR submits)
 * Submitted → Under Review (SYSTEM auto-transition or OPS accepts)
 * Under Review → Info Requested (OPS requests more info)
 * Info Requested → Under Review (CO_SELECTOR resubmits with updated info)
 * Under Review → Approved (OPS approves with reason)
 * Under Review → Rejected (OPS rejects with reason)
 * Rejected → Resubmitted (CO_SELECTOR resubmits)
 * Resubmitted → Under Review (SYSTEM auto-transition)
 */
export class LeadStateMachine {
  private static validTransitions: Record<LeadStatus, LeadStatus[]> = {
    [LeadStatus.DRAFT]: [LeadStatus.SUBMITTED],
    [LeadStatus.SUBMITTED]: [LeadStatus.UNDER_REVIEW],
    [LeadStatus.UNDER_REVIEW]: [
      LeadStatus.INFO_REQUESTED, 
      LeadStatus.APPROVED, 
      LeadStatus.REJECTED
    ],
    [LeadStatus.INFO_REQUESTED]: [LeadStatus.UNDER_REVIEW],
    [LeadStatus.APPROVED]: [], // Terminal state
    [LeadStatus.REJECTED]: [LeadStatus.RESUBMITTED],
    [LeadStatus.RESUBMITTED]: [LeadStatus.UNDER_REVIEW],
  };

  static canTransition(from: LeadStatus, to: LeadStatus): boolean {
    return this.validTransitions[from]?.includes(to) || false;
  }

  static transition(context: LeadTransitionContext, targetStatus: LeadStatus): LeadTransitionResult {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { currentStatus, actorType: _actorType, actorName: _actorName, reasonCode, reasonNote } = context;

    // Validate transition is allowed
    if (!this.canTransition(currentStatus, targetStatus)) {
      return {
        newStatus: currentStatus,
        event: this.createEvent(context, currentStatus, 'Invalid transition attempted'),
        isValid: false,
        error: `Cannot transition from ${currentStatus} to ${targetStatus}`,
      };
    }

    // Validate required reason codes
    if ((targetStatus === LeadStatus.APPROVED || 
         targetStatus === LeadStatus.REJECTED || 
         targetStatus === LeadStatus.INFO_REQUESTED) && !reasonCode) {
      return {
        newStatus: currentStatus,
        event: this.createEvent(context, currentStatus, 'Missing required reason code'),
        isValid: false,
        error: 'Reason code is required for this transition',
      };
    }

    // Create timeline event
    const event = this.createEvent(
      context, 
      targetStatus, 
      this.getEventDescription(currentStatus, targetStatus, reasonCode, reasonNote)
    );

    return {
      newStatus: targetStatus,
      event,
      isValid: true,
    };
  }

  private static createEvent(
    context: LeadTransitionContext, 
    newStatus: LeadStatus, 
    description: string
  ): TimelineEvent {
    return {
      id: generateId(),
      actorType: context.actorType,
      actorName: context.actorName,
      occurredAt: new Date().toISOString(),
      eventType: `Status changed to ${newStatus}`,
      description,
      reasonCode: context.reasonCode,
      metadata: {
        previousStatus: context.currentStatus,
        newStatus,
        reasonNote: context.reasonNote,
      },
    };
  }

  private static getEventDescription(
    from: LeadStatus, 
    to: LeadStatus, 
    reasonCode?: LeadReviewReason,
    reasonNote?: string
  ): string {
    const descriptions: Record<string, string> = {
      [`${LeadStatus.DRAFT}-${LeadStatus.SUBMITTED}`]: 'Lead submitted for review',
      [`${LeadStatus.SUBMITTED}-${LeadStatus.UNDER_REVIEW}`]: 'Lead accepted for review by operations team',
      [`${LeadStatus.UNDER_REVIEW}-${LeadStatus.INFO_REQUESTED}`]: `Additional information requested: ${reasonCode}${reasonNote ? ` - ${reasonNote}` : ''}`,
      [`${LeadStatus.INFO_REQUESTED}-${LeadStatus.UNDER_REVIEW}`]: 'Updated information submitted, review resumed',
      [`${LeadStatus.UNDER_REVIEW}-${LeadStatus.APPROVED}`]: `Lead approved: ${reasonCode}${reasonNote ? ` - ${reasonNote}` : ''}`,
      [`${LeadStatus.UNDER_REVIEW}-${LeadStatus.REJECTED}`]: `Lead rejected: ${reasonCode}${reasonNote ? ` - ${reasonNote}` : ''}`,
      [`${LeadStatus.REJECTED}-${LeadStatus.RESUBMITTED}`]: 'Lead resubmitted after addressing feedback',
      [`${LeadStatus.RESUBMITTED}-${LeadStatus.UNDER_REVIEW}`]: 'Resubmitted lead under review',
    };

    return descriptions[`${from}-${to}`] || `Status changed from ${from} to ${to}`;
  }
}

// ============================================================================
// EARNINGS STATE MACHINE
// ============================================================================

export interface EarningsTransitionContext {
  currentState: EarningsState;
  actorType: ActorType;
  actorName: string;
  reasonCode?: ReversalReason;
  lockEndDate?: string;
  transactionAmount: number;
}

export interface EarningsTransitionResult {
  newState: EarningsState;
  event: TimelineEvent;
  isValid: boolean;
  error?: string;
  reversalEntry?: {
    amount: number;
    reason: ReversalReason;
  };
}

/**
 * Earnings State Machine Transitions:
 * 
 * Pending → Locked (SYSTEM when lock_end_at date passes)
 * Pending → Reversed (SYSTEM/OPS for refund, fraud, dispute)
 * Locked → Payable (SYSTEM when KYC complete + threshold met)
 * Payable → Paid (FINANCE after successful payout)
 * Locked/Payable → Reversed (Creates reversal adjustment entry)
 * 
 * Key Business Rules:
 * - Pending transactions are modifiable/reversible before lock_end_at
 * - Locked transactions require reversal adjustment (separate entry)
 * - Payable transactions can be paid in batches
 * - Paid is terminal state (except reversal adjustments)
 */
export class EarningsStateMachine {
  private static validTransitions: Record<EarningsState, EarningsState[]> = {
    [EarningsState.PENDING]: [EarningsState.LOCKED, EarningsState.REVERSED],
    [EarningsState.LOCKED]: [EarningsState.PAYABLE, EarningsState.REVERSED],
    [EarningsState.PAYABLE]: [EarningsState.PAID, EarningsState.REVERSED],
    [EarningsState.PAID]: [EarningsState.REVERSED], // Reversal creates adjustment entry
    [EarningsState.REVERSED]: [], // Terminal state
  };

  static canTransition(from: EarningsState, to: EarningsState): boolean {
    return this.validTransitions[from]?.includes(to) || false;
  }

  static transition(
    context: EarningsTransitionContext, 
    targetState: EarningsState
  ): EarningsTransitionResult {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { currentState, actorType: _actorType, actorName: _actorName, reasonCode, lockEndDate, transactionAmount } = context;

    // Validate transition is allowed
    if (!this.canTransition(currentState, targetState)) {
      return {
        newState: currentState,
        event: this.createEvent(context, currentState, 'Invalid transition attempted'),
        isValid: false,
        error: `Cannot transition from ${currentState} to ${targetState}`,
      };
    }

    // Validate reversal has reason code
    if (targetState === EarningsState.REVERSED && !reasonCode) {
      return {
        newState: currentState,
        event: this.createEvent(context, currentState, 'Missing reversal reason'),
        isValid: false,
        error: 'Reason code is required for reversals',
      };
    }

    // Validate lock transition has lock_end_at
    if (targetState === EarningsState.LOCKED && !lockEndDate) {
      return {
        newState: currentState,
        event: this.createEvent(context, currentState, 'Missing lock end date'),
        isValid: false,
        error: 'Lock end date is required for locking transition',
      };
    }

    // Check if this is a reversal of already-locked/payable/paid transaction
    const needsReversalEntry = [
      EarningsState.LOCKED, 
      EarningsState.PAYABLE, 
      EarningsState.PAID
    ].includes(currentState) && targetState === EarningsState.REVERSED;

    // Create timeline event
    const event = this.createEvent(
      context,
      targetState,
      this.getEventDescription(currentState, targetState, reasonCode)
    );

    return {
      newState: targetState,
      event,
      isValid: true,
      reversalEntry: needsReversalEntry ? {
        amount: -Math.abs(transactionAmount),
        reason: reasonCode!,
      } : undefined,
    };
  }

  static canLockNow(lockEndDate: string): boolean {
    const lockDate = new Date(lockEndDate);
    const now = new Date();
    return now >= lockDate;
  }

  private static createEvent(
    context: EarningsTransitionContext,
    newState: EarningsState,
    description: string
  ): TimelineEvent {
    return {
      id: generateId(),
      actorType: context.actorType,
      actorName: context.actorName,
      occurredAt: new Date().toISOString(),
      eventType: `State changed to ${newState}`,
      description,
      reasonCode: context.reasonCode,
      metadata: {
        previousState: context.currentState,
        newState,
        lockEndDate: context.lockEndDate,
      },
    };
  }

  private static getEventDescription(
    from: EarningsState,
    to: EarningsState,
    reasonCode?: ReversalReason
  ): string {
    const descriptions: Record<string, string> = {
      [`${EarningsState.PENDING}-${EarningsState.LOCKED}`]: 'Transaction locked after lock period ended',
      [`${EarningsState.PENDING}-${EarningsState.REVERSED}`]: `Transaction reversed: ${reasonCode}`,
      [`${EarningsState.LOCKED}-${EarningsState.PAYABLE}`]: 'Transaction marked as payable (KYC verified + threshold met)',
      [`${EarningsState.LOCKED}-${EarningsState.REVERSED}`]: `Transaction reversed with adjustment entry: ${reasonCode}`,
      [`${EarningsState.PAYABLE}-${EarningsState.PAID}`]: 'Payment processed successfully',
      [`${EarningsState.PAYABLE}-${EarningsState.REVERSED}`]: `Transaction reversed with adjustment entry: ${reasonCode}`,
      [`${EarningsState.PAID}-${EarningsState.REVERSED}`]: `Payment reversed with adjustment entry: ${reasonCode}`,
    };

    return descriptions[`${from}-${to}`] || `State changed from ${from} to ${to}`;
  }
}

// ============================================================================
// PAYOUT STATE MACHINE
// ============================================================================

export interface PayoutTransitionContext {
  currentStatus: PayoutStatus;
  actorType: ActorType;
  actorName: string;
  reasonNote?: string;
  payoutAmount: number;
}

export interface PayoutTransitionResult {
  newStatus: PayoutStatus;
  event: TimelineEvent;
  isValid: boolean;
  error?: string;
}

/**
 * Payout State Machine Transitions:
 * 
 * Requested → Approved (FINANCE reviews and approves)
 * Requested → Rejected (FINANCE rejects with reason)
 * Requested → Cancelled (CO_SELECTOR cancels before approval)
 * Approved → Paid (SYSTEM after successful bank transfer)
 * Approved → Failed (SYSTEM if bank transfer fails)
 * Failed → Approved (Can retry after fixing issues)
 */
export class PayoutStateMachine {
  private static validTransitions: Record<PayoutStatus, PayoutStatus[]> = {
    [PayoutStatus.REQUESTED]: [PayoutStatus.APPROVED, PayoutStatus.REJECTED, PayoutStatus.CANCELLED],
    [PayoutStatus.APPROVED]: [PayoutStatus.PAID, PayoutStatus.FAILED],
    [PayoutStatus.REJECTED]: [], // Terminal state (user must create new request)
    [PayoutStatus.PAID]: [], // Terminal state
    [PayoutStatus.FAILED]: [PayoutStatus.APPROVED], // Allow retry
    [PayoutStatus.CANCELLED]: [], // Terminal state
  };

  static canTransition(from: PayoutStatus, to: PayoutStatus): boolean {
    return this.validTransitions[from]?.includes(to) || false;
  }

  static transition(
    context: PayoutTransitionContext,
    targetStatus: PayoutStatus
  ): PayoutTransitionResult {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { currentStatus, actorType: _actorType, actorName: _actorName, reasonNote, payoutAmount } = context;

    // Validate transition is allowed
    if (!this.canTransition(currentStatus, targetStatus)) {
      return {
        newStatus: currentStatus,
        event: this.createEvent(context, currentStatus, 'Invalid transition attempted'),
        isValid: false,
        error: `Cannot transition from ${currentStatus} to ${targetStatus}`,
      };
    }

    // Validate rejection has reason
    if (targetStatus === PayoutStatus.REJECTED && !reasonNote) {
      return {
        newStatus: currentStatus,
        event: this.createEvent(context, currentStatus, 'Missing rejection reason'),
        isValid: false,
        error: 'Reason is required for payout rejection',
      };
    }

    // Create timeline event
    const event = this.createEvent(
      context,
      targetStatus,
      this.getEventDescription(currentStatus, targetStatus, reasonNote, payoutAmount)
    );

    return {
      newStatus: targetStatus,
      event,
      isValid: true,
    };
  }

  private static createEvent(
    context: PayoutTransitionContext,
    newStatus: PayoutStatus,
    description: string
  ): TimelineEvent {
    return {
      id: generateId(),
      actorType: context.actorType,
      actorName: context.actorName,
      occurredAt: new Date().toISOString(),
      eventType: `Status changed to ${newStatus}`,
      description,
      metadata: {
        previousStatus: context.currentStatus,
        newStatus,
        reasonNote: context.reasonNote,
        payoutAmount: context.payoutAmount,
      },
    };
  }

  private static getEventDescription(
    from: PayoutStatus,
    to: PayoutStatus,
    reasonNote?: string,
    amount?: number
  ): string {
    const amountStr = amount ? ` (¥${amount.toFixed(2)})` : '';
    
    const descriptions: Record<string, string> = {
      [`${PayoutStatus.REQUESTED}-${PayoutStatus.APPROVED}`]: `Payout approved by finance team${amountStr}`,
      [`${PayoutStatus.REQUESTED}-${PayoutStatus.REJECTED}`]: `Payout rejected: ${reasonNote}`,
      [`${PayoutStatus.REQUESTED}-${PayoutStatus.CANCELLED}`]: `Payout cancelled by user${amountStr}`,
      [`${PayoutStatus.APPROVED}-${PayoutStatus.PAID}`]: `Payment successfully transferred to bank account${amountStr}`,
      [`${PayoutStatus.APPROVED}-${PayoutStatus.FAILED}`]: `Payment failed: ${reasonNote}`,
      [`${PayoutStatus.FAILED}-${PayoutStatus.APPROVED}`]: `Retry approved after fixing issues${amountStr}`,
    };

    return descriptions[`${from}-${to}`] || `Status changed from ${from} to ${to}`;
  }
}

// ============================================================================
// DISPUTE STATE MACHINE
// ============================================================================

export interface DisputeTransitionContext {
  currentStatus: DisputeStatus;
  actorType: ActorType;
  actorName: string;
  resolutionType?: 'WON' | 'LOST' | 'ADJUSTED';
  resolutionNote?: string;
  adjustmentAmount?: number;
}

export interface DisputeTransitionResult {
  newStatus: DisputeStatus;
  event: TimelineEvent;
  isValid: boolean;
  error?: string;
}

/**
 * Dispute State Machine Transitions:
 * 
 * Open → Waiting (SYSTEM after co-selector submits, waiting for ops response)
 * Waiting → Open (OPS requests more evidence)
 * Waiting → Resolved (OPS resolves with outcome: WON/LOST/ADJUSTED)
 */
export class DisputeStateMachine {
  private static validTransitions: Record<DisputeStatus, DisputeStatus[]> = {
    [DisputeStatus.OPEN]: [DisputeStatus.WAITING, DisputeStatus.WAITING_FOR_RESPONSE],
    [DisputeStatus.WAITING]: [DisputeStatus.OPEN, DisputeStatus.RESOLVED],
    [DisputeStatus.WAITING_FOR_RESPONSE]: [DisputeStatus.OPEN, DisputeStatus.RESOLVED],
    [DisputeStatus.RESOLVED]: [], // Terminal state
  };

  static canTransition(from: DisputeStatus, to: DisputeStatus): boolean {
    return this.validTransitions[from]?.includes(to) || false;
  }

  static transition(
    context: DisputeTransitionContext,
    targetStatus: DisputeStatus
  ): DisputeTransitionResult {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { currentStatus, actorType: _actorType, actorName: _actorName, resolutionType, resolutionNote } = context;

    // Validate transition is allowed
    if (!this.canTransition(currentStatus, targetStatus)) {
      return {
        newStatus: currentStatus,
        event: this.createEvent(context, currentStatus, 'Invalid transition attempted'),
        isValid: false,
        error: `Cannot transition from ${currentStatus} to ${targetStatus}`,
      };
    }

    // Validate resolution has type and note
    if (targetStatus === DisputeStatus.RESOLVED && (!resolutionType || !resolutionNote)) {
      return {
        newStatus: currentStatus,
        event: this.createEvent(context, currentStatus, 'Missing resolution details'),
        isValid: false,
        error: 'Resolution type and note are required for dispute resolution',
      };
    }

    // Create timeline event
    const event = this.createEvent(
      context,
      targetStatus,
      this.getEventDescription(currentStatus, targetStatus, resolutionType, resolutionNote)
    );

    return {
      newStatus: targetStatus,
      event,
      isValid: true,
    };
  }

  private static createEvent(
    context: DisputeTransitionContext,
    newStatus: DisputeStatus,
    description: string
  ): TimelineEvent {
    return {
      id: generateId(),
      actorType: context.actorType,
      actorName: context.actorName,
      occurredAt: new Date().toISOString(),
      eventType: `Status changed to ${newStatus}`,
      description,
      metadata: {
        previousStatus: context.currentStatus,
        newStatus,
        resolutionType: context.resolutionType,
        resolutionNote: context.resolutionNote,
        adjustmentAmount: context.adjustmentAmount,
      },
    };
  }

  private static getEventDescription(
    from: DisputeStatus,
    to: DisputeStatus,
    resolutionType?: 'WON' | 'LOST' | 'ADJUSTED',
    resolutionNote?: string
  ): string {
    const descriptions: Record<string, string> = {
      [`${DisputeStatus.OPEN}-${DisputeStatus.WAITING}`]: 'Dispute submitted, waiting for operations review',
      [`${DisputeStatus.WAITING}-${DisputeStatus.OPEN}`]: 'Additional evidence requested by operations team',
      [`${DisputeStatus.WAITING}-${DisputeStatus.RESOLVED}`]: resolutionType 
        ? `Dispute resolved: ${resolutionType} - ${resolutionNote}` 
        : 'Dispute resolved',
    };

    return descriptions[`${from}-${to}`] || `Status changed from ${from} to ${to}`;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate next locking dates distribution for Pending transactions
 * Returns counts for: within 7 days, 8-14 days, 15-30 days, 30+ days
 */
export function calculateLockingDistribution(lockEndDates: string[]): {
  within7Days: number;
  days8to14: number;
  days15to30: number;
  beyond30Days: number;
} {
  const now = new Date();
  const distribution = {
    within7Days: 0,
    days8to14: 0,
    days15to30: 0,
    beyond30Days: 0,
  };

  lockEndDates.forEach(dateStr => {
    const lockDate = new Date(dateStr);
    const daysUntilLock = Math.ceil((lockDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilLock <= 7) {
      distribution.within7Days++;
    } else if (daysUntilLock <= 14) {
      distribution.days8to14++;
    } else if (daysUntilLock <= 30) {
      distribution.days15to30++;
    } else {
      distribution.beyond30Days++;
    }
  });

  return distribution;
}

/**
 * Calculate reversal rate for a given period
 * Returns percentage of transactions that were reversed
 */
export function calculateReversalRate(
  totalTransactions: number,
  reversedTransactions: number
): number {
  if (totalTransactions === 0) return 0;
  return (reversedTransactions / totalTransactions) * 100;
}
