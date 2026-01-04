import { ColumnType } from 'antd/es/table';
import { Tag, Space, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import { Lead } from '../../types';
import { LeadStatus } from '../../types/enums';
import { formatDate } from '../../utils';

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
  if (!lead.merchantName) missing.push('Merchant name');
  if (!lead.category) missing.push('Category');
  if (!lead.city) missing.push('City');
  if (!lead.region) missing.push('Region');
  if (!lead.contactName) missing.push('Contact name');
  if (!lead.contactPhone && !lead.contactEmail) missing.push('Phone or Email');
  return missing;
};

export const getLeadsColumns = (): ColumnType<Lead>[] => [
  {
    title: 'Lead Name',
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
    title: 'Category',
    dataIndex: 'category',
    key: 'category',
    width: 150,
    filters: [
      { text: 'Restaurant', value: 'Restaurant' },
      { text: 'Retail', value: 'Retail' },
      { text: 'Beauty & Spa', value: 'Beauty & Spa' },
      { text: 'Entertainment', value: 'Entertainment' },
      { text: 'Education', value: 'Education' },
      { text: 'Healthcare', value: 'Healthcare' },
      { text: 'Other', value: 'Other' },
    ],
    onFilter: (value, record) => record.category === value,
  },
  {
    title: 'City / Region',
    key: 'location',
    width: 180,
    render: (_, record: Lead) => `${record.city}, ${record.region}`,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 150,
    render: (status: LeadStatus) => (
      <Tag color={statusColors[status]}>
        {status.replace(/_/g, ' ')}
      </Tag>
    ),
    filters: [
      { text: 'Draft', value: LeadStatus.DRAFT },
      { text: 'Submitted', value: LeadStatus.SUBMITTED },
      { text: 'Under Review', value: LeadStatus.UNDER_REVIEW },
      { text: 'Info Requested', value: LeadStatus.INFO_REQUESTED },
      { text: 'Approved', value: LeadStatus.APPROVED },
      { text: 'Rejected', value: LeadStatus.REJECTED },
      { text: 'Resubmitted', value: LeadStatus.RESUBMITTED },
    ],
    onFilter: (value, record) => record.status === value,
  },
  {
    title: 'Assigned Owner',
    dataIndex: 'assignedOwner',
    key: 'assignedOwner',
    width: 150,
    render: (owner?: string) => owner || <span style={{ color: '#999' }}>Unassigned</span>,
  },
  {
    title: 'Last Updated',
    dataIndex: 'lastUpdatedAt',
    key: 'lastUpdatedAt',
    width: 180,
    render: (date: string) => formatDate(date),
    sorter: (a, b) => new Date(a.lastUpdatedAt).getTime() - new Date(b.lastUpdatedAt).getTime(),
    defaultSortOrder: 'descend',
  },
  {
    title: 'Next Required Info',
    key: 'nextRequiredInfo',
    width: 200,
    render: (_, record: Lead) => {
      const missing = getMissingFields(record);
      
      if (missing.length === 0) {
        return <Tag color="success">Complete</Tag>;
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
            {missing.length} items missing
          </Tag>
        </Tooltip>
      );
    },
  },
  {
    title: 'Actions',
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
    { label: 'All Statuses', value: 'all' },
    { label: 'Draft', value: LeadStatus.DRAFT },
    { label: 'Submitted', value: LeadStatus.SUBMITTED },
    { label: 'Under Review', value: LeadStatus.UNDER_REVIEW },
    { label: 'Info Requested', value: LeadStatus.INFO_REQUESTED },
    { label: 'Approved', value: LeadStatus.APPROVED },
    { label: 'Rejected', value: LeadStatus.REJECTED },
    { label: 'Resubmitted', value: LeadStatus.RESUBMITTED },
  ],
  category: [
    { label: 'All Categories', value: 'all' },
    { label: 'Restaurant', value: 'Restaurant' },
    { label: 'Retail', value: 'Retail' },
    { label: 'Beauty & Spa', value: 'Beauty & Spa' },
    { label: 'Entertainment', value: 'Entertainment' },
    { label: 'Education', value: 'Education' },
    { label: 'Healthcare', value: 'Healthcare' },
    { label: 'Other', value: 'Other' },
  ],
  region: [
    { label: 'All Regions', value: 'all' },
    { label: 'Beijing', value: 'Beijing' },
    { label: 'Shanghai', value: 'Shanghai' },
    { label: 'Guangdong', value: 'Guangdong' },
    { label: 'Zhejiang', value: 'Zhejiang' },
    { label: 'Jiangsu', value: 'Jiangsu' },
    { label: 'Sichuan', value: 'Sichuan' },
  ],
  ownerAssigned: [
    { label: 'All', value: 'all' },
    { label: 'Assigned', value: 'assigned' },
    { label: 'Unassigned', value: 'unassigned' },
  ],
  missingInfo: [
    { label: 'All', value: 'all' },
    { label: 'Has Missing Info', value: 'missing' },
    { label: 'Complete', value: 'complete' },
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
  if (missing.length === 0) return 'All required information is complete';
  return `Missing: ${missing.join(', ')}`;
};
