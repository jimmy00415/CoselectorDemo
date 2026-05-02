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
import { translateChannel, translatePlatform } from '../../utils/i18n';

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
      message.success('内容已更新');
    } catch (error) {
      message.error('内容更新失败');
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
          message="绑定资产后才能追踪"
          description="此内容尚未绑定追踪资产。绑定资产后即可开始追踪点击和转化。"
          type="warning"
          icon={<ExclamationCircleOutlined />}
          action={
            <Button
              size="small"
              type="primary"
              onClick={onBindAssets}
              disabled={!can(Permission.CONTENT_BIND_ASSET)}
            >
              立即绑定
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
              取消
            </Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
              保存
            </Button>
          </Space>
        ) : (
          <Button
            icon={<EditOutlined />}
            onClick={() => setEditing(true)}
            disabled={!can(Permission.CONTENT_EDIT)}
          >
            编辑
          </Button>
        )}
      </div>

      {/* Basic Information */}
      <Card title="内容信息" size="small">
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="ID">
            {content.id}
          </Descriptions.Item>
          <Descriptions.Item label="标题">
            {editing ? (
              <Input
                value={editValues.title}
                onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
                placeholder="内容标题"
              />
            ) : (
              content.title
            )}
          </Descriptions.Item>
          <Descriptions.Item label="平台">
            <Tag color={getPlatformColor(content.platform)}>
              {translatePlatform(content.platform)}
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
          <Descriptions.Item label="发布日期">
            {content.publishDate
              ? dayjs(content.publishDate).format('YYYY-MM-DD HH:mm')
              : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {dayjs(content.createdAt).format('YYYY-MM-DD HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="备注">
            {editing ? (
              <TextArea
                value={editValues.notes}
                onChange={(e) => setEditValues({ ...editValues, notes: e.target.value })}
                rows={3}
                placeholder="可选备注"
              />
            ) : (
              content.notes || <Text type="secondary">-</Text>
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Performance Metrics - Funnel */}
      <Card title="表现漏斗" size="small">
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="观看"
              value={content.viewCount || 0}
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="点击"
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
              title="转化"
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
              title="预估收益"
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
            <span>绑定资产（{boundAssets.length}）</span>
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
            管理绑定
          </Button>
        }
      >
        {boundAssets.length === 0 ? (
          <Empty
            description="暂无绑定资产"
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
                      <Tag color="blue">{translateChannel(asset.channelTag)}</Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size="small">
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {asset.assetValue}
                      </Text>
                      <Space>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {asset.clickCount} 次点击
                        </Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {asset.conversionCount} 次转化
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
