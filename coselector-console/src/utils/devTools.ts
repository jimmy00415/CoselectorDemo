import { Lead, TimelineEvent } from '../types';
import { LeadStatus, ActorType, UserRole } from '../types/enums';
import { generateId } from './helpers';

/**
 * Mock Data Utilities for Developer Tools
 * 
 * Design Principles:
 * - Generate realistic data following business rules
 * - Maintain referential integrity (IDs, timestamps, relationships)
 * - Follow Sprint 1 state machine rules
 * - Provide diverse test scenarios
 */

const MERCHANT_CATEGORIES = [
  'Electronics', 'Fashion', 'Food & Beverage', 'Home & Garden', 
  'Health & Beauty', 'Sports & Outdoors', 'Toys & Games', 'Automotive'
];

const REGIONS = ['North America', 'Europe', 'Asia Pacific', 'Latin America'];

const CITIES: Record<string, string[]> = {
  'North America': ['New York', 'San Francisco', 'Chicago', 'Toronto', 'Vancouver'],
  'Europe': ['London', 'Paris', 'Berlin', 'Amsterdam', 'Barcelona'],
  'Asia Pacific': ['Tokyo', 'Singapore', 'Hong Kong', 'Sydney', 'Seoul'],
  'Latin America': ['São Paulo', 'Mexico City', 'Buenos Aires', 'Lima', 'Bogotá']
};

const MERCHANT_NAMES = [
  'TechHub Store', 'Fashion Forward', 'Gourmet Delights', 'Home Essentials',
  'Beauty Haven', 'Sports World', 'Toy Kingdom', 'Auto Parts Plus',
  'Digital Dreams', 'Style Central', 'Foodie Paradise', 'Garden Oasis'
];

const OPS_USERS = [
  'Sarah Chen (OPS)', 'Michael Rodriguez (BD)', 'Emma Wilson (OPS)', 
  'David Kim (BD)', 'Lisa Anderson (OPS)'
];

/**
 * Generate a realistic timeline event
 */
export function generateTimelineEvent(
  eventType: string,
  actorType: ActorType,
  actorName: string,
  reasonCode: string,
  metadata?: Record<string, any>
): TimelineEvent {
  const descriptions: Record<string, string> = {
    LEAD_SUBMITTED: 'Lead submitted for review',
    OWNER_ASSIGNED: `Lead ${metadata?.previousOwner ? 'reassigned' : 'assigned'} to ${metadata?.newOwner}`,
    STATUS_CHANGED: `Status changed from ${metadata?.previousStatus} to ${metadata?.newStatus}`,
    INFO_REQUESTED: 'Additional information requested',
    APPROVED: 'Lead approved',
    REJECTED: 'Lead rejected'
  };

  return {
    id: generateId(),
    actorType,
    actorName,
    occurredAt: new Date().toISOString(),
    eventType,
    description: descriptions[eventType] || `Event: ${eventType}`,
    reasonCode,
    metadata
  };
}

/**
 * Generate a realistic lead with complete timeline
 */
