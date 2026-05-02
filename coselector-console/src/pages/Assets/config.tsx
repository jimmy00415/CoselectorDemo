import { ColumnsType } from 'antd/es/table';
import { Tag, Space, Typography, Tooltip, Button, Select } from 'antd';
import {
  LinkOutlined,
  CopyOutlined,
  EyeOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { TrackingAsset } from '../../types';
import { AssetStatus } from '../../types/enums';
import { FilterConfig } from '../../components/FilterRail/FilterRail';
import { translateStatus } from '../../utils/i18n';

const { Text } = Typography;

interface AssetColumnActions {
  onDelete?: (asset: TrackingAsset) => void;
  onUsageMarkChange?: (asset: TrackingAsset, mark: 'pending' | 'used') => void;
  canDelete?: boolean;
}

/**
 * Asset table columns configuration
 */
export const getAssetColumns = ({ onDelete, onUsageMarkChange, canDelete = false }: AssetColumnActions = {}): ColumnsType<TrackingAsset> => [
  {
    title: '商品链接',
    dataIndex: 'name',
    key: 'name',
    width: 250,
    fixed: 'left',
    render: (name: string, record: TrackingAsset) => (
      <Space orientation="vertical" size={0}>
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
    title: '使用标记',
    dataIndex: 'lastUsedAt',
    key: 'lastUsedAt',
    width: 130,
    render: (date: string | undefined, record: TrackingAsset) => (
      <div onClick={event => event.stopPropagation()} onMouseDown={event => event.stopPropagation()}>
        <Select
          size="small"
          value={date ? 'used' : 'pending'}
          style={{ width: 100 }}
          aria-label="使用标记"
          options={[
            { label: '待使用', value: 'pending' },
            { label: '已使用', value: 'used' },
          ]}
          onChange={(value: 'pending' | 'used') => onUsageMarkChange?.(record, value)}
        />
      </div>
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
];
