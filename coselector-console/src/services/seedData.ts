import {
  TrackingAsset,
  ContentItem,
  Lead,
  Transaction,
  Payout,
  Notification,
  DisputeCase,
  UserProfile,
  TimelineEvent,
} from '../types';
import {
  AssetType,
  AssetStatus,
  ContentPlatform,
  LeadStatus,
  EarningsState,
  PayoutStatus,
  DisputeStatus,
  NotificationType,
  ActorType,
  TransactionSource,
  LeadReviewReason,
  ReversalReason,
  UserRole,
  KYCStatus,
} from '../types/enums';
import { generateId } from '../utils';
import dayjs from 'dayjs';

/**
 * Seed Data Generator for Co-selector Console
 * 
 * Generates realistic mock data covering all states and edge cases:
 * - 10-20 assets (mix of active/expired/pending)
 * - 10-20 content items with platform distribution
 * - 10-20 leads across all statuses
 * - 50-200 transactions covering all earnings states
 * - 5-10 payouts in various states
 * - 5-10 dispute cases
 * - 30-50 notifications
 * - 1 user profile with KYC data
 * 
 * Data is designed to demonstrate state machines and business logic
 */

// Constants for data generation
const CHINESE_NAMES = ['张伟', '李娜', '王芳', '刘洋', '陈静', '杨明', '黄丽', '赵强', '周敏', '吴刚'];
const MERCHANT_NAMES = ['美团', '饿了么', '京东', '拼多多', '淘宝', '小红书', '抖音', '快手', '滴滴', '携程', 
                        '去哪儿', '飞猪', '同程', '马蜂窝', '大众点评', '口碑', '盒马', '叮咚买菜'];
const CITIES = ['北京', '上海', '广州', '深圳', '杭州', '成都', '重庆', '西安', '武汉', '南京'];
const CHANNEL_TAGS = ['douyin', 'xiaohongshu', 'wechat', 'weibo', 'bilibili', 'kuaishou'];
const LEAD_CATEGORIES = ['餐饮', '零售', '旅游', '金融', '教育', '医疗', '娱乐', '生活服务'];

/**
 * Generate tracking assets (links, QR codes, invite codes)
 */
export function generateAssets(count: number = 15): TrackingAsset[] {
  const assets: TrackingAsset[] = [];
  const assetTypes = [AssetType.SHORT_LINK, AssetType.QR_CODE, AssetType.INVITE_CODE];
  const statuses = [AssetStatus.ACTIVE, AssetStatus.DISABLED, AssetStatus.EXPIRED, AssetStatus.REVOKED];

  for (let i = 0; i < count; i++) {
    const type = assetTypes[i % assetTypes.length];
    const status = i < count * 0.6 ? AssetStatus.ACTIVE : statuses[Math.floor(Math.random() * statuses.length)];
    const createdDate = dayjs().subtract(Math.floor(Math.random() * 180), 'day');
    const expiresDate = createdDate.add(Math.floor(Math.random() * 90) + 30, 'day');

    const assetValue = type === AssetType.SHORT_LINK 
      ? `https://co-selector.cn/${generateId().slice(0, 8)}`
      : type === AssetType.QR_CODE
      ? `QR-${generateId().slice(0, 8).toUpperCase()}`
      : `INV-${generateId().slice(0, 10).toUpperCase()}`;

    assets.push({
      id: generateId(),
      type,
      name: `${type === AssetType.SHORT_LINK ? '短链接' : type === AssetType.QR_CODE ? '二维码' : '邀请码'} ${i + 1}`,
      assetValue,
      channelTag: CHANNEL_TAGS[Math.floor(Math.random() * CHANNEL_TAGS.length)],
      status,
      createdAt: createdDate.toISOString(),
      expiresAt: status === AssetStatus.EXPIRED ? createdDate.add(30, 'day').toISOString() : expiresDate.toISOString(),
      lastUsedAt: status === AssetStatus.ACTIVE && Math.random() > 0.3 
        ? dayjs().subtract(Math.floor(Math.random() * 7), 'day').toISOString() 
        : undefined,
      clickCount: status === AssetStatus.ACTIVE ? Math.floor(Math.random() * 500) : 0,
      conversionCount: status === AssetStatus.ACTIVE ? Math.floor(Math.random() * 50) : 0,
      boundContentIds: [],
    });
  }

  return assets;
}

