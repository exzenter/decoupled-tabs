# Product Overview

Decoupled Tabs is a WordPress Gutenberg plugin that provides a flexible tabbed content system where tab triggers and content are decoupled - meaning triggers can be placed anywhere on the page, not just adjacent to the tab content.

## Core Blocks

- **Tab Area**: Container block that holds tab content panels with optional smooth height transitions and GSAP animations
- **Tab Content**: Individual tab panels with unique IDs that can be targeted by triggers
- **Tab Trigger**: Wrapper block that can contain any content and triggers tab switching when clicked

## Key Features

- Decoupled architecture - triggers can be placed anywhere, not just next to tab content
- URL hash support for direct linking to specific tabs (`#tab-id`)
- Manual trigger support via `data-tab-target` attribute on any HTML element
- Smooth height transitions when switching between tabs of different heights
- GSAP-powered character shuffle animations for tab transitions
- Custom CSS states for triggers (default, hover, active)
- Full keyboard navigation and ARIA accessibility support
- Multiple tab areas per page with unique identifiers

## Use Cases

- FAQ sections with triggers in a sidebar
- Product galleries with remote navigation
- Multi-step forms with progress indicators
- Content sections with floating navigation
