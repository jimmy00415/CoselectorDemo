import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Typography, Button, Space, message } from 'antd';
import { PlusOutlined, DownloadOutlined } from '@ant-design/icons';
import { ContentItem, TrackingAsset } from '../../types';
import { Permission } from '../../services/permissions';
import { usePermission } from '../../hooks/usePermission';
import * as mockApi from '../../services/mockApi';
import { DataTable } from '../../components/DataTable/DataTable';
import { FilterRail } from '../../components/FilterRail/FilterRail';
import { ActionBar } from '../../components/ActionBar/ActionBar';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { DetailsDrawer } from '../../components/DetailsDrawer/DetailsDrawer';
import { ConfirmModal } from '../../components/ConfirmModal/ConfirmModal';
import ContentFormModal from './ContentFormModal';
import ContentDetailView from './ContentDetailView';
import BindAssetsModal from './BindAssetsModal';
import { getContentColumns, getContentFilters } from './config';
import './styles.css';

const { Title, Paragraph } = Typography;

/**
 * Content Module - Multi-platform content performance tracking
 * 
 * Per PRD §7.3:
 * - List view with platform-specific metrics
 * - Bind assets to content for tracking
 * - View performance funnel and trends
 * - Manage content-to-asset bindings
 * - Empty state when no assets bound
 */