/**
 * Generate content items across different platforms
 */
export function generateContentItems(count: number = 15, assets: TrackingAsset[]): ContentItem[] {
  const contentItems: ContentItem[] = [];
  const platforms = [
    ContentPlatform.DOUYIN, 
    ContentPlatform.XIAOHONGSHU, 
    ContentPlatform.WECHAT, 
    ContentPlatform.WEIBO,
    ContentPlatform.BILIBILI,
  ];
  const contentTypes = ['视频', '图文', '直播', '种草笔记', '测评'];

  for (let i = 0; i < count; i++) {
    const platform = platforms[i % platforms.length];
    const publishedDate = dayjs().subtract(Math.floor(Math.random() * 90), 'day');
    const createdDate = publishedDate.subtract(Math.floor(Math.random() * 7), 'day');
    const boundAssets = assets.slice(i % 3, (i % 3) + 2).map(a => a.id);
    
    const viewCount = Math.floor(Math.random() * 50000) + 1000;
    const clickCount = Math.floor(viewCount * (0.02 + Math.random() * 0.08)); // 2-10% CTR
    const conversionCount = Math.floor(clickCount * (0.01 + Math.random() * 0.05)); // 1-6% CVR

    contentItems.push({
      id: generateId(),
      title: `${contentTypes[Math.floor(Math.random() * contentTypes.length)]} - ${MERCHANT_NAMES[Math.floor(Math.random() * MERCHANT_NAMES.length)]}推广`,
      platform,
      url: `https://${platform.toLowerCase()}.com/post/${generateId().slice(0, 8)}`,
      publishDate: publishedDate.toISOString(),
      notes: Math.random() > 0.7 ? '优质内容，表现良好' : undefined,
      boundAssetIds: boundAssets,
      viewCount,
      clickCount,
      conversionCount,
      estimatedEarnings: conversionCount * (50 + Math.random() * 200),
      createdAt: createdDate.toISOString(),
    });
  }

  return contentItems;
}

/**
 * Generate leads across all statuses with realistic distribution
 */
