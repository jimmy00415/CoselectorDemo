import React, { useState, useCallback, useMemo } from 'react';
import { Table, Space, Skeleton, Empty, Typography } from 'antd';
import type { ColumnType } from 'antd/es/table';
import type { FilterValue, SorterResult, TablePaginationConfig } from 'antd/es/table/interface';
import { ReloadOutlined } from '@ant-design/icons';
import { ActionBar } from '../ActionBar/ActionBar';
import type { BulkAction } from '../ActionBar/ActionBar';
import { FilterBar } from '../FilterBar/FilterBar';
import { FilterRail } from '../FilterRail/FilterRail';
import type { FilterConfig, FilterValues } from '../FilterBar/FilterBar';
import { EmptyState } from '../EmptyState/EmptyState';
import './styles.css';

const { Text } = Typography;

/**
 * TableKit Column Definition
 * Extends Ant Design ColumnType with additional metadata
 */
export interface TableKitColumn<T> extends ColumnType<T> {
  filterable?: boolean;
  searchable?: boolean;
  exportable?: boolean;
}

/**
 * TableKit Props
 * 
 * Per Sprint1 §4.1: Reusable Table Primitive with:
 * - Pagination (page + page size)
 * - Column sort (client-side)
 * - Column filters (basic)
 * - Loading state (skeleton)
 * - Empty state (actionable)
 * - Row selection (for future bulk actions)
 * - Row click opens Detail Drawer
 * 
 * Standard UI Regions:
 * - Above table: ActionBar + FilterBar
 * - Table header: column titles + sort indicators
 * - Table body: rows with hover actions
 * - Footer: pagination
 */
export interface TableKitProps<T extends Record<string, any>> {
  // Data
  data: T[];
  columns: TableKitColumn<T>[];
  loading?: boolean;
  rowKey: string | ((record: T) => string);

  // Page header
  pageTitle: string;
  pageDescription?: string;
  resultCount?: number;

  // Actions
  primaryAction?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    hidden?: boolean;
    tooltip?: string;
  };
  secondaryActions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    hidden?: boolean;
  }>;
  bulkActions?: BulkAction[];
  onRefresh?: () => void;

  // Row interaction
  onRowClick?: (record: T) => void;
  selectable?: boolean;
  selectedRowKeys?: React.Key[];
  onSelectionChange?: (selectedRowKeys: React.Key[], selectedRows: T[]) => void;

  // Filters
  filters?: FilterConfig[];
  filterValues?: FilterValues;
  onFilterChange?: (key: string, value: any) => void;
  onFilterClear?: () => void;
  showAdvancedFilters?: boolean;
  onToggleAdvancedFilters?: () => void;
  useFilterBar?: boolean; // If true, uses FilterBar (new); if false, uses FilterRail (legacy)

  // Pagination
  pagination?: TablePaginationConfig | false;
  onPaginationChange?: (page: number, pageSize: number) => void;

  // Empty states
  emptyState?: {
    title: string;
    description: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  firstTimeEmptyState?: {
    title: string;
    description: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };

  // Accessibility
  ariaLabel?: string;
}

/**
 * TableKit Component
 * 
 * The foundational table primitive for Sprint 1 admin console.
 * Combines ActionBar + FilterBar + Table + Pagination in one cohesive component.
 * 
 * Key Features:
 * - Integrated action bar with permission-aware buttons
 * - Integrated filter bar with basic + advanced filters
 * - Client-side sorting and filtering
 * - Row selection for bulk operations
 * - Actionable empty states
 * - Loading states with skeleton
 * - Responsive design
 * 
 * Usage Pattern:
 * ```tsx
 * <TableKit
 *   data={leads}
 *   columns={leadColumns}
 *   pageTitle="Lead Review Queue"
 *   resultCount={leads.length}
 *   primaryAction={{ label: "Submit Lead", onClick: handleSubmit }}
 *   filters={leadFilters}
 *   onRowClick={handleRowClick}
 * />
 * ```
 */
