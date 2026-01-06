# FilterBar Component

## Overview

FilterBar is the **enhanced filtering component** for the Co-Selector Admin Console, fully implementing Sprint 1 §4.2 requirements. It provides an intuitive, accessible interface for basic and advanced filtering with URL synchronization.

## Purpose

FilterBar serves as the standard filtering UI for all list and queue views. It ensures:

- **Progressive Disclosure**: Basic filters always visible, advanced collapsed
- **Immediate Feedback**: 300ms debounced updates for text inputs
- **URL Synchronization**: Filter state reflected in shareable URLs
- **Visual Clarity**: Active filters shown as removable chips
- **Accessibility**: ARIA labels, keyboard navigation, focus management

## Key Features vs FilterRail

### FilterBar (New - Sprint 1 Compliant)
- ✅ 300ms debounce for text inputs (prevents lag)
- ✅ Active filter chips with individual remove actions
- ✅ Chip-style multi-select for status filters (more intuitive)
- ✅ Horizontal responsive layout
- ✅ Progressive disclosure (Basic/Advanced sections)
- ✅ Integrated with useQueryParams for URL sync
- ✅ Better accessibility (ARIA, keyboard nav)

### FilterRail (Legacy)
- ❌ No debouncing (updates on every keystroke)
- ❌ No active filter visualization
- ❌ Vertical-only layout (less space efficient)
- ❌ Basic UI components only

## Migration Path

**For new components**: Use FilterBar
**For existing components**: Keep FilterRail for now, migrate when time permits

## Usage

### Basic Example

```tsx
import { FilterBar } from '@/components/FilterBar';
import { useQueryParams, createQueryParamsConfig } from '@/hooks/useQueryParams';

function LeadQueue() {
  // Setup URL-synchronized filters
  const queryConfig = createQueryParamsConfig({
    status: { type: 'array', defaultValue: [] },
    owner: { type: 'string', defaultValue: '' },
    date_from: { type: 'date' },
    date_to: { type: 'date' },
  });

  const { queryParams, setQueryParam, clearQueryParams } = useQueryParams(queryConfig);

  const filters = [
    {
      key: 'status',
      label: 'Status',
      type: 'chips',
      basic: true, // Always visible
      options: [
        { label: 'Draft', value: 'DRAFT' },
        { label: 'Submitted', value: 'SUBMITTED' },
        { label: 'Under Review', value: 'UNDER_REVIEW' },
      ],
    },
    {
      key: 'owner',
      label: 'Owner',
      type: 'select',
      basic: true,
      options: [
        { label: 'All', value: '' },
        { label: 'Assigned to me', value: 'me' },
        { label: 'Unassigned', value: 'unassigned' },
      ],
    },
    {
      key: 'category',
      label: 'Category',
      type: 'select',
      basic: false, // Collapsed in Advanced
      options: categoryOptions,
    },
  ];

  return (
    <FilterBar
      filters={filters}
      values={queryParams}
      onChange={setQueryParam}
      onClear={clearQueryParams}
      showAdvanced={showAdvanced}
      onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
    />
  );
}
```

### With Debounced Search Input

```tsx
const filters = [
  {
    key: 'merchant_name',
    label: 'Merchant Name',
    type: 'input',
    basic: true,
    placeholder: 'Search by merchant name...',
    debounce: 300, // Wait 300ms after user stops typing
  },
];
```

### With Date Range

```tsx
const filters = [
  {
    key: 'submitted_date',
    label: 'Submitted Date',
    type: 'dateRange',
    basic: true,
  },
];
```

### With Multi-Select (Dropdown)

```tsx
const filters = [
  {
    key: 'regions',
    label: 'Regions',
    type: 'multiSelect',
    basic: false, // Advanced filter
    options: [
      { label: 'North America', value: 'NA' },
      { label: 'Europe', value: 'EU' },
      { label: 'Asia Pacific', value: 'APAC' },
    ],
  },
];
```

### With Chip-Style Multi-Select (Status)

