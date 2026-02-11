# Nested Tab Areas Implementation

## Overview

This document describes the implementation of nested tab areas with independent operation and group trigger isolation.

## Changes Made

### 1. Block Configuration

#### `src/blocks/tab-content/block.json`

- Updated `parent` attribute to allow Tab Content blocks as children of both Tab Area and other Tab Content blocks
- This enables nesting Tab Areas inside Tab Content

```json
"parent": ["decoupled-tabs/tab-area", "decoupled-tabs/tab-content"]
```

#### `src/blocks/tab-area/edit.js`

- Updated `ALLOWED_BLOCKS` constant to include `decoupled-tabs/tab-area`
- Allows Tab Area blocks to be added as children of other Tab Areas (via Tab Content)

```javascript
const ALLOWED_BLOCKS = [
  'decoupled-tabs/tab-content',
  'decoupled-tabs/tab-area',
];
```

#### `src/blocks/tab-content/edit.js`

- Updated help text to indicate nesting support

### 2. Frontend JavaScript Fixes

#### `src/frontend/tabs.js`

**Added `getDirectTabChildren()` Method:**

- Filters tab content to only include direct children of each tab area
- Excludes nested tab areas' content from parent area management
- Uses `closest('.decoupled-tabs-area')` to find the immediate parent

```javascript
getDirectTabChildren(area) {
  const allTabs = Array.from(area.querySelectorAll('.decoupled-tabs-content'));
  return allTabs.filter((tab) => {
    const parentArea = tab.closest('.decoupled-tabs-area');
    return parentArea === area;
  });
}
```

**Updated `initTabArea()` Method:**

- Changed from `area.querySelectorAll('.decoupled-tabs-content')` to `this.getDirectTabChildren(area)`
- Ensures each tab area only initializes its direct children

**Fixed `deactivateGroupTriggers()` Method:**

- Added tab area filtering to only deactivate triggers in the same tab area
- Compares `currentTabArea` with `triggerTabArea` before deactivating
- Prevents group triggers in different tab areas from interfering with each other

```javascript
deactivateGroupTriggers(groupId, currentTrigger) {
  const currentTabArea = currentTrigger.dataset.tabArea || null;
  const groupTriggers = document.querySelectorAll(`[data-group-id="${groupId}"]`);

  groupTriggers.forEach((trigger) => {
    const triggerTabArea = trigger.dataset.tabArea || null;
    if (trigger !== currentTrigger && triggerTabArea === currentTabArea) {
      // Deactivate only triggers in same tab area
    }
  });
}
```

**Fixed `updateTriggerStates()` Method:**

- When `tabAreaId === null`: Only deactivates triggers without a specific tab area
- When `tabAreaId` is specified: Skips triggers from different tab areas entirely
- Prevents cross-area trigger state interference

```javascript
updateTriggerStates(activeTabId, tabAreaId = null) {
  document.querySelectorAll('[data-tab-target]').forEach((trigger) => {
    const triggerTabArea = trigger.dataset.tabArea || null;

    if (tabAreaId === null) {
      // Only deactivate triggers without a specific tab area
      if (triggerTabId === activeTabId) {
        // Activate
      } else if (!triggerTabArea) {
        // Deactivate only if no tab area
      }
    } else {
      // Skip triggers from different tab areas
      if (triggerTabArea !== tabAreaId) return;
      // Process only triggers in this tab area
    }
  });
}
```

### 3. Debug Logging

Added targeted console.log statements for debugging:

- **Trigger Click**: Logs target ID, tab area, group ID, and current active state
- **Group Deactivation**: Logs group ID, tab area, and which triggers are being deactivated
- **Switch Tab**: Logs tab ID, tab area ID, and whether a trigger initiated the switch
- **Update Trigger States**: Logs which triggers are being activated/deactivated and why

## How It Works

### Nested Tab Areas

1. Each tab area is initialized independently via `initTabArea()`
2. `getDirectTabChildren()` ensures only direct children are managed
3. Nested tab areas maintain their own state when parent tabs switch
4. CSS uses `position: absolute` to hide inactive tabs, preserving nested content

### Group Trigger Isolation

1. Group triggers are scoped to their tab area via `data-tab-area` attribute
2. `deactivateGroupTriggers()` only affects triggers in the same tab area
3. `updateTriggerStates()` respects tab area boundaries
4. Different tab areas can have groups with the same ID without conflict

## Testing

Use `test-nested-tab-areas.html` to test:

- Outer tab area with 3 tabs
- Inner tab area 1 (inside outer tab 1) with 3 tabs
- Inner tab area 2 (inside outer tab 2) with 2 tabs
- Each trigger group has a unique group ID scoped to its tab area

### Expected Behavior

1. Switching outer tabs preserves inner tab states
2. Switching inner tabs doesn't affect outer tabs
3. Group triggers only affect other triggers in the same tab area
4. Each tab area operates completely independently

## Key Concepts

**Tab Area Isolation**: Each tab area only manages its direct children, not nested descendants.

**Group Scope**: Group IDs are scoped to tab areas, allowing the same group ID in different areas.

**State Preservation**: Nested tab states are preserved when parent tabs switch because CSS hides them off-screen rather than destroying them.

**Trigger Filtering**: All trigger state updates check tab area membership before modifying state.