export function generateMockLead(options: {
  status?: LeadStatus;
  hasOwner?: boolean;
  hasMissingInfo?: boolean;
} = {}): Lead {
  const {
    status = LeadStatus.SUBMITTED,
    hasOwner = false,
    hasMissingInfo = false
  } = options;

  const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];
  const category = MERCHANT_CATEGORIES[Math.floor(Math.random() * MERCHANT_CATEGORIES.length)];
  const merchantName = MERCHANT_NAMES[Math.floor(Math.random() * MERCHANT_NAMES.length)];
  const cities = CITIES[region];
  const city = cities[Math.floor(Math.random() * cities.length)];

  const now = new Date();
  const submittedAt = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Last 7 days

  // Build timeline based on status
  const timeline: TimelineEvent[] = [];

  // Initial submission
  timeline.push(generateTimelineEvent(
    'LEAD_SUBMITTED',
    ActorType.CO_SELECTOR,
    'Demo User',
    'INITIAL_SUBMISSION',
    {
      previousStatus: LeadStatus.DRAFT,
      newStatus: LeadStatus.SUBMITTED
    }
  ));

  // Add owner assignment if has owner
  let assignedOwner: string | undefined;
  if (hasOwner || status !== LeadStatus.SUBMITTED) {
    assignedOwner = OPS_USERS[Math.floor(Math.random() * OPS_USERS.length)];
    timeline.push(generateTimelineEvent(
      'OWNER_ASSIGNED',
      ActorType.OPS_BD,
      assignedOwner,
      'CLAIMED',
      {
        previousOwner: undefined,
        newOwner: assignedOwner
      }
    ));
  }

  // Add status transitions based on current status
  if (status === LeadStatus.UNDER_REVIEW) {
    timeline.push(generateTimelineEvent(
      'STATUS_CHANGED',
      ActorType.OPS_BD,
      assignedOwner || 'OPS Team',
      'UNDER_REVIEW',
      {
        previousStatus: LeadStatus.SUBMITTED,
        newStatus: LeadStatus.UNDER_REVIEW
      }
    ));
  } else if (status === LeadStatus.INFO_REQUESTED) {
    timeline.push(generateTimelineEvent(
      'INFO_REQUESTED',
      ActorType.OPS_BD,
      assignedOwner || 'OPS Team',
      'INFO_REQUESTED',
      {
        previousStatus: LeadStatus.SUBMITTED,
        newStatus: LeadStatus.INFO_REQUESTED,
        requestedItems: ['Financial statements', 'Business license']
      }
    ));
  } else if (status === LeadStatus.APPROVED) {
    timeline.push(generateTimelineEvent(
      'APPROVED',
      ActorType.OPS_BD,
      assignedOwner || 'OPS Team',
      'MEETS_CRITERIA',
      {
        previousStatus: LeadStatus.UNDER_REVIEW,
        newStatus: LeadStatus.APPROVED
      }
    ));
  } else if (status === LeadStatus.REJECTED) {
    timeline.push(generateTimelineEvent(
      'REJECTED',
      ActorType.OPS_BD,
      assignedOwner || 'OPS Team',
      'DOES_NOT_MEET_CRITERIA',
      {
        previousStatus: LeadStatus.UNDER_REVIEW,
        newStatus: LeadStatus.REJECTED,
        resubmissionAllowed: true
      }
    ));
  }

  return {
    id: generateId(),
    merchantName,
    category,
    region,
    city,
    estimatedMonthlyVolume: hasMissingInfo ? '' : `$${Math.floor(Math.random() * 1000000) + 50000}`,
    contactName: hasMissingInfo ? '' : `${merchantName} Manager`,
    contactEmail: hasMissingInfo ? '' : `contact@${merchantName.toLowerCase().replace(/\s+/g, '')}.com`,
    contactPhone: hasMissingInfo ? '' : '+1-555-' + Math.floor(Math.random() * 9000 + 1000),
    website: `https://www.${merchantName.toLowerCase().replace(/\s+/g, '')}.com`,
    status,
    assignedOwner,
    notes: 'Generated by Dev Tools for testing purposes',
    submittedAt: submittedAt.toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    timeline
  };
}

/**
 * Generate a batch of diverse leads covering all scenarios
 */
export function generateLeadBatch(count: number = 10): Lead[] {
  const scenarios = [
    { status: LeadStatus.SUBMITTED, hasOwner: false, hasMissingInfo: false },
    { status: LeadStatus.SUBMITTED, hasOwner: false, hasMissingInfo: true },
    { status: LeadStatus.UNDER_REVIEW, hasOwner: true, hasMissingInfo: false },
    { status: LeadStatus.INFO_REQUESTED, hasOwner: true, hasMissingInfo: true },
    { status: LeadStatus.APPROVED, hasOwner: true, hasMissingInfo: false },
    { status: LeadStatus.REJECTED, hasOwner: true, hasMissingInfo: false }
  ];

  const leads: Lead[] = [];
  for (let i = 0; i < count; i++) {
    const scenario = scenarios[i % scenarios.length];
    leads.push(generateMockLead(scenario));
  }

  return leads;
}

/**
 * Generate timeline event for injection
 */
export function createCustomTimelineEvent(
  lead: Lead,
  eventType: string,
  actorType: ActorType,
  reasonCode: string,
  metadata?: Record<string, any>
): TimelineEvent {
  const actorNames: Record<string, string> = {
    [ActorType.CO_SELECTOR]: 'Demo User',
    [ActorType.OPS_BD]: lead.assignedOwner || 'OPS Team',
    [ActorType.SYSTEM]: 'System',
    [ActorType.FINANCE]: 'Finance Team'
  };

  return generateTimelineEvent(
    eventType,
    actorType,
    actorNames[actorType] || 'Unknown',
    reasonCode,
    metadata
  );
}

/**
 * Generate realistic user profile for role switching
 */
export function generateUserProfile(role: UserRole) {
  const profiles = {
    [UserRole.CO_SELECTOR]: {
      id: 'demo-coselector-001',
      displayName: 'Demo Co-Selector',
      email: 'demo.coselector@example.com',
      role: UserRole.CO_SELECTOR
    },
    [UserRole.OPS_BD]: {
      id: 'demo-opsbd-001',
      displayName: 'Demo OPS/BD',
      email: 'demo.opsbd@example.com',
      role: UserRole.OPS_BD
    },
    [UserRole.FINANCE]: {
      id: 'demo-finance-001',
      displayName: 'Demo Finance',
      email: 'demo.finance@example.com',
      role: UserRole.FINANCE
    }
  };

  return profiles[role];
}
