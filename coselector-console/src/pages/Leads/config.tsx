import { ColumnType } from 'antd/es/table';
import { Tag, Space, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import { Lead } from '../../types';
import { LeadStatus } from '../../types/enums';
import { formatDate, translateCategory, translateRegion, translateStatus } from '../../utils';

/**
 * Table Columns Configuration for Leads List
 * Per PRD §7.4.1: Lead name, Category, City/Region, Status, Assigned owner, Last updated, Next required info
 */

// Status color mapping per status pill design
const statusColors: Record<LeadStatus, string> = {
  [LeadStatus.DRAFT]: 'default',
  [LeadStatus.SUBMITTED]: 'blue',
  [LeadStatus.UNDER_REVIEW]: 'orange',
  [LeadStatus.INFO_REQUESTED]: 'purple',
  [LeadStatus.APPROVED]: 'green',
  [LeadStatus.REJECTED]: 'red',
  [LeadStatus.RESUBMITTED]: 'cyan',
};

// Helper to calculate missing required fields
const getMissingFields = (lead: Lead): string[] => {
  const missing: string[] = [];
  if (!lead.merchantName) missing.push('商户名称');
  if (!lead.category) missing.push('类目');
  if (!lead.city) missing.push('城市');
  if (!lead.region) missing.push('区域');
  if (!lead.contactName) missing.push('联系人姓名');
  if (!lead.contactPhone && !lead.contactEmail) missing.push('电话或邮箱');
  return missing;
};

export const getLeadsColumns = (): ColumnType<Lead>[] => [
  {
    title: '线索名称',
    dataIndex: 'merchantName',
    key: 'merchantName',
    width: 250,
    fixed: 'left',
    render: (text: string, record: Lead) => (
      <Link to={`/leads/${record.id}`} style={{ fontWeight: 500 }}>
        {text}
      </Link>
    ),
    sorter: (a, b) => a.merchantName.localeCompare(b.merchantName),
  },
  {
    title: '类目',
    dataIndex: 'category',
    key: 'category',
    width: 150,
    filters: [
      { text: '餐饮', value: 'Restaurant' },
      { text: '零售', value: 'Retail' },
      { text: '美妆与护理', value: 'Beauty & Spa' },
      { text: '娱乐', value: 'Entertainment' },
      { text: '教育', value: 'Education' },
      { text: '医疗健康', value: 'Healthcare' },
      { text: '其他', value: 'Other' },
    ],
    onFilter: (value, record) => record.category === value,
    render: (category: string) => translateCategory(category),
  },
  {
    title: '城市 / 区域',
    key: 'location',
    width: 180,
    render: (_, record: Lead) => `${translateRegion(record.city)}, ${translateRegion(record.region)}`,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 150,
    render: (status: LeadStatus) => (
      <Tag color={statusColors[status]}>
        {translateStatus(status)}
      </Tag>
    ),
    filters: [
      { text: '草稿', value: LeadStatus.DRAFT },
      { text: '已提交', value: LeadStatus.SUBMITTED },
      { text: '审核中', value: LeadStatus.UNDER_REVIEW },
      { text: '需补充信息', value: LeadStatus.INFO_REQUESTED },
      { text: '已通过', value: LeadStatus.APPROVED },
      { text: '已拒绝', value: LeadStatus.REJECTED },
      { text: '已重新提交', value: LeadStatus.RESUBMITTED },
    ],
    onFilter: (value, record) => record.status === value,
  },
  {
    title: '分配负责人',
    dataIndex: 'assignedOwner',
    key: 'assignedOwner',
    width: 150,
    render: (owner?: string) => owner || <span style={{ color: '#999' }}>未分配</span>,
  },
  {
    title: '最近更新',
    dataIndex: 'lastUpdatedAt',
    key: 'lastUpdatedAt',
    width: 180,
    render: (date: string) => formatDate(date),
    sorter: (a, b) => new Date(a.lastUpdatedAt).getTime() - new Date(b.lastUpdatedAt).getTime(),
    defaultSortOrder: 'descend',
  },
  {
    title: '下一项所需信息',
    key: 'nextRequiredInfo',
    width: 200,
    render: (_, record: Lead) => {
      const missing = getMissingFields(record);
      
      if (missing.length === 0) {
        return <Tag color="success">完整</Tag>;
      }
      
      if (missing.length === 1) {
        return (
          <Tag color="warning" style={{ cursor: 'pointer' }}>
            {missing[0]}
          </Tag>
        );
      }
      
      return (
        <Tooltip title={missing.join(', ')}>
          <Tag color="warning" style={{ cursor: 'pointer' }}>
            缺少 {missing.length} 项
          </Tag>
        </Tooltip>
      );
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    fixed: 'right',
    render: () => (
      <Space>
        {/* Actions will be rendered by parent component based on permissions */}
      </Space>
    ),
  },
];

/**
 * Filter Options for Leads List
 * Per PRD §7.4.1: Status, Category, Region, Owner assigned, Missing info, Date range
 */
export const leadFilterOptions = {
  status: [
    { label: '全部状态', value: 'all' },
    { label: '草稿', value: LeadStatus.DRAFT },
    { label: '已提交', value: LeadStatus.SUBMITTED },
    { label: '审核中', value: LeadStatus.UNDER_REVIEW },
    { label: '需补充信息', value: LeadStatus.INFO_REQUESTED },
    { label: '已通过', value: LeadStatus.APPROVED },
    { label: '已拒绝', value: LeadStatus.REJECTED },
    { label: '已重新提交', value: LeadStatus.RESUBMITTED },
  ],
  category: [
    { label: '全部类目', value: 'all' },
    { label: '餐饮', value: 'Restaurant' },
    { label: '零售', value: 'Retail' },
    { label: '美妆与护理', value: 'Beauty & Spa' },
    { label: '娱乐', value: 'Entertainment' },
    { label: '教育', value: 'Education' },
    { label: '医疗健康', value: 'Healthcare' },
    { label: '其他', value: 'Other' },
  ],
  region: [
    { label: '全部区域', value: 'all' },
    { label: '北京', value: 'Beijing' },
    { label: '上海', value: 'Shanghai' },
    { label: '广东', value: 'Guangdong' },
    { label: '浙江', value: 'Zhejiang' },
    { label: '江苏', value: 'Jiangsu' },
    { label: '四川', value: 'Sichuan' },
  ],
  ownerAssigned: [
    { label: '全部', value: 'all' },
    { label: '已分配', value: 'assigned' },
    { label: '未分配', value: 'unassigned' },
  ],
  missingInfo: [
    { label: '全部', value: 'all' },
    { label: '有缺失信息', value: 'missing' },
    { label: '信息完整', value: 'complete' },
  ],
};

/**
 * Helper function to check if lead has missing required info
 */
export const hasMissingInfo = (lead: Lead): boolean => {
  return getMissingFields(lead).length > 0;
};

/**
 * Helper function to get missing fields as a formatted string
 */
export const getMissingFieldsText = (lead: Lead): string => {
  const missing = getMissingFields(lead);
  if (missing.length === 0) return '所有必填信息已完整';
  return `缺少：${missing.join('、')}`;
};