export function generateLeads(count: number = 18): Lead[] {
  const leads: Lead[] = [];

  // Distribution: 10% Draft, 10% Submitted, 30% Under Review, 10% Info Requested, 30% Approved, 10% Rejected
  const statusDistribution = [
    ...Array(Math.floor(count * 0.1)).fill(LeadStatus.DRAFT),
    ...Array(Math.floor(count * 0.1)).fill(LeadStatus.SUBMITTED),
    ...Array(Math.floor(count * 0.3)).fill(LeadStatus.UNDER_REVIEW),
    ...Array(Math.floor(count * 0.1)).fill(LeadStatus.INFO_REQUESTED),
    ...Array(Math.floor(count * 0.3)).fill(LeadStatus.APPROVED),
    ...Array(Math.floor(count * 0.1)).fill(LeadStatus.REJECTED),
  ];

  for (let i = 0; i < count; i++) {
    const status = statusDistribution[i] || LeadStatus.UNDER_REVIEW;
    const submittedDate = status !== LeadStatus.DRAFT 
      ? dayjs().subtract(Math.floor(Math.random() * 60), 'day')
      : null;
    const merchantName = MERCHANT_NAMES[Math.floor(Math.random() * MERCHANT_NAMES.length)];

    const timeline: TimelineEvent[] = [];
    
    // Add creation event
    timeline.push({
      id: generateId(),
      actorType: ActorType.CO_SELECTOR,
      actorName: CHINESE_NAMES[0],
      occurredAt: submittedDate ? submittedDate.subtract(1, 'day').toISOString() : dayjs().toISOString(),
      eventType: 'Created',
      description: '创建了新的lead',
    });

    // Add status-specific events
    if (status !== LeadStatus.DRAFT) {
      timeline.push({
        id: generateId(),
        actorType: ActorType.CO_SELECTOR,
        actorName: CHINESE_NAMES[0],
        occurredAt: submittedDate!.toISOString(),
        eventType: 'Submitted',
        description: 'Lead提交审核',
      });
    }

    if ([LeadStatus.UNDER_REVIEW, LeadStatus.INFO_REQUESTED, LeadStatus.APPROVED, LeadStatus.REJECTED].includes(status)) {
      timeline.push({
        id: generateId(),
        actorType: ActorType.OPS,
        actorName: CHINESE_NAMES[1],
        occurredAt: submittedDate!.add(1, 'day').toISOString(),
        eventType: 'Under Review',
        description: 'BD团队开始审核',
      });
    }

    if (status === LeadStatus.INFO_REQUESTED) {
      timeline.push({
        id: generateId(),
        actorType: ActorType.OPS,
        actorName: CHINESE_NAMES[1],
        occurredAt: submittedDate!.add(3, 'day').toISOString(),
        eventType: 'Info Requested',
        description: '需要补充商家联系方式',
        reasonCode: LeadReviewReason.MISSING_CONTACT,
      });
    }

    if (status === LeadStatus.APPROVED) {
      timeline.push({
        id: generateId(),
        actorType: ActorType.OPS,
        actorName: CHINESE_NAMES[1],
        occurredAt: submittedDate!.add(5, 'day').toISOString(),
        eventType: 'Approved',
        description: '审核通过，符合合作要求',
        reasonCode: LeadReviewReason.MEETS_CRITERIA,
      });
    }

    if (status === LeadStatus.REJECTED) {
      timeline.push({
        id: generateId(),
        actorType: ActorType.OPS,
        actorName: CHINESE_NAMES[1],
        occurredAt: submittedDate!.add(5, 'day').toISOString(),
        eventType: 'Rejected',
        description: '未通过审核，商家类目不符合',
        reasonCode: LeadReviewReason.CATEGORY_MISMATCH,
      });
    }

    leads.push({
      id: generateId(),
      merchantName,
      category: LEAD_CATEGORIES[Math.floor(Math.random() * LEAD_CATEGORIES.length)],
      city: CITIES[Math.floor(Math.random() * CITIES.length)],
      region: CITIES[Math.floor(Math.random() * CITIES.length)],
      status,
      contactName: CHINESE_NAMES[Math.floor(Math.random() * CHINESE_NAMES.length)],
      contactPhone: `138${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      contactEmail: `contact${i}@example.com`,
      website: `https://www.${merchantName.toLowerCase()}.com`,
      estimatedMonthlyVolume: `${Math.floor(Math.random() * 500) + 50}万`,
      notes: status === LeadStatus.DRAFT ? '初步接触，需要进一步了解' : '',
      submittedAt: submittedDate?.toISOString(),
      lastUpdatedAt: dayjs().toISOString(),
      assignedOwner: status !== LeadStatus.DRAFT ? CHINESE_NAMES[1] : undefined,
      timeline,
    });
  }

  return leads;
}

/**
 * Generate transactions across all earnings states
 * Critical: Must demonstrate proper state machine transitions
 */
