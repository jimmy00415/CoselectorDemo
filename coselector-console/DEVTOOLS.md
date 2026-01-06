# Developer Tools Documentation

## Overview

The Developer Tools system provides powerful utilities for testing, debugging, and demonstrating the Co-Selector application. It implements a modular, context-based architecture designed for reliability and production safety.

## Architecture

### Design Principles

1. **Isolated State Management**: DevTools use separate React Context to avoid polluting application state
2. **Environment Guards**: Multiple layers of protection prevent production leaks
3. **Persistent Settings**: User preferences saved to localStorage
4. **Keyboard Shortcuts**: Global hotkey (Ctrl+Shift+D / Cmd+Shift+D) for quick access
5. **Modular Design**: Clean separation between utilities, context, and UI components

### Component Structure

```
components/
  DevTools/
    DevToolsPanel.tsx    # Main UI component (drawer with tabs)
    devTools.css         # Styling
    index.ts             # Exports

contexts/
  DevToolsContext.tsx    # State management + keyboard handler

utils/
  devTools.ts            # Mock data generation utilities
```

## Features

### 1. Role Switching (Tab 1)

**Purpose**: Quickly switch between user roles to test different permission levels

**Roles Available**:
- **CO_SELECTOR**: Regular user (can create/submit leads)
- **OPS_BD**: Operations/Business Development (can review/approve leads)
- **FINANCE**: Finance team (view-only access)

**How to Use**:
1. Open DevTools (Ctrl+Shift+D)
2. Select "Role" tab
3. Click role button to switch
4. UI updates immediately with new permissions

**Technical Details**:
- Uses `AuthContext.switchRole()` method
- Persists to localStorage
- Triggers full UI re-render with new permissions

### 2. Mock Data Generation (Tab 2)

**Purpose**: Generate realistic test data following business logic

**Features**:

#### Generate Single Lead
Create one lead in a specific status:
- **DRAFT**: Incomplete lead (missing contact info)
- **SUBMITTED**: Awaiting review assignment
- **UNDER_REVIEW**: Has assigned owner
- **INFO_REQUESTED**: Missing info with specific requests
- **APPROVED**: Approved with timeline
- **REJECTED**: Rejected with reasons

#### Generate Batch
Creates 10 diverse leads covering:
- 2 SUBMITTED (no owner)
- 2 UNDER_REVIEW (with owner)
- 2 INFO_REQUESTED (with missing data)
- 2 APPROVED
- 2 REJECTED

#### Data Management
- **Refresh from Storage**: Reload page to see updated data
- **Reset All Data**: Clear localStorage and regenerate seed data

**Technical Details**:
- Uses `generateMockLead()` utility with status-aware logic
- Generates complete timeline events following state machine rules
- Random but realistic merchant data (categories, regions, cities)
- Proper timestamp distribution (last 7 days)

### 3. Timeline Injection (Tab 3)

**Purpose**: Manually inject timeline events for testing edge cases

**Form Fields**:
- **Lead ID**: Target lead identifier (required)
- **Event Type**: Type of event (STATUS_CHANGED, OWNER_ASSIGNED, etc.)
- **Actor Type**: Who performed the action (CO_SELECTOR, OPS_BD, SYSTEM, FINANCE)
- **Reason Code**: Short code for event reason
- **Metadata**: JSON object with additional context (optional)

**Example Metadata**:
```json
{
  "previousStatus": "SUBMITTED",
  "newStatus": "UNDER_REVIEW",
  "reviewNotes": "High priority merchant"
}
```

**Technical Details**:
- Uses `createCustomTimelineEvent()` utility
- Validates lead existence before injection
- Updates lead's timeline array atomically
- Maintains timeline chronological order

### 4. Settings (Tab 4)

**Purpose**: Configure DevTools behavior and view environment info

**Settings**:
- **Keyboard Shortcuts**: Enable/disable Ctrl+Shift+D hotkey
- **Auto Refresh**: Automatically reload after data changes
- **Mock Data Enabled**: Toggle mock data generation features

**Environment Info**:
- **Mode**: Development/Production
- **User**: Current logged-in user email
- **Role**: Current user role
- **Storage**: localStorage/sessionStorage

**Actions**:
- **Reset All Settings**: Restore default DevTools configuration

## Keyboard Shortcuts

### Global Hotkey

**Windows/Linux**: `Ctrl + Shift + D`
**macOS**: `Cmd + Shift + D`

**Action**: Toggle DevTools panel open/closed

**Technical Details**:
- Event listener attached to `window`
- Cross-platform detection (`navigator.platform`)
- `preventDefault()` prevents browser conflicts
- Only active when `keyboardShortcuts` setting enabled

## Mock Data Utilities

### generateMockLead(options)

Generates a realistic lead with complete timeline.

**Parameters**:
```typescript
{
  status?: LeadStatus;        // Target status (default: SUBMITTED)
  hasOwner?: boolean;        // Assign owner? (auto for non-SUBMITTED)
  hasMissingInfo?: boolean;  // Leave contact fields empty?
}
```

