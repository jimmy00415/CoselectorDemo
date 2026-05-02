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
  '电子产品', '时尚', '餐饮', '家居园艺',
  '健康美妆', '运动户外', '玩具游戏', '汽车用品'
];

const REGIONS = ['华北', '华东', '华南', '西南'];

const CITIES: Record<string, string[]> = {
  '华北': ['北京', '天津', '石家庄', '太原', '呼和浩特'],
  '华东': ['上海', '杭州', '南京', '苏州', '宁波'],
  '华南': ['广州', '深圳', '厦门', '福州', '海口'],
  '西南': ['成都', '重庆', '昆明', '贵阳', '南宁']
};

const MERCHANT_NAMES = [
  '智选数码', '风尚前线', '美味食集', '家居优选',
  '美妆花园', '运动世界', '玩具王国', '车品优选',
  '数字梦想', '潮流中心', '食光乐园', '花园绿洲'
];

const OPS_USERS = [
  '陈思雨（运营）', '王明（BD）', '林佳（运营）',
  '李凯（BD）', '赵安（运营）'
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
    LEAD_SUBMITTED: '线索已提交审核',
    OWNER_ASSIGNED: `线索已${metadata?.previousOwner ? '重新分配' : '分配'}给 ${metadata?.newOwner}`,
    STATUS_CHANGED: `状态已从 ${metadata?.previousStatus} 变更为 ${metadata?.newStatus}`,
    INFO_REQUESTED: '已请求补充信息',
    APPROVED: '线索已通过',
    REJECTED: '线索已拒绝'
  };

  return {
    id: generateId(),
    actorType,
    actorName,
    occurredAt: new Date().toISOString(),
    eventType,
    description: descriptions[eventType] || `事件：${eventType}`,
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
    '演示用户',
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
      assignedOwner || '运营团队',
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
      assignedOwner || '运营团队',
      'INFO_REQUESTED',
      {
        previousStatus: LeadStatus.SUBMITTED,
        newStatus: LeadStatus.INFO_REQUESTED,
        requestedItems: ['财务报表', '营业执照']
      }
    ));
  } else if (status === LeadStatus.APPROVED) {
    timeline.push(generateTimelineEvent(
      'APPROVED',
      ActorType.OPS_BD,
      assignedOwner || '运营团队',
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
      assignedOwner || '运营团队',
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
    contactName: hasMissingInfo ? '' : `${merchantName} 负责人`,
    contactEmail: hasMissingInfo ? '' : `contact@${merchantName.toLowerCase().replace(/\s+/g, '')}.com`,
    contactPhone: hasMissingInfo ? '' : '+1-555-' + Math.floor(Math.random() * 9000 + 1000),
    website: `https://www.${merchantName.toLowerCase().replace(/\s+/g, '')}.com`,
    status,
    assignedOwner,
    notes: '由开发工具生成，用于测试',
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
    [ActorType.CO_SELECTOR]: '演示用户',
    [ActorType.OPS_BD]: lead.assignedOwner || '运营团队',
    [ActorType.SYSTEM]: '系统',
    [ActorType.FINANCE]: '财务团队'
  };

  return generateTimelineEvent(
    eventType,
    actorType,
    actorNames[actorType] || '未知',
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
      displayName: '演示 Co-Selector',
      email: 'demo.coselector@example.com',
      role: UserRole.CO_SELECTOR
    },
    [UserRole.OPS_BD]: {
      id: 'demo-opsbd-001',
      displayName: '演示 OPS/BD',
      email: 'demo.opsbd@example.com',
      role: UserRole.OPS_BD
    },
    [UserRole.FINANCE]: {
      id: 'demo-finance-001',
      displayName: '演示财务',
      email: 'demo.finance@example.com',
      role: UserRole.FINANCE
    }
  };

  return profiles[role];
}