export function generateTransactions(count: number = 120, assets: TrackingAsset[]): Transaction[] {
  const transactions: Transaction[] = [];

  // Distribution: 30% Pending, 25% Locked, 20% Payable, 20% Paid, 5% Reversed
  const stateDistribution = [
    ...Array(Math.floor(count * 0.30)).fill(EarningsState.PENDING),
    ...Array(Math.floor(count * 0.25)).fill(EarningsState.LOCKED),
    ...Array(Math.floor(count * 0.20)).fill(EarningsState.PAYABLE),
    ...Array(Math.floor(count * 0.20)).fill(EarningsState.PAID),
    ...Array(Math.floor(count * 0.05)).fill(EarningsState.REVERSED),
  ];

  for (let i = 0; i < count; i++) {
    const state = stateDistribution[i] || EarningsState.PENDING;
    const createdDate = dayjs().subtract(Math.floor(Math.random() * 120), 'day');
    const amount = Math.floor(Math.random() * 500) + 50;
    const asset = assets[Math.floor(Math.random() * assets.length)];

    // Calculate lock_end_at based on state
    let lockEndAt: string;
    if (state === EarningsState.PENDING) {
      // Pending: lock date in future (7-30 days from now)
      lockEndAt = dayjs().add(Math.floor(Math.random() * 23) + 7, 'day').toISOString();
    } else {
      // Locked/Payable/Paid/Reversed: lock date already passed
      lockEndAt = createdDate.add(30, 'day').toISOString();
    }

    const timeline: TimelineEvent[] = [];

    // Creation event
    timeline.push({
      id: generateId(),
      actorType: ActorType.SYSTEM,
      actorName: '系统',
      occurredAt: createdDate.toISOString(),
      eventType: 'Created',
      description: `交易创建，订单号：ORD-${generateId().slice(0, 10)}`,
    });

    // State transition events
    if (state !== EarningsState.PENDING) {
      timeline.push({
        id: generateId(),
        actorType: ActorType.SYSTEM,
        actorName: '系统',
        occurredAt: dayjs(lockEndAt).add(1, 'hour').toISOString(),
        eventType: 'Locked',
        description: '锁定期结束，交易已锁定',
      });
    }

    if ([EarningsState.PAYABLE, EarningsState.PAID].includes(state)) {
      timeline.push({
        id: generateId(),
        actorType: ActorType.SYSTEM,
        actorName: '系统',
        occurredAt: dayjs(lockEndAt).add(2, 'day').toISOString(),
        eventType: 'Payable',
        description: 'KYC验证通过，可提现',
      });
    }

    if (state === EarningsState.PAID) {
      timeline.push({
        id: generateId(),
        actorType: ActorType.FINANCE,
        actorName: CHINESE_NAMES[2],
        occurredAt: dayjs(lockEndAt).add(5, 'day').toISOString(),
        eventType: 'Paid',
        description: '已成功打款至银行账户',
      });
    }

    if (state === EarningsState.REVERSED) {
      const reversalReason = [
        ReversalReason.REFUND,
        ReversalReason.DISPUTE,
        ReversalReason.FRAUD,
      ][Math.floor(Math.random() * 3)];
      
      timeline.push({
        id: generateId(),
        actorType: ActorType.SYSTEM,
        actorName: '系统',
        occurredAt: createdDate.add(Math.floor(Math.random() * 20) + 5, 'day').toISOString(),
        eventType: 'Reversed',
        description: `交易已冲销：${reversalReason}`,
        reasonCode: reversalReason,
      });
    }

    transactions.push({
      id: generateId(),
      date: createdDate.format('YYYY-MM-DD'),
      source: i % 10 === 0 ? TransactionSource.ADJUSTMENT : TransactionSource.ORDER,
      referenceId: `ORD-${generateId().slice(0, 12)}`,
      amount: state === EarningsState.REVERSED ? -amount : amount,
      state,
      lockEndAt,
      ruleVersion: 'v1.2',
      commissionRate: 0.05 + Math.random() * 0.10,
      assetId: asset.id,
      channelTag: asset.channelTag,
      createdAt: createdDate.toISOString(),
      timeline,
    });
  }

  return transactions;
}

/**
 * Generate payout requests in various states
 */
