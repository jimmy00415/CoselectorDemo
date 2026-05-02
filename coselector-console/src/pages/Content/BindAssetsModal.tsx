import React, { useState, useEffect } from 'react';
import { Modal, Input, List, Checkbox, Button, Space, Empty, Tag, Divider, message } from 'antd';
import { SearchOutlined, PlusOutlined, LinkOutlined } from '@ant-design/icons';
import { ContentItem, TrackingAsset } from '../../types';
import { AssetType } from '../../types/enums';
import { translateChannel } from '../../utils/i18n';

const { Search } = Input;

interface BindAssetsModalProps {
  visible: boolean;
  content: ContentItem | null;
  allAssets: TrackingAsset[];
  onClose: () => void;
  onSubmit: (assetIds: string[]) => Promise<void>;
}

/**
 * Bind Assets Modal
 * 
 * Per PRD §7.3.3 Binding Flow:
 * - Search existing assets
 * - Multi-select
 * - Option: "Create new asset" (opens nested wizard, then auto-binds)
 */
const BindAssetsModal: React.FC<BindAssetsModalProps> = ({
  visible,
  content,
  allAssets,
  onClose,
  onSubmit,
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Initialize selected assets when modal opens
  useEffect(() => {
    if (visible && content) {
      setSelectedAssetIds(content.boundAssetIds || []);
      setSearchText('');
    }
  }, [visible, content]);

  // Filter assets by search text
  const filteredAssets = allAssets.filter(asset => {
    if (!searchText) return true;
    const search = searchText.toLowerCase();
    return (
      asset.name.toLowerCase().includes(search) ||
      asset.id.toLowerCase().includes(search) ||
      asset.channelTag.toLowerCase().includes(search) ||
      asset.assetValue.toLowerCase().includes(search)
    );
  });

  const handleToggleAsset = (assetId: string) => {
    setSelectedAssetIds(prev => {
      if (prev.includes(assetId)) {
        return prev.filter(id => id !== assetId);
      } else {
        return [...prev, assetId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedAssetIds.length === filteredAssets.length) {
      // Deselect all
      setSelectedAssetIds([]);
    } else {
      // Select all filtered
      setSelectedAssetIds(filteredAssets.map(a => a.id));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(selectedAssetIds);
    } catch (error) {
      message.error('资产绑定失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    // TODO: Open nested asset creation wizard
    // For now, show message
    message.info('资产创建向导将在此打开');
  };

  const getAssetTypeIcon = (type: AssetType) => {
    switch (type) {
      case AssetType.SHORT_LINK:
        return <LinkOutlined />;
      case AssetType.QR_CODE:
        return '📱';
      case AssetType.INVITE_CODE:
        return '✉️';
      default:
        return null;
    }
  };

  return (
    <Modal
      title={`绑定资产到“${content?.title || '内容'}”`}
      open={visible}
      onCancel={onClose}
      width={700}
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
          disabled={selectedAssetIds.length === 0}
        >
          绑定 {selectedAssetIds.length} 个资产
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* Search and Actions */}
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Search
            placeholder="按名称、ID、渠道或链接搜索资产"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 400 }}
            prefix={<SearchOutlined />}
          />
          <Space>
            <Button
              size="small"
              onClick={handleSelectAll}
            >
              {selectedAssetIds.length === filteredAssets.length ? '取消全选' : '全选'}
            </Button>
            <Button
              type="dashed"
              size="small"
              icon={<PlusOutlined />}
              onClick={handleCreateNew}
            >
              新建资产
            </Button>
          </Space>
        </Space>

        <Divider style={{ margin: '8px 0' }} />

        {/* Asset List */}
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {filteredAssets.length === 0 ? (
            <Empty
              description={searchText ? '未找到资产' : '暂无可用资产'}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <List
              dataSource={filteredAssets}
              renderItem={(asset) => {
                const isSelected = selectedAssetIds.includes(asset.id);
                const isBound = content?.boundAssetIds?.includes(asset.id);

                return (
                  <List.Item
                    style={{
                      cursor: 'pointer',
                      padding: '12px',
                      backgroundColor: isSelected ? '#f0f5ff' : 'transparent',
                      borderRadius: '4px',
                    }}
                    onClick={() => handleToggleAsset(asset.id)}
                  >
                    <List.Item.Meta
                      avatar={
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleToggleAsset(asset.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      }
                      title={
                        <Space>
                          <span>{getAssetTypeIcon(asset.type)}</span>
                          <span>{asset.name}</span>
                          {isBound && <Tag color="green">当前已绑定</Tag>}
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size="small">
                          <div>
                            <Tag color="blue">{translateChannel(asset.channelTag)}</Tag>
                            <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
                              {asset.assetValue}
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                            {asset.clickCount} 次点击 · {asset.conversionCount} 次转化
                          </div>
                        </Space>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          )}
        </div>

        {/* Summary */}
        {selectedAssetIds.length > 0 && (
          <div style={{ padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            已选择 <strong>{selectedAssetIds.length}</strong> 个资产
            {content?.boundAssetIds && (
              <span style={{ marginLeft: '16px', color: '#8c8c8c' }}>
                （原有 {content.boundAssetIds.length} 个）
              </span>
            )}
          </div>
        )}
      </Space>
    </Modal>
  );
};

export default BindAssetsModal;
