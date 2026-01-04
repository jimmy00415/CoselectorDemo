import React from 'react';
import { Tag, Button, Space, Tooltip, Typography } from 'antd';
import { EditOutlined, LinkOutlined, CopyOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { ContentItem } from '../../types';
import { ContentPlatform } from '../../types/enums';
import type { FilterConfig } from '../../components/FilterRail/FilterRail';
import dayjs from 'dayjs';

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
    [ContentPlatform.DOUYIN]: { color: 'black', text: 'Douyin' },
    [ContentPlatform.XIAOHONGSHU]: { color: 'red', text: 'Xiaohongshu' },
    [ContentPlatform.WECHAT]: { color: 'green', text: 'WeChat' },
    [ContentPlatform.WEIBO]: { color: 'orange', text: 'Weibo' },
    [ContentPlatform.BILIBILI]: { color: 'cyan', text: 'Bilibili' },
    [ContentPlatform.KUAISHOU]: { color: 'orange', text: 'Kuaishou' },
    [ContentPlatform.OTHER]: { color: 'default', text: 'Other' },
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
    title: 'Title',
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
    title: 'Platform',
    dataIndex: 'platform',
    key: 'platform',
    width: 120,
    render: (platform: ContentPlatform) => {
      const config = getPlatformConfig(platform);
      return <Tag color={config.color}>{config.text}</Tag>;
    },
  },
  {
    title: 'Bound Assets',
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
            <Tooltip title="Click to manage bindings">
              <Tag color="blue" style={{ cursor: 'pointer' }}>
                {count} asset{count !== 1 ? 's' : ''}
              </Tag>
            </Tooltip>
          ) : (
            <Tooltip title="Not trackable until assets are bound">
              <Tag icon={<ExclamationCircleOutlined />} color="warning">
                No assets
              </Tag>
            </Tooltip>
          )}
        </Space>
      );
    },
  },
  {
    title: 'Views',
    dataIndex: 'viewCount',
    key: 'viewCount',
    width: 100,
    align: 'right',
    sorter: (a, b) => (a.viewCount || 0) - (b.viewCount || 0),
    render: (count: number | undefined) => <Text>{(count || 0).toLocaleString()}</Text>,
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
    render: (count: number, record: ContentItem) => {
      const rate = record.clickCount > 0 
        ? ((count / record.clickCount) * 100).toFixed(2)
        : '0.00';
      return (
        <div>
          <div><Text strong>{count.toLocaleString()}</Text></div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            CVR: {rate}%
          </Text>
        </div>
      );
    },
  },
  {
    title: 'Est. Earnings',
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
    title: 'Publish Date',
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
    title: 'Actions',
    key: 'actions',
    width: 180,
    fixed: 'right',
    render: (_, record: ContentItem) => (
      <Space size="small">
        <Tooltip title="Edit content">
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
        <Tooltip title="Bind assets">
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
        <Tooltip title="Duplicate">
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
    label: 'Platform',
    type: 'multiSelect',
    options: [
      { label: 'Douyin', value: ContentPlatform.DOUYIN },
      { label: 'Xiaohongshu', value: ContentPlatform.XIAOHONGSHU },
      { label: 'WeChat', value: ContentPlatform.WECHAT },
      { label: 'Weibo', value: ContentPlatform.WEIBO },
      { label: 'Bilibili', value: ContentPlatform.BILIBILI },
      { label: 'Kuaishou', value: ContentPlatform.KUAISHOU },
      { label: 'Other', value: ContentPlatform.OTHER },
    ],
  },
  {
    key: 'hasBoundAssets',
    label: 'Has Bound Assets',
    type: 'select',
    options: [
      { label: 'Yes', value: true },
      { label: 'No', value: false },
    ],
  },
  {
    key: 'publishDateRange',
    label: 'Publish Date Range',
    type: 'dateRange',
  },
];
