# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**athenahealth Design Checker** - A Figma plugin that audits design files against a standardized checklist, reporting violations and helping designers maintain file quality and consistency.

## Commands

```bash
npm run build      # Build plugin to dist/
npm run dev        # Build with watch mode
npm run typecheck  # TypeScript type checking
```

After building, import `manifest.json` into Figma via Plugins → Development → Import plugin from manifest.

## Architecture

```
src/
├── main.ts              # Plugin entry point (runs in Figma sandbox)
├── ui.html              # Results panel UI (vanilla HTML/JS)
└── checks/
    ├── naming.ts        # Semantic naming checker
    ├── autolayout.ts    # Auto-layout checker
    ├── styles.ts        # Variables & styles checker
    ├── components.ts    # Components checker
    ├── hierarchy.ts     # Layer hierarchy checker
    ├── spacing.ts       # Spacing & pixels checker
    └── cover.ts         # Cover/documentation checker
```

- **main.ts**: Handles Figma API calls, traverses node tree, aggregates violations from checkers, communicates with UI via postMessage
- **ui.html**: Displays violations grouped by category, handles rename actions, click-to-select navigation
- **checks/*.ts**: Each checker module exports a function that takes `SceneNode[]` and returns `Violation[]`

## Design Checklist

The plugin checks against this checklist:

| Category | Status | Checks |
|----------|--------|--------|
| Semantic naming | ✅ Done | Flag "Frame 123", "Group 456", pure numbers; check parent-child naming consistency |
| Auto-layout | ✅ Done | Detect frames without auto-layout (excludes top-level frames) |
| Variables & Styles | ✅ Done | Flag raw hex colors; check for unlinked text/effect styles |
| Components | ✅ Done | Find duplicate local components with identical names |
| Layer hierarchy | ✅ Done | Flag groups that should be frames; warn on deep nesting (>7 levels) |
| Spacing & Pixels | ✅ Done | Flag non-8px spacing; detect sub-pixel values in position and size |
| Cover & Description | ✅ Done | Check for Cover frame on first page |
| Pages & Sections | ➖ Skipped | Not enforced per project requirements |

## Adding a New Checker

1. Create `src/checks/yourchecker.ts`:
```typescript
import type { Violation } from '../main';

export function checkYourThing(nodes: SceneNode[]): Violation[] {
  const violations: Violation[] = [];
  // ... check logic
  return violations;
}
```

2. Import and add to `runChecks()` in `src/main.ts`:
```typescript
import { checkYourThing } from './checks/yourchecker';

// In runChecks():
const violations: Violation[] = [
  ...checkNaming(allNodes),
  ...checkYourThing(allNodes),
];
```

3. Rebuild: `npm run build`

## Violation Interface

```typescript
interface Violation {
  nodeId: string;
  nodeName: string;
  rule: string;
  category: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  fixable?: boolean;
}
```

## Key Decisions

- **Auto-fix enabled**: Offer quick-fix actions where possible (rename, convert group→frame)
- **Default scope**: Current selection (with option to expand to page/document)
- **UI**: Vanilla HTML/JS to keep bundle small; no framework dependencies
