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
import { translateAssetType, translateChannel, translateStatus } from '../../utils/i18n';

const { Text } = Typography;

/**
 * Asset table columns configuration
 */
export const getAssetColumns = (): ColumnsType<TrackingAsset> => [
  {
    title: '资产',
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
    title: '渠道',
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
      const config: Record<AssetStatus, { color: string; text: string }> = {
        [AssetStatus.ACTIVE]: { color: 'success', text: '启用' },
        [AssetStatus.DISABLED]: { color: 'default', text: '已停用' },
        [AssetStatus.EXPIRED]: { color: 'warning', text: '已过期' },
        [AssetStatus.REVOKED]: { color: 'error', text: '已撤销' },
      };
      const { color, text } = config[status];
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
    title: '绑定内容',
    dataIndex: 'boundContentIds',
    key: 'boundContentIds',
    width: 120,
    align: 'center',
    render: (ids: string[]) => (
      <Tooltip title={ids.length > 0 ? `已绑定 ${ids.length} 个内容项` : '未绑定内容'}>
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
    width: 120,
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
    label: '类型',
    type: 'select',
    options: [
      { label: translateAssetType(AssetType.SHORT_LINK), value: AssetType.SHORT_LINK },
      { label: translateAssetType(AssetType.QR_CODE), value: AssetType.QR_CODE },
      { label: translateAssetType(AssetType.INVITE_CODE), value: AssetType.INVITE_CODE },
    ],
  },
  {
    key: 'status',
    label: '状态',
    type: 'select',
    options: [
      { label: translateStatus(AssetStatus.ACTIVE), value: AssetStatus.ACTIVE },
      { label: translateStatus(AssetStatus.DISABLED), value: AssetStatus.DISABLED },
      { label: translateStatus(AssetStatus.EXPIRED), value: AssetStatus.EXPIRED },
    ],
  },
  {
    key: 'channelTag',
    label: '渠道',
    type: 'select',
    options: [
      { label: '微信', value: 'wechat' },
      { label: '抖音', value: 'douyin' },
      { label: '小红书', value: 'xiaohongshu' },
      { label: '微博', value: 'weibo' },
      { label: '其他', value: 'other' },
    ],
  },
];
