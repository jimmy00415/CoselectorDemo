import React, { useState } from 'react';
import {
  Descriptions,
  Tag,
  Space,
  Button,
  Input,
  message,
  Card,
  Row,
  Col,
  Statistic,
  List,
  Empty,
  Alert,
  Typography,
} from 'antd';
import {
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  LinkOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { ContentItem, TrackingAsset } from '../../types';
import { ContentPlatform } from '../../types/enums';
import { Permission } from '../../services/permissions';
import { usePermission } from '../../hooks/usePermission';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text } = Typography;

interface ContentDetailViewProps {
  content: ContentItem;
  allAssets: TrackingAsset[];
  onUpdate: (updates: Partial<ContentItem>) => Promise<void>;
  onBindAssets: () => void;
}

/**
 * Content Detail View
 * 
 * Per PRD §7.3.3:
 * - Funnel + trends
 * - Bound assets (manage bindings)
 * - Conversions table (drilldown)
 * - Earnings trace (drawer)
 * - Empty State: "Not trackable until assets are bound" banner
 */
const ContentDetailView: React.FC<ContentDetailViewProps> = ({
  content,
  allAssets,
  onUpdate,
  onBindAssets,
}) => {
  const { can } = usePermission();
  const [editing, setEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    title: content.title,
    url: content.url,
    notes: content.notes,
  });

  // Get bound assets
  const boundAssets = allAssets.filter(asset =>
    content.boundAssetIds?.includes(asset.id)
  );
  const hasNoBoundAssets = boundAssets.length === 0;

  const handleSave = async () => {
    try {
      await onUpdate(editValues);
      setEditing(false);
      message.success('Content updated');
    } catch (error) {
      message.error('Failed to update content');
    }
  };

  const handleCancel = () => {
    setEditValues({
      title: content.title,
      url: content.url,
      notes: content.notes,
    });
    setEditing(false);
  };

  const getPlatformColor = (platform: ContentPlatform) => {
    const colors: Record<ContentPlatform, string> = {
      [ContentPlatform.DOUYIN]: 'black',
      [ContentPlatform.XIAOHONGSHU]: 'red',
      [ContentPlatform.WECHAT]: 'green',
      [ContentPlatform.WEIBO]: 'orange',
      [ContentPlatform.BILIBILI]: 'cyan',
      [ContentPlatform.KUAISHOU]: 'orange',
      [ContentPlatform.OTHER]: 'default',
    };
    return colors[platform];
  };

  // Calculate conversion rate
  const conversionRate = content.clickCount > 0
    ? ((content.conversionCount / content.clickCount) * 100).toFixed(2)
    : '0.00';

  const clickThroughRate = (content.viewCount || 0) > 0
    ? ((content.clickCount / (content.viewCount || 1)) * 100).toFixed(2)
    : '0.00';

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* No Bound Assets Warning - Per PRD §7.3.3 Empty State */}
      {hasNoBoundAssets && (
        <Alert
          message="Not trackable until assets are bound"
          description="This content has no tracking assets bound to it. Bind assets to start tracking clicks and conversions."
          type="warning"
          icon={<ExclamationCircleOutlined />}
          action={
            <Button
              size="small"
              type="primary"
              onClick={onBindAssets}
              disabled={!can(Permission.CONTENT_BIND_ASSET)}
            >
              Bind Now
            </Button>
          }
          showIcon
        />
      )}

      {/* Edit/Save Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {editing ? (
          <Space>
            <Button icon={<CloseOutlined />} onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
              Save
            </Button>
          </Space>
        ) : (
          <Button
            icon={<EditOutlined />}
            onClick={() => setEditing(true)}
            disabled={!can(Permission.CONTENT_EDIT)}
          >
            Edit
          </Button>
        )}
      </div>

      {/* Basic Information */}
      <Card title="Content Information" size="small">
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="ID">
            {content.id}
          </Descriptions.Item>
          <Descriptions.Item label="Title">
            {editing ? (
              <Input
                value={editValues.title}
                onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
                placeholder="Content title"
              />
            ) : (
              content.title
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Platform">
            <Tag color={getPlatformColor(content.platform)}>
              {content.platform}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="URL">
            {editing ? (
              <Input
                value={editValues.url}
                onChange={(e) => setEditValues({ ...editValues, url: e.target.value })}
                placeholder="https://..."
              />
            ) : (
              content.url ? (
                <a href={content.url} target="_blank" rel="noopener noreferrer">
                  {content.url}
                </a>
              ) : (
                <Text type="secondary">-</Text>
              )
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Publish Date">
            {content.publishDate
              ? dayjs(content.publishDate).format('YYYY-MM-DD HH:mm')
              : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {dayjs(content.createdAt).format('YYYY-MM-DD HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="Notes">
            {editing ? (
              <TextArea
                value={editValues.notes}
                onChange={(e) => setEditValues({ ...editValues, notes: e.target.value })}
                rows={3}
                placeholder="Optional notes"
              />
            ) : (
              content.notes || <Text type="secondary">-</Text>
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Performance Metrics - Funnel */}
      <Card title="Performance Funnel" size="small">
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="Views"
              value={content.viewCount || 0}
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Clicks"
              value={content.clickCount}
              suffix={
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  ({clickThroughRate}%)
                </Text>
              }
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Conversions"
              value={content.conversionCount}
              suffix={
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  ({conversionRate}%)
                </Text>
              }
              valueStyle={{ color: '#cf1322' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Est. Earnings"
              value={content.estimatedEarnings || 0}
              prefix="¥"
              precision={2}
            />
          </Col>
        </Row>
      </Card>

      {/* Bound Assets */}
      <Card
        title={
          <Space>
            <span>Bound Assets ({boundAssets.length})</span>
          </Space>
        }
        size="small"
        extra={
          <Button
            type="link"
            size="small"
            icon={<LinkOutlined />}
            onClick={onBindAssets}
            disabled={!can(Permission.CONTENT_BIND_ASSET)}
          >
            Manage Bindings
          </Button>
        }
      >
        {boundAssets.length === 0 ? (
          <Empty
            description="No assets bound"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            dataSource={boundAssets}
            renderItem={(asset) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <Space>
                      <span>{asset.name}</span>
                      <Tag color="blue">{asset.channelTag}</Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size="small">
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {asset.assetValue}
                      </Text>
                      <Space>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {asset.clickCount} clicks
                        </Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {asset.conversionCount} conversions
                        </Text>
                      </Space>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </Space>
  );
};

export default ContentDetailView;
