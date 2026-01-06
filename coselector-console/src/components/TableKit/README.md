# TableKit Component

## Overview

TableKit is the **foundational table primitive** for the Co-Selector Admin Console, as specified in Sprint 1 §4.1. It provides a complete, integrated solution combining ActionBar, FilterBar, table display, and pagination in one cohesive component.

## Purpose

TableKit serves as the standard UI pattern for all list and queue views in the admin console. It ensures:

- **Consistency**: All tables follow the same layout and interaction patterns
- **Efficiency**: Pre-integrated components reduce boilerplate code
- **Accessibility**: Built-in keyboard navigation, ARIA labels, and focus management
- **Responsiveness**: Adapts to different screen sizes and data volumes

## Key Features

### Standard UI Regions
```
┌─────────────────────────────────────────────┐
│ Page Title & Description                     │
├─────────────────────────────────────────────┤
│ ActionBar: Primary/Secondary Actions         │
├─────────────────────────────────────────────┤
│ FilterBar: Basic + Advanced Filters          │
├─────────────────────────────────────────────┤
│ Table: Header → Body → Pagination            │
└─────────────────────────────────────────────┘
```

### Core Capabilities

1. **Pagination**
   - Page number and page size controls
   - Configurable page size options (10, 20, 50, 100)
   - Total count display
   - Jump to page

2. **Column Sorting**
   - Client-side ascending/descending sort
   - Visual sort indicators
   - Multi-column sort support

3. **Column Filtering**
   - Basic filters (always visible)
   - Advanced filters (collapsible)
   - Active filter chips with clear actions
   - 300ms debounce on filter changes

4. **Loading States**
   - Skeleton loading for initial data fetch
   - Loading overlay for refresh operations
   - Preserves table structure during load

5. **Empty States**
   - **First-time user**: No data + no filters → CTA to create first item
   - **No results**: Active filters + no data → CTA to clear filters
   - **Default**: Generic empty state with helpful message

6. **Row Selection**
   - Checkbox selection for bulk actions
   - Select all / deselect all
   - Selected count display
   - Preserved across pagination

7. **Row Interaction**
   - Click to open detail drawer
   - Hover effects
   - Keyboard navigation support

## Usage

### Basic Example

```tsx
import { TableKit } from '@/components/TableKit';

function LeadQueue() {
  const columns = [
    {
      key: 'merchant_name',
      title: 'Merchant',
      dataIndex: 'merchant_name',
      sorter: true,
      filterable: true,
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      render: (status) => <Badge status={status} />,
      filters: [
        { text: 'Draft', value: 'DRAFT' },
        { text: 'Submitted', value: 'SUBMITTED' },
      ],
    },
    {
      key: 'submitted_at',
      title: 'Submitted',
      dataIndex: 'submitted_at',
      render: (date) => formatDate(date),
      sorter: true,
    },
  ];

  return (
    <TableKit
      data={leads}
      columns={columns}
      rowKey="id"
      pageTitle="Lead Review Queue"
      resultCount={leads.length}
      primaryAction={{
        label: 'Submit Lead',
        onClick: handleSubmitLead,
      }}
      onRowClick={handleRowClick}
      loading={isLoading}
    />
  );
}
```

### With Filters

```tsx
<TableKit
  data={leads}
  columns={columns}
  rowKey="id"
  pageTitle="Lead Review Queue"
  filters={[
    {
      key: 'status',
      label: 'Status',
      type: 'multiselect',
      options: [
        { label: 'Draft', value: 'DRAFT' },
        { label: 'Submitted', value: 'SUBMITTED' },
        { label: 'Under Review', value: 'UNDER_REVIEW' },
      ],
      basic: true, // Always visible
    },
    {
      key: 'owner',
      label: 'Owner',
      type: 'select',
      options: ownerOptions,
      basic: true,
    },
    {
      key: 'category',
      label: 'Category',
      type: 'select',
      options: categoryOptions,
      basic: false, // Collapsed in Advanced section
    },
  ]}
  filterValues={filterValues}
  onFilterChange={handleFilterChange}
  onFilterClear={handleClearFilters}
  showAdvancedFilters={showAdvanced}
  onToggleAdvancedFilters={toggleAdvanced}
/>
```

### With Row Selection & Bulk Actions

