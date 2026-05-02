import {
  ActorType,
  AssetStatus,
  AssetType,
  ContentPlatform,
  DisputeStatus,
  EarningsState,
  KYCStatus,
  LeadReviewReason,
  LeadStatus,
  PayoutStatus,
  ReversalReason,
  TransactionSource,
  UserRole,
} from '../types/enums';

export const STATUS_TEXTS: Record<string, string> = {
  [AssetStatus.ACTIVE]: '启用',
  [AssetStatus.DISABLED]: '已停用',
  [AssetStatus.EXPIRED]: '已过期',
  [AssetStatus.REVOKED]: '已撤销',
  INACTIVE: '未启用',

  [LeadStatus.DRAFT]: '草稿',
  [LeadStatus.SUBMITTED]: '已提交',
  [LeadStatus.UNDER_REVIEW]: '审核中',
  [LeadStatus.INFO_REQUESTED]: '需补充信息',
  [LeadStatus.APPROVED]: '已通过',
  [LeadStatus.REJECTED]: '已拒绝',
  [LeadStatus.RESUBMITTED]: '已重新提交',

  [EarningsState.PENDING]: '待锁定',
  [EarningsState.LOCKED]: '已锁定',
  [EarningsState.PAYABLE]: '可提现',
  [EarningsState.PAID]: '已支付',
  [EarningsState.REVERSED]: '已冲正',

  [PayoutStatus.REQUESTED]: '已申请',
  [PayoutStatus.FAILED]: '失败',
  [PayoutStatus.CANCELLED]: '已取消',

  [DisputeStatus.OPEN]: '处理中',
  [DisputeStatus.WAITING]: '等待中',
  [DisputeStatus.WAITING_FOR_RESPONSE]: '等待回复',
  [DisputeStatus.RESOLVED]: '已解决',

  [KYCStatus.NOT_STARTED]: '未开始',
  [KYCStatus.IN_PROGRESS]: '进行中',
  [KYCStatus.VERIFIED]: '已验证',
};

export const ASSET_TYPE_TEXTS: Record<string, string> = {
  [AssetType.SHORT_LINK]: '短链接',
  [AssetType.QR_CODE]: '二维码',
  [AssetType.INVITE_CODE]: '邀请码',
  'Short Link': '短链接',
  'QR Code': '二维码',
  'Invite Code': '邀请码',
};

export const PLATFORM_TEXTS: Record<string, string> = {
  [ContentPlatform.DOUYIN]: '抖音',
  [ContentPlatform.XIAOHONGSHU]: '小红书',
  [ContentPlatform.WECHAT]: '微信',
  [ContentPlatform.WEIBO]: '微博',
  [ContentPlatform.BILIBILI]: '哔哩哔哩',
  [ContentPlatform.KUAISHOU]: '快手',
  [ContentPlatform.OTHER]: '其他',
  Douyin: '抖音',
  Xiaohongshu: '小红书',
  WeChat: '微信',
  Weibo: '微博',
  Bilibili: '哔哩哔哩',
  Kuaishou: '快手',
  Other: '其他',
};

export const CHANNEL_TEXTS: Record<string, string> = {
  wechat: '微信',
  douyin: '抖音',
  xiaohongshu: '小红书',
  weibo: '微博',
  bilibili: '哔哩哔哩',
  kuaishou: '快手',
  email: '电子邮件',
  custom: '自定义',
  WeChat: '微信',
  XHS: '小红书',
  Instagram: 'Instagram',
  TikTok: 'TikTok',
  Weibo: '微博',
  Douyin: '抖音',
  Email: '电子邮件',
  Custom: '自定义',
};

export const TRANSACTION_SOURCE_TEXTS: Record<string, string> = {
  [TransactionSource.ORDER]: '订单',
  [TransactionSource.MILESTONE]: '里程碑',
  [TransactionSource.ADJUSTMENT]: '调整',
};

export const USER_ROLE_TEXTS: Record<string, string> = {
  [UserRole.CO_SELECTOR]: '协同遴选者',
  [UserRole.OPS_BD]: '运营/BD',
  [UserRole.FINANCE]: '财务',
  AFFILIATE: '协同遴选者',
};

export const VIEW_PRESET_TEXTS: Record<string, string> = {
  OWNER: '所有者',
  OPERATOR: '运营',
  ANALYST: '分析',
  FINANCE: '财务',
};

export const ACTOR_TYPE_TEXTS: Record<string, string> = {
  [ActorType.CO_SELECTOR]: '协同遴选者',
  [ActorType.OPS]: '运营',
  [ActorType.OPS_BD]: '运营/BD',
  [ActorType.SYSTEM]: '系统',
  [ActorType.FINANCE]: '财务',
  [ActorType.ADMIN]: '管理员',
};

