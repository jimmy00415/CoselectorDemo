import React from 'react';
import { Card, Select, Input, DatePicker, Space, Button, Drawer, Badge } from 'antd';
import { FilterOutlined, CloseOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

export interface FilterOption {
  label: string;
  value: string | number | boolean;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'multiSelect' | 'input' | 'dateRange' | 'range' | 'chips';
  options?: FilterOption[];
  placeholder?: string;
  advanced?: boolean; // If true, shows in advanced section
  basic?: boolean; // For FilterBar compatibility
  debounce?: number; // For FilterBar compatibility
  allowClear?: boolean; // For FilterBar compatibility
}

export interface FilterValues {
  [key: string]: any;
}

interface FilterRailProps {
  filters: FilterConfig[];
  values: FilterValues;
  onChange: (key: string, value: any) => void;
  onClear: () => void;
  onApply?: () => void;
  
  // Mobile/responsive
  mode?: 'rail' | 'drawer';
  drawerVisible?: boolean;
  onDrawerClose?: () => void;

  // Styling
  className?: string;
  showAdvanced?: boolean;
  onToggleAdvanced?: () => void;
}

/**
 * FilterRail Component
 * 
 * A faceted filter panel with:
 * - Basic and advanced filter sections
 * - Multiple filter types (select, input, date range)
 * - Clear and apply actions
 * - Responsive drawer mode for mobile
 * - Active filter count badge
 * 
 * Meets PRD requirements:
 * - Filter Rail / Faceted Filters
 * - Basic and Advanced filters (collapsed)
 * - Progressive disclosure pattern
 */
export const FilterRail: React.FC<FilterRailProps> = ({
  filters,
  values,
  onChange,
  onClear,
  onApply,
  mode = 'rail',
  drawerVisible = false,
  onDrawerClose,
  className = '',
  showAdvanced = false,
  onToggleAdvanced,
}) => {
  // Count active filters
  const activeFilterCount = Object.keys(values).filter(
    (key) => values[key] !== undefined && values[key] !== null && values[key] !== ''
  ).length;

  // Separate basic and advanced filters
  const basicFilters = filters.filter((f) => !f.advanced);
  const advancedFilters = filters.filter((f) => f.advanced);

  // Render individual filter based on type
  const renderFilter = (filter: FilterConfig) => {
    const value = values[filter.key];

    switch (filter.type) {
      case 'select':
        return (
          <Select
            style={{ width: '100%' }}
            placeholder={filter.placeholder || `Select ${filter.label}`}
            value={value}
            onChange={(val) => onChange(filter.key, val)}
            allowClear
            options={filter.options}
            aria-label={filter.label}
          />
        );

      case 'multiSelect':
        return (
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder={filter.placeholder || `Select ${filter.label}`}
            value={value || []}
            onChange={(val) => onChange(filter.key, val)}
            allowClear
            options={filter.options}
            maxTagCount="responsive"
            aria-label={filter.label}
          />
        );

      case 'input':
        return (
          <Input
            placeholder={filter.placeholder || `Enter ${filter.label}`}
            value={value}
            onChange={(e) => onChange(filter.key, e.target.value)}
            allowClear
            aria-label={filter.label}
          />
        );

      case 'dateRange':
        return (
          <RangePicker
            style={{ width: '100%' }}
            value={value}
            onChange={(dates: [Dayjs | null, Dayjs | null] | null) =>
              onChange(filter.key, dates)
            }
            aria-label={filter.label}
          />
        );

      default:
        return null;
    }
  };

  // Render filter group
  const renderFilterGroup = (filterList: FilterConfig[], title?: string) => (
    <>
      {title && <h4 className="filter-group-title">{title}</h4>}
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {filterList.map((filter) => (
          <div key={filter.key} className="filter-item">
            <label className="filter-label" htmlFor={filter.key}>
              {filter.label}
            </label>
            {renderFilter(filter)}
          </div>
        ))}
      </Space>
    </>
  );

  // Render filter actions
  const renderActions = () => (
    <div className="filter-actions">
      <Space size="small" style={{ width: '100%' }}>
        <Button onClick={onClear} block disabled={activeFilterCount === 0}>
          Clear All
        </Button>
        {onApply && (
          <Button type="primary" onClick={onApply} block>
            Apply Filters
          </Button>
        )}
      </Space>
    </div>
  );

  // Render filter content
  const renderContent = () => (
    <div className={`filter-rail-content ${className}`}>
      {/* Active filter count */}
      {activeFilterCount > 0 && (
        <div className="filter-count-badge">
          <Badge count={activeFilterCount} style={{ backgroundColor: '#1890ff' }}>
            <FilterOutlined /> {activeFilterCount} active filter{activeFilterCount > 1 ? 's' : ''}
          </Badge>
        </div>
      )}

      {/* Basic filters */}
      {basicFilters.length > 0 && (
        <div className="filter-section">
          {renderFilterGroup(basicFilters, 'Filters')}
        </div>
      )}

      {/* Advanced filters (collapsible) */}
      {advancedFilters.length > 0 && (
        <div className="filter-section">
          <Button
            type="link"
            onClick={onToggleAdvanced}
            style={{ padding: 0, marginBottom: 12 }}
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
          </Button>
          {showAdvanced && renderFilterGroup(advancedFilters, 'Advanced')}
        </div>
      )}

      {/* Actions */}
      {renderActions()}
    </div>
  );

  // Render as drawer for mobile/responsive mode
  if (mode === 'drawer') {
    return (
      <Drawer
        title="Filters"
        placement="left"
        width={320}
        open={drawerVisible}
        onClose={onDrawerClose}
        closeIcon={<CloseOutlined aria-label="Close filters" />}
      >
        {renderContent()}
      </Drawer>
    );
  }

  // Render as rail (default)
  return <Card className="filter-rail">{renderContent()}</Card>;
};

// CSS for the filter rail (to be added to global.css)
export const filterRailStyles = `
.filter-rail {
  height: fit-content;
  position: sticky;
  top: var(--spacing-lg);
}

.filter-rail-content {
  padding: var(--spacing-sm);
}

.filter-count-badge {
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-sm);
  background: #e6f7ff;
  border-radius: var(--border-radius);
  text-align: center;
}

.filter-section {
  margin-bottom: var(--spacing-lg);
}

.filter-group-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.filter-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.filter-actions {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
}

/* Responsive: convert to drawer on small screens */
@media (max-width: 768px) {
  .filter-rail {
    display: none;
  }
}
`;
