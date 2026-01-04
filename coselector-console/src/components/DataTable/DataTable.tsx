import React, { useState, useCallback, useMemo } from 'react';
import { Table, Input, Button, Space, Dropdown, Tooltip } from 'antd';
import type { TableProps, ColumnType } from 'antd/es/table';
import type { FilterValue, SorterResult, TablePaginationConfig } from 'antd/es/table/interface';
import {
  SearchOutlined,
  DownloadOutlined,
  ReloadOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { TablePagination } from '../../types';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '../../constants';

export interface DataTableColumn<T> extends ColumnType<T> {
  searchable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
}

export interface RowAction<T> {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (record: T) => void;
  disabled?: (record: T) => boolean;
  hidden?: (record: T) => boolean;
  danger?: boolean;
}

interface DataTableProps<T> {
  // Data
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  rowKey: string | ((record: T) => string);

  // Pagination
  pagination?: TablePaginationConfig | false;
  onPaginationChange?: (pagination: TablePagination) => void;

  // Selection
  selectable?: boolean;
  selectedRowKeys?: React.Key[];
  onSelectionChange?: (selectedRowKeys: React.Key[], selectedRows: T[]) => void;

  // Actions
  rowActions?: RowAction<T>[];
  onRowClick?: (record: T) => void;

  // Search & Filter
  searchable?: boolean;
  onSearch?: (searchText: string) => void;
  searchPlaceholder?: string;

  // Export
  exportable?: boolean;
  onExport?: () => void;
  exportFileName?: string;

  // Refresh
  refreshable?: boolean;
  onRefresh?: () => void;

  // Table settings
  bordered?: boolean;
  size?: 'small' | 'middle' | 'large';
  scroll?: { x?: number; y?: number };

  // Accessibility
  ariaLabel?: string;
}

/**
 * DataTable Component
 * 
 * A comprehensive table component with built-in features:
 * - Sorting, filtering, pagination
 * - Search functionality
 * - Row selection
 * - Row actions
 * - Export capability
 * - Refresh functionality
 * - Full accessibility support
 * 
 * Meets PRD requirements:
 * - Column sort (client-side)
 * - Filters (faceted + advanced)
 * - Pagination with configurable page sizes
 * - Row click opens Details Drawer
 * - Row actions in "..." menu + key actions inline
 */
export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  rowKey,
  pagination = {
    current: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    showTotal: (total: number, range: [number, number]) =>
      `${range[0]}-${range[1]} of ${total} items`,
  },
  onPaginationChange,
  selectable = false,
  selectedRowKeys = [],
  onSelectionChange,
  rowActions = [],
  onRowClick,
  searchable = false,
  onSearch,
  searchPlaceholder = 'Search...',
  exportable = false,
  onExport,
  exportFileName = 'export.csv',
  refreshable = false,
  onRefresh,
  bordered = true,
  size = 'middle',
  scroll,
  ariaLabel,
}: DataTableProps<T>) {
  const [searchText, setSearchText] = useState('');
  const [filteredInfo, setFilteredInfo] = useState<Record<string, FilterValue | null>>({});

  // Handle table change (pagination, filters, sorter)
  const handleTableChange: TableProps<T>['onChange'] = useCallback(
    (newPagination: TablePaginationConfig, filters: Record<string, FilterValue | null>, _sorter: SorterResult<T> | SorterResult<T>[]) => {
      setFilteredInfo(filters);
      // Store sorted info if needed in the future
      // setSortedInfo(Array.isArray(sorter) ? sorter[0] : sorter);

      if (onPaginationChange && newPagination) {
        onPaginationChange({
          current: newPagination.current || 1,
          pageSize: newPagination.pageSize || DEFAULT_PAGE_SIZE,
          total: newPagination.total || 0,
        });
      }
    },
    [onPaginationChange]
  );

  // Handle search
  const handleSearch = useCallback(
    (value: string) => {
      setSearchText(value);
      onSearch?.(value);
    },
    [onSearch]
  );

  // Clear filters
  const handleClearFilters = useCallback(() => {
    setFilteredInfo({});
    setSearchText('');
    onSearch?.('');
  }, [onSearch]);

  // Render row actions
  const renderRowActions = useCallback(
    (record: T) => {
      const visibleActions = rowActions.filter(
        (action) => !action.hidden || !action.hidden(record)
      );

      if (visibleActions.length === 0) return null;

      // Show first 2 actions inline, rest in dropdown
      const inlineActions = visibleActions.slice(0, 2);
      const dropdownActions = visibleActions.slice(2);

      return (
        <Space size="small">
          {inlineActions.map((action) => (
            <Button
              key={action.key}
              type="link"
              size="small"
              icon={action.icon}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick(record);
              }}
              disabled={action.disabled?.(record)}
              danger={action.danger}
              aria-label={action.label}
            >
              {action.label}
            </Button>
          ))}
          {dropdownActions.length > 0 && (
            <Dropdown
              menu={{
                items: dropdownActions.map((action) => ({
                  key: action.key,
                  label: action.label,
                  icon: action.icon,
                  onClick: () => action.onClick(record),
                  disabled: action.disabled?.(record),
                  danger: action.danger,
                })),
              }}
              trigger={['click']}
            >
              <Button
                type="text"
                size="small"
                icon={<MoreOutlined />}
                onClick={(e) => e.stopPropagation()}
                aria-label="More actions"
              />
            </Dropdown>
          )}
        </Space>
      );
    },
    [rowActions]
  );

  // Add actions column if row actions exist
  const enhancedColumns = useMemo(() => {
    const cols = [...columns];
    if (rowActions.length > 0) {
      cols.push({
        title: 'Actions',
        key: 'actions',
        fixed: 'right',
        width: 150,
        render: (_, record) => renderRowActions(record),
      });
    }
    return cols;
  }, [columns, rowActions, renderRowActions]);

  // Row selection config
  const rowSelection = selectable
    ? {
        selectedRowKeys,
        onChange: onSelectionChange,
        preserveSelectedRowKeys: true,
      }
    : undefined;

  return (
    <div className="data-table-container">
      {/* Action Bar */}
      <div className="table-action-bar">
        <Space size="middle">
          {searchable && (
            <Input
              placeholder={searchPlaceholder}
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              onPressEnter={() => handleSearch(searchText)}
              style={{ width: 250 }}
              allowClear
              aria-label="Search table"
            />
          )}
          {(Object.keys(filteredInfo).length > 0 || searchText) && (
            <Button onClick={handleClearFilters} size="small">
              Clear Filters
            </Button>
          )}
        </Space>

        <Space size="small">
          {refreshable && (
            <Tooltip title="Refresh data">
              <Button
                icon={<ReloadOutlined />}
                onClick={onRefresh}
                loading={loading}
                aria-label="Refresh data"
              />
            </Tooltip>
          )}
          {exportable && (
            <Tooltip title={`Export to ${exportFileName}`}>
              <Button
                icon={<DownloadOutlined />}
                onClick={onExport}
                aria-label="Export data"
              >
                Export
              </Button>
            </Tooltip>
          )}
        </Space>
      </div>

      {/* Table */}
      <Table<T>
        columns={enhancedColumns}
        dataSource={data}
        loading={loading}
        rowKey={rowKey}
        pagination={pagination}
        onChange={handleTableChange}
        rowSelection={rowSelection}
        onRow={(record) => ({
          onClick: () => onRowClick?.(record),
          style: { cursor: onRowClick ? 'pointer' : 'default' },
          'aria-label': ariaLabel
            ? `${ariaLabel} row`
            : 'Table row',
        })}
        bordered={bordered}
        size={size}
        scroll={scroll}
        aria-label={ariaLabel}
        locale={{
          emptyText: 'No data available',
          filterConfirm: 'OK',
          filterReset: 'Reset',
          filterEmptyText: 'No filters',
          selectAll: 'Select all',
          selectInvert: 'Invert selection',
          selectionAll: 'Select all data',
          sortTitle: 'Sort',
          triggerDesc: 'Click to sort descending',
          triggerAsc: 'Click to sort ascending',
          cancelSort: 'Click to cancel sorting',
        }}
      />
    </div>
  );
}