```tsx
const filters = [
  {
    key: 'status',
    label: 'Status',
    type: 'chips', // Chip-style UI
    basic: true,
    options: [
      { label: 'Draft', value: 'DRAFT', count: 5 }, // Optional count
      { label: 'Submitted', value: 'SUBMITTED', count: 12 },
      { label: 'Approved', value: 'APPROVED', count: 8 },
    ],
  },
];
```

## Props API

### FilterBarProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `filters` | `FilterConfig[]` | Yes | Array of filter configurations |
| `values` | `FilterValues` | Yes | Current filter values (from queryParams) |
| `onChange` | `(key: string, value: any) => void` | Yes | Filter change handler (setQueryParam) |
| `onClear` | `() => void` | Yes | Clear all filters handler (clearQueryParams) |
| `showAdvanced` | `boolean` | No | Show advanced filters section (default: false) |
| `onToggleAdvanced` | `() => void` | No | Toggle advanced filters handler |
| `className` | `string` | No | Additional CSS class |
| `compact` | `boolean` | No | Compact layout mode (default: false) |
| `ariaLabel` | `string` | No | ARIA label for accessibility |

### FilterConfig

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `key` | `string` | Yes | Unique filter key (must match queryParams key) |
| `label` | `string` | Yes | Display label |
| `type` | `'select' \| 'multiSelect' \| 'input' \| 'dateRange' \| 'chips'` | Yes | Filter UI type |
| `options` | `FilterOption[]` | Conditional | Required for select/multiSelect/chips |
| `placeholder` | `string` | No | Placeholder text |
| `basic` | `boolean` | No | If false, shows in advanced section (default: true) |
| `debounce` | `number` | No | Debounce delay in ms (default: 300 for input, 0 for others) |
| `allowClear` | `boolean` | No | Show clear button (default: true) |

### FilterOption

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Display label |
| `value` | `string \| number \| boolean` | Filter value |
| `count` | `number` | Optional result count badge |

## Integration with useQueryParams

FilterBar is designed to work seamlessly with the useQueryParams hook for URL synchronization:

```tsx
// 1. Define query param config
const queryConfig = createQueryParamsConfig({
  status: { type: 'array', defaultValue: [] },
  owner: { type: 'string', defaultValue: '' },
  search: { type: 'string', defaultValue: '' },
});

// 2. Get query params and handlers
const { queryParams, setQueryParam, clearQueryParams } = useQueryParams(queryConfig);

// 3. Pass to FilterBar
<FilterBar
  filters={filterConfigs}
  values={queryParams} // Current URL values
  onChange={setQueryParam} // Updates URL
  onClear={clearQueryParams} // Clears URL params
/>
```

**URL Example**: `?status=SUBMITTED&status=UNDER_REVIEW&owner=john@example.com`

## Debouncing Behavior

FilterBar automatically debounces text input changes to prevent excessive updates:

```tsx
// Default debounce for text inputs: 300ms
{
  key: 'search',
  type: 'input',
  debounce: 300, // Optional, 300ms is default for input
}

// No debounce for select/chips (immediate update)
{
  key: 'status',
  type: 'chips',
  // debounce not needed - instant selection
}
```