export const REASON_CODE_TEXTS: Record<string, string> = {
  [LeadReviewReason.HIGH_VOLUME]: '高潜力成交量',
  [LeadReviewReason.STRATEGIC_FIT]: '战略匹配',
  [LeadReviewReason.GOOD_REPUTATION]: '口碑良好',
  [LeadReviewReason.MEETS_CRITERIA]: '符合全部标准',
  [LeadReviewReason.LOW_VOLUME]: '成交量偏低',
  [LeadReviewReason.POOR_REPUTATION]: '口碑风险',
  [LeadReviewReason.INCOMPLETE_INFO]: '信息不完整',
  [LeadReviewReason.OUT_OF_SCOPE]: '不在合作范围内',
  [LeadReviewReason.MISSING_CONTACT]: '缺少联系人信息',
  [LeadReviewReason.MISSING_DOCUMENTS]: '缺少证明文件',
  [LeadReviewReason.MISSING_DOCS]: '缺少证明文件',
  [LeadReviewReason.UNCLEAR_VOLUME]: '成交量预估不清',
  [LeadReviewReason.IDENTITY_MISMATCH]: '身份信息不一致',
  [LeadReviewReason.NOT_FIT]: '不匹配',
  [LeadReviewReason.POLICY_RISK]: '政策风险',
  [LeadReviewReason.DUPLICATE_LEAD]: '重复线索',
  [LeadReviewReason.CATEGORY_MISMATCH]: '类目不匹配',
  [LeadReviewReason.OTHER]: '其他',
  CLAIMED: '已认领',
  EXPERTISE: '专业能力匹配',
  WORKLOAD: '工作量平衡',
  REGIONAL: '区域覆盖',
  INITIAL_SUBMISSION: '首次提交',
  UNDER_REVIEW: '进入审核',
  INFO_REQUESTED: '需补充信息',
  STRONG_PROFILE: '商户画像优秀',
  CONDITIONAL: '有条件通过',
  DOES_NOT_MEET_CRITERIA: '不符合标准',
  HIGH_RISK: '高风险画像',
  DUPLICATE: '重复提交',
  USER_ACTION: '用户操作',
  VERIFICATION_COMPLETE: '验证完成',

  [ReversalReason.REFUND]: '客户退款',
  [ReversalReason.DISPUTE]: '争议',
  [ReversalReason.DISPUTE_CHARGEBACK]: '争议/拒付',
  [ReversalReason.FRAUD]: '欺诈',
  [ReversalReason.FRAUD_HOLD]: '欺诈冻结',
  [ReversalReason.ORDER_VOID_CANCEL]: '订单作废/取消',
  [ReversalReason.SYSTEM_REATTRIBUTED]: '系统重新归因',
};

export const EVENT_TYPE_TEXTS: Record<string, string> = {
  Created: '已创建',
  Submitted: '已提交',
  'Under Review': '审核中',
  'Info Requested': '需补充信息',
  Approved: '已通过',
  Rejected: '已拒绝',
  Locked: '已锁定',
  Payable: '可提现',
  Paid: '已支付',
  Reversed: '已冲正',
  Requested: '已申请',
  Failed: '失败',
  Opened: '已打开',
  Waiting: '等待中',
  Resolved: '已解决',
  'Status Changed': '状态已变更',
  'Payout Requested': '提现已申请',
  'Status changed to FAILED': '状态变为失败',
  LEAD_SUBMITTED: '线索已提交',
  OWNER_ASSIGNED: '负责人已分配',
  STATUS_CHANGED: '状态已变更',
  INFO_REQUESTED: '需补充信息',
  APPROVED: '已通过',
  REJECTED: '已拒绝',
  EVIDENCE_UPLOADED: '证据已上传',
  EVIDENCE_DELETED: '证据已删除',
  MESSAGE_SENT: '消息已发送',
  RESOLUTION_ACCEPTED: '处理结果已接受',
  RESOLUTION_APPEALED: '处理结果已申诉',
};