export function generatePayouts(count: number = 8): Payout[] {
  const payouts: Payout[] = [];

  // Distribution across statuses

  // Distribution: 20% Requested, 20% Approved, 40% Paid, 10% Failed, 10% Rejected
  const statusDistribution = [
    ...Array(Math.floor(count * 0.2)).fill(PayoutStatus.REQUESTED),
    ...Array(Math.floor(count * 0.2)).fill(PayoutStatus.APPROVED),
    ...Array(Math.floor(count * 0.4)).fill(PayoutStatus.PAID),
    ...Array(Math.floor(count * 0.1)).fill(PayoutStatus.FAILED),
    ...Array(Math.floor(count * 0.1)).fill(PayoutStatus.REJECTED),
  ];

  for (let i = 0; i < count; i++) {
    const status = statusDistribution[i] || PayoutStatus.REQUESTED;
    const requestedDate = dayjs().subtract(Math.floor(Math.random() * 60), 'day');
    const amount = Math.floor(Math.random() * 5000) + 1000;

    const timeline: TimelineEvent[] = [];

    timeline.push({
      id: generateId(),
      actorType: ActorType.CO_SELECTOR,
      actorName: CHINESE_NAMES[0],
      occurredAt: requestedDate.toISOString(),
      eventType: 'Requested',
      description: `提现申请：¥${amount.toFixed(2)}`,
    });

    if (status !== PayoutStatus.REQUESTED) {
      if (status === PayoutStatus.REJECTED) {
        timeline.push({
          id: generateId(),
          actorType: ActorType.FINANCE,
          actorName: CHINESE_NAMES[2],
          occurredAt: requestedDate.add(1, 'day').toISOString(),
          eventType: 'Rejected',
          description: '提现被拒绝：银行信息不完整',
        });
      } else {
        timeline.push({
          id: generateId(),
          actorType: ActorType.FINANCE,
          actorName: CHINESE_NAMES[2],
          occurredAt: requestedDate.add(1, 'day').toISOString(),
          eventType: 'Approved',
          description: '财务审核通过',
        });
      }
    }

    if (status === PayoutStatus.PAID) {
      timeline.push({
        id: generateId(),
        actorType: ActorType.SYSTEM,
        actorName: '系统',
        occurredAt: requestedDate.add(3, 'day').toISOString(),
        eventType: 'Paid',
        description: '款项已成功转账',
      });
    }

    if (status === PayoutStatus.FAILED) {
      timeline.push({
        id: generateId(),
        actorType: ActorType.SYSTEM,
        actorName: '系统',
        occurredAt: requestedDate.add(3, 'day').toISOString(),
        eventType: 'Failed',
        description: '转账失败：银行账户异常',
      });
    }

    payouts.push({
      id: generateId(),
      amount,
      status,
      requestedAt: requestedDate.toISOString(),
      approvedAt: [PayoutStatus.APPROVED, PayoutStatus.PAID].includes(status) 
        ? requestedDate.add(1, 'day').toISOString() 
        : undefined,
      paidAt: status === PayoutStatus.PAID 
        ? requestedDate.add(3, 'day').toISOString() 
        : undefined,
      bankAccount: {
        bankName: '中国工商银行',
        accountNumber: '6222 **** **** 1234',
        accountHolder: CHINESE_NAMES[0],
      },
      transactionIds: [],
      timeline,
    });
  }

  return payouts;
}

/**
 * Generate dispute cases
 */
export function generateDisputeCases(count: number = 7, transactions: Transaction[]): DisputeCase[] {
  const cases: DisputeCase[] = [];
  const statuses = [DisputeStatus.OPEN, DisputeStatus.WAITING, DisputeStatus.RESOLVED];
  const reasons = ['订单被取消', '商家拒绝结算', '佣金计算错误', '未收到商品', '服务质量问题'];

  for (let i = 0; i < count; i++) {
    const status = statuses[i % statuses.length];
    const createdDate = dayjs().subtract(Math.floor(Math.random() * 30), 'day');
    const transaction = transactions[Math.floor(Math.random() * Math.min(20, transactions.length))];

    const timeline: TimelineEvent[] = [];

    timeline.push({
      id: generateId(),
      actorType: ActorType.CO_SELECTOR,
      actorName: CHINESE_NAMES[0],
      occurredAt: createdDate.toISOString(),
      eventType: 'Opened',
      description: `提交争议：${reasons[i % reasons.length]}`,
    });

    if (status !== DisputeStatus.OPEN) {
      timeline.push({
        id: generateId(),
        actorType: ActorType.SYSTEM,
        actorName: '系统',
        occurredAt: createdDate.add(1, 'hour').toISOString(),
        eventType: 'Waiting',
        description: '等待运营团队审核',
      });
    }

    if (status === DisputeStatus.RESOLVED) {
      const outcomes = ['WON', 'LOST', 'ADJUSTED'];
      const outcome = outcomes[i % outcomes.length];
      timeline.push({
        id: generateId(),
        actorType: ActorType.OPS,
        actorName: CHINESE_NAMES[1],
        occurredAt: createdDate.add(5, 'day').toISOString(),
        eventType: 'Resolved',
        description: outcome === 'WON' 
          ? '争议解决：支持用户' 
          : outcome === 'LOST'
          ? '争议解决：维持原判'
          : '争议解决：部分调整',
      });
    }

    cases.push({
      id: generateId(),
      transactionId: transaction.id,
      status,
      reason: reasons[i % reasons.length],
      description: `关于订单 ${transaction.referenceId} 的争议`,
      openedAt: createdDate.toISOString(),
      resolvedAt: status === DisputeStatus.RESOLVED 
        ? createdDate.add(5, 'day').toISOString() 
        : undefined,
      evidence: [],
      timeline,
    });
  }

  return cases;
}