**Returns**: `Lead` object with:
- Random merchant name, category, region, city
- Realistic contact information (unless `hasMissingInfo=true`)
- Complete timeline with status-appropriate events
- Proper timestamps (last 7 days distribution)
- Assigned owner (for UNDER_REVIEW+ statuses)

**Business Logic**:
- **SUBMITTED**: Basic timeline with LEAD_SUBMITTED event
- **UNDER_REVIEW**: + OWNER_ASSIGNED + STATUS_CHANGED events
- **INFO_REQUESTED**: + INFO_REQUESTED event with `requestedItems`
- **APPROVED**: + APPROVED event with approval reasons
- **REJECTED**: + REJECTED event with rejection reasons

### generateLeadBatch(count)

Generates diverse batch of leads.

**Parameters**:
- `count`: Number of leads to generate (default: 10)

**Returns**: Array of `Lead` objects covering all scenarios

**Distribution**:
- 20% SUBMITTED (no owner, complete info)
- 20% UNDER_REVIEW (with owner)
- 20% INFO_REQUESTED (missing contact info)
- 20% APPROVED
- 20% REJECTED

### createCustomTimelineEvent(lead, eventType, actorType, reasonCode, metadata)

Creates custom timeline event for manual injection.

**Parameters**:
```typescript
lead: Lead;                    // Target lead
eventType: string;            // Event type (e.g., "STATUS_CHANGED")
actorType: ActorType;         // Actor performing action
reasonCode?: string;          // Optional reason code
metadata?: Record<string, any>; // Optional additional data
```

**Returns**: `TimelineEvent` object ready to append to timeline

### generateUserProfile(role)

Generates mock user profile for role switching.

**Parameters**:
- `role`: UserRole enum value

**Returns**: User profile object with role-specific attributes

## Environment Detection

DevTools are only available when **ANY** of these conditions is true:

1. `process.env.NODE_ENV === 'development'`
2. `localStorage.getItem('coselector_dev_mode') === 'true'`
3. `window.location.hostname === 'localhost'`
4. `window.location.hostname.includes('127.0.0.1')`

### Manual Override

Force enable DevTools in any environment:

```javascript
localStorage.setItem('coselector_dev_mode', 'true');
window.location.reload();
```

Force disable:

```javascript
localStorage.removeItem('coselector_dev_mode');
window.location.reload();
```

### Production Safety

**Context Guard**: If not in dev environment, `DevToolsProvider` returns `null` from context:

```typescript
const useDevTools = () => {
  const context = useContext(DevToolsContext);
  // Returns null in production, preventing access
  return context;
};
```

**Component Guard**: `DevToolsPanel` checks context before rendering:

```typescript
if (!devTools) return null;
```

## Persistence

### localStorage Keys

- **`coselector_dev_tools_state`**: DevTools settings
  ```json
  {
    "isEnabled": true,
    "isPanelOpen": false,
    "autoRefresh": false,
    "mockDataEnabled": true,
    "keyboardShortcuts": true
  }
  ```

- **`coselector_dev_mode`**: Manual dev mode override flag

### Settings Persistence

Settings automatically save on change and restore on page load.

**Clear All Settings**:
1. Open DevTools
2. Go to Settings tab
3. Click "Reset All Settings"

Or programmatically:
```javascript
localStorage.removeItem('coselector_dev_tools_state');
```

## Integration

### App.tsx

DevTools integrated at top level:

```tsx
<DevToolsProvider forceEnable={true}>
  <AuthProvider>
    <DevToolsPanel />
    <HashRouter>
      {/* App content */}
    </HashRouter>
  </AuthProvider>
</DevToolsProvider>
```

**Note**: `forceEnable={true}` bypasses environment checks for demo purposes. Remove for production builds.

### Using DevTools Context

Access DevTools state in any component:

```tsx
import { useDevTools } from '../contexts/DevToolsContext';

const MyComponent = () => {
  const devTools = useDevTools();
  
  if (!devTools) {
    // Not in dev mode, hide dev features
    return null;
  }
  
  const { state, openPanel, closePanel } = devTools;
  
  return (
    <Button onClick={openPanel}>
      Open DevTools
    </Button>
  );
};
```

## Testing Workflows

### Test Role-Based Access Control

1. Press `Ctrl+Shift+D` to open DevTools
2. Switch to **CO_SELECTOR** role
3. Navigate to Leads page
4. Verify: Can create/submit leads, cannot review/approve
5. Switch to **OPS_BD** role
6. Verify: Can review/approve leads, see Admin menu
7. Switch to **FINANCE** role
8. Verify: Read-only access, limited actions

### Test Lead Workflow

1. Generate SUBMITTED lead
2. Switch to OPS_BD role
3. Assign lead to self and move to UNDER_REVIEW
4. Request additional information
5. Switch to CO_SELECTOR role
6. Provide requested information
7. Switch back to OPS_BD
8. Approve or reject lead
9. Verify complete timeline

