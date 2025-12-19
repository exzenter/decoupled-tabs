# Decoupled Tabs

A WordPress Gutenberg plugin for **decoupled tabbed content** where any block can trigger tab switching in a Tab Area.

## Features

- **Tab Area Block** - Container with transition animations (fade, slide, none)
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
3. Configure transition animation and duration

### Tab Triggers
**Option A - Tab Trigger Block:**
1. Insert **Tab Trigger** block anywhere
2. Set "Target Tab ID" to match a Tab Content ID
3. Add custom CSS for default, hover, and active states

**Option B - Manual:**
Add `data-tab-target="your-tab-id"` to any HTML element.

## Transition Types

| Type | Effect |
|------|--------|
| `none` | Instant switch |
| `fade` | Opacity fade |
| `slide-horizontal` | Slide left/right |
| `slide-vertical` | Slide up with fade |

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