const ContentPage: React.FC = () => {
  const navigate = useNavigate();
  const { contentId } = useParams<{ contentId: string }>();
  const { can } = usePermission();

  // Data state
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [assets, setAssets] = useState<TrackingAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [selectedRows, setSelectedRows] = useState<ContentItem[]>([]);

  // UI state
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [searchText, setSearchText] = useState('');
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [bindModalVisible, setBindModalVisible] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [bindingContent, setBindingContent] = useState<ContentItem | null>(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [actionType, setActionType] = useState<'delete' | 'unbindAll'>('delete');

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  // Handle deep link to specific content
  useEffect(() => {
    if (contentId && contentItems.length > 0) {
      const content = contentItems.find(c => c.id === contentId);
      if (content) {
        setSelectedContent(content);
      }
    }
  }, [contentId, contentItems]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [contentData, assetsData] = await Promise.all([
        mockApi.getContentItems(),
        mockApi.getAssets(),
      ]);
      setContentItems(contentData);
      setAssets(assetsData);
    } catch (error) {
      message.error('Failed to load content data');
    } finally {
      setLoading(false);
    }
  };

  // Filter content items
  const filteredContent = useMemo(() => {
    let filtered = [...contentItems];

    // Platform filter
    if (filters.platform && filters.platform.length > 0) {
      filtered = filtered.filter(item => 
        filters.platform.includes(item.platform)
      );
    }

    // Has bound assets filter
    if (filters.hasBoundAssets !== undefined) {
      filtered = filtered.filter(item => {
        const hasBound = item.boundAssetIds && item.boundAssetIds.length > 0;
        return filters.hasBoundAssets ? hasBound : !hasBound;
      });
    }

    // Date range filter
    if (filters.publishDateRange && filters.publishDateRange.length === 2) {
      const [start, end] = filters.publishDateRange;
      filtered = filtered.filter(item => {
        if (!item.publishDate) return false;
        const publishDate = new Date(item.publishDate);
        return publishDate >= start && publishDate <= end;
      });
    }

    // Search filter
    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(search) ||
        item.id.toLowerCase().includes(search) ||
        (item.url && item.url.toLowerCase().includes(search))
      );
    }

    return filtered;
  }, [contentItems, filters, searchText]);

  const handleRowClick = (record: ContentItem) => {
    setSelectedContent(record);
    navigate(`/content/${record.id}`);
  };

  const handleDrawerClose = () => {
    setSelectedContent(null);
    navigate('/content');
  };

  const handleCreateContent = () => {
    setEditingContent(null);
    setFormModalVisible(true);
  };

  const handleEditContent = (content: ContentItem) => {
    setEditingContent(content);
    setFormModalVisible(true);
  };

  const handleDuplicateContent = async (content: ContentItem) => {
    try {
      const newContent = await mockApi.createContentItem({
        platform: content.platform,
        title: `${content.title} (Copy)`,
        url: content.url,
        publishDate: new Date().toISOString(),
        notes: content.notes,
        boundAssetIds: [], // Don't copy bindings
        clickCount: 0,
        viewCount: 0,
        conversionCount: 0,
      });
      setContentItems([newContent, ...contentItems]);
      message.success('Content duplicated successfully');
    } catch (error) {
      message.error('Failed to duplicate content');
    }
  };

  const handleFormSubmit = async (values: any) => {
    try {
      if (editingContent) {
        // Update existing
        const updated = await mockApi.updateContentItem(editingContent.id, values);
        setContentItems(contentItems.map(c => c.id === updated.id ? updated : c));
        if (selectedContent?.id === updated.id) {
          setSelectedContent(updated);
        }
        message.success('Content updated successfully');
      } else {
        // Create new
        const newContent = await mockApi.createContentItem({
          ...values,
          boundAssetIds: [],
          clickCount: 0,
          viewCount: 0,
          conversionCount: 0,
        });
        setContentItems([newContent, ...contentItems]);
        message.success('Content created successfully');
      }
      setFormModalVisible(false);
      setEditingContent(null);
    } catch (error) {
      message.error(`Failed to ${editingContent ? 'update' : 'create'} content`);
    }
  };

  const handleBindAssets = (content: ContentItem) => {
    setBindingContent(content);
    setBindModalVisible(true);
  };

  const handleBindSubmit = async (assetIds: string[]) => {
    if (!bindingContent) return;

    try {
      const updated = await mockApi.updateContentItem(bindingContent.id, {
        boundAssetIds: assetIds,
      });
      setContentItems(contentItems.map(c => c.id === updated.id ? updated : c));
      if (selectedContent?.id === updated.id) {
        setSelectedContent(updated);
      }
      setBindModalVisible(false);
      setBindingContent(null);
      message.success('Assets bound successfully');
    } catch (error) {
      message.error('Failed to bind assets');
    }
  };

  const handleBulkAction = (action: 'delete' | 'unbindAll') => {
    if (selectedRows.length === 0) {
      message.warning('Please select content items first');
      return;
    }
    setActionType(action);
    setConfirmModalVisible(true);
  };

  const handleConfirmAction = async () => {
    try {
      if (actionType === 'delete') {
        await Promise.all(
          selectedRows.map(content => mockApi.deleteContentItem(content.id))
        );
        setContentItems(contentItems.filter(c => !selectedRows.find(r => r.id === c.id)));
        message.success(`${selectedRows.length} content item(s) deleted`);
      } else if (actionType === 'unbindAll') {
        await Promise.all(
          selectedRows.map(content =>
            mockApi.updateContentItem(content.id, { boundAssetIds: [] })
          )
        );
        setContentItems(contentItems.map(c => {
          if (selectedRows.find(r => r.id === c.id)) {
            return { ...c, boundAssetIds: [] };
          }
          return c;
        }));
        message.success(`${selectedRows.length} content item(s) unbound`);
      }
      setSelectedRows([]);
      setConfirmModalVisible(false);
    } catch (error) {
      message.error(`Failed to ${actionType} content items`);
    }
  };

  const handleExport = () => {
    // Export to CSV
    const csv = [
      ['ID', 'Title', 'Platform', 'URL', 'Bound Assets', 'Clicks', 'Views', 'Conversions', 'Publish Date'].join(','),
      ...filteredContent.map(item => [
        item.id,
        `"${item.title}"`,
        item.platform,
        item.url || '',
        item.boundAssetIds?.length || 0,
        item.clickCount,
        item.viewCount || 0,
        item.conversionCount,
        item.publishDate || '',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="content-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <Title level={2}>Content Performance</Title>
          <Paragraph type="secondary">
            Track content across platforms and manage asset bindings
          </Paragraph>
        </div>
        <Space>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExport}
            disabled={filteredContent.length === 0}
          >
            Export CSV
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateContent}
            disabled={!can(Permission.CONTENT_CREATE)}
          >
            Add Content Item
          </Button>
        </Space>
      </div>

      {/* Action Bar for bulk operations */}
      {selectedRows.length > 0 && (
        <ActionBar
          selectedCount={selectedRows.length}
          onClearSelection={() => setSelectedRows([])}
          bulkActions={[
            {
              key: 'unbindAll',
              label: 'Unbind All Assets',
              onClick: () => handleBulkAction('unbindAll'),
              disabled: !can(Permission.CONTENT_BIND_ASSET),
            },
            {
              key: 'delete',
              label: 'Delete',
              onClick: () => handleBulkAction('delete'),
              danger: true,
              disabled: !can(Permission.CONTENT_DELETE),
            },
          ]}
        />
      )}

      {/* Main Content Area */}
      <div className="page-content">
        {/* Filter Rail */}
        <FilterRail
          filters={getContentFilters()}
          values={filters}
          onChange={(key: string, value: any) => {
            setFilters(prev => ({ ...prev, [key]: value }));
          }}
          onClear={() => setFilters({})}
        />

        {/* Data Table */}
        <div className="content-main">
          {contentItems.length === 0 && !loading ? (
            <EmptyState
              title="No content items yet"
              description="Create your first content item to start tracking performance across platforms"
              action={{
                label: 'Add Content Item',
                onClick: handleCreateContent,
              }}
            />
          ) : (
            <DataTable
              columns={getContentColumns({
                onEdit: handleEditContent,
                onBind: handleBindAssets,
                onDuplicate: handleDuplicateContent,
                canEdit: can(Permission.CONTENT_EDIT),
                canBind: can(Permission.CONTENT_BIND_ASSET),
              })}
              data={filteredContent}
              loading={loading}
              rowKey="id"
              onRowClick={(record: ContentItem) => handleRowClick(record)}
              selectable
              selectedRowKeys={selectedRows.map(r => r.id)}
              onSelectionChange={(_keys: React.Key[], rows: ContentItem[]) => setSelectedRows(rows)}
              searchable
              searchPlaceholder="Search by title, ID, or URL..."
              onSearch={(value) => setSearchText(value)}
            />
          )}
        </div>
      </div>

      {/* Create/Edit Content Modal */}
      <ContentFormModal
        visible={formModalVisible}
        content={editingContent}
        onClose={() => {
          setFormModalVisible(false);
          setEditingContent(null);
        }}
        onSubmit={handleFormSubmit}
      />

      {/* Bind Assets Modal */}
      <BindAssetsModal
        visible={bindModalVisible}
        content={bindingContent}
        allAssets={assets}
        onClose={() => {
          setBindModalVisible(false);
          setBindingContent(null);
        }}
        onSubmit={handleBindSubmit}
      />

      {/* Detail Drawer */}
      <DetailsDrawer
        visible={!!selectedContent}
        onClose={handleDrawerClose}
        title="Content Details"
        width={720}
        sections={[
          {
            key: 'details',
            title: 'Content Information',
            content: selectedContent && (
              <ContentDetailView
                content={selectedContent}
                allAssets={assets}
                onUpdate={async (updates: Partial<ContentItem>) => {
                  try {
                    const updated = await mockApi.updateContentItem(selectedContent.id, updates);
                    setContentItems(contentItems.map(c => c.id === updated.id ? updated : c));
                    setSelectedContent(updated);
                    message.success('Content updated');
                  } catch (error) {
                    message.error('Failed to update content');
                  }
                }}
                onBindAssets={() => handleBindAssets(selectedContent)}
              />
            ),
          },
        ]}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        visible={confirmModalVisible}
        title={`Confirm ${actionType === 'delete' ? 'Delete' : 'Unbind All'}`}
        message={`Are you sure you want to ${actionType === 'delete' ? 'delete' : 'unbind all assets from'} ${selectedRows.length} content item(s)? ${
          actionType === 'delete' ? 'This action cannot be undone.' : ''
        }`}
        onConfirm={handleConfirmAction}
        onClose={() => setConfirmModalVisible(false)}
        danger={actionType === 'delete'}
      />
    </div>
  );
};

export default ContentPage;
