import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card, Select, Input, DatePicker, Space, Button, Tag, Row, Col, Badge, Collapse } from 'antd';
import { FilterOutlined, CloseOutlined, SearchOutlined } from '@ant-design/icons';
import './FilterBar.css';

const { RangePicker } = DatePicker;
const { Panel } = Collapse;

export interface FilterOption {
  label: string;
  value: string | number | boolean;
  count?: number; // Optional result count for this filter value
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'multiSelect' | 'input' | 'dateRange' | 'range' | 'chips';
  options?: FilterOption[];
  placeholder?: string;
  basic?: boolean; // If false, shows in advanced section (default: true for backward compat)
  advanced?: boolean; // Backward compat with FilterRail
  debounce?: number; // Debounce delay in ms (default: 300ms for input, 0 for others)
  allowClear?: boolean; // Allow clearing individual filter (default: true)
}

export interface FilterValues {
  [key: string]: any;
}

/**
 * Active Filter Display
 * Shows which filters are currently applied with removable chips
 */
interface ActiveFilter {
  key: string;
  label: string;
  value: any;
  displayValue: string;
}

interface FilterBarProps {
  filters: FilterConfig[];
  values: FilterValues;
  onChange: (key: string, value: any) => void;
  onClear: () => void;
  
  // Advanced filters
  showAdvanced?: boolean;
  onToggleAdvanced?: () => void;

  // Styling
  className?: string;
  compact?: boolean; // Compact layout for narrow spaces
  
  // Accessibility
  ariaLabel?: string;
}

/**
 * FilterBar Component
 * 
 * Per Sprint 1 §4.2: FilterBar (Basic + Advanced)
 * 
 * Key Features:
 * - Basic filters (always visible): Status chips, Owner dropdown, Date range
 * - Advanced filters (collapsed): Category, Region, COI flag, Needs action
 * - 300ms debounce for text inputs (prevents excessive updates)
 * - Active filter chips with individual remove actions
 * - "Reset" button clears all filters + URL params
 * - Integrated with useQueryParams for URL synchronization
 * 
 * UX Principles:
 * - Progressive Disclosure (§2.1): Advanced filters collapsed by default
 * - Immediate feedback: Filter changes update immediately (with debounce)
 * - Visual affordance: Active filters shown as removable chips
 * - Accessibility: ARIA labels, keyboard navigation
 * 
 * Improvements over FilterRail:
 * - Debouncing to reduce update frequency (prevents lag)
 * - Active filter chips for at-a-glance understanding
 * - Horizontal layout option for better space utilization
 * - Chip-style multi-select for status filters (more intuitive)
 * - Better mobile responsiveness
 * 
 * Edge Cases Handled:
 * - Empty array values → removed from active filters
 * - Null/undefined → ignored
 * - Rapid typing → debounced to 300ms
 * - Date ranges → formatted for display
 * - Multi-select → comma-separated display
 */
