# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Figma plugin that audits design files against a standardized checklist, reporting violations and helping designers maintain file quality and consistency.

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
├── main.ts           # Plugin entry point (runs in Figma sandbox)
├── ui.html           # Results panel UI (vanilla HTML/JS)
└── checks/
    └── naming.ts     # Semantic naming checker
```

- **main.ts**: Handles Figma API calls, traverses node tree, aggregates violations from checkers, communicates with UI via postMessage
- **ui.html**: Displays violations grouped by category, handles rename actions, click-to-select navigation
- **checks/*.ts**: Each checker module exports a function that takes `SceneNode[]` and returns `Violation[]`

## Design Checklist to Implement

The plugin checks against this checklist:

| Category | Status | Checks |
|----------|--------|--------|
| Semantic naming | ✅ Done | Flag "Frame 123", "Group 456", pure numbers; check parent-child naming consistency |
| Auto-layout | ⬜ Todo | Detect frames without auto-layout; flag absolute positioning |
| Variables & Styles | ⬜ Todo | Flag raw hex colors; check for unlinked text/effect styles; find unused variables |
| Components | ⬜ Todo | Detect detached instances; find duplicate local components |
| Layer hierarchy | ⬜ Todo | Flag groups that should be frames; warn on deep nesting (>5 levels) |
| Spacing & Pixels | ⬜ Todo | Flag non-4/8px spacing; detect sub-pixel values; check radius consistency |
| Cover & Description | ⬜ Todo | Check for title, owner, team, version, last updated; Description section exists |
| Pages & Sections | ⬜ Todo | Exploration/Components/Flows/Archive pages exist; sections used for grouping |

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
