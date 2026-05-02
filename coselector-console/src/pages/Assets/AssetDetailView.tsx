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
import { AssetStatus } from '../../types/enums';
import { Permission } from '../../services/permissions';
import { usePermission } from '../../hooks/usePermission';

const { Title, Text } = Typography;

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('zh-CN', { hour12: false });

interface AssetDetailViewProps {
  asset: TrackingAsset;
  onUpdate: (updates: Partial<TrackingAsset>) => Promise<void>;
}

/**
 * Product link detail view
 * Shows product information, attribution link, and QR code tools.
 */
const AssetDetailView: React.FC<AssetDetailViewProps> = ({
  asset,
  onUpdate,
}) => {
  const { can } = usePermission();
  const [editing, setEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    name: asset.name,
    status: asset.status,
  });
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(asset.assetValue);
    message.success('链接已复制到剪贴板');
  };

  const handleGenerateQR = async () => {
    try {
      const url = await QRCode.toDataURL(asset.assetValue, {
        width: 300,
        margin: 2,
      });
      setQrCodeUrl(url);
    } catch (error) {
      message.error('二维码生成失败');
    }
  };

  const handleDownloadQR = () => {
    if (!qrCodeUrl) return;
    const a = document.createElement('a');
    a.href = qrCodeUrl;
    a.download = `qr-${asset.id}.png`;
    a.click();
    message.success('二维码已下载');
  };

  const handleSave = async () => {
    try {
      await onUpdate(editValues);
      setEditing(false);
    } catch (error) {
      message.error('商品信息更新失败');
    }
  };

  const handleCancel = () => {
    setEditValues({
      name: asset.name,
      status: asset.status,
    });
    setEditing(false);
  };

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
              编辑
            </Button>
            <Button icon={<CopyOutlined />} onClick={handleCopyLink}>
              复制链接
            </Button>
            <Button icon={<QrcodeOutlined />} onClick={handleGenerateQR}>
              生成二维码
            </Button>
          </>
        ) : (
          <>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
              保存
            </Button>
            <Button icon={<CloseOutlined />} onClick={handleCancel}>
              取消
            </Button>
          </>
        )}
      </Space>

      {/* Product Info */}
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="链接编号">
          <Text code copyable>
            {asset.id}
          </Text>
        </Descriptions.Item>

        <Descriptions.Item label="商品名称">
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

        <Descriptions.Item label="状态">
          {editing ? (
            <Select
              value={editValues.status}
              onChange={(value) => setEditValues({ ...editValues, status: value })}
              style={{ width: 120 }}
            >
              <Select.Option value={AssetStatus.ACTIVE}>启用</Select.Option>
              <Select.Option value={AssetStatus.DISABLED}>失效</Select.Option>
            </Select>
          ) : (
            <Tag color={asset.status === AssetStatus.ACTIVE ? 'success' : 'default'}>
              {asset.status === AssetStatus.ACTIVE ? '启用' : '失效'}
            </Tag>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="商品链接">
          <Text code copyable style={{ fontSize: 12 }}>
            {asset.assetValue}
          </Text>
        </Descriptions.Item>

        <Descriptions.Item label="创建时间">
          {formatDateTime(asset.createdAt)}
        </Descriptions.Item>

        <Descriptions.Item label="最近使用">
          {asset.lastUsedAt ? formatDateTime(asset.lastUsedAt) : '从未使用'}
        </Descriptions.Item>

        {asset.expiresAt && (
          <Descriptions.Item label="过期时间">
            {formatDateTime(asset.expiresAt)}
          </Descriptions.Item>
        )}
      </Descriptions>

      <Divider />

      <Title level={5}>关联 SPU</Title>
      <Card>
        {asset.boundContentIds.length > 0 ? (
          <Space orientation="vertical">
            {asset.boundContentIds.map((id) => (
              <Tag key={id} color="green">
                {id}
              </Tag>
            ))}
          </Space>
        ) : (
          <Text type="secondary">此商品链接尚未关联 SPU</Text>
        )}
      </Card>

      {/* QR Code Display */}
      {qrCodeUrl && (
        <>
          <Divider />
          <Title level={5}>二维码</Title>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <img src={qrCodeUrl} alt="二维码" style={{ maxWidth: 300 }} />
              <div style={{ marginTop: 16 }}>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={handleDownloadQR}
                >
                  下载二维码
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
