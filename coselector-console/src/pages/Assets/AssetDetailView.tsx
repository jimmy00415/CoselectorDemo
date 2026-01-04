import React, { useState } from 'react';
import {
  Descriptions,
  Tag,
  Space,
  Button,
  Input,
  Select,
  message,
  Divider,
  Typography,
  Card,
  Statistic,
  Row,
  Col,
} from 'antd';
import {
  CopyOutlined,
  QrcodeOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import QRCode from 'qrcode';
import { TrackingAsset } from '../../types';
import { AssetType, AssetStatus } from '../../types/enums';
import { Permission } from '../../services/permissions';
import { usePermission } from '../../hooks/usePermission';

const { Title, Text } = Typography;

interface AssetDetailViewProps {
  asset: TrackingAsset;
  onUpdate: (updates: Partial<TrackingAsset>) => Promise<void>;
}

/**
 * Asset Detail View
 * Shows complete asset information with inline editing
 */
const AssetDetailView: React.FC<AssetDetailViewProps> = ({
  asset,
  onUpdate,
}) => {
  const { can } = usePermission();
  const [editing, setEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    name: asset.name,
    channelTag: asset.channelTag,
    status: asset.status,
  });
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(asset.assetValue);
    message.success('Link copied to clipboard');
  };

  const handleGenerateQR = async () => {
    try {
      const url = await QRCode.toDataURL(asset.assetValue, {
        width: 300,
        margin: 2,
      });
      setQrCodeUrl(url);
    } catch (error) {
      message.error('Failed to generate QR code');
    }
  };

  const handleDownloadQR = () => {
    if (!qrCodeUrl) return;
    const a = document.createElement('a');
    a.href = qrCodeUrl;
    a.download = `qr-${asset.id}.png`;
    a.click();
    message.success('QR code downloaded');
  };

  const handleSave = async () => {
    try {
      await onUpdate(editValues);
      setEditing(false);
    } catch (error) {
      message.error('Failed to update asset');
    }
  };

  const handleCancel = () => {
    setEditValues({
      name: asset.name,
      channelTag: asset.channelTag,
      status: asset.status,
    });
    setEditing(false);
  };

  const conversionRate = asset.clickCount > 0 
    ? ((asset.conversionCount / asset.clickCount) * 100).toFixed(2)
    : '0.00';

  return (
    <div className="asset-detail-view">
      {/* Header Actions */}
      <Space style={{ marginBottom: 16 }}>
        {!editing ? (
          <>
            <Button
              icon={<EditOutlined />}
              onClick={() => setEditing(true)}
              disabled={!can(Permission.ASSET_UPDATE)}
            >
              Edit
            </Button>
            <Button icon={<CopyOutlined />} onClick={handleCopyLink}>
              Copy Link
            </Button>
            {asset.type === AssetType.QR_CODE && (
              <Button icon={<QrcodeOutlined />} onClick={handleGenerateQR}>
                Generate QR
              </Button>
            )}
          </>
        ) : (
          <>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
              Save
            </Button>
            <Button icon={<CloseOutlined />} onClick={handleCancel}>
              Cancel
            </Button>
          </>
        )}
      </Space>

      {/* Asset Info */}
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Asset ID">
          <Text code copyable>
            {asset.id}
          </Text>
        </Descriptions.Item>

        <Descriptions.Item label="Name">
          {editing ? (
            <Input
              value={editValues.name}
              onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
              maxLength={60}
            />
          ) : (
            <Text strong>{asset.name}</Text>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Type">
          <Tag color="blue">{asset.type}</Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Status">
          {editing ? (
            <Select
              value={editValues.status}
              onChange={(value) => setEditValues({ ...editValues, status: value })}
              style={{ width: 120 }}
            >
              <Select.Option value={AssetStatus.ACTIVE}>Active</Select.Option>
              <Select.Option value={AssetStatus.DISABLED}>Disabled</Select.Option>
            </Select>
          ) : (
            <Tag color={asset.status === AssetStatus.ACTIVE ? 'success' : 'default'}>
              {asset.status}
            </Tag>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Channel">
          {editing ? (
            <Select
              value={editValues.channelTag}
              onChange={(value) => setEditValues({ ...editValues, channelTag: value })}
              style={{ width: 150 }}
            >
              <Select.Option value="wechat">WeChat</Select.Option>
              <Select.Option value="douyin">Douyin</Select.Option>
              <Select.Option value="xiaohongshu">Xiaohongshu</Select.Option>
              <Select.Option value="weibo">Weibo</Select.Option>
              <Select.Option value="other">Other</Select.Option>
            </Select>
          ) : (
            <Tag>{asset.channelTag}</Tag>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Asset Value">
          <Text code copyable style={{ fontSize: 12 }}>
            {asset.assetValue}
          </Text>
        </Descriptions.Item>

        <Descriptions.Item label="Created">
          {new Date(asset.createdAt).toLocaleString()}
        </Descriptions.Item>

        <Descriptions.Item label="Last Used">
          {asset.lastUsedAt ? new Date(asset.lastUsedAt).toLocaleString() : 'Never'}
        </Descriptions.Item>

        {asset.expiresAt && (
          <Descriptions.Item label="Expires">
            {new Date(asset.expiresAt).toLocaleString()}
          </Descriptions.Item>
        )}
      </Descriptions>

      <Divider />

      {/* Performance Metrics */}
      <Title level={5}>Performance Metrics</Title>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic title="Total Clicks" value={asset.clickCount} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Conversions" value={asset.conversionCount} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Conversion Rate"
              value={conversionRate}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      {/* Bound Content */}
      <Title level={5}>Bound Content Items</Title>
      <Card>
        {asset.boundContentIds.length > 0 ? (
          <Space direction="vertical">
            {asset.boundContentIds.map((id) => (
              <Tag key={id} color="green">
                {id}
              </Tag>
            ))}
          </Space>
        ) : (
          <Text type="secondary">No content items bound to this asset</Text>
        )}
      </Card>

      {/* QR Code Display */}
      {qrCodeUrl && (
        <>
          <Divider />
          <Title level={5}>QR Code</Title>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <img src={qrCodeUrl} alt="QR Code" style={{ maxWidth: 300 }} />
              <div style={{ marginTop: 16 }}>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={handleDownloadQR}
                >
                  Download QR Code
                </Button>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default AssetDetailView;