const FREE_TEXTS: Record<string, string> = {
  'Lead created': '线索已创建',
  'Lead submitted for review': '线索已提交审核',
  'Lead accepted for review by operations team': '运营团队已接收并开始审核线索',
  'Updated information submitted, review resumed': '补充信息已提交，审核已恢复',
  'Lead resubmitted after addressing feedback': '线索已根据反馈补充后重新提交',
  'Resubmitted lead under review': '重新提交的线索正在审核中',
  'Transaction locked after lock period ended': '锁定期结束，交易已锁定',
  'Transaction marked as payable (KYC verified + threshold met)': '交易已标记为可提现（KYC 已验证且达到门槛）',
  'Payment processed successfully': '付款已成功处理',
  'Dispute submitted, waiting for operations review': '争议已提交，等待运营审核',
  'Additional evidence requested by operations team': '运营团队已要求补充证据',
  'Dispute resolved': '争议已解决',
  'Invalid transition attempted': '尝试了无效状态流转',
  'Missing required reason code': '缺少必填原因码',
  'Reason code is required for this transition': '此状态流转需要原因码',
  'Missing reversal reason': '缺少冲正原因',
  'Reason code is required for reversals': '冲正需要原因码',
  'Missing lock end date': '缺少锁定结束日期',
  'Lock end date is required for locking transition': '锁定状态流转需要锁定结束日期',
  'Missing rejection reason': '缺少拒绝原因',
  'Reason is required for payout rejection': '拒绝提现需要原因',
  'Missing resolution details': '缺少处理结果详情',
  'Resolution type and note are required for dispute resolution': '解决争议需要处理类型和说明',
  'Deleted evidence item': '已删除证据项',
  'Accepted resolution. Case closed.': '已接受处理结果，案件已关闭。',
  'Generated by Dev Tools for testing purposes': '由开发工具生成，仅用于测试',
  'Record was created': '记录已创建',
  'Record approved for processing': '记录已通过，可继续处理',
  'Status changed from Draft to Active': '状态已从草稿变为启用',
  'Current User': '当前用户',
  'Unknown User': '未知用户',
  'Unknown': '未知',
  'System': '系统',
  'System Auto-Lock': '系统自动锁定',
  'Finance Team': '财务团队',
  'OPS Team': '运营团队',
  'Demo User': '演示用户',
  'Demo Co-Selector': '演示协同遴选者',
  'Demo OPS/BD': '演示运营/BD',
  'Demo Finance': '演示财务',
  'Dev Tools': '开发工具',
};

export const CATEGORY_TEXTS: Record<string, string> = {
  Restaurant: '餐饮',
  Retail: '零售',
  'Beauty & Spa': '美妆与护理',
  Entertainment: '娱乐',
  Education: '教育',
  Healthcare: '医疗健康',
  Other: '其他',
  'Food & Beverage': '餐饮',
  'Fashion & Apparel': '服饰',
  'Beauty & Cosmetics': '美妆',
  Electronics: '电子产品',
  'Home & Living': '家居生活',
  'Health & Wellness': '健康养生',
  'Travel & Tourism': '旅游',
  'Professional Services': '专业服务',
};

export const REGION_TEXTS: Record<string, string> = {
  Beijing: '北京',
  Shanghai: '上海',
  Guangdong: '广东',
  Zhejiang: '浙江',
  Jiangsu: '江苏',
  Sichuan: '四川',
  Guangzhou: '广州',
  Shenzhen: '深圳',
  Hangzhou: '杭州',
  Chengdu: '成都',
  Chongqing: '重庆',
  Wuhan: '武汉',
  Nanjing: '南京',
  Suzhou: '苏州',
  Xiamen: '厦门',
  Other: '其他',
};

const METADATA_KEY_TEXTS: Record<string, string> = {
  previousStatus: '原状态',
  newStatus: '新状态',
  previousOwner: '原负责人',
  newOwner: '新负责人',
  requestedItems: '需补充材料',
  note: '备注',
  source: '来源',
  action: '操作',
  amount: '金额',
};

export const translate = (value?: string | null): string => {
  if (!value) return '';
  return (
    FREE_TEXTS[value] ||
    STATUS_TEXTS[value] ||
    ASSET_TYPE_TEXTS[value] ||
    PLATFORM_TEXTS[value] ||
    CHANNEL_TEXTS[value] ||
    TRANSACTION_SOURCE_TEXTS[value] ||
    USER_ROLE_TEXTS[value] ||
    VIEW_PRESET_TEXTS[value] ||
    ACTOR_TYPE_TEXTS[value] ||
    REASON_CODE_TEXTS[value] ||
    EVENT_TYPE_TEXTS[value] ||
    CATEGORY_TEXTS[value] ||
    REGION_TEXTS[value] ||
    value
  );
};

export const translateStatus = (status?: string | null): string => translate(status);
export const translateAssetType = (type?: string | null): string => translate(type);
export const translatePlatform = (platform?: string | null): string => translate(platform);
export const translateChannel = (channel?: string | null): string => translate(channel);
export const translateReasonCode = (reasonCode?: string | null): string => translate(reasonCode);
export const translateActorName = (actorName?: string | null): string => translate(actorName);
export const translateEventType = (eventType?: string | null): string => translate(eventType);
export const translateText = (text?: string | null): string => translate(text);
export const translateCategory = (category?: string | null): string => translate(category);
export const translateRegion = (region?: string | null): string => translate(region);

export const translateMetadataKey = (key: string): string => METADATA_KEY_TEXTS[key] || key;

export const translateMetadataValue = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value.map((item) => translateMetadataValue(item)).join('、');
  }
  if (typeof value === 'string') {
    return translate(value);
  }
  return String(value);
};