/**
 * Generate notifications
 */
export function generateNotifications(count: number = 40): Notification[] {
  const notifications: Notification[] = [];
  const types = [
    NotificationType.LEAD_STATUS_CHANGED,
    NotificationType.TRANSACTION_LOCKED,
    NotificationType.PAYOUT_APPROVED,
    NotificationType.DISPUTE_UPDATE,
    NotificationType.KYC_REQUIRED,
  ];
  const messages = [
    'Lead审核通过',
    '交易已锁定',
    '提现申请已批准',
    '争议案件有新回复',
    'KYC验证需要更新',
  ];

  for (let i = 0; i < count; i++) {
    const type = types[i % types.length];
    const createdDate = dayjs().subtract(Math.floor(Math.random() * 30), 'day');

    notifications.push({
      id: generateId(),
      type,
      title: messages[i % messages.length],
      message: `详情: ${messages[i % messages.length]}`,
      createdAt: createdDate.toISOString(),
      read: Math.random() > 0.3,
      actionUrl: `/transactions`,
    });
  }

  return notifications.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Generate user profile
 */
export function generateUserProfile(): UserProfile {
  return {
    id: generateId(),
    role: UserRole.CO_SELECTOR,
    displayName: CHINESE_NAMES[0],
    email: 'user@example.com',
    phone: '13800138000',
    kycStatus: KYCStatus.VERIFIED,
    kycSubmittedAt: dayjs().subtract(60, 'day').toISOString(),
    kycApprovedAt: dayjs().subtract(50, 'day').toISOString(),
    bankAccount: {
      bankName: '中国工商银行',
      accountNumber: '6222 **** **** 1234',
      accountHolder: CHINESE_NAMES[0],
      verified: true,
      verifiedAt: dayjs().subtract(45, 'day').toISOString(),
    },
    notificationPreferences: {
      emailEnabled: true,
      smsEnabled: true,
      criticalNotifications: {
        kycRejected: true,
        accountFrozen: true,
        disputeDeadline: true,
        payoutFailed: true,
      },
      importantNotifications: {
        transactionLocked: true,
        payoutApproved: true,
        leadApproved: true,
        leadRejected: true,
      },
      informationalNotifications: {
        policyUpdates: false,
        rulebookVersion: false,
        monthlyStatement: true,
      },
    },
    createdAt: dayjs().subtract(180, 'day').toISOString(),
    lastLoginAt: dayjs().toISOString(),
  };
}

/**
 * Generate complete seed dataset
 */
export function generateSeedData() {
  console.log('🌱 Generating seed data...');

  const assets = generateAssets(15);
  const contentItems = generateContentItems(15, assets);
  const leads = generateLeads(18);
  const transactions = generateTransactions(120, assets);
  const payouts = generatePayouts(8);
  const disputeCases = generateDisputeCases(7, transactions);
  const notifications = generateNotifications(40);
  const userProfile = generateUserProfile();

  console.log('✅ Seed data generated:');
  console.log(`   - ${assets.length} assets`);
  console.log(`   - ${contentItems.length} content items`);
  console.log(`   - ${leads.length} leads`);
  console.log(`   - ${transactions.length} transactions`);
  console.log(`   - ${payouts.length} payouts`);
  console.log(`   - ${disputeCases.length} dispute cases`);
  console.log(`   - ${notifications.length} notifications`);
  console.log(`   - 1 user profile`);

  return {
    assets,
    contentItems,
    leads,
    transactions,
    payouts,
    disputeCases,
    notifications,
    userProfile,
  };
}