```tsx
<TableKit
  data={leads}
  columns={columns}
  rowKey="id"
  pageTitle="Lead Review Queue"
  selectable
  selectedRowKeys={selectedKeys}
  onSelectionChange={handleSelectionChange}
  bulkActions={[
    {
      key: 'assign',
      label: 'Assign to me',
      icon: <UserOutlined />,
      onClick: handleBulkAssign,
      requireSelection: true,
    },
    {
      key: 'export',
      label: 'Export selected',
      icon: <DownloadOutlined />,
      onClick: handleBulkExport,
      requireSelection: true,
    },
  ]}
/>
```

### With Custom Empty States

```tsx
<TableKit
  data={leads}
  columns={columns}
  rowKey="id"
  pageTitle="My Leads"
  firstTimeEmptyState={{
    title: "You haven't submitted any leads yet",
    description: "Get started by creating your first merchant lead submission",
    action: {
      label: 'Submit First Lead',
      onClick: handleSubmitLead,
    },
  }}
  emptyState={{
    title: 'No leads match your filters',
    description: 'Try adjusting your search criteria or clearing filters',
    action: {
      label: 'Clear Filters',
      onClick: handleClearFilters,
    },
  }}
/>
```

## Props API

### TableKitProps<T>

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `T[]` | Yes | Array of data records to display |
| `columns` | `TableKitColumn<T>[]` | Yes | Column definitions |
| `rowKey` | `string \| (record: T) => string` | Yes | Unique identifier for each row |
| `loading` | `boolean` | No | Loading state (shows skeleton) |
| `pageTitle` | `string` | Yes | Page title displayed at top |
| `pageDescription` | `string` | No | Optional description below title |
| `resultCount` | `number` | No | Total result count (shown in ActionBar) |
| `primaryAction` | `Action` | No | Primary CTA button (e.g., "Submit Lead") |
| `secondaryActions` | `Action[]` | No | Secondary actions (e.g., Export, Columns) |
| `bulkActions` | `BulkAction[]` | No | Actions available when rows selected |
| `onRefresh` | `() => void` | No | Refresh callback (adds Refresh button) |
| `onRowClick` | `(record: T) => void` | No | Row click handler (opens detail) |
| `selectable` | `boolean` | No | Enable row selection checkboxes |
| `selectedRowKeys` | `React.Key[]` | No | Controlled selected row keys |
| `onSelectionChange` | `(keys: React.Key[], rows: T[]) => void` | No | Selection change handler |
| `filters` | `FilterConfig[]` | No | Filter configuration |
| `filterValues` | `FilterValues` | No | Current filter values |
| `onFilterChange` | `(key: string, value: any) => void` | No | Filter change handler |
| `onFilterClear` | `() => void` | No | Clear all filters handler |
| `showAdvancedFilters` | `boolean` | No | Show advanced filter section |
| `onToggleAdvancedFilters` | `() => void` | No | Toggle advanced filters handler |
| `pagination` | `TablePaginationConfig \| false` | No | Pagination config (false to disable) |
| `onPaginationChange` | `(page: number, pageSize: number) => void` | No | Pagination change handler |
| `emptyState` | `EmptyStateConfig` | No | Empty state when filters active |
| `firstTimeEmptyState` | `EmptyStateConfig` | No | Empty state for first-time users |
| `ariaLabel` | `string` | No | ARIA label for accessibility |

### TableKitColumn<T>

Extends Ant Design `ColumnType<T>` with:

| Prop | Type | Description |
|------|------|-------------|
| `filterable` | `boolean` | Enable filtering for this column |
| `searchable` | `boolean` | Include in search functionality |
| `exportable` | `boolean` | Include in CSV export |

## Design Patterns

### Progressive Disclosure

```tsx
// Basic filters always visible
const basicFilters = [
  { key: 'status', label: 'Status', basic: true },
  { key: 'owner', label: 'Owner', basic: true },
  { key: 'date_range', label: 'Date Range', basic: true },
];

// Advanced filters collapsed by default
const advancedFilters = [
  { key: 'category', label: 'Category', basic: false },
  { key: 'region', label: 'Region', basic: false },
  { key: 'coi_flag', label: 'COI Flag', basic: false },
];

<TableKit
  filters={[...basicFilters, ...advancedFilters]}
  showAdvancedFilters={showAdvanced}
  onToggleAdvancedFilters={() => setShowAdvanced(!showAdvanced)}
/>
```

### Permission-Aware Actions

```tsx
<TableKit
  primaryAction={{
    label: 'Approve Lead',
    onClick: handleApprove,
    disabled: !hasPermission('APPROVE_LEADS'),
    tooltip: !hasPermission('APPROVE_LEADS') 
      ? 'Internal only: Ops/BD' 
      : undefined,
  }}
/>
```