### Test Timeline Events

1. Generate a lead in any status
2. Copy lead ID
3. Open DevTools → Timeline tab
4. Inject custom event:
   - Event Type: STATUS_CHANGED
   - Actor: SYSTEM
   - Reason Code: AUTO_ESCALATION
   - Metadata: `{"reason": "14 days no response"}`
5. View lead details to verify event appears

## Troubleshooting

### DevTools Won't Open

**Problem**: Pressing Ctrl+Shift+D does nothing

**Solutions**:
1. Check environment detection: `localStorage.getItem('coselector_dev_mode')`
2. Check keyboard shortcuts setting (Settings tab)
3. Check browser console for errors
4. Verify `forceEnable={true}` in App.tsx for testing
5. Try manual override: `localStorage.setItem('coselector_dev_mode', 'true')` + reload

### Role Switching Not Working

**Problem**: Clicking role button shows success but UI doesn't update

**Solutions**:
1. Verify `AuthContext.switchRole()` method exists
2. Check localStorage persistence: `localStorage.getItem('user')`
3. Refresh page to force state reload
4. Check browser console for errors

### Mock Data Not Generating

**Problem**: "Generate Lead" buttons do nothing

**Solutions**:
1. Check "Mock Data Enabled" setting (Settings tab)
2. Verify `mockApi` service is initialized
3. Check browser console for errors
4. Verify localStorage is not full/disabled
5. Try "Reset All Data" to clear corrupt state

### Timeline Injection Fails

**Problem**: "Lead not found" error when injecting event

**Solutions**:
1. Verify lead ID is correct (copy from Leads page)
2. Check lead exists: `mockApi.leads.getById(leadId)`
3. Ensure lead wasn't deleted/reset
4. Verify JSON metadata is valid (parse test)
5. Check browser console for detailed error

## Best Practices

### For Demo Scripts

1. **Pre-generate Data**: Use "Generate Batch" before starting demo
2. **Role Preparation**: Switch to correct role BEFORE navigating to pages
3. **Timeline Review**: Check timeline after each major action
4. **Reset Between Demos**: Use "Reset All Data" for clean slate

### For Development

1. **Isolate Tests**: Reset data between test scenarios
2. **Verify Timelines**: Always check timeline after state changes
3. **Test Edge Cases**: Use timeline injection for unusual scenarios
4. **Cross-Role Testing**: Test each action from all relevant roles

### For Sprint Demos

1. **Prepare Script**: Pre-load specific lead statuses needed
2. **Time Tracking**: Note timestamps for async operations
3. **Fallback Data**: Have backup leads ready if demo fails
4. **Clear Console**: Clear browser console before presenting

## Future Enhancements

Planned improvements for future sprints:

1. **Export/Import Data**: Save/load complete data snapshots
2. **Scenario Templates**: Pre-configured data sets for specific demos
3. **Timeline Simulator**: Step-by-step timeline visualization
4. **Performance Monitor**: Track API response times and render performance
5. **Error Injection**: Simulate API failures for error handling tests
6. **A11y Inspector**: Test accessibility in real-time
7. **State History**: Undo/redo for data changes
8. **Analytics Dashboard**: Usage statistics for demos

## API Reference

### DevToolsContext

```typescript
interface DevToolsContextValue {
  state: DevToolsState;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  setAutoRefresh: (enabled: boolean) => void;
  setMockDataEnabled: (enabled: boolean) => void;
  setKeyboardShortcuts: (enabled: boolean) => void;
  isDevMode: boolean;
  resetSettings: () => void;
}
```

### DevTools Utilities

```typescript
// Generate mock lead
function generateMockLead(options?: {
  status?: LeadStatus;
  hasOwner?: boolean;
  hasMissingInfo?: boolean;
}): Lead;

// Generate batch of diverse leads
function generateLeadBatch(count?: number): Lead[];

// Create custom timeline event
function createCustomTimelineEvent(
  lead: Lead,
  eventType: string,
  actorType: ActorType,
  reasonCode?: string,
  metadata?: Record<string, any>
): TimelineEvent;

// Generate user profile for role
function generateUserProfile(role: UserRole): UserProfile;
```

## Related Documentation

- [PRD.markdown](./PRD.markdown) - Sprint 1 §9: Dev Tools Requirements
- [README.md](./README.md) - Project setup and structure
- [src/contexts/AuthContext.tsx](./coselector-console/src/contexts/AuthContext.tsx) - Authentication context
- [src/services/mockApi.ts](./coselector-console/src/services/mockApi.ts) - Mock API service

## Support

For issues or questions:
1. Check browser console for errors
2. Review this documentation
3. Verify environment detection
4. Check localStorage state
5. Try "Reset All Settings"

---

**Last Updated**: Sprint 1, Task 15 Completion
**Version**: 1.0.0
**Status**: Production Ready
