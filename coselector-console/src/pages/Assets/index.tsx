import React, { useState, useEffect } from 'react';
import { Typography, Space, Button, message } from 'antd';
import { PlusOutlined, DownloadOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import PageBreadcrumb from '../../layout/PageBreadcrumb';
import { DataTable, FilterRail, ActionBar, DetailsDrawer, EmptyState, ConfirmModal } from '../../components';
import { TrackingAsset } from '../../types';
import { AssetStatus } from '../../types/enums';
import { Permission } from '../../services/permissions';
import { usePermission } from '../../hooks/usePermission';
import * as mockApi from '../../services/mockApi';
import AssetCreateModal from './AssetCreateModal';
import AssetDetailView from './AssetDetailView';
import { getAssetColumns, getAssetFilters } from './config';
import './styles.css';

const { Title, Paragraph } = Typography;

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
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [actionType, setActionType] = useState<'disable' | 'enable' | 'delete'>('disable');

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
      message.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  // Filter assets based on active filters
  const filteredAssets = assets.filter(asset => {
    if (filters.type && asset.type !== filters.type) return false;
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

  const handleRowClick = (record: TrackingAsset) => {
    setSelectedAsset(record);
    navigate(`/assets/${record.id}`);
  };

  const handleDrawerClose = () => {
    setSelectedAsset(null);
    navigate('/assets');
  };

  const handleCreateAsset = async (values: any) => {
    try {
      const newAsset = await mockApi.createAsset({
        type: values.type,
        name: values.name,
        assetValue: values.assetValue || `https://short.link/${Math.random().toString(36).substr(2, 8)}`,
        channelTag: values.channelTag,
        status: AssetStatus.ACTIVE,
        clickCount: 0,
        conversionCount: 0,
        boundContentIds: [],
      });
      setAssets([newAsset, ...assets]);
      setCreateModalVisible(false);
      message.success('Asset created successfully');
    } catch (error) {
      message.error('Failed to create asset');
    }
  };

  const handleBulkAction = (action: 'disable' | 'enable' | 'delete') => {
    if (selectedRows.length === 0) {
      message.warning('Please select assets first');
      return;
    }
    setActionType(action);
    setConfirmModalVisible(true);
  };

  const handleConfirmAction = async () => {
    try {
      if (actionType === 'disable') {
        await Promise.all(
          selectedRows.map(asset =>
            mockApi.updateAsset(asset.id, { status: AssetStatus.DISABLED })
          )
        );
        message.success(`${selectedRows.length} asset(s) disabled`);
      } else if (actionType === 'enable') {
        await Promise.all(
          selectedRows.map(asset =>
            mockApi.updateAsset(asset.id, { status: AssetStatus.ACTIVE })
          )
        );
        message.success(`${selectedRows.length} asset(s) enabled`);
      } else if (actionType === 'delete') {
        await Promise.all(
          selectedRows.map(asset => mockApi.deleteAsset(asset.id))
        );
        message.success(`${selectedRows.length} asset(s) deleted`);
      }
      await loadAssets();
      setSelectedRows([]);
      setConfirmModalVisible(false);
    } catch (error) {
      message.error(`Failed to ${actionType} assets`);
    }
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Name', 'Type', 'Channel', 'Status', 'Clicks', 'Conversions', 'Created'],
      ...filteredAssets.map(asset => [
        asset.id,
        asset.name,
        asset.type,
        asset.channelTag,
        asset.status,
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
    a.download = `assets-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('Assets exported');
  };

  return (
    <div className="assets-page">
      <PageBreadcrumb />

      {/* Header */}
      <div className="page-header">
        <div>
          <Title level={2}>Links Management</Title>
          <Paragraph type="secondary">
            Manage your tracking links, QR codes, and invite codes
          </Paragraph>
        </div>
        <Space>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExport}
            disabled={filteredAssets.length === 0}
          >
            Export CSV
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
            disabled={!can(Permission.ASSET_CREATE)}
          >
            Create Asset
          </Button>
        </Space>
      </div>

      {/* Action Bar */}
      {selectedRows.length > 0 && (
        <ActionBar
          selectedCount={selectedRows.length}
          onClearSelection={() => setSelectedRows([])}
          bulkActions={[
            {
              key: 'disable',
              label: 'Disable',
              onClick: () => handleBulkAction('disable'),
              danger: true,
              disabled: !can(Permission.ASSET_UPDATE),
            },
            {
              key: 'enable',
              label: 'Enable',
              onClick: () => handleBulkAction('enable'),
              disabled: !can(Permission.ASSET_UPDATE),
            },
            {
              key: 'delete',
              label: 'Delete',
              onClick: () => handleBulkAction('delete'),
              danger: true,
              disabled: !can(Permission.ASSET_DELETE),
            },
          ]}
        />
      )}

      {/* Main Content Area */}
      <div className="page-content">
        {/* Filter Rail */}
        <FilterRail
          filters={getAssetFilters()}
          values={filters}
          onChange={(key: string, value: any) => {
            setFilters(prev => ({...prev, [key]: value}));
          }}
          onClear={() => setFilters({})}
        />

        {/* Data Table */}
        <div className="content-main">
          {assets.length === 0 && !loading ? (
            <EmptyState
              title="No assets yet"
              description="Create your first tracking link, QR code, or invite code to start tracking conversions"
              action={{
                label: 'Create Asset',
                onClick: () => setCreateModalVisible(true),
              }}
            />
          ) : (
            <DataTable
              columns={getAssetColumns()}
              data={filteredAssets}
              loading={loading}
              rowKey="id"
              onRowClick={(record: TrackingAsset) => handleRowClick(record)}
              selectable
              selectedRowKeys={selectedRows.map(r => r.id)}
              onSelectionChange={(_keys: React.Key[], rows: TrackingAsset[]) => setSelectedRows(rows)}
              searchable
              searchPlaceholder="Search by name, ID, or channel tag..."
              onSearch={(value) => setFilters({ ...filters, search: value })}
            />
          )}
        </div>
      </div>

      {/* Create Asset Modal */}
      <AssetCreateModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSubmit={handleCreateAsset}
      />

      {/* Detail Drawer */}
      <DetailsDrawer
        visible={!!selectedAsset}
        onClose={handleDrawerClose}
        title="Asset Details"
        width={720}
        sections={[
          {
            key: 'details',
            title: 'Asset Information',
            content: selectedAsset && (
              <AssetDetailView
                asset={selectedAsset}
                onUpdate={async (updates: Partial<TrackingAsset>) => {
                  try {
                    const updated = await mockApi.updateAsset(selectedAsset.id, updates);
                    setAssets(assets.map(a => (a.id === updated.id ? updated : a)));
                    setSelectedAsset(updated);
                    message.success('Asset updated');
                  } catch (error) {
                    message.error('Failed to update asset');
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
        title={`Confirm ${actionType}`}
        message={`Are you sure you want to ${actionType} ${selectedRows.length} asset(s)? ${
          actionType === 'delete' ? 'This action cannot be undone.' : ''
        }`}
        onConfirm={handleConfirmAction}
        onClose={() => setConfirmModalVisible(false)}
        danger={actionType === 'delete' || actionType === 'disable'}
      />
    </div>
  );
};

export default AssetsPage;