### URL-Synchronized Filters

```tsx
function LeadQueue() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const filterValues = {
    status: searchParams.getAll('status'),
    owner: searchParams.get('owner'),
    date_from: searchParams.get('date_from'),
    date_to: searchParams.get('date_to'),
  };

  const handleFilterChange = (key: string, value: any) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (Array.isArray(value)) {
      newParams.delete(key);
      value.forEach(v => newParams.append(key, v));
    } else if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    
    setSearchParams(newParams);
  };

  return (
    <TableKit
      filterValues={filterValues}
      onFilterChange={handleFilterChange}
      // ... other props
    />
  );
}
```

## Accessibility

TableKit follows Sprint 1 accessibility requirements:

- **Keyboard Navigation**: Full keyboard support with Tab/Shift+Tab
- **ARIA Labels**: Proper labeling for screen readers
- **Focus Management**: Visible focus indicators
- **Error Identification**: Text-based error messages (not color-only)
- **Row Click**: Accessible via Enter key when focused

## Relationship to Other Components

### vs. DataTable

- **DataTable**: Low-level table component with sorting, filtering, pagination
- **TableKit**: High-level page component with integrated ActionBar + FilterBar + DataTable

**When to use**:
- Use **TableKit** for full-page list/queue views (Leads, Earnings, Payouts)
- Use **DataTable** when embedding a table in a custom layout (e.g., inside a modal)

### Integration with FilterBar

TableKit accepts FilterBar props directly:

```tsx
<TableKit
  filters={filterConfigs}
  filterValues={currentValues}
  onFilterChange={handleChange}
  onFilterClear={handleClear}
  showAdvancedFilters={showAdvanced}
  onToggleAdvancedFilters={toggleAdvanced}
/>
```

### Integration with ActionBar

TableKit accepts ActionBar props directly:

```tsx
<TableKit
  primaryAction={{ label: '...', onClick: ... }}
  secondaryActions={[{ label: '...', onClick: ... }]}
  bulkActions={[{ key: '...', label: '...', onClick: ... }]}
/>
```

## Sprint 1 Compliance

TableKit implements Sprint 1 §4.1 requirements:

- ✅ **Pagination**: Page + page size with configurable options
- ✅ **Column Sort**: Client-side ascending/descending with visual indicators
- ✅ **Column Filters**: Basic + Advanced with 300ms debounce
- ✅ **Loading State**: Skeleton loading preserves table structure
- ✅ **Empty States**: Actionable CTAs for first-time and no-results scenarios
- ✅ **Row Selection**: Checkbox selection for bulk actions
- ✅ **Row Click**: Opens Detail Drawer
- ✅ **Standard UI Regions**: ActionBar + FilterBar + Table + Pagination
- ✅ **Responsive Design**: Mobile-friendly layout
- ✅ **Accessibility**: ARIA labels, keyboard navigation, focus indicators

## Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TableKit } from './TableKit';

describe('TableKit', () => {
  it('renders page title', () => {
    render(
      <TableKit
        data={[]}
        columns={[]}
        rowKey="id"
        pageTitle="Test Table"
      />
    );
    expect(screen.getByText('Test Table')).toBeInTheDocument();
  });

  it('shows first-time empty state when no data and no filters', () => {
    render(
      <TableKit
        data={[]}
        columns={[]}
        rowKey="id"
        pageTitle="Test Table"
        firstTimeEmptyState={{
          title: 'No items yet',
          description: 'Create your first item',
        }}
      />
    );
    expect(screen.getByText('No items yet')).toBeInTheDocument();
  });

  it('calls onRowClick when row is clicked', () => {
    const handleClick = jest.fn();
    const data = [{ id: '1', name: 'Test' }];
    
    render(
      <TableKit
        data={data}
        columns={[{ key: 'name', dataIndex: 'name', title: 'Name' }]}
        rowKey="id"
        pageTitle="Test Table"
        onRowClick={handleClick}
      />
    );
    
    fireEvent.click(screen.getByText('Test'));
    expect(handleClick).toHaveBeenCalledWith(data[0]);
  });
});
```

## Future Enhancements

Planned for future sprints:

- **Saved Views**: Save and load filter/sort presets
- **Column Reordering**: Drag-and-drop column rearrangement
- **Column Resizing**: Adjustable column widths
- **Inline Editing**: Edit cells directly in table
- **Virtual Scrolling**: Handle 10,000+ rows efficiently
- **Export Options**: CSV, Excel, PDF export formats