**Why debounce?**
- Prevents lag when typing quickly
- Reduces URL history pollution
- Improves performance for expensive filter operations
- Better UX (doesn't feel sluggish)

## Active Filter Chips

FilterBar automatically displays active filters as removable chips:

```
[🔵 3] [Status: Draft, Submitted] [Owner: John Smith] [X Clear All]
```

**Features**:
- Shows count of active filters
- Each chip displays "Label: Value"
- Individual remove (X) button per filter
- "Clear All" button removes all filters
- Hidden when no filters active

## Progressive Disclosure

Per Sprint 1 §2.1, FilterBar implements progressive disclosure:

### Basic Filters (Always Visible)
- Status (multi-select chips)
- Owner (dropdown)
- Date range (range picker)
- High-frequency controls

### Advanced Filters (Collapsed)
- Category
- Region
- COI flag
- Needs action
- Low-frequency controls

**Toggle Button**: "Show Advanced Filters" / "Hide Advanced Filters"

## Accessibility

FilterBar follows Sprint 1 accessibility requirements:

- ✅ **ARIA Labels**: All inputs have proper labels
- ✅ **Keyboard Navigation**: Full Tab/Shift+Tab support
- ✅ **Focus Indicators**: Visible focus rings
- ✅ **Screen Readers**: Semantic HTML + ARIA roles
- ✅ **Error Prevention**: Clear visual feedback
- ✅ **No Color-Only**: Text labels for all states

## Edge Cases Handled

1. **Empty Arrays**: Removed from active filters and URL
2. **Null/Undefined**: Treated as "no filter"
3. **Rapid Typing**: Debounced to 300ms
4. **Date Ranges**: Formatted for display ("Jan 1 - Jan 31")
5. **Multi-Select**: Comma-separated display ("Draft, Submitted")
6. **Invalid Values**: Ignored gracefully
7. **Browser Back/Forward**: URL state restored correctly
8. **Page Reload**: Filter state preserved via URL

## Responsive Design

FilterBar adapts to screen size:

### Desktop (≥768px)
- Horizontal layout with 3 columns
- All basic filters visible
- Advanced section collapsible

### Tablet (≥576px, <768px)
- 2-column layout
- Reduced spacing

### Mobile (<576px)
- Single column
- Stacked filters
- Touch-friendly tap targets

## Sprint 1 Compliance

FilterBar implements Sprint 1 §4.2 requirements:

- ✅ **Basic filters always visible**: Status chips, Owner dropdown, Date range
- ✅ **Advanced filters collapsed**: Category, Region, COI flag, Needs action
- ✅ **300ms debounce**: Text inputs debounced to prevent lag
- ✅ **Active filter chips**: Removable chips show current filters
- ✅ **Reset clears URL**: "Clear All" removes all URL params
- ✅ **URL synchronization**: Integrated with useQueryParams hook
- ✅ **Progressive disclosure**: §2.1 compliance
- ✅ **Accessibility**: §2.3 and §2.4 compliance

## Testing

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { FilterBar } from './FilterBar';

describe('FilterBar', () => {
  it('renders basic filters', () => {
    render(
      <BrowserRouter>
        <FilterBar
          filters={[
            { key: 'status', label: 'Status', type: 'chips', basic: true, options: [] },
          ]}
          values={{}}
          onChange={jest.fn()}
          onClear={jest.fn()}
        />
      </BrowserRouter>
    );
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('debounces text input changes', async () => {
    const onChange = jest.fn();
    render(
      <BrowserRouter>
        <FilterBar
          filters={[
            { key: 'search', label: 'Search', type: 'input', basic: true, debounce: 300 },
          ]}
          values={{}}
          onChange={onChange}
          onClear={jest.fn()}
        />
      </BrowserRouter>
    );

    const input = screen.getByPlaceholderText('Search Search');
    fireEvent.change(input, { target: { value: 'test' } });

    // Should not call immediately
    expect(onChange).not.toHaveBeenCalled();

    // Should call after debounce
    await waitFor(() => expect(onChange).toHaveBeenCalledWith('search', 'test'), {
      timeout: 350,
    });
  });

  it('shows active filter chips', () => {
    render(
      <BrowserRouter>
        <FilterBar
          filters={[
            {
              key: 'status',
              label: 'Status',
              type: 'chips',
              basic: true,
              options: [{ label: 'Draft', value: 'DRAFT' }],
            },
          ]}
          values={{ status: ['DRAFT'] }}
          onChange={jest.fn()}
          onClear={jest.fn()}
        />
      </BrowserRouter>
    );
    expect(screen.getByText(/Status:/)).toBeInTheDocument();
    expect(screen.getByText(/Draft/)).toBeInTheDocument();
  });
});
```

## Performance Considerations

- **Debouncing**: Prevents excessive re-renders and URL updates
- **useMemo**: Active filters calculated only when values change
- **useCallback**: Handlers memoized to prevent child re-renders
- **Cleanup**: Debounce timers cleared on unmount (no memory leaks)

## Future Enhancements

Planned for future sprints:

- **Filter Presets**: Save/load common filter combinations
- **Recent Filters**: Quick access to recently used filters
- **Smart Defaults**: Remember user preferences
- **Bulk Clear**: Clear specific filter groups
- **Filter Analytics**: Track most-used filters
