# Technical Stack

## Build System

- **Bundler**: Webpack (via `@wordpress/scripts`)
- **Package Manager**: npm
- **WordPress Scripts**: `@wordpress/scripts` v30.0.0 for standardized build tooling

## Core Technologies

- **WordPress**: Gutenberg Block API v3
- **React**: Via `@wordpress/element` for block editor UI
- **JavaScript**: ES6+ with WordPress coding standards
- **CSS**: SCSS for styling (compiled to CSS)
- **Animation**: GSAP 3.12.5 with SplitText plugin (bundled with frontend script)

## WordPress Dependencies

- `@wordpress/blocks` - Block registration
- `@wordpress/block-editor` - Block editor components (InnerBlocks, InspectorControls, etc.)
- `@wordpress/components` - UI components (PanelBody, TextControl, ToggleControl, etc.)
- `@wordpress/i18n` - Internationalization
- `@wordpress/element` - React abstraction

## Testing

- **Framework**: Jest v30.2.0
- **Environment**: jsdom for DOM simulation
- **Testing Library**: `@testing-library/dom` and `@testing-library/jest-dom`
- **Property Testing**: fast-check for property-based testing
- **Coverage Target**: 80% across branches, functions, lines, statements

## Common Commands

```bash
# Development
npm install              # Install dependencies
npm run start            # Watch mode with hot reload
npm run build            # Production build

# Code Quality
npm run format           # Format code with Prettier
npm run lint:js          # Lint JavaScript files

# Testing
npm test                 # Run Jest tests
npm test -- --coverage   # Run tests with coverage report
```

## Build Output

- `build/blocks/` - Compiled block assets (JS, CSS)
- `build/frontend/` - Frontend JavaScript bundle
- Each block outputs: `index.js`, `index.css`, `style-index.css`

## Frontend Architecture

- Vanilla JavaScript class-based architecture (`DecoupledTabs`)
- No framework dependencies on frontend
- GSAP loaded conditionally only when GSAP animations are enabled
- Event-driven with keyboard navigation support
