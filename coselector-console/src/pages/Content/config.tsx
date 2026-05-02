import React from 'react';
import { Tag, Button, Space, Tooltip, Typography } from 'antd';
import { EditOutlined, LinkOutlined, CopyOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { ContentItem } from '../../types';
import { ContentPlatform } from '../../types/enums';
import type { FilterConfig } from '../../components/FilterRail/FilterRail';
import dayjs from 'dayjs';
import { translatePlatform } from '../../utils/i18n';

const { Text } = Typography;

interface ColumnConfig {
  onEdit: (content: ContentItem) => void;
  onBind: (content: ContentItem) => void;
  onDuplicate: (content: ContentItem) => void;
  canEdit: boolean;
  canBind: boolean;
}

/**
 * Get platform display config
 */
const getPlatformConfig = (platform: ContentPlatform) => {
  const configs = {
    [ContentPlatform.DOUYIN]: { color: 'black', text: '抖音' },
    [ContentPlatform.XIAOHONGSHU]: { color: 'red', text: '小红书' },
    [ContentPlatform.WECHAT]: { color: 'green', text: '微信' },
    [ContentPlatform.WEIBO]: { color: 'orange', text: '微博' },
    [ContentPlatform.BILIBILI]: { color: 'cyan', text: '哔哩哔哩' },
    [ContentPlatform.KUAISHOU]: { color: 'orange', text: '快手' },
    [ContentPlatform.OTHER]: { color: 'default', text: '其他' },
  };
  return configs[platform];
};

/**
 * Content table columns configuration
 */
export const getContentColumns = ({
  onEdit,
  onBind,
  onDuplicate,
  canEdit,
  canBind,
}: ColumnConfig): ColumnsType<ContentItem> => [
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title',
    width: 250,
    fixed: 'left',
    render: (title: string, record: ContentItem) => (
      <div>
        <div style={{ fontWeight: 500 }}>{title}</div>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          ID: {record.id}
        </Text>
      </div>
    ),
  },
  {
    title: '平台',
    dataIndex: 'platform',
    key: 'platform',
    width: 120,
    render: (platform: ContentPlatform) => {
      const config = getPlatformConfig(platform);
      return <Tag color={config.color}>{config.text}</Tag>;
    },
  },
  {
    title: '绑定资产',
    dataIndex: 'boundAssetIds',
    key: 'boundAssets',
    width: 140,
    align: 'center',
    render: (boundAssetIds: string[] | undefined, _record: ContentItem) => {
      const count = boundAssetIds?.length || 0;
      const hasAssets = count > 0;
      
      return (
        <Space>
          {hasAssets ? (
            <Tooltip title="点击管理绑定">
              <Tag color="blue" style={{ cursor: 'pointer' }}>
                {count} 个资产
              </Tag>
            </Tooltip>
          ) : (
            <Tooltip title="绑定资产后才能追踪">
              <Tag icon={<ExclamationCircleOutlined />} color="warning">
                未绑定资产
              </Tag>
            </Tooltip>
          )}
        </Space>
      );
    },
  },
  {
    title: '观看',
    dataIndex: 'viewCount',
    key: 'viewCount',
    width: 100,
    align: 'right',
    sorter: (a, b) => (a.viewCount || 0) - (b.viewCount || 0),
    render: (count: number | undefined) => <Text>{(count || 0).toLocaleString()}</Text>,
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
    render: (count: number, record: ContentItem) => {
      const rate = record.clickCount > 0 
        ? ((count / record.clickCount) * 100).toFixed(2)
        : '0.00';
      return (
        <div>
          <div><Text strong>{count.toLocaleString()}</Text></div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            转化率：{rate}%
          </Text>
        </div>
      );
    },
  },
  {
    title: '预估收益',
    dataIndex: 'estimatedEarnings',
    key: 'estimatedEarnings',
    width: 120,
    align: 'right',
    sorter: (a, b) => (a.estimatedEarnings || 0) - (b.estimatedEarnings || 0),
    render: (earnings: number | undefined) => (
      <Text>¥{(earnings || 0).toLocaleString()}</Text>
    ),
  },
  {
    title: '发布日期',
    dataIndex: 'publishDate',
    key: 'publishDate',
    width: 120,
    sorter: (a, b) => {
      const dateA = a.publishDate ? new Date(a.publishDate).getTime() : 0;
      const dateB = b.publishDate ? new Date(b.publishDate).getTime() : 0;
      return dateA - dateB;
    },
    render: (date: string | undefined) => {
      if (!date) return <Text type="secondary">-</Text>;
      return <Text>{dayjs(date).format('YYYY-MM-DD')}</Text>;
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    fixed: 'right',
    render: (_, record: ContentItem) => (
      <Space size="small">
        <Tooltip title="编辑内容">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(record);
            }}
            disabled={!canEdit}
          />
        </Tooltip>
        <Tooltip title="绑定资产">
          <Button
            type="text"
            size="small"
            icon={<LinkOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onBind(record);
            }}
            disabled={!canBind}
          />
        </Tooltip>
        <Tooltip title="复制内容">
          <Button
            type="text"
            size="small"
            icon={<CopyOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(record);
            }}
            disabled={!canEdit}
          />
        </Tooltip>
      </Space>
    ),
  },
];

/**
 * Content filter configurations
 */
export const getContentFilters = (): FilterConfig[] => [
  {
    key: 'platform',
    label: '平台',
    type: 'multiSelect',
    options: [
      { label: translatePlatform(ContentPlatform.DOUYIN), value: ContentPlatform.DOUYIN },
      { label: translatePlatform(ContentPlatform.XIAOHONGSHU), value: ContentPlatform.XIAOHONGSHU },
      { label: translatePlatform(ContentPlatform.WECHAT), value: ContentPlatform.WECHAT },
      { label: translatePlatform(ContentPlatform.WEIBO), value: ContentPlatform.WEIBO },
      { label: translatePlatform(ContentPlatform.BILIBILI), value: ContentPlatform.BILIBILI },
      { label: translatePlatform(ContentPlatform.KUAISHOU), value: ContentPlatform.KUAISHOU },
      { label: translatePlatform(ContentPlatform.OTHER), value: ContentPlatform.OTHER },
    ],
  },
  {
    key: 'hasBoundAssets',
    label: '是否绑定资产',
    type: 'select',
    options: [
      { label: '是', value: true },
      { label: '否', value: false },
    ],
  },
  {
    key: 'publishDateRange',
    label: '发布日期范围',
    type: 'dateRange',
  },
];
