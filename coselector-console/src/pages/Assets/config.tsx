import { ColumnsType } from 'antd/es/table';
import { Tag, Space, Typography, Tooltip, Button } from 'antd';
import {
  LinkOutlined,
  CopyOutlined,
  EyeOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { TrackingAsset } from '../../types';
import { AssetStatus } from '../../types/enums';
import { FilterConfig } from '../../components/FilterRail/FilterRail';
import { translateChannel, translateStatus } from '../../utils/i18n';
import { PRODUCT_LINK_ENTRIES } from './ProductLinkCreator';

const { Text } = Typography;

interface AssetColumnActions {
  onDelete?: (asset: TrackingAsset) => void;
  canDelete?: boolean;
}

/**
 * Asset table columns configuration
 */
export const getAssetColumns = ({ onDelete, canDelete = false }: AssetColumnActions = {}): ColumnsType<TrackingAsset> => [
  {
    title: '商品链接',
    dataIndex: 'name',
    key: 'name',
    width: 250,
    fixed: 'left',
    render: (name: string, record: TrackingAsset) => (
      <Space direction="vertical" size={0}>
        <Space>
          <LinkOutlined />
          <Text strong>{name}</Text>
        </Space>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {record.id}
        </Text>
      </Space>
    ),
  },
  {
    title: '入口',
    dataIndex: 'channelTag',
    key: 'channelTag',
    width: 120,
    render: (tag: string) => <Tag color="blue">{translateChannel(tag)}</Tag>,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    render: (status: AssetStatus) => {
      const isActive = status === AssetStatus.ACTIVE;
      const color = isActive ? 'success' : 'default';
      const text = isActive ? '启用' : '失效';
      return <Tag color={color}>{text}</Tag>;
    },
  },
  {
    title: '点击',
    dataIndex: 'clickCount',
    key: 'clickCount',
    width: 100,
    align: 'right',
    sorter: (a, b) => a.clickCount - b.clickCount,
    render: (count: number) => <Text>{count.toLocaleString()}</Text>,
  },
  {
    title: '转化',
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
            转化率 {rate.toFixed(1)}%
          </Text>
        </Space>
      );
    },
  },
  {
    title: '绑定 SPU',
    dataIndex: 'boundContentIds',
    key: 'boundContentIds',
    width: 120,
    align: 'center',
    render: (ids: string[]) => (
      <Tooltip title={ids.length > 0 ? `已关联 ${ids.length} 个 SPU` : '未关联 SPU'}>
        <Tag>{ids.length}</Tag>
      </Tooltip>
    ),
  },
  {
    title: '最近使用',
    dataIndex: 'lastUsedAt',
    key: 'lastUsedAt',
    width: 150,
    render: (date: string) =>
      date ? (
        <Text type="secondary">{new Date(date).toLocaleString()}</Text>
      ) : (
        <Text type="secondary">从未使用</Text>
      ),
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 150,
    sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    render: (date: string) => (
      <Text type="secondary">{new Date(date).toLocaleDateString()}</Text>
    ),
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    fixed: 'right',
    render: (_, record: TrackingAsset) => (
      <Space size="small">
        <Tooltip title="复制链接">
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
        <Tooltip title="查看详情">
          <Button type="text" size="small" icon={<EyeOutlined />} />
        </Tooltip>
        <Tooltip title="删除商品链接">
          <Button
            type="text"
            size="small"
            danger
            disabled={!canDelete}
            aria-label="删除商品链接"
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(record);
            }}
          />
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
    key: 'status',
    label: '状态',
    type: 'select',
    options: [
      { label: translateStatus(AssetStatus.ACTIVE), value: AssetStatus.ACTIVE },
      { label: translateStatus(AssetStatus.DISABLED), value: AssetStatus.DISABLED },
    ],
  },
  {
    key: 'channelTag',
    label: '入口',
    type: 'select',
    options: PRODUCT_LINK_ENTRIES.map(entry => ({ label: entry.name, value: entry.name })),
  },
];