export function TableKit<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  rowKey,
  pageTitle,
  pageDescription,
  resultCount,
  primaryAction,
  secondaryActions = [],
  bulkActions = [],
  onRefresh,
  onRowClick,
  selectable = false,
  selectedRowKeys = [],
  onSelectionChange,
  filters = [],
  filterValues = {},
  onFilterChange,
  onFilterClear,
  showAdvancedFilters = false,
  onToggleAdvancedFilters,
  useFilterBar = true, // Default to new FilterBar
  pagination = {
    current: 1,
    pageSize: 20,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: ['10', '20', '50', '100'],
    showTotal: (total: number, range: [number, number]) =>
      `${range[0]}-${range[1]} of ${total} items`,
  },
  onPaginationChange,
  emptyState,
  firstTimeEmptyState,
  ariaLabel,
}: TableKitProps<T>) {
  const [sortedInfo, setSortedInfo] = useState<SorterResult<T>>({});
  const [filteredInfo, setFilteredInfo] = useState<Record<string, FilterValue | null>>({});

  // Calculate if this is first time use (no data and no filters applied)
  const isFirstTimeUse = useMemo(() => {
    return data.length === 0 && Object.keys(filterValues).length === 0 && !loading;
  }, [data.length, filterValues, loading]);

  // Calculate if there are active filters but no results
  const hasActiveFiltersWithNoResults = useMemo(() => {
    return data.length === 0 && Object.keys(filterValues).length > 0 && !loading;
  }, [data.length, filterValues, loading]);

  // Handle table change (sorting, filtering, pagination)
  const handleTableChange = useCallback(
    (
      newPagination: TablePaginationConfig,
      filters: Record<string, FilterValue | null>,
      sorter: SorterResult<T> | SorterResult<T>[]
    ) => {
      setFilteredInfo(filters);
      setSortedInfo(Array.isArray(sorter) ? sorter[0] : sorter);

      if (onPaginationChange && newPagination.current && newPagination.pageSize) {
        onPaginationChange(newPagination.current, newPagination.pageSize);
      }
    },
    [onPaginationChange]
  );

  // Row selection configuration
  const rowSelection = useMemo(() => {
    if (!selectable) return undefined;

    return {
      selectedRowKeys,
      onChange: onSelectionChange,
      preserveSelectedRowKeys: true,
    };
  }, [selectable, selectedRowKeys, onSelectionChange]);

  // Enhance columns with current sort/filter state
  const enhancedColumns = useMemo(() => {
    return columns.map(col => ({
      ...col,
      sortOrder: sortedInfo.columnKey === col.key ? sortedInfo.order : null,
      filteredValue: filteredInfo[col.key as string] || null,
    }));
  }, [columns, sortedInfo, filteredInfo]);

  // Render empty state
  const renderEmptyState = () => {
    if (loading) return null;

    // First time user - no data and no filters
    if (isFirstTimeUse && firstTimeEmptyState) {
      return (
        <EmptyState
          title={firstTimeEmptyState.title}
          description={firstTimeEmptyState.description}
          action={firstTimeEmptyState.action}
        />
      );
    }

    // Active filters but no results
    if (hasActiveFiltersWithNoResults && emptyState) {
      return (
        <EmptyState
          title={emptyState.title}
          description={emptyState.description}
          action={
            emptyState.action || {
              label: 'Clear filters',
              onClick: onFilterClear || (() => {}),
            }
          }
        />
      );
    }

    // Default empty state
    return (
      <Empty
        description="No data available"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  };

  return (
    <div className="table-kit" aria-label={ariaLabel}>
      {/* Page Header */}
      <div className="table-kit-header">
        <div className="table-kit-header-content">
          <h1 className="table-kit-title">{pageTitle}</h1>
          {pageDescription && (
            <Text type="secondary" className="table-kit-description">
              {pageDescription}
            </Text>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="table-kit-action-bar">
        <ActionBar
          primaryAction={primaryAction}
          secondaryActions={[
            ...secondaryActions,
            ...(onRefresh
              ? [
                  {
                    label: 'Refresh',
                    icon: <ReloadOutlined />,
                    onClick: onRefresh,
                  },
                ]
              : []),
          ]}
          bulkActions={bulkActions}
          selectedCount={selectedRowKeys.length}
          onClearSelection={() => onSelectionChange?.([], [])}
          leftContent={
            resultCount !== undefined ? (
              <Space>
                <Text type="secondary">
                  {resultCount} {resultCount === 1 ? 'item' : 'items'}
                </Text>
              </Space>
            ) : undefined
          }
        />
      </div>

      {/* Filter Bar or Filter Rail */}
      {filters.length > 0 && (
        <div className="table-kit-filter-bar">
          {useFilterBar ? (
            <FilterBar
              filters={filters}
              values={filterValues}
              onChange={onFilterChange || (() => {})}
              onClear={onFilterClear || (() => {})}
              showAdvanced={showAdvancedFilters}
              onToggleAdvanced={onToggleAdvancedFilters}
            />
          ) : (
            <FilterRail
              filters={filters}
              values={filterValues}
              onChange={onFilterChange || (() => {})}
              onClear={onFilterClear || (() => {})}
              showAdvanced={showAdvancedFilters}
              onToggleAdvanced={onToggleAdvancedFilters}
            />
          )}
        </div>
      )}

      {/* Table */}
      <div className="table-kit-table">
        {loading ? (
          <Skeleton active paragraph={{ rows: 10 }} />
        ) : data.length === 0 ? (
          renderEmptyState()
        ) : (
          <Table<T>
            columns={enhancedColumns}
            dataSource={data}
            rowKey={rowKey}
            loading={loading}
            pagination={pagination}
            onChange={handleTableChange}
            rowSelection={rowSelection}
            onRow={(record) => ({
              onClick: () => onRowClick?.(record),
              style: { cursor: onRowClick ? 'pointer' : 'default' },
            })}
            bordered
            size="middle"
            scroll={{ x: 'max-content' }}
            aria-label={ariaLabel ? `${ariaLabel} table` : undefined}
            locale={{
              emptyText: renderEmptyState(),
            }}
          />
        )}
      </div>
    </div>
  );
}