export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  values,
  onChange,
  onClear,
  showAdvanced = false,
  onToggleAdvanced,
  className = '',
  compact = false,
  ariaLabel = 'Filter controls',
}) => {
  // Debounce timers for input fields
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  // Local state for input fields (to show immediate feedback while debouncing)
  const [localInputValues, setLocalInputValues] = useState<Record<string, string>>({});

  // Cleanup debounce timers on unmount
  useEffect(() => {
    const timers = debounceTimers.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  /**
   * Handle filter change with optional debouncing
   */
  const handleFilterChange = useCallback(
    (key: string, value: any, debounceMs?: number) => {
      const filter = filters.find((f) => f.key === key);
      const shouldDebounce = debounceMs !== undefined ? debounceMs : filter?.debounce ?? 0;

      // Clear existing debounce timer for this key
      if (debounceTimers.current[key]) {
        clearTimeout(debounceTimers.current[key]);
      }

      if (shouldDebounce > 0) {
        // Update local state immediately for UI feedback
        if (filter?.type === 'input') {
          setLocalInputValues((prev) => ({ ...prev, [key]: value }));
        }

        // Debounce the actual onChange call
        debounceTimers.current[key] = setTimeout(() => {
          onChange(key, value);
          delete debounceTimers.current[key];
        }, shouldDebounce);
      } else {
        // No debounce - call immediately
        onChange(key, value);
      }
    },
    [filters, onChange]
  );

  /**
   * Calculate active filters for chip display
   */
  const activeFilters = React.useMemo((): ActiveFilter[] => {
    const active: ActiveFilter[] = [];

    filters.forEach((filter) => {
      const value = values[filter.key];

      // Skip empty values
      if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
        return;
      }

      // Format display value based on type
      let displayValue = '';

      if (Array.isArray(value)) {
        // Multi-select: show labels
        const labels = value
          .map((v) => filter.options?.find((opt) => opt.value === v)?.label || v)
          .filter(Boolean);
        displayValue = labels.join(', ');
      } else if (filter.type === 'dateRange' && Array.isArray(value)) {
        // Date range
        const [start, end] = value;
        if (start && end) {
          displayValue = `${start.format('MMM D')} - ${end.format('MMM D')}`;
        }
      } else {
        // Single value: find label or use value
        const option = filter.options?.find((opt) => opt.value === value);
        displayValue = option?.label || String(value);
      }

      if (displayValue) {
        active.push({
          key: filter.key,
          label: filter.label,
          value,
          displayValue,
        });
      }
    });

    return active;
  }, [filters, values]);

  /**
   * Remove individual filter
   */
  const handleRemoveFilter = useCallback(
    (key: string) => {
      const filter = filters.find((f) => f.key === key);
      if (!filter) return;

      // Clear the filter value
      onChange(key, filter.type === 'multiSelect' || filter.type === 'chips' ? [] : null);
    },
    [filters, onChange]
  );

  /**
   * Render filter control based on type
   */
  const renderFilter = (filter: FilterConfig) => {
    const value = values[filter.key];
    const localValue = localInputValues[filter.key];

    switch (filter.type) {
      case 'select':
        return (
          <Select
            style={{ width: '100%', minWidth: 150 }}
            placeholder={filter.placeholder || `Select ${filter.label}`}
            value={value}
            onChange={(val) => handleFilterChange(filter.key, val)}
            allowClear={filter.allowClear ?? true}
            options={filter.options}
            aria-label={filter.label}
          />
        );

      case 'multiSelect':
        return (
          <Select
            mode="multiple"
            style={{ width: '100%', minWidth: 200 }}
            placeholder={filter.placeholder || `Select ${filter.label}`}
            value={value || []}
            onChange={(val) => handleFilterChange(filter.key, val)}
            allowClear={filter.allowClear ?? true}
            options={filter.options}
            maxTagCount="responsive"
            aria-label={filter.label}
          />
        );

      case 'chips':
        // Chip-style multi-select (better for status filters)
        return (
          <Space wrap>
            {filter.options?.map((option) => {
              const isSelected = Array.isArray(value) && value.includes(option.value);
              return (
                <Tag.CheckableTag
                  key={String(option.value)}
                  checked={isSelected}
                  onChange={(checked) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    const newValues = checked
                      ? [...currentValues, option.value]
                      : currentValues.filter((v) => v !== option.value);
                    handleFilterChange(filter.key, newValues);
                  }}
                >
                  {option.label}
                  {option.count !== undefined && ` (${option.count})`}
                </Tag.CheckableTag>
              );
            })}
          </Space>
        );

      case 'input':
        return (
          <Input
            style={{ width: '100%', minWidth: 200 }}
            placeholder={filter.placeholder || `Search ${filter.label}`}
            value={localValue !== undefined ? localValue : value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value, filter.debounce ?? 300)}
            allowClear
            prefix={<SearchOutlined />}
            aria-label={filter.label}
          />
        );

      case 'dateRange':
        return (
          <RangePicker
            style={{ width: '100%', minWidth: 250 }}
            value={value}
            onChange={(dates) => handleFilterChange(filter.key, dates)}
            aria-label={filter.label}
            allowClear={filter.allowClear ?? true}
          />
        );

      default:
        return null;
    }
  };

  // Separate basic and advanced filters
  const basicFilters = filters.filter((f) => f.basic !== false);
  const advancedFilters = filters.filter((f) => f.basic === false);

  const hasAdvancedFilters = advancedFilters.length > 0;
  const activeCount = activeFilters.length;

  return (
    <div className={`filter-bar ${compact ? 'filter-bar-compact' : ''} ${className}`} role="region" aria-label={ariaLabel}>
      <Card className="filter-bar-card">
        {/* Active Filters Display */}
        {activeCount > 0 && (
          <div className="filter-bar-active">
            <Space size="small" wrap>
              <Badge count={activeCount} style={{ backgroundColor: '#1890ff' }}>
                <FilterOutlined style={{ fontSize: 16 }} />
              </Badge>
              {activeFilters.map((filter) => (
                <Tag
                  key={filter.key}
                  closable
                  onClose={() => handleRemoveFilter(filter.key)}
                  className="filter-active-tag"
                >
                  <strong>{filter.label}:</strong> {filter.displayValue}
                </Tag>
              ))}
              <Button
                type="link"
                size="small"
                onClick={onClear}
                icon={<CloseOutlined />}
                className="filter-clear-all"
              >
                Clear All
              </Button>
            </Space>
          </div>
        )}

        {/* Basic Filters (Always Visible) */}
        {basicFilters.length > 0 && (
          <div className="filter-bar-basic">
            <Row gutter={[16, 16]} align="middle">
              {basicFilters.map((filter) => (
                <Col key={filter.key} xs={24} sm={12} md={8} lg={filter.type === 'chips' ? 24 : 8}>
                  <div className="filter-item">
                    <label className="filter-label" htmlFor={filter.key}>
                      {filter.label}
                    </label>
                    {renderFilter(filter)}
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        )}

        {/* Advanced Filters (Collapsible) */}
        {hasAdvancedFilters && (
          <div className="filter-bar-advanced">
            <Collapse
              ghost
              activeKey={showAdvanced ? ['advanced'] : []}
              onChange={() => onToggleAdvanced?.()}
            >
              <Panel
                header={
                  <Space>
                    <FilterOutlined />
                    <span>Advanced Filters</span>
                    {advancedFilters.some((f) => {
                      const v = values[f.key];
                      return v !== undefined && v !== null && v !== '' && (!Array.isArray(v) || v.length > 0);
                    }) && <Badge dot />}
                  </Space>
                }
                key="advanced"
              >
                <Row gutter={[16, 16]} align="middle">
                  {advancedFilters.map((filter) => (
                    <Col key={filter.key} xs={24} sm={12} md={8}>
                      <div className="filter-item">
                        <label className="filter-label" htmlFor={filter.key}>
                          {filter.label}
                        </label>
                        {renderFilter(filter)}
                      </div>
                    </Col>
                  ))}
                </Row>
              </Panel>
            </Collapse>
          </div>
        )}

        {/* Clear Button (if no active filters shown) */}
        {activeCount === 0 && (
          <div className="filter-bar-actions">
            <Button
              onClick={onClear}
              size="small"
              disabled
              icon={<CloseOutlined />}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
