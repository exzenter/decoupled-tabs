# Decoupled Tabs

A WordPress Gutenberg plugin for **decoupled tabbed content** where any block can trigger tab switching in a Tab Area.

## Features

- **Tab Area Block** - Container with optional smooth height transition
- **Tab Content Block** - Individual tab panes with unique IDs
- **Tab Trigger Block** - Wrapper with custom CSS for default/hover/active states
- **Manual triggers** - Any element with `data-tab-target="id"` can switch tabs
- **URL hash support** - Direct link to specific tabs via `#tab-id`

## Installation

1. Clone or download to `wp-content/plugins/decoupled-tabs/`
2. Run `npm install && npm run build`
3. Activate in WordPress admin

## Usage

### Tab Area + Content
1. Insert **Tab Area** block
2. Add **Tab Content** blocks inside with unique Tab IDs
3. Configure smooth height transition if tabs have different heights

### Tab Triggers
**Option A - Tab Trigger Block:**
1. Insert **Tab Trigger** block anywhere
2. Set "Target Tab ID" to match a Tab Content ID
3. Add custom CSS for default, hover, and active states

**Option B - Manual:**
Add `data-tab-target="your-tab-id"` to any HTML element.

## Smooth Height Transition

Enable **Smooth Height Transition** in the Tab Area settings to animate the container height when switching between tabs with different heights. This prevents content below from jumping.

## Development

```bash
npm install     # Install dependencies
npm run start   # Watch mode
npm run build   # Production build
```

## Requirements

- WordPress 6.1+
- Gutenberg editor

## License

GPL-2.0-or-later
