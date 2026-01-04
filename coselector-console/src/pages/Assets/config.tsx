import { ColumnsType } from 'antd/es/table';
import { Tag, Space, Typography, Tooltip, Button } from 'antd';
import {
  LinkOutlined,
  QrcodeOutlined,
  MailOutlined,
  CopyOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { TrackingAsset } from '../../types';
import { AssetType, AssetStatus } from '../../types/enums';
import { FilterConfig } from '../../components/FilterRail/FilterRail';

const { Text } = Typography;

/**
 * Asset table columns configuration
 */
export const getAssetColumns = (): ColumnsType<TrackingAsset> => [
  {
    title: 'Asset',
    dataIndex: 'name',
    key: 'name',
    width: 250,
    fixed: 'left',
    render: (name: string, record: TrackingAsset) => (
      <Space direction="vertical" size={0}>
        <Space>
          {record.type === AssetType.SHORT_LINK && <LinkOutlined />}
          {record.type === AssetType.QR_CODE && <QrcodeOutlined />}
          {record.type === AssetType.INVITE_CODE && <MailOutlined />}
          <Text strong>{name}</Text>
        </Space>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {record.id}
        </Text>
      </Space>
    ),
  },
  {
    title: 'Channel',
    dataIndex: 'channelTag',
    key: 'channelTag',
    width: 120,
    render: (tag: string) => <Tag color="blue">{tag}</Tag>,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    render: (status: AssetStatus) => {
      const config: Record<AssetStatus, { color: string; text: string }> = {
        [AssetStatus.ACTIVE]: { color: 'success', text: 'Active' },
        [AssetStatus.DISABLED]: { color: 'default', text: 'Disabled' },
        [AssetStatus.EXPIRED]: { color: 'warning', text: 'Expired' },
        [AssetStatus.REVOKED]: { color: 'error', text: 'Revoked' },
      };
      const { color, text } = config[status];
      return <Tag color={color}>{text}</Tag>;
    },
  },
  {
    title: 'Clicks',
    dataIndex: 'clickCount',
    key: 'clickCount',
    width: 100,
    align: 'right',
    sorter: (a, b) => a.clickCount - b.clickCount,
    render: (count: number) => <Text>{count.toLocaleString()}</Text>,
  },
  {
    title: 'Conversions',
    dataIndex: 'conversionCount',
    key: 'conversionCount',
    width: 120,
    align: 'right',
    sorter: (a, b) => a.conversionCount - b.conversionCount,
    render: (count: number, record: TrackingAsset) => {
      const rate = record.clickCount > 0 ? (count / record.clickCount) * 100 : 0;
      return (
        <Space direction="vertical" size={0}>
          <Text>{count.toLocaleString()}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {rate.toFixed(1)}% CVR
          </Text>
        </Space>
      );
    },
  },
  {
    title: 'Content Items',
    dataIndex: 'boundContentIds',
    key: 'boundContentIds',
    width: 120,
    align: 'center',
    render: (ids: string[]) => (
      <Tooltip title={ids.length > 0 ? `${ids.length} content items bound` : 'No content bound'}>
        <Tag>{ids.length}</Tag>
      </Tooltip>
    ),
  },
  {
    title: 'Last Used',
    dataIndex: 'lastUsedAt',
    key: 'lastUsedAt',
    width: 150,
    render: (date: string) =>
      date ? (
        <Text type="secondary">{new Date(date).toLocaleString()}</Text>
      ) : (
        <Text type="secondary">Never</Text>
      ),
  },
  {
    title: 'Created',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 150,
    sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    render: (date: string) => (
      <Text type="secondary">{new Date(date).toLocaleDateString()}</Text>
    ),
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 120,
    fixed: 'right',
    render: (_, record: TrackingAsset) => (
      <Space size="small">
        <Tooltip title="Copy link">
          <Button
            type="text"
            size="small"
            icon={<CopyOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(record.assetValue);
            }}
          />
        </Tooltip>
        <Tooltip title="View details">
          <Button type="text" size="small" icon={<EyeOutlined />} />
        </Tooltip>
      </Space>
    ),
  },
];

/**
 * Asset filter configuration
 */
export const getAssetFilters = (): FilterConfig[] => [
  {
    key: 'type',
    label: 'Type',
    type: 'select',
    options: [
      { label: 'Short Link', value: AssetType.SHORT_LINK },
      { label: 'QR Code', value: AssetType.QR_CODE },
      { label: 'Invite Code', value: AssetType.INVITE_CODE },
    ],
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Active', value: AssetStatus.ACTIVE },
      { label: 'Disabled', value: AssetStatus.DISABLED },
      { label: 'Expired', value: AssetStatus.EXPIRED },
    ],
  },
  {
    key: 'channelTag',
    label: 'Channel',
    type: 'select',
    options: [
      { label: 'WeChat', value: 'wechat' },
      { label: 'Douyin', value: 'douyin' },
      { label: 'Xiaohongshu', value: 'xiaohongshu' },
      { label: 'Weibo', value: 'weibo' },
      { label: 'Other', value: 'other' },
    ],
  },
];
