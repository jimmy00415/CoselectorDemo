import React, { useState, useEffect } from 'react';
import { Typography, Button, message, Card, Input, Select, Tag } from 'antd';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import PageBreadcrumb from '../../layout/PageBreadcrumb';
import { DataTable, ActionBar, DetailsDrawer, EmptyState, ConfirmModal } from '../../components';
import { TrackingAsset } from '../../types';
import { AssetStatus } from '../../types/enums';
import { Permission } from '../../services/permissions';
import { usePermission } from '../../hooks/usePermission';
import * as mockApi from '../../services/mockApi';
import AssetDetailView from './AssetDetailView';
import { getAssetColumns, getAssetFilters } from './config';
import ProductLinkCreator, { ProductLinkAssetInput } from './ProductLinkCreator';
import './styles.css';

const { Title, Paragraph, Text } = Typography;

/**
 * Assets (Links) Module - Main Page
 * 
 * Per PRD §7.2: Complete links management with:
 * - List view with filtering
 * - Create asset wizard
 * - Detail view with metrics
 * - QR code generation
 * - Click tracking
 * - Permission enforcement
 */
const AssetsPage: React.FC = () => {
  const { assetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();
  const { can } = usePermission();

  // State
  const [assets, setAssets] = useState<TrackingAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<TrackingAsset | null>(null);
  const [selectedRows, setSelectedRows] = useState<TrackingAsset[]>([]);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [actionType, setActionType] = useState<'disable' | 'enable' | 'delete'>('disable');
  const [actionAssets, setActionAssets] = useState<TrackingAsset[]>([]);

  // Load assets
  useEffect(() => {
    loadAssets();
  }, []);

  // Open detail drawer if assetId in URL
  useEffect(() => {
    if (assetId && assets.length > 0) {
      const asset = assets.find(a => a.id === assetId);
      if (asset) {
        setSelectedAsset(asset);
      }
    }
  }, [assetId, assets]);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const data = await mockApi.getAssets();
      setAssets(data);
    } catch (error) {
      message.error('商品链接加载失败');
    } finally {
      setLoading(false);
    }
  };

  // Filter assets based on active filters
  const filteredAssets = assets.filter(asset => {
    if (filters.status && asset.status !== filters.status) return false;
    if (filters.channelTag && asset.channelTag !== filters.channelTag) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        asset.name.toLowerCase().includes(searchLower) ||
        asset.id.toLowerCase().includes(searchLower) ||
        asset.channelTag.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const assetFilters = getAssetFilters();
  const getFilterOptions = (key: string) => assetFilters.find(filter => filter.key === key)?.options || [];
  const activeFilterEntries = [
    { key: 'search', label: '搜索', value: filters.search },
    { key: 'channelTag', label: '入口', value: filters.channelTag },
    { key: 'status', label: '状态', value: filters.status },
  ].filter(entry => entry.value !== undefined && entry.value !== null && entry.value !== '');
  const activeAssets = assets.filter(asset => asset.status === AssetStatus.ACTIVE).length;
  const totalClicks = filteredAssets.reduce((total, asset) => total + asset.clickCount, 0);
  const totalConversions = filteredAssets.reduce((total, asset) => total + asset.conversionCount, 0);
  const actionTargetCount = actionAssets.length;
  const confirmActionText = actionType === 'disable' ? '设为失效' : actionType === 'enable' ? '启用' : '删除';
  const confirmMessage =
    actionType === 'disable'
      ? `确定要将 ${actionTargetCount} 个商品链接设为失效吗？`
      : actionType === 'enable'
        ? `确定要启用 ${actionTargetCount} 个商品链接吗？`
        : `确定要删除 ${actionTargetCount} 个商品链接吗？此操作无法撤销。`;

  const getFilterLabel = (key: string, value: any) => {
    if (key === 'search') return String(value);
    const option = getFilterOptions(key).find(filterOption => filterOption.value === value);
    return option?.label || String(value);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilter = (key: string) => {
    setFilters(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleRowClick = (record: TrackingAsset) => {
    setSelectedAsset(record);
    navigate(`/assets/${record.id}`);
  };

  const handleDrawerClose = () => {
    setSelectedAsset(null);
    navigate('/assets');
  };

  const handleCreateProductLink = async (assetInput: ProductLinkAssetInput) => {
    const newAsset = await mockApi.createAsset(assetInput);
    setAssets(prev => [newAsset, ...prev]);
    return newAsset;
  };

  const handleBulkAction = (action: 'disable' | 'enable' | 'delete') => {
    if (selectedRows.length === 0) {
      message.warning('请先选择商品链接');
      return;
    }
    setActionType(action);
    setActionAssets(selectedRows);
    setConfirmModalVisible(true);
  };

  const handleSingleDelete = (asset: TrackingAsset) => {
    setActionType('delete');
    setActionAssets([asset]);
    setConfirmModalVisible(true);
  };

  const handleConfirmAction = async () => {
    const targets = actionAssets;

    if (targets.length === 0) {
      setConfirmModalVisible(false);
      return;
    }

    try {
      if (actionType === 'disable') {
        await Promise.all(
          targets.map(asset =>
            mockApi.updateAsset(asset.id, { status: AssetStatus.DISABLED })
          )
        );
        message.success(`已将 ${targets.length} 个商品链接设为失效`);
      } else if (actionType === 'enable') {
        await Promise.all(
          targets.map(asset =>
            mockApi.updateAsset(asset.id, { status: AssetStatus.ACTIVE })
          )
        );
        message.success(`已启用 ${targets.length} 个商品链接`);
      } else if (actionType === 'delete') {
        await Promise.all(
          targets.map(asset => mockApi.deleteAsset(asset.id))
        );
        message.success(`已删除 ${targets.length} 个商品链接`);
      }
      await loadAssets();
      setSelectedRows([]);
      setActionAssets([]);
      setConfirmModalVisible(false);
    } catch (error) {
      message.error('商品链接操作失败');
    }
  };

  const handleExport = () => {
    const csv = [
      ['链接编号', '商品名称', '入口', '状态', '点击', '转化', '创建时间'],
      ...filteredAssets.map(asset => [
        asset.id,
        asset.name,
        asset.channelTag,
        asset.status === AssetStatus.ACTIVE ? '启用' : '失效',
        asset.clickCount,
        asset.conversionCount,
        asset.createdAt,
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `product-links-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('商品链接已导出');
  };

  return (
    <div className="assets-page">
      <PageBreadcrumb />

      {/* Header */}
      <div className="page-header">
        <div>
          <Title level={2}>链接管理</Title>
          <Paragraph type="secondary">
            为八大入口下的商家 SPU 生成唯一归因商品链接和二维码
          </Paragraph>
        </div>
      </div>

      <ProductLinkCreator
        disabled={!can(Permission.ASSET_CREATE)}
        onCreateAsset={handleCreateProductLink}
      />

      <section className="asset-history-section">
        <Card className="asset-history-card">
          <div className="asset-history-header">
            <div>
              <Title level={3}>已生成商品链接</Title>
              <Text type="secondary">查看、筛选和管理已创建的唯一归因链接。</Text>
            </div>
            <div className="asset-history-stats">
              <div className="asset-history-stat">
                <span>全部链接</span>
                <strong>{assets.length.toLocaleString()}</strong>
              </div>
              <div className="asset-history-stat">
                <span>启用中</span>
                <strong>{activeAssets.toLocaleString()}</strong>
              </div>
              <div className="asset-history-stat">
                <span>点击</span>
                <strong>{totalClicks.toLocaleString()}</strong>
              </div>
              <div className="asset-history-stat">
                <span>转化</span>
                <strong>{totalConversions.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          <div className="asset-history-toolbar">
            <Input
              className="asset-history-search"
              placeholder="搜索商品链接、ID 或入口"
              prefix={<SearchOutlined />}
              allowClear
              value={filters.search}
              onChange={event => handleFilterChange('search', event.target.value)}
            />
            <Select
              placeholder="入口"
              allowClear
              value={filters.channelTag}
              onChange={value => handleFilterChange('channelTag', value)}
              options={getFilterOptions('channelTag')}
            />
            <Select
              placeholder="状态"
              allowClear
              value={filters.status}
              onChange={value => handleFilterChange('status', value)}
              options={getFilterOptions('status')}
            />
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExport}
              disabled={filteredAssets.length === 0}
            >
              导出
            </Button>
          </div>

          {activeFilterEntries.length > 0 && (
            <div className="asset-filter-chip-row">
              <Text type="secondary">已筛选</Text>
              {activeFilterEntries.map(entry => (
                <Tag
                  key={entry.key}
                  closable
                  onClose={event => {
                    event.preventDefault();
                    handleClearFilter(entry.key);
                  }}
                >
                  {entry.label}: {getFilterLabel(entry.key, entry.value)}
                </Tag>
              ))}
              <Button type="link" size="small" onClick={() => setFilters({})}>
                清空
              </Button>
            </div>
          )}

          {selectedRows.length > 0 && (
            <ActionBar
              selectedCount={selectedRows.length}
              onClearSelection={() => setSelectedRows([])}
              bulkActions={[
                {
                  key: 'disable',
                  label: '设为失效',
                  onClick: () => handleBulkAction('disable'),
                  danger: true,
                  disabled: !can(Permission.ASSET_UPDATE),
                },
                {
                  key: 'enable',
                  label: '启用',
                  onClick: () => handleBulkAction('enable'),
                  disabled: !can(Permission.ASSET_UPDATE),
                },
                {
                  key: 'delete',
                  label: '删除',
                  onClick: () => handleBulkAction('delete'),
                  danger: true,
                  disabled: !can(Permission.ASSET_DELETE),
                },
              ]}
            />
          )}

          <div className="asset-history-table">
          {assets.length === 0 && !loading ? (
            <EmptyState
              title="暂无商品链接"
              description="上方生成链接后，记录会出现在这里。"
            />
          ) : (
            <DataTable
              columns={getAssetColumns({
                onDelete: handleSingleDelete,
                canDelete: can(Permission.ASSET_DELETE),
              })}
              data={filteredAssets}
              loading={loading}
              rowKey="id"
              onRowClick={(record: TrackingAsset) => handleRowClick(record)}
              selectable
              selectedRowKeys={selectedRows.map(r => r.id)}
              onSelectionChange={(_keys: React.Key[], rows: TrackingAsset[]) => setSelectedRows(rows)}
              bordered={false}
              scroll={{ x: 1120 }}
              ariaLabel="商品链接"
            />
          )}
          </div>
        </Card>
      </section>

      {/* Detail Drawer */}
      <DetailsDrawer
        visible={!!selectedAsset}
        onClose={handleDrawerClose}
        title="商品详情"
        width={720}
        sections={[
          {
            key: 'details',
            title: '商品信息',
            content: selectedAsset && (
              <AssetDetailView
                asset={selectedAsset}
                onUpdate={async (updates: Partial<TrackingAsset>) => {
                  try {
                    const updated = await mockApi.updateAsset(selectedAsset.id, updates);
                    setAssets(assets.map(a => (a.id === updated.id ? updated : a)));
                    setSelectedAsset(updated);
                    message.success('商品信息已更新');
                  } catch (error) {
                    message.error('商品信息更新失败');
                  }
                }}
              />
            ),
          },
        ]}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        visible={confirmModalVisible}
        title="确认操作"
        message={confirmMessage}
        onConfirm={handleConfirmAction}
        onClose={() => {
          setConfirmModalVisible(false);
          setActionAssets([]);
        }}
        confirmText={confirmActionText}
        danger={actionType === 'delete' || actionType === 'disable'}
      />
    </div>
  );
};

export default AssetsPage;
